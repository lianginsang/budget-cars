import React, { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { site } from '../site.config.js'
import { initTracking, fireLeadConversion, fireCallClick } from './tracking.js'
import { Header, Footer } from './Shell.jsx'
import './styles.css'

initTracking()

function Thanks() {
  const [lead, setLead] = useState(null)
  useEffect(() => {
    let l = null
    try { l = JSON.parse(sessionStorage.getItem('lead_done') || 'null') } catch { /* ignore */ }
    setLead(l)
    const id = l?.id || new URLSearchParams(location.search).get('id')
    let fired = null
    try { fired = sessionStorage.getItem('conv_fired') } catch { /* ignore */ }
    if (id && fired !== id) {
      fireLeadConversion({ email: l?.email, phone: l?.phone, leadId: id })
      try { sessionStorage.setItem('conv_fired', id) } catch { /* ignore */ }
    }
  }, [])

  const name = lead?.firstName ? `, ${lead.firstName}` : ''
  return (
    <>
      <Header />
      <main className="thanks">
        <div className="wrap narrow">
          {lead?.budget && (
            <div className="glass glass--small" aria-hidden="true">
              <span className="marker">${lead.budget.toLocaleString('en-US')}<small>/mo</small></span>
            </div>
          )}
          <h1>Got it{name}. I’m shopping your budget now.</h1>
          <p className="lede">
            Watch for a text from {site.phoneDisplay} with vehicles that fit. During {site.hours} that’s usually within the hour.
          </p>
          <p>Want to move faster? Text me the car you’re driving now or a model you’ve had your eye on.</p>
          <div className="last-actions">
            <a className="btn btn--go" href={`sms:${site.phoneE164}`} onClick={() => fireCallClick('text')}>Text {site.agentName}</a>
            <a className="btn btn--line" href={`tel:${site.phoneE164}`} onClick={() => fireCallClick('call')}>Call now</a>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

createRoot(document.getElementById('root')).render(<React.StrictMode><Thanks /></React.StrictMode>)
