import React from 'react'
import { createRoot } from 'react-dom/client'
import { site } from '../site.config.js'
import { initTracking, fireCallClick } from './tracking.js'
import { Header, Footer } from './Shell.jsx'
import LeadForm from './LeadForm.jsx'
import './styles.css'

initTracking()

const STEPS = [
  ['Tell me your budget', 'Your monthly number, money down, and optional questions to help your search. No SSN, no hard pull.'],
  ['I pull real matches', `I check what’s on the lot today and what your numbers can realistically support across hundreds of vehicles on the ground in ${site.city}, FL.`],
  ['You get a short list by text', 'Usually within the hour during business hours. Come drive the ones you like.'],
]

const DELIVER = [
  `Decide on a budget, receive a list of cars within that budget in ${site.city}, FL.`,
  'Schedule a test drive, don’t spend half a day at a dealership.',
  `My name is ${site.agentName}, you have my number and I will work with you directly.`,
]

const FAQ = [
  ['Does this hurt my credit?', 'No. Seeing matches doesn’t involve a credit check. If you decide to buy, a lender will run credit with your permission at that point.'],
  ['What if my credit isn’t great?', 'Tell me honestly in the form. I work with buyers who are rebuilding, and a realistic budget plus some money down goes a long way.'],
  ['Is the monthly number guaranteed?', 'It’s the target I shop to. The final payment depends on the vehicle, your down payment, term, and the rate a lender approves.'],
  ['New or used?', 'Both. Pick a preference in the form, or leave it open and I’ll show you the best fits either way.'],
]

function App() {
  return (
    <>
      <Header />
      <main>
        <section className="hero">
          <div className="wrap hero-grid">
            <LeadForm />
            <div className="hero-copy">
              <h1>How this works:</h1>
              <ul className="deliver-list">
                {DELIVER.map((d) => <li key={d}>{d}</li>)}
              </ul>
            </div>
          </div>
        </section>

        <section className="me">
          <div className="wrap me-grid">
            <div className="me-photo" role="img" aria-label={`Photo of ${site.agentName}`}>
              {/* Replace with <img src="/lian.jpg" alt="..."> — a real photo lifts trust and lead rate */}
              <span>{site.agentName.slice(0, 1)}</span>
            </div>
            <div>
              <h2>You’ll be talking to {site.agentName}.</h2>
              <p>
                I’ve spent years on the sales floor and in the finance office{site.dealerName ? ` at ${site.dealerName}` : ` in ${site.city}`},
                so I know what a budget can actually buy before you ever step on the lot. Send me your numbers and I’ll
                tell you straight what fits, what doesn’t, and what would make it work.
              </p>
              <p className="me-hours">Answering texts {site.hours}.</p>
            </div>
          </div>
        </section>

        <section className="how">
          <div className="wrap">
            <h2>My Process:</h2>
            <ol className="steps">
              {STEPS.map(([t, d]) => (
                <li key={t}><h3>{t}</h3><p>{d}</p></li>
              ))}
            </ol>
          </div>
        </section>

        <section className="faq">
          <div className="wrap narrow">
            <h2>Common questions</h2>
            {FAQ.map(([q, ans]) => (
              <details key={q}><summary>{q}</summary><p>{ans}</p></details>
            ))}
          </div>
        </section>

        <section className="last">
          <div className="wrap last-row">
            <p>Rather just talk?</p>
            <div className="last-actions">
              <a className="btn btn--go" href={`tel:${site.phoneE164}`} onClick={() => fireCallClick('call')}>Call {site.phoneDisplay}</a>
              <a className="btn btn--line" href={`sms:${site.phoneE164}`} onClick={() => fireCallClick('text')}>Text your budget</a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}

createRoot(document.getElementById('root')).render(<React.StrictMode><App /></React.StrictMode>)
