import { useMemo, useState } from 'react'
import { addBusinessDays, formatAuDate } from '../lib/businessDays'
import { Card } from './ui/Badge'
import { Paywall } from './ui/Paywall'
import { useAccess } from '../context/AccessContext'
import type { View } from '../types'

function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

export function PaydayDeadline({ setView }: { setView: (v: View) => void }) {
  const { hasFullAccess } = useAccess()
  const [paydayDate, setPaydayDate] = useState(todayIso())
  const [interacted, setInteracted] = useState(false)

  const deadline = useMemo(() => {
    const start = paydayDate ? new Date(paydayDate) : new Date()
    return addBusinessDays(start, 7)
  }, [paydayDate])

  const daysLeft = useMemo(() => {
    const diff = deadline.getTime() - Date.now()
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
  }, [deadline])

  const locked = interacted && !hasFullAccess

  return (
    <div className="mx-auto max-w-3xl px-6 py-14">
      <h1 className="font-display text-3xl text-plum-200 sm:text-4xl">Payday Deadline Tracker</h1>
      <p className="mt-3 text-plum-400">
        From 1 July 2026, super must reach a performer's fund within 7 business days of
        payday. Enter the payday to see the actual deadline.
      </p>

      {locked ? (
        <div className="mt-8">
          <Paywall
            title="See your actual deadline"
            body="Subscribe for unlimited use of the Payday Deadline Tracker across every booking."
            setView={setView}
          />
        </div>
      ) : (
        <Card className="mt-8">
          <label className="block text-sm font-medium text-plum-200">Payday</label>
          <input
            type="date"
            value={paydayDate}
            onChange={(e) => {
              setPaydayDate(e.target.value)
              setInteracted(true)
            }}
            className="mt-1.5 w-full rounded-lg border border-plum-600 bg-plum-950 px-3 py-2 text-plum-100 outline-none focus:border-copper-400 sm:w-64"
          />

          <div className="mt-6 border-t border-plum-700 pt-6">
            <p className="text-sm text-plum-400">Super must land in the fund by</p>
            <p className="mt-1 font-display text-3xl text-copper-300">{formatAuDate(deadline)}</p>
            {daysLeft >= 0 ? (
              <p className="mt-2 text-sm text-plum-400">{daysLeft} day{daysLeft === 1 ? '' : 's'} from today</p>
            ) : (
              <p className="mt-2 text-sm text-plum-400">This date has already passed</p>
            )}
            <p className="mt-4 text-xs text-plum-400">
              This counts weekdays only. It doesn't subtract national or state public
              holidays, so treat it as the latest possible date and pay a little earlier
              where you can.
            </p>
          </div>
        </Card>
      )}
    </div>
  )
}
