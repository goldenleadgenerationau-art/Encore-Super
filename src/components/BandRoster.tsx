import { useEffect, useState } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient'
import { localBandStore } from '../lib/localBandStore'
import { useAuth } from '../context/AuthContext'
import { AuthForm } from './AuthForm'
import { Card } from './ui/Badge'

const isLocalMode = !isSupabaseConfigured

interface Band {
  id: string
  name: string
}

interface BandMember {
  id: string
  name: string
  super_fund_name: string | null
  usi: string | null
  member_number: string | null
}

export function BandRoster() {
  const { user } = useAuth()
  const [bands, setBands] = useState<Band[]>([])
  const [selectedBandId, setSelectedBandId] = useState<string | null>(null)
  const [members, setMembers] = useState<BandMember[]>([])
  const [newBandName, setNewBandName] = useState('')
  const [newMember, setNewMember] = useState({ name: '', super_fund_name: '', usi: '', member_number: '' })
  const [loading, setLoading] = useState(true)

  async function loadBands() {
    if (isLocalMode) {
      const data = localBandStore.listBands()
      setBands(data)
      if (data.length > 0 && !selectedBandId) setSelectedBandId(data[0].id)
      setLoading(false)
      return
    }
    const { data } = await supabase.from('bands').select('id, name').order('created_at')
    setBands(data ?? [])
    if (data && data.length > 0 && !selectedBandId) setSelectedBandId(data[0].id)
    setLoading(false)
  }

  async function loadMembers(bandId: string) {
    if (isLocalMode) {
      setMembers(localBandStore.listMembers(bandId))
      return
    }
    const { data } = await supabase
      .from('band_members')
      .select('id, name, super_fund_name, usi, member_number')
      .eq('band_id', bandId)
      .order('created_at')
    setMembers(data ?? [])
  }

  useEffect(() => {
    if (isLocalMode || user) loadBands()
  }, [user])

  useEffect(() => {
    if (selectedBandId) loadMembers(selectedBandId)
    else setMembers([])
  }, [selectedBandId])

  async function createBand() {
    if (!newBandName.trim()) return
    if (isLocalMode) {
      const band = localBandStore.createBand(newBandName.trim())
      setNewBandName('')
      setBands((prev) => [...prev, band])
      setSelectedBandId(band.id)
      return
    }
    if (!user) return
    const { data } = await supabase
      .from('bands')
      .insert({ owner_id: user.id, name: newBandName.trim() })
      .select('id, name')
      .single()
    setNewBandName('')
    if (data) {
      setBands((prev) => [...prev, data])
      setSelectedBandId(data.id)
    }
  }

  async function deleteBand(id: string) {
    if (isLocalMode) {
      localBandStore.deleteBand(id)
    } else {
      await supabase.from('bands').delete().eq('id', id)
    }
    const remaining = bands.filter((b) => b.id !== id)
    setBands(remaining)
    setSelectedBandId(remaining[0]?.id ?? null)
  }

  async function addMember() {
    if (!newMember.name.trim() || !selectedBandId) return
    if (isLocalMode) {
      const member = localBandStore.addMember(selectedBandId, newMember)
      setMembers((prev) => [...prev, member])
      setNewMember({ name: '', super_fund_name: '', usi: '', member_number: '' })
      return
    }
    const { data } = await supabase
      .from('band_members')
      .insert({ band_id: selectedBandId, ...newMember })
      .select('id, name, super_fund_name, usi, member_number')
      .single()
    if (data) setMembers((prev) => [...prev, data])
    setNewMember({ name: '', super_fund_name: '', usi: '', member_number: '' })
  }

  async function deleteMember(id: string) {
    if (isLocalMode) {
      localBandStore.deleteMember(id)
    } else {
      await supabase.from('band_members').delete().eq('id', id)
    }
    setMembers((prev) => prev.filter((m) => m.id !== id))
  }

  if (!isLocalMode && !user) {
    return (
      <div className="mx-auto max-w-md px-6 py-14">
        <h1 className="text-center font-display text-3xl text-plum-200">Band Roster</h1>
        <p className="mt-3 text-center text-plum-400">
          Sign in to save your band members' super fund details once, instead of re-entering them for every gig.
        </p>
        <div className="mt-8">
          <AuthForm />
        </div>
      </div>
    )
  }

  if (loading) {
    return <div className="mx-auto max-w-5xl px-6 py-14 text-plum-400">Loading…</div>
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-14">
      <h1 className="font-display text-3xl text-plum-200 sm:text-4xl">Band Roster</h1>
      <p className="mt-3 max-w-2xl text-plum-400">
        Save each band's members and their super fund details here once — the Gig Calculator's custom split can
        pull them in instead of you re-typing everything for every booking.
      </p>

      {isLocalMode && (
        <Card className="mt-6 max-w-2xl border-dashed border-plum-600">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-plum-400">Testing — temporary</p>
          <p className="mt-2 text-sm text-plum-400">
            Supabase isn't connected yet, so sign-in doesn't work here — this is testing locally instead.
            Bands and members are saved only in this browser and won't be tied to a real account until
            accounts are wired up.
          </p>
        </Card>
      )}

      <div className="mt-10 grid gap-8 lg:grid-cols-[240px_1fr]">
        <Card className="h-fit space-y-3">
          <p className="text-sm font-medium text-plum-200">Your bands</p>
          <ul className="space-y-1">
            {bands.map((band) => (
              <li key={band.id} className="flex items-center justify-between gap-2">
                <button
                  onClick={() => setSelectedBandId(band.id)}
                  className={`flex-1 truncate rounded-lg px-2.5 py-1.5 text-left text-sm ${
                    selectedBandId === band.id ? 'bg-plum-700 text-copper-300' : 'text-plum-400 hover:text-plum-200'
                  }`}
                >
                  {band.name}
                </button>
                <button
                  onClick={() => deleteBand(band.id)}
                  aria-label={`Delete ${band.name}`}
                  className="text-xs text-plum-400 hover:text-red-400"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
          <div className="flex gap-2 pt-2">
            <input
              value={newBandName}
              onChange={(e) => setNewBandName(e.target.value)}
              placeholder="New band name"
              className="w-full rounded-lg border border-plum-600 bg-plum-950 px-2.5 py-1.5 text-sm text-plum-100 outline-none focus:border-copper-400"
            />
            <button
              onClick={createBand}
              className="shrink-0 rounded-lg bg-copper-500 px-3 py-1.5 text-sm font-medium text-plum-950"
            >
              Add
            </button>
          </div>
        </Card>

        <Card>
          {!selectedBandId ? (
            <p className="text-sm text-plum-400">Create a band to start adding members.</p>
          ) : (
            <>
              <div className="grid grid-cols-5 gap-2 text-xs text-plum-400">
                <span>Name</span>
                <span>Super fund</span>
                <span>USI</span>
                <span>Member number</span>
                <span />
              </div>
              <ul className="mt-2 divide-y divide-plum-700/60">
                {members.map((m) => (
                  <li key={m.id} className="grid grid-cols-5 items-center gap-2 py-2 text-sm">
                    <span className="truncate text-plum-100">{m.name}</span>
                    <span className="truncate text-plum-400">{m.super_fund_name || '—'}</span>
                    <span className="truncate text-plum-400">{m.usi || '—'}</span>
                    <span className="truncate text-plum-400">{m.member_number || '—'}</span>
                    <button
                      onClick={() => deleteMember(m.id)}
                      className="justify-self-end text-xs text-plum-400 hover:text-red-400"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>

              <div className="mt-4 grid grid-cols-5 gap-2 border-t border-plum-700 pt-4">
                <input
                  placeholder="Name"
                  value={newMember.name}
                  onChange={(e) => setNewMember((p) => ({ ...p, name: e.target.value }))}
                  className="rounded-lg border border-plum-600 bg-plum-950 px-2 py-1.5 text-sm text-plum-100 outline-none focus:border-copper-400"
                />
                <input
                  placeholder="Super fund"
                  value={newMember.super_fund_name}
                  onChange={(e) => setNewMember((p) => ({ ...p, super_fund_name: e.target.value }))}
                  className="rounded-lg border border-plum-600 bg-plum-950 px-2 py-1.5 text-sm text-plum-100 outline-none focus:border-copper-400"
                />
                <input
                  placeholder="USI"
                  value={newMember.usi}
                  onChange={(e) => setNewMember((p) => ({ ...p, usi: e.target.value }))}
                  className="rounded-lg border border-plum-600 bg-plum-950 px-2 py-1.5 text-sm text-plum-100 outline-none focus:border-copper-400"
                />
                <input
                  placeholder="Member number"
                  value={newMember.member_number}
                  onChange={(e) => setNewMember((p) => ({ ...p, member_number: e.target.value }))}
                  className="rounded-lg border border-plum-600 bg-plum-950 px-2 py-1.5 text-sm text-plum-100 outline-none focus:border-copper-400"
                />
                <button
                  onClick={addMember}
                  className="rounded-lg bg-copper-500 px-3 py-1.5 text-sm font-medium text-plum-950"
                >
                  Add member
                </button>
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  )
}
