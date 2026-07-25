// Plain client-side CSV generation — no server, no third-party API call, no
// stored copy anywhere. The file never leaves the browser until the user
// downloads it, and importing it into their accounting software is a manual
// step they take themselves. Deliberately simple over a "seamless" live
// integration (Xero/MYOB API, OAuth, ongoing sync) — that carries real
// liability if it ever mis-syncs; a static export the user reviews doesn't.
// HTML date inputs give back ISO (YYYY-MM-DD) — convert to AU convention
// (DD/MM/YYYY) before it goes anywhere near a CSV a user will actually read.
export function formatDateForCsv(isoDate: string): string {
  const [year, month, day] = isoDate.split('-')
  if (!year || !month || !day) return isoDate
  return `${day}/${month}/${year}`
}

// Same DD/MM/YYYY formatting, for a JS Date object rather than an ISO string
// (e.g. the computed Payday Super deadline, not a raw form field).
export function formatDateObjectForCsv(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  return `${day}/${month}/${date.getFullYear()}`
}

function escapeCsvField(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

export function downloadCsv(filename: string, header: string[], rows: string[][]) {
  const lines = [header, ...rows].map((row) => row.map(escapeCsvField).join(','))
  const csvContent = lines.join('\r\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
