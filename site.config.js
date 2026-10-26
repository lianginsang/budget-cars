// Everything you'll want to edit lives here.
// Values starting with VITE_ in .env override the tracking IDs below.
export const site = {
  // You, the person buyers will talk to
  agentName: 'Lian',
  agentRole: 'Sales consultant',
  // Leave blank to keep the store out of the page until management signs off
  dealerName: '',
  dealerAddress: '',
  city: 'Jacksonville',
  region: 'Northeast Florida',

  // Contact (display + tap-to-call/text). Use a dedicated or tracking number.
  phoneDisplay: '(904) 867-2415',
  phoneE164: '+19048672415',
  email: 'developer@riverfrontsystems.com',

  // Hours you can actually answer
  hours: 'Mon–Sat, 9am–8pm',

  // Budget slider range ($/month)
  budgetMin: 250,
  budgetMax: 900,
  budgetStep: 25,
  budgetDefault: 500,

  // Legal entity shown in the privacy policy and footer
  legalName: 'Lian Sang',
  // Must match the Brand name registered with Twilio (A2P 10DLC) word for word
  brandName: 'Lian Sang',
  privacyEffective: 'October 26, 2026',
  termsEffective: 'October 26, 2026',
}
