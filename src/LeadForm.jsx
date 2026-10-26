import { useEffect, useMemo, useRef, useState } from 'react'
import { site } from '../site.config.js'
import { getAttribution, track } from './tracking.js'

const DOWN = ['$0 down', 'Under $1,000', '$1,000–$3,000', '$3,000+']
const CREDIT = ['Excellent (720+)', 'Good (660–719)', 'Fair (600–659)', 'Rebuilding', 'Not sure']
const INCOME = ['Under $2,500', '$2,500–$3,500', '$3,500–$5,000', '$5,000+', 'Not sure']
const TIMING = ['Today', 'Within a week', 'This month', 'Just looking']
const TYPES = ['Car', 'SUV', 'Truck', 'Minivan', 'Any']

const fmt = (n) => '$' + n.toLocaleString('en-US')

function Choice({ name, options, value, onChange, columns }) {
  return (
    <div className={`choices ${columns ? 'choices--' + columns : ''}`} role="radiogroup" aria-label={name}>
      {options.map((o) => (
        <button
          type="button"
          key={o}
          role="radio"
          aria-checked={value === o}
          className={`chip ${value === o ? 'is-on' : ''}`}
          onClick={() => onChange(o)}
        >
          {o}
        </button>
      ))}
    </div>
  )
}

function formatPhone(raw) {
  const d = raw.replace(/\D/g, '').replace(/^1/, '').slice(0, 10)
  if (d.length < 4) return d
  if (d.length < 7) return `(${d.slice(0, 3)}) ${d.slice(3)}`
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`
}

export default function LeadForm() {
  const [step, setStep] = useState(0)
  const [budget, setBudget] = useState(site.budgetDefault)
  const [a, setA] = useState({
    down: '$0 down', trade: 'Not sure', credit: 'Not sure', income: 'Not sure', timing: 'Today', type: 'Any', condition: 'Either',
    firstName: '', phone: '', email: '', consent: false, company: '',
  })
  const [error, setError] = useState('')
  const [sending, setSending] = useState(false)
  const startedAt = useRef(Date.now())
  const formRef = useRef(null)
  const firstRender = useRef(true)
  useEffect(() => {
    if (firstRender.current) { firstRender.current = false; return }
    const el = formRef.current
    if (el && el.getBoundingClientRect().top < 60) {
      const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
      window.scrollTo({ top: el.getBoundingClientRect().top + scrollY - 72, behavior: reduce ? 'auto' : 'smooth' })
    }
  }, [step])
  const set = (k) => (v) => { setA((s) => ({ ...s, [k]: v })); setError('') }

  const pct = ((budget - site.budgetMin) / (site.budgetMax - site.budgetMin)) * 100
  const stepNames = ['Budget', 'Down & trade', 'Your situation', 'Where to send matches']

  const canNext = useMemo(() => {
    if (step === 1) return a.down && a.trade
    if (step === 2) return a.credit && a.income && a.timing
    return true
  }, [step, a])

  function next() {
    if (!canNext) { setError('Pick one option in each group to continue.'); return }
    if (step === 0) track('budget_selected', { value: budget })
    setStep((s) => s + 1)
  }

  async function submit(e) {
    e.preventDefault()
    const digits = a.phone.replace(/\D/g, '')
    if (!a.firstName.trim()) return setError('Add your first name so I know who I’m texting.')
    if (digits.length !== 10) return setError('Enter a 10-digit mobile number.')
    if (a.email && !/^\S+@\S+\.\S+$/.test(a.email)) return setError('That email doesn’t look complete. Fix it or leave it blank.')
    if (!a.consent) return setError('Check the box to let me text and call you about your matches.')

    setSending(true)
    const payload = {
      budget, ...a, phone: '+1' + digits,
      consentText: document.getElementById('consent-text')?.textContent || '',
      elapsedMs: Date.now() - startedAt.current,
      attribution: getAttribution(),
      page: location.href,
      userAgent: navigator.userAgent,
    }
    try {
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'send failed')
      try {
        sessionStorage.setItem('lead_done', JSON.stringify({
          id: data.id, firstName: a.firstName.trim(), budget, email: a.email, phone: payload.phone,
        }))
      } catch { /* private mode: thank-you page still works */ }
      location.href = `/thanks/?id=${encodeURIComponent(data.id)}`
    } catch (err) {
      setSending(false)
      setError(`Your info didn’t send. Try again, or text ${site.phoneDisplay} with your budget.`)
    }
  }

  return (
    <form className="finder" ref={formRef} onSubmit={submit} noValidate>
      <ol className="progress" aria-label="Form progress">
        {stepNames.map((n, i) => (
          <li key={n} className={i < step ? 'done' : i === step ? 'now' : ''} aria-current={i === step ? 'step' : undefined}>
            <span className="sr-only">{n}</span>
          </li>
        ))}
      </ol>

      {step === 0 && (
        <fieldset className="step">
          <legend>What monthly payment works for you?</legend>
          <div className="glass" aria-hidden="true">
            <span className="marker">{fmt(budget)}<small>/mo</small></span>
          </div>
          <label className="sr-only" htmlFor="budget">Monthly budget</label>
          <input
            id="budget" type="range" className="range"
            min={site.budgetMin} max={site.budgetMax} step={site.budgetStep}
            value={budget} onChange={(e) => setBudget(+e.target.value)}
            style={{ '--pct': pct + '%' }}
            aria-valuetext={`${fmt(budget)} per month`}
          />
          <div className="range-ends"><span>{fmt(site.budgetMin)}</span><span>{fmt(site.budgetMax)}+</span></div>
          <button type="button" className="btn btn--go" onClick={next}>Find cars at {fmt(budget)}/mo</button>
          <p className="fine">Takes about a minute. No credit check to see matches.</p>
        </fieldset>
      )}

      {step === 1 && (
        <fieldset className="step">
          <legend>Money down, and a trade?</legend>
          <p className="q">How much can you put down?</p>
          <Choice name="Down payment" options={DOWN} value={a.down} onChange={set('down')} columns={2} />
          <p className="q">Do you have a vehicle to trade in?</p>
          <Choice name="Trade-in" options={['Yes', 'No', 'Not sure']} value={a.trade} onChange={set('trade')} columns={3} />
        </fieldset>
      )}

      {step === 2 && (
        <fieldset className="step">
          <legend>A little about your situation</legend>
          <p className="q">How would you rate your credit?</p>
          <Choice name="Credit" options={CREDIT} value={a.credit} onChange={set('credit')} columns={2} />
          <p className="q">Monthly income before taxes</p>
          <Choice name="Income" options={INCOME} value={a.income} onChange={set('income')} columns={2} />
          <p className="q">When do you want to be driving it?</p>
          <Choice name="Timing" options={TIMING} value={a.timing} onChange={set('timing')} columns={2} />
          <p className="q">What kind of vehicle? <span className="opt">Optional</span></p>
          <Choice name="Vehicle type" options={TYPES} value={a.type} onChange={set('type')} columns={5} />
          <Choice name="New or used" options={['New', 'Used', 'Either']} value={a.condition} onChange={set('condition')} columns={3} />
        </fieldset>
      )}

      {step === 3 && (
        <fieldset className="step">
          <legend>Where should I send your matches?</legend>
          <div className="field">
            <label htmlFor="fn">First name</label>
            <input id="fn" autoComplete="given-name" value={a.firstName} onChange={(e) => set('firstName')(e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="ph">Mobile number</label>
            <input id="ph" type="tel" inputMode="tel" autoComplete="tel-national" placeholder="(904) 555-0123"
              value={a.phone} onChange={(e) => set('phone')(formatPhone(e.target.value))} />
          </div>
          <div className="field">
            <label htmlFor="em">Email <span className="opt">Optional</span></label>
            <input id="em" type="email" autoComplete="email" value={a.email} onChange={(e) => set('email')(e.target.value)} />
          </div>
          {/* Honeypot: real people never see or fill this */}
          <div className="hp" aria-hidden="true">
            <label htmlFor="co">Company</label>
            <input id="co" tabIndex={-1} autoComplete="off" value={a.company} onChange={(e) => set('company')(e.target.value)} />
          </div>
          <label className="consent">
            <input type="checkbox" checked={a.consent} onChange={(e) => set('consent')(e.target.checked)} />
            <span id="consent-text">
              I agree to receive calls and text messages from {site.brandName}{site.dealerName ? ` at ${site.dealerName}` : ''} at this number about my vehicle search,
              including messages sent with automated technology and AI-assisted tools. Consent isn’t required to buy.
              Message frequency varies. Message and data rates may apply. Reply STOP to opt out or HELP for help.
              See the <a href="/privacy/" target="_blank" rel="noopener">Privacy Policy</a> and <a href="/terms/" target="_blank" rel="noopener">Terms &amp; Conditions</a>.
            </span>
          </label>
          <button type="submit" className="btn btn--go" disabled={sending}>
            {sending ? 'Sending…' : 'Send me my matches'}
          </button>
        </fieldset>
      )}

      {error && <p className="error" role="alert">{error}</p>}

      {step > 0 && (
        <div className="nav">
          <button type="button" className="btn btn--ghost" onClick={() => { setStep((s) => s - 1); setError('') }}>Back</button>
          {step < 3 && <button type="button" className="btn btn--next" onClick={next}>Continue</button>}
          <span className="budget-tag">{fmt(budget)}/mo</span>
        </div>
      )}
    </form>
  )
}
