import React from 'react'
import { createRoot } from 'react-dom/client'
import { site } from '../site.config.js'
import { Header, Footer } from './Shell.jsx'
import './styles.css'

// Plain-language starter terms. Have them reviewed before you rely on them.
function Terms() {
  return (
    <>
      <Header />
      <main className="legal">
        <div className="wrap narrow">
          <h1>Terms &amp; Conditions</h1>
          <p className="muted">Effective {site.termsEffective}</p>
          <p>
            These Terms &amp; Conditions apply to this website and to the text messaging program run by {site.brandName}.
            By using this site or opting in to text messages, you agree to these terms.
          </p>

          <h2>About this service</h2>
          <p>
            {site.brandName} helps shoppers in {site.city}, FL find vehicles that may fit a monthly budget. The budget you enter is used
            only to find vehicles that may fit. It is not a quote, an offer of credit, or a guarantee of approval. Actual payment depends
            on vehicle price, down payment, trade value, term, taxes, fees, and the APR you qualify for. All financing is subject to lender
            approval. Vehicle availability changes daily.
          </p>

          <h2 id="sms">SMS Terms</h2>
          <ul>
            <li>
              <strong>Program:</strong> {site.brandName} vehicle matches. When you submit the form on this site and check the consent box,
              you agree to receive text messages from {site.brandName} at the mobile number you provide.
            </li>
            <li>
              <strong>What you’ll receive:</strong> vehicles that may fit your budget, replies to your questions, test drive scheduling and
              reminders, and follow-ups about your vehicle search. Some messages may be sent with automated or AI-assisted tools.
            </li>
            <li><strong>Message frequency varies</strong> based on your search and how you reply.</li>
            <li><strong>Message and data rates may apply.</strong> Check your mobile plan for details.</li>
            <li><strong>To opt out,</strong> reply STOP to any message. You’ll get one confirmation text and no further messages unless you opt in again.</li>
            <li><strong>For help,</strong> reply HELP to any message, call {site.phoneDisplay}, or email {site.email}.</li>
            <li><strong>Consent is not a condition of purchase.</strong> You can shop with {site.brandName} without agreeing to texts.</li>
            <li>Carriers are not liable for delayed or undelivered messages.</li>
            <li>
              Your information is handled as described in the <a href="/privacy/">Privacy Policy</a>. SMS opt-in data and consent are never
              sold or shared with third parties for marketing purposes.
            </li>
          </ul>

          <h2>Your information</h2>
          <p>Please give accurate information and use a mobile number that belongs to you.</p>

          <h2>No guarantees</h2>
          <p>
            Vehicle listings, prices, and availability can change without notice. {site.brandName} is not a lender and does not make credit
            decisions.
          </p>

          <h2>Contact</h2>
          <p>{site.brandName}, {site.phoneDisplay}, {site.email}.</p>

          <h2>Changes</h2>
          <p>I’ll update the date above when these terms change.</p>
        </div>
      </main>
      <Footer />
    </>
  )
}

createRoot(document.getElementById('root')).render(<React.StrictMode><Terms /></React.StrictMode>)
