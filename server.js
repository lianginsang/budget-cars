// Production server for Render (or any Node host): serves the built site from dist/
// and runs api/lead.js at POST /api/lead. Build first with `npm run build`, then `npm start`.
import { createServer } from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import { extname, join, normalize, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import handler from './api/lead.js'

const DIST = resolve(fileURLToPath(new URL('.', import.meta.url)), 'dist')
const PORT = process.env.PORT || 3000
const MAX_BODY = 32 * 1024

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.json': 'application/json',
  '.txt': 'text/plain; charset=utf-8',
  '.woff2': 'font/woff2',
}

// Same interface as Vercel's req/res helpers, so api/lead.js runs unchanged
async function api(req, res) {
  let raw = ''
  for await (const chunk of req) {
    raw += chunk
    if (raw.length > MAX_BODY) { res.writeHead(413).end(); return }
  }
  try { req.body = raw ? JSON.parse(raw) : {} } catch { req.body = {} }
  res.status = (c) => { res.statusCode = c; return res }
  res.json = (obj) => { res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(obj)) }
  try {
    await handler(req, res)
  } catch (err) {
    console.error('api/lead failed:', err)
    if (!res.headersSent) res.status(500).json({ error: 'Server error.' })
  }
}

// Resolves /, /thanks, /thanks/, /privacy and asset paths to a file inside dist/
async function findFile(pathname) {
  const clean = normalize(decodeURIComponent(pathname)).replace(/^(\.\.[/\\])+/, '')
  const base = join(DIST, clean)
  if (base !== DIST && !base.startsWith(DIST + sep)) return null
  for (const p of [base, join(base, 'index.html'), base + '.html']) {
    try { if ((await stat(p)).isFile()) return p } catch { /* try next */ }
  }
  return null
}

async function serveStatic(req, res, pathname) {
  // /thanks → /thanks/ so relative links on that page resolve the same as in dev
  if (!extname(pathname) && !pathname.endsWith('/') && await findFile(pathname + '/')) {
    res.writeHead(301, { Location: pathname + '/' }).end()
    return
  }
  const file = await findFile(pathname)
  if (!file) {
    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' })
    res.end('<p>Page not found. <a href="/">Go to the home page</a>.</p>')
    return
  }
  res.setHeader('Content-Type', TYPES[extname(file)] || 'application/octet-stream')
  // Vite fingerprints everything in /assets, so it can be cached forever; HTML must stay fresh
  res.setHeader('Cache-Control', pathname.startsWith('/assets/') ? 'public, max-age=31536000, immutable' : 'no-cache')
  res.end(req.method === 'HEAD' ? undefined : await readFile(file))
}

createServer(async (req, res) => {
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
  const { pathname } = new URL(req.url, 'http://localhost')
  try {
    if (pathname === '/api/lead') return await api(req, res)
    if (req.method !== 'GET' && req.method !== 'HEAD') { res.writeHead(405, { Allow: 'GET, HEAD' }).end(); return }
    await serveStatic(req, res, pathname)
  } catch (err) {
    console.error(err)
    if (!res.headersSent) res.writeHead(500).end()
  }
}).listen(PORT, () => console.log(`Listening on port ${PORT}`))
