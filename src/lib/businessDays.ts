import { isNationalPublicHoliday, isWithinHolidayCalendar } from '../data/publicHolidays'

// Payday Super requires SG contributions to reach the performer's fund within
// 7 *business* days of payday (ATO: "Payment deadlines for Payday Super").
// The ATO defines a business day as any day that isn't a Saturday, Sunday, or
// a public holiday for the *whole* of any Australian state or territory —
// even one the payer isn't in. This skips weekends always, and skips those
// public holidays too wherever the date falls within the hardcoded calendar
// (2026–2027) — see src/data/publicHolidays.ts for sourcing and scope.
export function addBusinessDays(start: Date, days: number): { date: Date; usedHolidayCalendar: boolean } {
  const result = new Date(start)
  let added = 0
  let usedHolidayCalendar = false
  while (added < days) {
    result.setDate(result.getDate() + 1)
    const day = result.getDay()
    if (day === 0 || day === 6) continue
    if (isWithinHolidayCalendar(result)) {
      usedHolidayCalendar = true
      if (isNationalPublicHoliday(result)) continue
    }
    added++
  }
  return { date: result, usedHolidayCalendar }
}

export function formatAuDate(date: Date): string {
  return date.toLocaleDateString('en-AU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}
