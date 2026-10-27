import React from 'react'
import { createRoot } from 'react-dom/client'
import { site } from '../site.config.js'
import { Header, Footer } from './Shell.jsx'
import './styles.css'

// Plain-language starter policy. Have it reviewed before you rely on it.
function Privacy() {
  const who = site.legalName + (site.dealerName ? ` (${site.agentRole}, ${site.dealerName})` : '')
  return (
    <>
      <Header />
      <main className="legal">
        <div className="wrap narrow">
          <h1>Privacy Policy</h1>
          <p className="muted">Effective {site.privacyEffective}</p>
          <p>
            This Privacy Policy explains how {site.brandName} collects, uses, and protects your information when you use this
            website and when you receive text messages from {site.brandName}.
          </p>

          <h2>Who I am</h2>
          <p>
            This site and its text messaging program are run by {who}, operating under the brand name {site.brandName}.
            Contact: {site.email}, {site.phoneDisplay}.
          </p>

          <h2>What I collect</h2>
          <p>
            When you use the form I collect what you enter: your first name, mobile number, optional email, monthly budget,
            down payment range, trade-in status, self-rated credit range, income range, timing, and vehicle preferences.
            If you check a consent box, I also record which text messages you agreed to receive (Updates, Offers, or both), the exact consent wording
            you saw, the date and time, and your IP address.
            I also collect basic technical data: the page you came from, ad click identifiers (such as a Google click ID),
            campaign tags, browser type, and the time of your request. I do not ask for your Social Security number or run credit from this site.
          </p>

          <h2>How I use it</h2>
          <p>
            To find vehicles that may fit your budget, contact you by call, text, or email about those vehicles and your inquiry,
            schedule test drives, keep a record of your consent, and measure which ads and pages work.
            Some messages may be sent with automated or AI-assisted tools and reviewed by a person.
          </p>

          <h2>SMS opt-in data</h2>
          <p>
            <strong>We do not sell or share your SMS opt-in data or personal information with third parties for marketing purposes.</strong>
          </p>
          <p>
            No mobile information will be shared with third parties or affiliates for marketing or promotional purposes.
            Text messaging originator opt-in data and consent will not be shared with any third parties.
            Your mobile number is used only to send you the messages you agreed to receive.
          </p>

          <h2>Who I share it with</h2>
          <p>
            Service providers that help me run this site and contact you (hosting, form processing, text messaging, spreadsheets or CRM),
            only to provide those services to me. The dealership where you may buy, and, only if you choose to apply for financing,
            lenders as part of that application. Google receives ad interaction data and, for conversion measurement, a hashed
            (scrambled) version of your email or phone. None of these parties receive your SMS opt-in data or consent, and none
            may use your information for their own marketing. I do not sell your personal information.
          </p>

          <h2>Texts and calls</h2>
          <p>
            If you agree on the form, {site.brandName} may call and text the number you provide about your vehicle search.
            Message frequency varies. Message and data rates may apply. Reply STOP to any text to opt out, or HELP for help.
            Consent is not a condition of purchase. See the <a href="/terms/">Terms &amp; Conditions</a> for the full SMS Terms.
          </p>

          <h2>Cookies and ads</h2>
          <p>
            I use Google tags to measure ad performance. You can manage Google ad personalization at adssettings.google.com
            and block cookies in your browser settings.
          </p>

          <h2>How long I keep it</h2>
          <p>I keep lead information for as long as needed to help you shop and to meet legal record-keeping requirements, then delete it.</p>

          <h2>Your choices</h2>
          <p>Email {site.email} to see, correct, or delete the information I have about you. Reply STOP to any text to stop messages.</p>

          <h2>Children</h2>
          <p>This site is for adults shopping for vehicles and is not directed to anyone under 18.</p>

          <h2>Changes</h2>
          <p>I’ll update the date above when this policy changes.</p>
        </div>
      </main>
      <Footer />
    </>
  )
}

createRoot(document.getElementById('root')).render(<React.StrictMode><Privacy /></React.StrictMode>)
