# Budget-first car landing page

Vite + React front end, one Node function (`api/lead.js`). Deploys on Render (Node web service via `server.js`) or Vercel.

```
index.html / src/main.jsx      landing page (budget slider → 4-step qualifier)
thanks/ → src/thanks.jsx       thank-you page; the Google Ads lead conversion fires HERE
privacy/ → src/privacy.jsx     Privacy Policy (starter, have it reviewed)
terms/ → src/terms.jsx         Terms & Conditions with SMS Terms (needed for Twilio A2P 10DLC)
api/lead.js                    validates, scores (HOT/WARM/NURTURE), forwards to your webhook
server.js                      production Node server for Render: serves dist/ and POST /api/lead
site.config.js                 your name, phone, hours, budget range, dealer name
.env.example                   tracking IDs + webhook URL
```

## 1. Edit before launch
- `site.config.js`: real phone (ideally a dedicated or tracking number), email, hours.
- `dealerName` / `dealerAddress`: leave blank until management signs off. Once they do, adding them helps trust and approval.
- Replace the placeholder initial in the "You'll be talking to" section with a real photo (`public/lian.jpg`). It noticeably lifts lead rate.

## 2. Run locally
```
npm install
cp .env.example .env
npm run dev          # http://localhost:5173, form works locally, leads print in the terminal
```

## 3. Deploy (Render)
1. Push this folder to a GitHub repo.
2. On render.com: New → Blueprint and pick the repo (it reads `render.yaml`). Or New → Web Service with:
   - Runtime: Node
   - Build command: `npm ci --include=dev && npm run build`
   - Start command: `npm start`
3. Environment: add everything from `.env.example`. The `VITE_` values are baked in at build time, so redeploy after changing them.
4. Settings → Custom Domains: add your domain. HTTPS is automatic.

Free instances sleep after about 15 minutes without traffic, and the first visit after that takes 30+ seconds to load. For paid ads, use at least the Starter plan so visitors never hit that delay.

To test the production build locally: `npm run build && npm start` (http://localhost:3000).

### Or deploy on Vercel
1. Push this folder to a GitHub repo, then "Add New Project" on vercel.com and import it (framework: Vite).
2. Project → Settings → Environment Variables: add everything from `.env.example`.
3. Settings → Domains: add your domain. HTTPS is automatic.

## 4. Where leads go (pick one for `LEAD_WEBHOOK_URL`)
Each lead arrives as JSON with a ready-made `summary` line, for example:
`HOT (82) Maria +19045551234 — $525/mo, $1,000–$3,000, credit Good (660–719), income $3,500–$5,000, Today, Either SUV, trade: Yes | has trade`

**Free option: Google Sheet + email alert**, using Extensions → Apps Script in a new sheet:
```js
function doPost(e) {
  const l = JSON.parse(e.postData.contents);
  const sh = SpreadsheetApp.getActiveSheet();
  if (sh.getLastRow() === 0) sh.appendRow(['Time','Tier','Score','Name','Phone','Email','Budget','Down','Trade','Credit','Income','Timing','Type','New/Used','Flags','gclid','Campaign','Keyword','Consent text','IP']);
  const a = l.attribution || {};
  sh.appendRow([l.receivedAt,l.tier,l.score,l.firstName,l.phone,l.email,l.budget,l.down,l.trade,l.credit,l.income,l.timing,l.type,l.condition,(l.flags||[]).join('; '),a.gclid||'',a.utm_campaign||'',a.utm_term||'',l.consentText,l.ip]);
  MailApp.sendEmail(Session.getActiveUser().getEmail(), 'New lead: ' + l.tier + ' ' + l.firstName, l.summary);
  return ContentService.createTextOutput('ok');
}
```
Deploy → New deployment → Web app → "Anyone" can access → copy the URL into `LEAD_WEBHOOK_URL`.

**Other options:** a Zapier or Make webhook (to forward to SMS, a CRM, or your AI responder), or a GoHighLevel inbound webhook. Use `LEAD_WEBHOOK_URL_2` to send to two places at once.

The consent text, timestamp, and IP are saved with every lead. Keep them, because they are your record of permission to text.

## 5. Google Ads tracking
1. Goals → Conversions → New → Website → "Submit lead form". Copy the `AW-…` ID and label into `VITE_GADS_ID` / `VITE_GADS_LEAD_LABEL`. Turn on Enhanced Conversions (the thank-you page already sends the email/phone, which Google hashes).
2. Optional: a second conversion for "Phone call clicks from website" goes into `VITE_GADS_CALL_LABEL`.
3. Leave auto-tagging ON. The page captures `gclid`, and it's stored with each lead so you can later upload "sold" deals as offline conversions. That is how Google learns to find buyers rather than form-fillers.
4. Final URL: `https://yourdomain.com/`. Optional tracking template: `{lpurl}?utm_source=google&utm_medium=cpc&utm_campaign={campaignid}&utm_term={keyword}`

## 6. Ad copy (responsive search ad)
**Headlines (≤30):** Shop Cars By Monthly Budget · Tell Us Your Monthly Budget · Matches Available Today · Jacksonville Car Shopping · New & Used, Every Budget · No Credit Check To See Cars · Get A Short List By Text · Set Your Payment, Not Price · Talk To One Real Person · Trade-In Welcome · Drive Home This Week · 1-Minute Budget Match · All Credit Situations Seen · SUVs, Trucks, Cars & Vans · Find What Fits Your Budget

**Descriptions (≤90):**
- Pick a monthly budget and we'll text you cars that fit, available today in Jacksonville.
- No SSN, no hard pull to see matches. New and used. Trade-ins welcome. Takes one minute.
- One local sales pro shops your numbers and tells you straight what fits and what doesn't.
- Rebuilding credit or great credit, tell us honestly and we'll find realistic options.

**Why there's no "Cars under $500/month" headline:** a specific payment amount in an ad is a "trigger term" under federal Truth in Lending rules (Reg Z, or Reg M for leases). It requires stating the down payment, term, and APR in the same ad, which an RSA can't fit. Inviting people to name *their* budget gets the same click without the exposure. If you still want to test a specific number, run it past the dealership's compliance or F&I director first.

## 7. Keywords (phrase + exact match to start)
"cars for sale jacksonville", "used cars jacksonville", "car dealership near me", "low monthly payment cars", "cars under 400 a month", "cars under 500 a month", "affordable suv jacksonville", "buy a car this weekend", "bad credit car dealership jacksonville", "first time car buyer jacksonville", "trade in my car jacksonville"

**Negatives:** jobs, careers, salary, hiring, parts, service, repair, oil change, recall, rental, rent, junk, scrap, salvage, auction, manual, diy, insurance quote, kbb, "how to", free, toy, rc, lego, uber, lyft, craigslist, facebook marketplace, by owner, and any competitor or brand names you're told not to use.

## 8. Targeting notes
- **Location:** "Presence: people in or regularly in your locations." Target Jacksonville plus a radius of about 25–35 miles.
- **Credit policy:** because the ads talk about monthly payments and credit, Google may classify them under its personalized advertising policy for credit (car loans are listed). If so, you **cannot** target by ZIP code, age, gender, parental or marital status. City and radius targeting still work, so build it that way from day one and you won't get disrupted.
- **Schedule:** run ads only during the hours set in `site.config.js`, since speed to lead is everything.
- **Budget:** at $500–1,000/month, start with one campaign and one ad group, use Maximize Clicks with a max CPC cap, then switch to Maximize Conversions after about 15–30 leads.
