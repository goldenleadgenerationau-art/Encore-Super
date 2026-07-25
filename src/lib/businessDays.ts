// Payday Super requires SG contributions to reach the performer's fund within
// 7 *business* days of payday (ATO: "About Payday Super").
// This counts Mon–Fri only. It does NOT subtract national/state public holidays —
// flagged to the user, since holiday calendars differ by state.
export function addBusinessDays(start: Date, days: number): Date {
  const result = new Date(start)
  let added = 0
  while (added < days) {
    result.setDate(result.getDate() + 1)
    const day = result.getDay()
    if (day !== 0 && day !== 6) added++
  }
  return result
}

export function formatAuDate(date: Date): string {
  return date.toLocaleDateString('en-AU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}
