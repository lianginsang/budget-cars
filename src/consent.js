// Exact wording the buyer saw, with which boxes were checked, saved with each lead as the consent record.
// Both forms use the ids consent-updates, consent-offers (the span right after each checkbox) and consent-note.
export function consentRecord() {
  const t = (id) => document.getElementById(id)?.textContent.replace(/\s+/g, ' ').trim() || ''
  const box = (id) => (document.getElementById(id)?.previousElementSibling?.checked ? '[x] ' : '[ ] ') + t(id)
  return [box('consent-updates'), box('consent-offers'), t('consent-note')].join(' | ')
}
