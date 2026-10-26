import { site } from '../site.config.js'
import { fireCallClick } from './tracking.js'

export function Header() {
  return (
    <header className="top">
      <a className="brand" href="/">
        <span className="brand-mark" aria-hidden="true">$</span>
        <span>
          {site.agentName}
          <em>{site.dealerName ? site.dealerName : `Car shopping in ${site.city}`}</em>
        </span>
      </a>
      <div className="top-actions">
        <a className="pill" href={`sms:${site.phoneE164}`} onClick={() => fireCallClick('text')}>Text</a>
        <a className="pill pill--solid" href={`tel:${site.phoneE164}`} onClick={() => fireCallClick('call')}>Call {site.phoneDisplay}</a>
      </div>
    </header>
  )
}

export function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="foot">
      <div className="wrap">
        <p className="disclose">
          Monthly budget is used only to find vehicles that may fit. It is not a quote, an offer of credit, or a guarantee of approval.
          Actual payment depends on vehicle price, down payment, trade value, term, taxes, fees, and the APR you qualify for.
          All financing is subject to lender approval. Vehicle availability changes daily.
        </p>
        <p className="foot-links">
          <span>© {year} {site.legalName}{site.dealerName ? `, ${site.dealerName}` : ''}</span>
          {site.dealerAddress && <span>{site.dealerAddress}</span>}
          <a href={`tel:${site.phoneE164}`}>{site.phoneDisplay}</a>
          <a href={`mailto:${site.email}`}>{site.email}</a>
          <a href="/privacy/">Privacy Policy</a>
          <a href="/terms/">Terms &amp; Conditions</a>
        </p>
      </div>
    </footer>
  )
}
