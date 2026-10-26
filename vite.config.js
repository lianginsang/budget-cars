import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'

// Runs api/lead.js inside the Vite dev server so the form works locally.
// In production Vercel runs api/ as serverless functions.
function localApi() {
  return {
    name: 'local-api',
    configureServer(server) {
      server.middlewares.use('/api/lead', async (req, res) => {
        let raw = ''
        for await (const chunk of req) raw += chunk
        req.body = raw ? JSON.parse(raw) : {}
        const { default: handler } = await server.ssrLoadModule('/api/lead.js')
        const shim = {
          statusCode: 200,
          setHeader: (k, v) => res.setHeader(k, v),
          status(c) { this.statusCode = c; return this },
          json(obj) { res.statusCode = this.statusCode; res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(obj)) },
        }
        await handler(req, shim)
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  Object.assign(process.env, loadEnv(mode, process.cwd(), ''))
  return {
    plugins: [react(), localApi()],
    build: {
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'index.html'),
          thanks: resolve(__dirname, 'thanks/index.html'),
          privacy: resolve(__dirname, 'privacy/index.html'),
          terms: resolve(__dirname, 'terms/index.html'),
        },
      },
    },
  }
})
