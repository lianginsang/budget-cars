// POST /api/lead — Vercel serverless function (Node 18+).
// Validates, scores, and forwards each lead to your webhook(s) as JSON.
import { randomUUID } from 'node:crypto'

const INCOME_MID = { 'Under $2,500': 2000, '$2,500–$3,500': 3000, '$3,500–$5,000': 4250, '$5,000+': 6000, 'Not sure': 0 }
const CREDIT_PTS = { 'Excellent (720+)': 30, 'Good (660–719)': 24, 'Fair (600–659)': 14, Rebuilding: 6, 'Not sure': 10 }
const DOWN_PTS = { '$0 down': 0, 'Under $1,000': 6, '$1,000–$3,000': 12, '$3,000+': 18 }
const TIMING_PTS = { Today: 30, 'Within a week': 20, 'This month': 10, 'Just looking': 0 }

// Capability: budget vs income (payment-to-income) + credit + cash down. Readiness: timing.
export function scoreLead(l) {
  const income = INCOME_MID[l.income] || 0
  // Unknown income scores neutral instead of being treated as unaffordable
  const pti = income ? l.budget / income : null
  const ptiPts = pti === null ? 8 : pti <= 0.12 ? 22 : pti <= 0.17 ? 16 : pti <= 0.22 ? 8 : 0
  const score = (CREDIT_PTS[l.credit] ?? 0) + (DOWN_PTS[l.down] ?? 0) + (TIMING_PTS[l.timing] ?? 0) + ptiPts
  const tier = score >= 70 ? 'HOT' : score >= 45 ? 'WARM' : 'NURTURE'
  const flags = []
  if (pti !== null && pti > 0.22) flags.push('payment high vs income')
  if (l.credit === 'Rebuilding' && l.down === '$0 down') flags.push('rebuilding credit with $0 down')
  if (l.trade === 'Yes') flags.push('has trade')
  return { score, tier, pti: pti === null ? null : Math.round(pti * 100), flags }
}

const pick = (v, allowed) => (allowed.includes(v) ? v : '')
const clean = (s, n = 120) => String(s ?? '').replace(/[\u0000-\u001f<>]/g, '').trim().slice(0, n)

export function normalize(b) {
  return {
    budget: Math.max(100, Math.min(3000, Math.round(Number(b.budget) || 0))),
    down: pick(b.down, Object.keys(DOWN_PTS)),
    trade: pick(b.trade, ['Yes', 'No', 'Not sure']),
    credit: pick(b.credit, Object.keys(CREDIT_PTS)),
    income: pick(b.income, Object.keys(INCOME_MID)),
    timing: pick(b.timing, Object.keys(TIMING_PTS)),
    type: pick(b.type, ['Car', 'SUV', 'Truck', 'Minivan', 'Any']) || 'Any',
    condition: pick(b.condition, ['New', 'Used', 'Either']) || 'Either',
    firstName: clean(b.firstName, 40),
    phone: clean(b.phone, 16),
    email: clean(b.email, 120),
    consent: b.consent === true,
    consentText: clean(b.consentText, 600),
  }
}

async function forward(url, lead, secret) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(secret ? { 'X-Lead-Secret': secret } : {}) },
    body: JSON.stringify(lead),
    redirect: 'follow', // Google Apps Script web apps redirect once
  })
  if (!res.ok) throw new Error(`webhook ${res.status}`)
}

export default async function handler(req, res) {
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).json({ error: 'POST only' }) }
  let body = req.body
  if (typeof body === 'string') { try { body = JSON.parse(body) } catch { body = {} } }
  body = body || {}

  // Bots: filled honeypot or inhumanly fast submit. Pretend success so they don't retry.
  if (body.company || Number(body.elapsedMs) < 2500) return res.status(200).json({ id: 'ok-' + randomUUID().slice(0, 8) })

  const l = normalize(body)
  if (!l.firstName) return res.status(400).json({ error: 'First name is required.' })
  if (!/^\+1[2-9]\d{9}$/.test(l.phone)) return res.status(400).json({ error: 'Enter a valid 10-digit US mobile number.' })
  if (l.email && !/^\S+@\S+\.\S+$/.test(l.email)) return res.status(400).json({ error: 'Email looks incomplete.' })
  if (!l.consent) return res.status(400).json({ error: 'Consent is required to contact you.' })
  if (!l.down || !l.credit || !l.income || !l.timing || !l.trade) return res.status(400).json({ error: 'Some answers are missing.' })

  const id = randomUUID()
  const lead = {
    id,
    receivedAt: new Date().toISOString(),
    ...l,
    ...scoreLead(l),
    attribution: typeof body.attribution === 'object' && body.attribution ? body.attribution : {},
    page: clean(body.page, 500),
    userAgent: clean(req.headers['user-agent'], 300),
    ip: clean(req.headers['x-forwarded-for']?.split(',')[0], 64), // consent record
  }
  // One-line summary your phone notification / AI responder can use directly
  lead.summary = `${lead.tier} (${lead.score}) ${lead.firstName} ${lead.phone} — $${lead.budget}/mo, ${lead.down}, credit ${lead.credit}, income ${lead.income}, ${lead.timing}, ${lead.condition} ${lead.type}, trade: ${lead.trade}${lead.flags.length ? ' | ' + lead.flags.join('; ') : ''}`

  const urls = [process.env.LEAD_WEBHOOK_URL, process.env.LEAD_WEBHOOK_URL_2].filter(Boolean)
  if (!urls.length) {
    console.log('LEAD (no webhook set):', JSON.stringify(lead))
    return res.status(200).json({ id })
  }
  const results = await Promise.allSettled(urls.map((u) => forward(u, lead, process.env.LEAD_WEBHOOK_SECRET)))
  results.forEach((r, i) => r.status === 'rejected' && console.error(`webhook ${i + 1} failed:`, r.reason?.message, JSON.stringify(lead)))
  if (results.every((r) => r.status === 'rejected')) return res.status(502).json({ error: 'Could not save your info.' })
  return res.status(200).json({ id })
}
