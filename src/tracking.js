// Google tag + attribution capture. No-ops cleanly when IDs aren't set.
const GADS_ID = import.meta.env.VITE_GADS_ID
const LEAD_LABEL = import.meta.env.VITE_GADS_LEAD_LABEL
const CALL_LABEL = import.meta.env.VITE_GADS_CALL_LABEL
const GA4_ID = import.meta.env.VITE_GA4_ID

const ATTR_KEYS = ['gclid', 'gbraid', 'wbraid', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content']
const STORE = 'lead_attr'

function safeGet(k) { try { return sessionStorage.getItem(k) } catch { return null } }
function safeSet(k, v) { try { sessionStorage.setItem(k, v) } catch { /* private mode */ } }

export function initTracking() {
  // Keep ad click IDs + UTMs from the landing URL so they ride along with the lead
  const params = new URLSearchParams(location.search)
  const found = {}
  ATTR_KEYS.forEach((k) => { if (params.get(k)) found[k] = params.get(k) })
  if (Object.keys(found).length) {
    found.landing_url = location.href
    found.captured_at = new Date().toISOString()
    safeSet(STORE, JSON.stringify(found))
  }

  if (!GADS_ID && !GA4_ID) return
  const s = document.createElement('script')
  s.async = true
  s.src = `https://www.googletagmanager.com/gtag/js?id=${GADS_ID || GA4_ID}`
  document.head.appendChild(s)
  window.dataLayer = window.dataLayer || []
  window.gtag = function () { window.dataLayer.push(arguments) }
  window.gtag('js', new Date())
  if (GADS_ID) window.gtag('config', GADS_ID, { allow_enhanced_conversions: true })
  if (GA4_ID) window.gtag('config', GA4_ID)
}

export function getAttribution() {
  try { return JSON.parse(safeGet(STORE) || '{}') } catch { return {} }
}

export function track(event, params = {}) {
  if (window.gtag) window.gtag('event', event, params)
}

// Fired on /thanks/ only, so one submit = one conversion
export function fireLeadConversion({ email, phone, leadId }) {
  if (!window.gtag || !GADS_ID || !LEAD_LABEL) return
  // Enhanced conversions: gtag hashes these before sending
  window.gtag('set', 'user_data', {
    ...(email ? { email } : {}),
    ...(phone ? { phone_number: phone } : {}),
  })
  window.gtag('event', 'conversion', {
    send_to: `${GADS_ID}/${LEAD_LABEL}`,
    transaction_id: leadId, // dedupes refreshes of the thank-you page
  })
  track('generate_lead')
}

export function fireCallClick(kind) {
  track(kind === 'text' ? 'text_click' : 'call_click')
  if (window.gtag && GADS_ID && CALL_LABEL) {
    window.gtag('event', 'conversion', { send_to: `${GADS_ID}/${CALL_LABEL}` })
  }
}
