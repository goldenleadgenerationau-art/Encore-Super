// The Payday Super 7-business-day deadline excludes any day that is a public
// holiday for the *whole* of any Australian state or territory — even if the
// payer isn't in that state (ATO: "Payment deadlines for Payday Super").
// Regional/capital-city-only holidays (e.g. Melbourne Cup, Royal Hobart Show,
// WA's regionally-varied King's Birthday) don't count under that rule, so
// they're deliberately left out here — the safe direction if a holiday is
// wrongly excluded from this list is an earlier-than-required deadline, not
// a later one.
//
// Sourced from the Fair Work Ombudsman's official 2026/2027 public holiday
// lists (fairwork.gov.au), unioned across all 8 states/territories. Covers
// 1 July 2026 (when Payday Super starts) through the end of 2027 — the
// nearest 18 months of realistic use. Dates outside this range fall back to
// counting weekdays only.
export const NATIONAL_PUBLIC_HOLIDAYS = new Set<string>([
  // 2026
  '2026-01-01', // New Year's Day
  '2026-01-26', // Australia Day
  '2026-03-02', // Labour Day (WA)
  '2026-03-09', // Canberra Day / Adelaide Cup Day / Eight Hours Day (TAS) / Labour Day (VIC)
  '2026-04-03', // Good Friday
  '2026-04-04', // Easter Saturday
  '2026-04-05', // Easter Sunday
  '2026-04-06', // Easter Monday
  '2026-04-25', // Anzac Day
  '2026-04-27', // Additional Anzac Day holiday (ACT, NSW, WA)
  '2026-05-04', // Labour Day (QLD) / May Day (NT)
  '2026-06-01', // Reconciliation Day (ACT) / WA Day
  '2026-06-08', // King's Birthday (ACT, NSW, NT, SA, TAS, VIC)
  '2026-08-03', // Picnic Day (NT)
  '2026-09-25', // Friday before AFL Grand Final (VIC)
  '2026-10-05', // Labour Day (ACT, NSW, SA) / King's Birthday (QLD)
  '2026-12-25', // Christmas Day
  '2026-12-26', // Boxing Day / Proclamation Day (SA)
  '2026-12-28', // Additional Boxing Day / Proclamation Day holiday

  // 2027
  '2027-01-01', // New Year's Day
  '2027-01-26', // Australia Day
  '2027-03-01', // Labour Day (WA)
  '2027-03-08', // Canberra Day / Adelaide Cup Day / Eight Hours Day (TAS) / Labour Day (VIC)
  '2027-03-26', // Good Friday
  '2027-03-27', // Easter Saturday
  '2027-03-28', // Easter Sunday
  '2027-03-29', // Easter Monday
  '2027-04-25', // Anzac Day (NSW, WA, SA, TAS, VIC)
  '2027-04-26', // Anzac Day / additional holiday (ACT, NSW, NT, QLD, WA)
  '2027-05-03', // Labour Day (QLD) / May Day (NT)
  '2027-05-31', // Reconciliation Day (ACT)
  '2027-06-07', // WA Day
  '2027-06-14', // King's Birthday (ACT, NSW, NT, SA, TAS, VIC)
  '2027-08-02', // Picnic Day (NT)
  '2027-10-04', // Labour Day (ACT, NSW, SA) / King's Birthday (QLD)
  '2027-12-25', // Christmas Day
  '2027-12-26', // Boxing Day / Proclamation Day (SA)
  '2027-12-27', // Additional Christmas Day holiday
  '2027-12-28', // Additional Boxing Day / Proclamation Day holiday / Boxing Day (TAS)
])

// Inclusive range this calendar actually covers — used to know when to fall
// back to a weekday-only estimate instead of silently under-counting.
export const PUBLIC_HOLIDAY_CALENDAR_COVERS = {
  from: '2026-07-01',
  to: '2027-12-31',
}

function toIsoDate(date: Date): string {
  return date.toLocaleDateString('en-CA') // en-CA gives YYYY-MM-DD
}

export function isWithinHolidayCalendar(date: Date): boolean {
  const iso = toIsoDate(date)
  return iso >= PUBLIC_HOLIDAY_CALENDAR_COVERS.from && iso <= PUBLIC_HOLIDAY_CALENDAR_COVERS.to
}

export function isNationalPublicHoliday(date: Date): boolean {
  return NATIONAL_PUBLIC_HOLIDAYS.has(toIsoDate(date))
}
