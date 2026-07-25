// Local-only stand-in for the `bands` / `band_members` Supabase tables, used
// only while VITE_SUPABASE_URL isn't configured yet so Band Roster (and the
// Gig Calculator's "load from saved band" picker) can be tested end-to-end
// on this device. TODO: remove once Supabase is connected — real accounts
// make this redundant.
export interface LocalBand {
  id: string
  name: string
}

export interface LocalBandMember {
  id: string
  band_id: string
  name: string
  super_fund_name: string
  usi: string
  member_number: string
}

const BANDS_KEY = 'encoreSuper.localBands'
const MEMBERS_KEY = 'encoreSuper.localBandMembers'

function readBands(): LocalBand[] {
  try {
    return JSON.parse(localStorage.getItem(BANDS_KEY) || '[]')
  } catch {
    return []
  }
}

function writeBands(bands: LocalBand[]) {
  localStorage.setItem(BANDS_KEY, JSON.stringify(bands))
}

function readMembers(): LocalBandMember[] {
  try {
    return JSON.parse(localStorage.getItem(MEMBERS_KEY) || '[]')
  } catch {
    return []
  }
}

function writeMembers(members: LocalBandMember[]) {
  localStorage.setItem(MEMBERS_KEY, JSON.stringify(members))
}

export const localBandStore = {
  listBands(): LocalBand[] {
    return readBands()
  },
  createBand(name: string): LocalBand {
    const band = { id: crypto.randomUUID(), name }
    writeBands([...readBands(), band])
    return band
  },
  deleteBand(id: string) {
    writeBands(readBands().filter((b) => b.id !== id))
    writeMembers(readMembers().filter((m) => m.band_id !== id))
  },
  listMembers(bandId: string): LocalBandMember[] {
    return readMembers().filter((m) => m.band_id === bandId)
  },
  addMember(bandId: string, fields: Omit<LocalBandMember, 'id' | 'band_id'>): LocalBandMember {
    const member = { id: crypto.randomUUID(), band_id: bandId, ...fields }
    writeMembers([...readMembers(), member])
    return member
  },
  deleteMember(id: string) {
    writeMembers(readMembers().filter((m) => m.id !== id))
  },
}
