// Submits the plain-HTML form on /sms-opt-in/ through the same /api/lead as the main form.
import { site } from '../site.config.js'
import { initTracking, getAttribution } from './tracking.js'
import './styles.css'

initTracking()

const form = document.getElementById('optin')
const err = document.getElementById('err')
const btn = form.querySelector('button[type=submit]')
const startedAt = Date.now()
const showError = (msg) => { err.textContent = msg; err.hidden = !msg }

form.addEventListener('input', () => showError(''))
form.addEventListener('submit', async (e) => {
  e.preventDefault()
  const f = form.elements
  const digits = f.phone.value.replace(/\D/g, '').replace(/^1(?=\d{10}$)/, '')
  if (!f.firstName.value.trim()) return showError('Add your first name so I know who I’m texting.')
  if (digits.length !== 10) return showError('Enter a 10-digit mobile number.')
  if (f.email.value && !/^\S+@\S+\.\S+$/.test(f.email.value)) return showError('That email doesn’t look complete. Fix it or leave it blank.')
  if (!f.consent.checked) return showError('Check the box to let me text and call you about your matches.')

  btn.disabled = true
  btn.textContent = 'Sending…'
  const payload = {
    source: 'sms-optin',
    firstName: f.firstName.value, phone: '+1' + digits, email: f.email.value, company: f.company.value,
    consent: true,
    consentText: document.getElementById('consent-text').textContent.replace(/\s+/g, ' ').trim(),
    elapsedMs: Date.now() - startedAt,
    attribution: getAttribution(),
    page: location.href,
  }
  try {
    const res = await fetch('/api/lead', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(data.error || 'send failed')
    try {
      sessionStorage.setItem('lead_done', JSON.stringify({ id: data.id, firstName: f.firstName.value.trim(), email: f.email.value, phone: payload.phone }))
    } catch { /* private mode: thank-you page still works */ }
    location.href = `/thanks/?id=${encodeURIComponent(data.id)}`
  } catch {
    btn.disabled = false
    btn.textContent = 'Send me my matches'
    showError(`Your info didn’t send. Try again, or text ${site.phoneDisplay}.`)
  }
})
