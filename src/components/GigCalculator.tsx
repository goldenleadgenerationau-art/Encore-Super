import { useEffect, useMemo, useState } from 'react'
import type { BandContractWith, GigInput, GstMode, PaidAs, Perspective, View } from '../types'
import { calculateGig, GST_RATE } from '../lib/gigCalculator'
import { formatAuDate } from '../lib/businessDays'
import { Card } from './ui/Badge'
import { Paywall } from './ui/Paywall'
import { useAuth } from '../context/AuthContext'
import { useAccess } from '../context/AccessContext'
import { useOnceLock } from '../lib/useOnceLock'
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient'
import { localBandStore } from '../lib/localBandStore'
import { downloadCsv, formatDateForCsv, formatDateObjectForCsv } from '../lib/csvExport'
import { downloadDemandLetterPdf } from '../lib/letterPdf'

const currency = new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' })
const MAX_BAND_MEMBERS = 30
const isLocalMode = !isSupabaseConfigured

function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

// New member slots start at $0, not an even split — starting from an even
// split meant the very first field you edited got clamped against the OTHER
// fields' still-default amounts, making it impossible to type e.g. $800 into
// member one before you'd shrunk everyone else. Starting at zero means the
// running total only grows as real numbers go in, in whatever order.
function resizeShares(shares: string[], count: number): string[] {
  const next = shares.slice(0, count)
  while (next.length < count) next.push('')
  return next
}

// Wages can never add up to more than the labour component — if they would,
// scale every entry down proportionally so the total lands exactly on the cap.
function rescaleToFit(shares: string[], cap: number): string[] {
  const sum = shares.reduce((s, v) => s + (Number(v) || 0), 0)
  if (sum <= cap + 0.01 || sum <= 0) return shares
  const factor = cap / sum
  return shares.map((v) => (Number(v) * factor).toFixed(2))
}

function resizeNames(names: string[], count: number): string[] {
  const next = names.slice(0, count)
  while (next.length < count) next.push(`Member ${next.length + 1}`)
  return next
}

interface SavedBand {
  id: string
  name: string
}

export function GigCalculator({ setView }: { setView: (v: View) => void }) {
  const { user } = useAuth()
  const { hasFullAccess, loading: accessLoading } = useAccess()
  // Local dev (no Supabase configured) falls back to the old localStorage-only
  // gate so the free-use flow stays testable without edge functions running.
  const localOnceLock = useOnceLock('encoreSuper.calculatorUsed')
  const [serverChecking, setServerChecking] = useState(isSupabaseConfigured)
  const [serverUsedBefore, setServerUsedBefore] = useState(false)

  useEffect(() => {
    if (isLocalMode || accessLoading || hasFullAccess) {
      setServerChecking(false)
      return
    }
    let cancelled = false
    supabase.functions
      .invoke('check-free-use', { body: { feature: 'calculator' } })
      .then(({ data }) => {
        if (cancelled) return
        setServerUsedBefore(!(data?.allowed ?? true))
        setServerChecking(false)
      })
      .catch(() => {
        if (cancelled) return
        setServerUsedBefore(false)
        setServerChecking(false)
      })
    return () => {
      cancelled = true
    }
  }, [accessLoading, hasFullAccess])

  const checkingFreeUse = !isLocalMode && !hasFullAccess && serverChecking
  const usedBefore = isLocalMode ? localOnceLock : serverUsedBefore
  const [totalFee, setTotalFee] = useState('600')
  const [gstMode, setGstMode] = useState<GstMode>('none')
  const [nonLabourAmount, setNonLabourAmount] = useState('0')
  const [perspective, setPerspective] = useState<Perspective>('performer')
  const [paidAs, setPaidAs] = useState<PaidAs>('individual')
  const [bandContractWith, setBandContractWith] = useState<BandContractWith>('wholeBand')
  const [bandleaderShareInput, setBandleaderShareInput] = useState('')
  const [bandMemberCount, setBandMemberCount] = useState('4')
  const [paydayDate, setPaydayDate] = useState(todayIso())
  const [performanceDate, setPerformanceDate] = useState('')
  const [performanceDateError, setPerformanceDateError] = useState(false)
  const [splitMode, setSplitMode] = useState<'even' | 'custom'>('even')
  const [customShares, setCustomShares] = useState<string[]>([])
  const [customNames, setCustomNames] = useState<string[]>([])
  const [savedBands, setSavedBands] = useState<SavedBand[]>([])
  const [selectedSavedBand, setSelectedSavedBand] = useState('')
  const [letterSenderName, setLetterSenderName] = useState('')
  const [letterSenderEmail, setLetterSenderEmail] = useState('')
  const [letterVenueName, setLetterVenueName] = useState('')
  const [letterErrors, setLetterErrors] = useState<{ senderName?: boolean; venueName?: boolean; performanceDate?: boolean }>({})

  const feeExGst =
    gstMode === 'inclusive' ? (Number(totalFee) || 0) / (1 + GST_RATE) : Number(totalFee) || 0
  const gstAmount = gstMode === 'exclusive' ? (Number(totalFee) || 0) * GST_RATE : gstMode === 'inclusive' ? (Number(totalFee) || 0) - feeExGst : 0
  const labourComponent = Math.max(0, feeExGst - (Number(nonLabourAmount) || 0))
  const memberCount = Math.min(MAX_BAND_MEMBERS, Math.max(1, Number(bandMemberCount) || 1))
  const bandleaderOnly = paidAs === 'bandRepresentative' && bandContractWith === 'bandleaderBusiness'
  const bandleaderShareAmount = Math.min(Math.max(0, Number(bandleaderShareInput) || 0), labourComponent)
  const remainingToAllocate = Math.max(
    0,
    labourComponent - customShares.reduce((sum, s) => sum + (Number(s) || 0), 0)
  )

  useEffect(() => {
    if (paidAs !== 'bandRepresentative') return
    if (isLocalMode) {
      setSavedBands(localBandStore.listBands())
      return
    }
    if (!user) return
    supabase
      .from('bands')
      .select('id, name')
      .order('created_at')
      .then(({ data }) => setSavedBands(data ?? []))
  }, [user, paidAs])

  // If the labour component shrinks (e.g. total fee reduced, or more marked
  // as non-labour) after custom wages were entered, scale them back down so
  // they can never add up to more than what's actually available to split.
  useEffect(() => {
    setCustomShares((prev) => rescaleToFit(prev, labourComponent))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [labourComponent])

  function handleShareChange(index: number, rawValue: string) {
    setCustomShares((prev) => {
      const otherSum = prev.reduce((sum, s, idx) => (idx === index ? sum : sum + (Number(s) || 0)), 0)
      const maxAllowed = Math.max(0, labourComponent - otherSum)
      const desired = Number(rawValue) || 0
      const nextValue = desired > maxAllowed ? maxAllowed.toFixed(2) : rawValue
      return prev.map((s, idx) => (idx === index ? nextValue : s))
    })
  }

  async function loadSavedBand(bandId: string) {
    setSelectedSavedBand(bandId)
    if (!bandId) return
    const names = isLocalMode
      ? localBandStore.listMembers(bandId).map((m) => m.name)
      : ((
          await supabase.from('band_members').select('name').eq('band_id', bandId).order('created_at')
        ).data ?? []
        ).map((m) => m.name)
    if (names.length === 0) return
    const count = names.length
    setBandMemberCount(String(count))
    setCustomNames(names)
    setCustomShares(names.map(() => ''))
    setSplitMode('custom')
  }

  function handleMemberCountChange(value: string) {
    const count = Math.min(MAX_BAND_MEMBERS, Math.max(1, Number(value) || 1))
    setBandMemberCount(Number(value) > MAX_BAND_MEMBERS ? String(count) : value)
    setCustomShares((prev) => resizeShares(prev, count))
    setCustomNames((prev) => resizeNames(prev, count))
  }

  function enableCustomSplit() {
    setCustomShares((prev) => (prev.length === memberCount ? prev : resizeShares(prev, memberCount)))
    setCustomNames((prev) => resizeNames(prev, memberCount))
    setSplitMode('custom')
  }

  const input: GigInput = useMemo(
    () => ({
      totalFee: Number(totalFee) || 0,
      gstMode,
      nonLabourAmount: Number(nonLabourAmount) || 0,
      paidAs,
      perspective,
      bandContractWith: paidAs === 'bandRepresentative' ? bandContractWith : undefined,
      bandleaderShare: bandleaderOnly ? bandleaderShareAmount : undefined,
      bandMemberCount: memberCount,
      bandCustomShares:
        splitMode === 'custom' ? customShares.map((s) => Number(s) || 0) : undefined,
      bandMemberNames: splitMode === 'custom' ? customNames : undefined,
      paydayDate,
    }),
    [
      totalFee,
      gstMode,
      nonLabourAmount,
      paidAs,
      perspective,
      bandContractWith,
      bandleaderOnly,
      bandleaderShareAmount,
      memberCount,
      paydayDate,
      splitMode,
      customShares,
      customNames,
    ]
  )

  const result = useMemo(() => calculateGig(input), [input])

  async function handleDownloadCsv() {
    if (!performanceDate) {
      setPerformanceDateError(true)
      return
    }
    setPerformanceDateError(false)

    let fundLookup: Record<string, { super_fund_name: string; usi: string; member_number: string }> = {}
    if (selectedSavedBand) {
      const members = isLocalMode
        ? localBandStore.listMembers(selectedSavedBand)
        : (
            await supabase
              .from('band_members')
              .select('name, super_fund_name, usi, member_number')
              .eq('band_id', selectedSavedBand)
          ).data ?? []
      fundLookup = Object.fromEntries(
        members.map((m) => [
          m.name,
          {
            super_fund_name: m.super_fund_name ?? '',
            usi: m.usi ?? '',
            member_number: m.member_number ?? '',
          },
        ])
      )
    }

    const header = [
      'Performance Date',
      'Payday',
      'Payee',
      'Type',
      'Description',
      'Amount (AUD)',
      'Super Fund',
      'USI',
      'Member Number',
      'Super Must Land By',
    ]
    const rows: string[][] = []
    const csvDate = formatDateForCsv(paydayDate)
    const csvPerformanceDate = formatDateForCsv(performanceDate)
    const superDueDate = formatDateObjectForCsv(result.fundDeadline)

    if (result.perMember) {
      for (const member of result.perMember) {
        const fund = fundLookup[member.name]
        rows.push([csvPerformanceDate, csvDate, member.name, 'Fee', 'Performance fee', member.wage.toFixed(2), '', '', '', ''])
        rows.push([
          csvPerformanceDate,
          csvDate,
          member.name,
          'Super',
          'Superannuation guarantee (12%)',
          member.superOwed.toFixed(2),
          fund?.super_fund_name ?? '',
          fund?.usi ?? '',
          fund?.member_number ?? '',
          superDueDate,
        ])
      }
    } else {
      rows.push([csvPerformanceDate, csvDate, 'Performer', 'Fee', 'Performance fee', result.labourComponent.toFixed(2), '', '', '', ''])
      if (result.likelyLiable) {
        rows.push([
          csvPerformanceDate,
          csvDate,
          'Performer',
          'Super',
          'Superannuation guarantee (12%)',
          result.superOwed.toFixed(2),
          '',
          '',
          '',
          superDueDate,
        ])
      }
      if (Number(nonLabourAmount) > 0) {
        rows.push([
          csvPerformanceDate,
          csvDate,
          'Performer',
          'Reimbursement',
          'Non-labour costs (PA/lighting hire, travel, materials)',
          (Number(nonLabourAmount) || 0).toFixed(2),
          '',
          '',
          '',
          '',
        ])
      }
    }

    if (result.gstAmount > 0.01) {
      rows.push([csvDate, csvPerformanceDate, 'Payer', 'GST', 'GST collected on invoice', result.gstAmount.toFixed(2), '', '', '', ''])
    }

    downloadCsv(`encore-super-gig-${paydayDate}.csv`, header, rows)
  }

  async function handleDownloadLetter() {
    const errors: typeof letterErrors = {}
    if (!letterSenderName.trim()) errors.senderName = true
    if (!letterVenueName.trim()) errors.venueName = true
    if (!performanceDate) errors.performanceDate = true
    setLetterErrors(errors)
    if (Object.keys(errors).length > 0) return

    await downloadDemandLetterPdf({
      senderName: letterSenderName.trim(),
      senderEmail: letterSenderEmail.trim() || undefined,
      venueName: letterVenueName.trim(),
      performanceDate,
      paydayDate,
      fundDeadline: result.fundDeadline,
      labourComponent: result.labourComponent,
      superOwed: result.superOwed,
      isBand: Boolean(result.perMember),
    })
  }

  if (checkingFreeUse) {
    return (
      <div className="mx-auto max-w-5xl px-6 py-14">
        <h1 className="font-display text-3xl text-plum-200 sm:text-4xl">Gig Super Calculator</h1>
        <p className="mt-3 max-w-2xl text-plum-400">
          Work out the super guarantee owed on a specific booking — built around how live
          performance fees actually work, not a generic payroll calculator.
        </p>
      </div>
    )
  }

  if (usedBefore && !hasFullAccess) {
    return (
      <div className="mx-auto max-w-5xl px-6 py-14">
        <h1 className="font-display text-3xl text-plum-200 sm:text-4xl">Gig Super Calculator</h1>
        <p className="mt-3 max-w-2xl text-plum-400">
          Work out the super guarantee owed on a specific booking — built around how live
          performance fees actually work, not a generic payroll calculator.
        </p>
        <div className="mt-10">
          <Paywall
            title="You've used your free calculation"
            body="The Gig Super Calculator is free to try once per device. Subscribe for unlimited calculations, including band lump-sum splitting."
            setView={setView}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-14">
      <h1 className="font-display text-3xl text-plum-200 sm:text-4xl">Gig Super Calculator</h1>
      <p className="mt-3 max-w-2xl text-plum-400">
        Work out the super guarantee owed on a specific booking — built around how live
        performance fees actually work, not a generic payroll calculator.
      </p>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <Card className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-plum-200">I'm filling this in as…</label>
            <div className="mt-1.5 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setPerspective('performer')}
                className={`rounded-full px-3.5 py-1.5 text-sm ${
                  perspective === 'performer'
                    ? 'bg-plum-700 text-copper-300'
                    : 'border border-plum-600 text-plum-400'
                }`}
              >
                The performer / band
              </button>
              <button
                type="button"
                onClick={() => setPerspective('payer')}
                className={`rounded-full px-3.5 py-1.5 text-sm ${
                  perspective === 'payer'
                    ? 'bg-plum-700 text-copper-300'
                    : 'border border-plum-600 text-plum-400'
                }`}
              >
                The venue / booker paying someone
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-plum-200">Total gig fee (AUD)</label>
            <input
              type="number"
              min="0"
              value={totalFee}
              onChange={(e) => setTotalFee(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-plum-600 bg-plum-950 px-3 py-2 text-plum-100 outline-none focus:border-copper-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-plum-200">GST</label>
            <select
              value={gstMode}
              onChange={(e) => setGstMode(e.target.value as GstMode)}
              className="mt-1.5 w-full rounded-lg border border-plum-600 bg-plum-950 px-3 py-2 text-plum-100 outline-none focus:border-copper-400"
            >
              <option value="none">Not GST registered — no GST applies</option>
              <option value="inclusive">Fee above already includes 10% GST</option>
              <option value="exclusive">Fee above is before GST — add 10% on top</option>
            </select>
            {gstMode !== 'none' && (
              <p className="mt-1.5 text-xs text-plum-400">
                GST-exclusive fee: {currency.format(feeExGst)} · GST: {currency.format(gstAmount)} · Invoice
                total: {currency.format(feeExGst + gstAmount)}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-plum-200">
              Of the GST-exclusive fee, how much is genuinely non-labour? (PA/lighting hire, travel,
              materials — itemised)
            </label>
            <input
              type="number"
              min="0"
              value={nonLabourAmount}
              onChange={(e) => setNonLabourAmount(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-plum-600 bg-plum-950 px-3 py-2 text-plum-100 outline-none focus:border-copper-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-plum-200">How is the fee being paid?</label>
            <select
              value={paidAs}
              onChange={(e) => setPaidAs(e.target.value as PaidAs)}
              className="mt-1.5 w-full rounded-lg border border-plum-600 bg-plum-950 px-3 py-2 text-plum-100 outline-none focus:border-copper-400"
            >
              {perspective === 'payer' ? (
                <>
                  <option value="individual">Paid to the performer as an individual (incl. sole trader / ABN)</option>
                  <option value="bandRepresentative">Lump sum paid to one band member (e.g. bandleader) for the whole band</option>
                  <option value="ownCompany">Paid to the performer's own Pty Ltd company</option>
                </>
              ) : (
                <>
                  <option value="individual">Paid to me as an individual (including sole trader / ABN)</option>
                  <option value="bandRepresentative">Paid to me as a lump sum for the whole band</option>
                  <option value="ownCompany">Paid to my own Pty Ltd company</option>
                </>
              )}
            </select>
          </div>

          {paidAs === 'bandRepresentative' && (
            <div>
              <label className="block text-sm font-medium text-plum-200">
                {perspective === 'payer'
                  ? "Is your booking contract with the whole band, or just with the bandleader's business?"
                  : "Is the venue's booking contract with the whole band, or just with your own business?"}
              </label>
              <select
                value={bandContractWith}
                onChange={(e) => setBandContractWith(e.target.value as BandContractWith)}
                className="mt-1.5 w-full rounded-lg border border-plum-600 bg-plum-950 px-3 py-2 text-plum-100 outline-none focus:border-copper-400"
              >
                <option value="wholeBand">
                  {perspective === 'payer'
                    ? 'The whole band — named as the act, or as individual members'
                    : 'The whole band — we\'re named as the act, or as individual members'}
                </option>
                <option value="bandleaderBusiness">
                  {perspective === 'payer'
                    ? "Just the bandleader's own business — they arrange the rest of the band themselves"
                    : 'Just my own business — I arrange the rest of the band myself'}
                </option>
              </select>
              <p className="mt-1.5 text-xs text-plum-400">
                {perspective === 'payer'
                  ? "This changes what you're calculated as owing: super across the whole band, or just the amount attributable to the bandleader."
                  : "This changes what the venue is calculated as owing you: super across the whole band, or just your own share as bandleader."}
              </p>
            </div>
          )}

          {bandleaderOnly && (
            <div>
              <label className="block text-sm font-medium text-plum-200">
                {perspective === 'payer'
                  ? `Of the ${currency.format(labourComponent)} fee, how much is the bandleader's own personal share?`
                  : `Of the ${currency.format(labourComponent)} fee, how much is your own personal share?`}
              </label>
              <input
                type="number"
                min="0"
                max={labourComponent}
                placeholder="0.00"
                value={bandleaderShareInput}
                onChange={(e) => setBandleaderShareInput(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-plum-600 bg-plum-950 px-3 py-2 text-plum-100 outline-none focus:border-copper-400"
              />
              <p className="mt-1.5 text-xs text-plum-400">
                {perspective === 'payer'
                  ? `The rest (${currency.format(Math.max(0, labourComponent - bandleaderShareAmount))}) is money the bandleader passes on to the other band members — only their own share is superable on your side.`
                  : `The rest (${currency.format(Math.max(0, labourComponent - bandleaderShareAmount))}) is money you pass on to the other band members — only your own share is superable from what the venue owes you.`}
              </p>
            </div>
          )}

          {paidAs === 'bandRepresentative' && !bandleaderOnly && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-plum-200">Number of band members sharing the fee</label>
                <input
                  type="number"
                  min="1"
                  max={MAX_BAND_MEMBERS}
                  value={bandMemberCount}
                  onChange={(e) => handleMemberCountChange(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-plum-600 bg-plum-950 px-3 py-2 text-plum-100 outline-none focus:border-copper-400"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setSplitMode('even')}
                  className={`rounded-full px-3.5 py-1.5 text-sm ${
                    splitMode === 'even'
                      ? 'bg-plum-700 text-copper-300'
                      : 'border border-plum-600 text-plum-400'
                  }`}
                >
                  Split evenly
                </button>
                <button
                  type="button"
                  onClick={enableCustomSplit}
                  className={`rounded-full px-3.5 py-1.5 text-sm ${
                    splitMode === 'custom'
                      ? 'bg-plum-700 text-copper-300'
                      : 'border border-plum-600 text-plum-400'
                  }`}
                >
                  Customise per member
                </button>
              </div>

              {(isLocalMode || user) && savedBands.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-plum-200">
                    Load member names from a saved band
                  </label>
                  <select
                    value={selectedSavedBand}
                    onChange={(e) => loadSavedBand(e.target.value)}
                    className="mt-1.5 w-full rounded-lg border border-plum-600 bg-plum-950 px-3 py-2 text-sm text-plum-100 outline-none focus:border-copper-400"
                  >
                    <option value="">Choose a band…</option>
                    {savedBands.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {splitMode === 'custom' && (
                <div className="space-y-2 rounded-lg border border-plum-700 p-3">
                  {customShares.map((share, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input
                        value={customNames[i] ?? `Member ${i + 1}`}
                        onChange={(e) =>
                          setCustomNames((prev) => prev.map((n, idx) => (idx === i ? e.target.value : n)))
                        }
                        className="w-28 shrink-0 rounded-lg border border-plum-600 bg-plum-950 px-2 py-1.5 text-sm text-plum-100 outline-none focus:border-copper-400"
                      />
                      <input
                        type="number"
                        min="0"
                        placeholder="0.00"
                        value={share}
                        onChange={(e) => handleShareChange(i, e.target.value)}
                        className="w-full rounded-lg border border-plum-600 bg-plum-950 px-3 py-1.5 text-sm text-plum-100 outline-none focus:border-copper-400"
                      />
                    </div>
                  ))}
                  <p
                    className={`pt-1 text-xs ${
                      remainingToAllocate > 0.01 ? 'text-copper-300' : 'text-plum-400'
                    }`}
                  >
                    {remainingToAllocate > 0.01
                      ? `${currency.format(remainingToAllocate)} left to allocate of ${currency.format(labourComponent)} total.`
                      : `Fully allocated — ${currency.format(labourComponent)} total.`}
                  </p>
                </div>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-plum-200">Payday (day the fee is actually paid)</label>
            <input
              type="date"
              value={paydayDate}
              onChange={(e) => setPaydayDate(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-plum-600 bg-plum-950 px-3 py-2 text-plum-100 outline-none focus:border-copper-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-plum-200">Performance date</label>
            <input
              type="date"
              required
              value={performanceDate}
              onChange={(e) => {
                setPerformanceDate(e.target.value)
                if (e.target.value) {
                  setPerformanceDateError(false)
                  setLetterErrors((prev) => ({ ...prev, performanceDate: false }))
                }
              }}
              className={`mt-1.5 w-full rounded-lg border bg-plum-950 px-3 py-2 text-plum-100 outline-none focus:border-copper-400 ${
                performanceDateError ? 'border-red-400' : 'border-plum-600'
              }`}
            />
            {performanceDateError ? (
              <p className="mt-1.5 text-xs text-red-400">
                Required before downloading the CSV — enter the date of the actual gig.
              </p>
            ) : (
              <p className="mt-1.5 text-xs text-plum-400">
                Not used in the calculation — just makes it easier to match this record back to the
                actual gig later, since payday often lands well after the show.
              </p>
            )}
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="border-copper-400/30 bg-gradient-to-b from-plum-900 to-plum-900/40">
            <p className="text-sm text-plum-400">Super guarantee owed</p>
            <p className="mt-1 font-display text-4xl text-copper-300">
              {currency.format(result.superOwed)}
            </p>
            <p className="mt-2 text-sm text-plum-400">
              {bandleaderOnly
                ? perspective === 'payer'
                  ? `on the bandleader's own share of ${currency.format(bandleaderShareAmount)}, at 12%`
                  : `on your own share of ${currency.format(bandleaderShareAmount)}, at 12%`
                : `on a labour component of ${currency.format(result.labourComponent)}, at 12%`}
            </p>
            {result.gstAmount > 0.01 && (
              <p className="mt-1 text-xs text-plum-400">
                Fee entered {currency.format(input.totalFee)} · GST {currency.format(result.gstAmount)} ·
                GST-exclusive {currency.format(result.feeExGst)} · invoice total{' '}
                {currency.format(result.invoiceTotal)}
              </p>
            )}

            {result.perMember && (
              <div className="mt-5 border-t border-plum-700 pt-4">
                <p className="text-sm font-medium text-plum-200">Per band member</p>
                <div className="mt-2 grid grid-cols-4 gap-2 text-xs text-plum-400">
                  <span>Member</span>
                  <span className="text-right">Wage</span>
                  <span className="text-right">Super (+12%)</span>
                  <span className="text-right">Total</span>
                </div>
                <ul className="mt-1 divide-y divide-plum-700/60">
                  {result.perMember.map((member, i) => (
                    <li key={i} className="grid grid-cols-4 gap-2 py-2 text-sm">
                      <span className="truncate text-plum-400">{member.name}</span>
                      <span className="text-right text-plum-200">{currency.format(member.wage)}</span>
                      <span className="text-right text-plum-200">{currency.format(member.superOwed)}</span>
                      <span className="text-right font-medium text-copper-300">
                        {currency.format(member.total)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {!result.perMember && bandleaderOnly && (
              <div className="mt-5 border-t border-plum-700 pt-4">
                <p className="text-sm font-medium text-plum-200">
                  {perspective === 'payer' ? "The bandleader's breakdown" : 'Your breakdown'}
                </p>
                <div className="mt-2 divide-y divide-plum-700/60 rounded-lg border border-plum-700">
                  <div className="flex items-center justify-between gap-3 px-3 py-2 text-sm">
                    <span className="text-plum-200">Whole fee paid</span>
                    <span className="text-plum-200">{currency.format(result.feeExGst)}</span>
                  </div>
                  {Number(nonLabourAmount) > 0 && (
                    <div className="flex items-center justify-between gap-3 px-3 py-2 text-sm">
                      <span className="text-plum-400">
                        Non-labour items
                        <span className="ml-2 text-xs">(PA/lighting, travel — not superable)</span>
                      </span>
                      <span className="text-plum-400">-{currency.format(Number(nonLabourAmount) || 0)}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between gap-3 px-3 py-2 text-sm">
                    <span className="text-plum-200">
                      {perspective === 'payer' ? "Bandleader's own share" : 'Your own share'}
                      <span className="ml-2 text-xs text-plum-400">(superable)</span>
                    </span>
                    <span className="text-plum-200">{currency.format(bandleaderShareAmount)}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3 bg-copper-400/5 px-3 py-2 text-sm">
                    <span className="text-copper-300">Superannuation guarantee (12%)</span>
                    <span className="text-copper-300">{currency.format(result.superOwed)}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3 px-3 py-2 text-sm font-semibold">
                    <span className="text-plum-100">{perspective === 'payer' ? 'Total cost' : 'Total from venue'}</span>
                    <span className="text-copper-300">{currency.format(result.feeExGst + result.superOwed)}</span>
                  </div>
                </div>
              </div>
            )}

            {!result.perMember && !bandleaderOnly && (
              <div className="mt-5 border-t border-plum-700 pt-4">
                <p className="text-sm font-medium text-plum-200">
                  {perspective === 'payer' ? 'What you owe' : 'Your breakdown'}
                </p>
                <div className="mt-2 grid grid-cols-3 gap-2 text-xs text-plum-400">
                  <span>Fee (labour)</span>
                  <span className="text-right">Super (+12%)</span>
                  <span className="text-right">Total</span>
                </div>
                <div className="grid grid-cols-3 gap-2 py-2 text-sm">
                  <span className="text-plum-200">{currency.format(result.labourComponent)}</span>
                  <span className="text-right text-plum-200">{currency.format(result.superOwed)}</span>
                  <span className="text-right font-medium text-copper-300">
                    {currency.format(result.labourComponent + result.superOwed)}
                  </span>
                </div>
                {Number(nonLabourAmount) > 0 && (
                  <p className="pt-1 text-xs text-plum-400">
                    Plus {currency.format(Number(nonLabourAmount) || 0)} for non-labour items (PA/lighting hire,
                    travel, materials) — not superable, paid on top of the above.
                  </p>
                )}
              </div>
            )}

            <div className="mt-5 border-t border-plum-700 pt-4">
              <p className="text-sm font-medium text-plum-200">Must land in the fund by</p>
              <p className="mt-1 text-copper-300">{formatAuDate(result.fundDeadline)}</p>
              <p className="mt-1 text-xs text-plum-400">
                7 business days after payday, weekdays only — doesn't account for public holidays.
              </p>
            </div>

            <div className="mt-5 border-t border-plum-700 pt-4">
              <button
                onClick={handleDownloadCsv}
                className="w-full rounded-lg border border-plum-600 px-4 py-2 text-sm font-medium text-plum-200 hover:border-copper-400"
              >
                Download CSV for your accounting records
              </button>
              <p className="mt-2 text-xs text-plum-400">
                A plain summary of this calculation — fee, super, and GST line items. Nothing is sent anywhere;
                review it and import it yourself. Not a live sync with any accounting platform.
              </p>
              <p className="mt-1.5 text-xs text-plum-400">
                Import it via your accounting software's bank statement/transactions import, not the Bills
                import — Bills import needs contact and account codes already set up on your side, which a
                downloaded file can't know.
              </p>
            </div>

            <div className="mt-5 border-t border-plum-700 pt-4">
              <p className="text-sm font-medium text-plum-200">Unpaid super? Send a letter</p>
              <p className="mt-1.5 text-xs text-plum-400">
                Generates a factual payment-request letter for this booking, citing the actual rules —
                not a legal threat. Fill these in to enable it.
              </p>

              <div className="mt-3 space-y-3">
                <div>
                  <label className="block text-xs font-medium text-plum-300">Your name / business</label>
                  <input
                    type="text"
                    value={letterSenderName}
                    onChange={(e) => {
                      setLetterSenderName(e.target.value)
                      if (e.target.value.trim()) setLetterErrors((prev) => ({ ...prev, senderName: false }))
                    }}
                    placeholder="e.g. Alex Rivera"
                    className={`mt-1 w-full rounded-lg border bg-plum-950 px-3 py-1.5 text-sm text-plum-100 outline-none focus:border-copper-400 ${
                      letterErrors.senderName ? 'border-red-400' : 'border-plum-600'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-plum-300">Your email (optional)</label>
                  <input
                    type="email"
                    value={letterSenderEmail}
                    onChange={(e) => setLetterSenderEmail(e.target.value)}
                    placeholder="e.g. alex@example.com"
                    className="mt-1 w-full rounded-lg border border-plum-600 bg-plum-950 px-3 py-1.5 text-sm text-plum-100 outline-none focus:border-copper-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-plum-300">Venue / payer name</label>
                  <input
                    type="text"
                    value={letterVenueName}
                    onChange={(e) => {
                      setLetterVenueName(e.target.value)
                      if (e.target.value.trim()) setLetterErrors((prev) => ({ ...prev, venueName: false }))
                    }}
                    placeholder="e.g. The Rocket Bar"
                    className={`mt-1 w-full rounded-lg border bg-plum-950 px-3 py-1.5 text-sm text-plum-100 outline-none focus:border-copper-400 ${
                      letterErrors.venueName ? 'border-red-400' : 'border-plum-600'
                    }`}
                  />
                </div>
              </div>

              {(letterErrors.senderName || letterErrors.venueName || letterErrors.performanceDate) && (
                <p className="mt-2 text-xs text-red-400">
                  Fill in your name, the venue/payer name{!performanceDate ? ', and the performance date above' : ''} to
                  generate the letter.
                </p>
              )}

              <button
                onClick={handleDownloadLetter}
                className="mt-3 w-full rounded-lg border border-plum-600 px-4 py-2 text-sm font-medium text-plum-200 hover:border-copper-400"
              >
                Download demand letter (PDF)
              </button>
            </div>
          </Card>

          <Card>
            <p className="text-sm font-medium text-plum-200">What this means</p>
            <ul className="mt-3 space-y-3 text-sm text-plum-400">
              {result.notes.map((note, i) => (
                <li key={i} className="flex gap-2">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-copper-400" />
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  )
}
