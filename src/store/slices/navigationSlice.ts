import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface NavigationState {
  view: 'customers' | 'projects' | 'fields' | 'zones' | 'datapoints' | 'analyse' | 'evaluation' | 'output' | 'settings'
  selectedProjectId: string | undefined
  selectedFieldId: string | undefined
  selectedZoneId: string | undefined
  selectedCustomerId: string | null
  lastActive: number
}

const initialState: NavigationState = {
  view: 'customers',
  selectedProjectId: undefined,
  selectedFieldId: undefined,
  selectedZoneId: undefined,
  selectedCustomerId: null,
  lastActive: Date.now(),
}

const navigationSlice = createSlice({
  name: 'navigation',
  initialState,
  reducers: {
    setView: (state, action: PayloadAction<NavigationState['view']>) => {
      state.view = action.payload
    },
    setSelectedProjectId: (state, action: PayloadAction<string | undefined>) => {
      state.selectedProjectId = action.payload
    },
    setSelectedFieldId: (state, action: PayloadAction<string | undefined>) => {
      state.selectedFieldId = action.payload
    },
    setSelectedZoneId: (state, action: PayloadAction<string | undefined>) => {
      state.selectedZoneId = action.payload
    },
    setSelectedCustomerId: (state, action: PayloadAction<string | null>) => {
      state.selectedCustomerId = action.payload
    },
    resetNavigation: (state) => {
      state.selectedProjectId = undefined
      state.selectedFieldId = undefined
      state.selectedZoneId = undefined
    },
    updateLastActive: (state) => {
      state.lastActive = Date.now()
    },
  },
})

export const {
  setView,
  setSelectedProjectId,
  setSelectedFieldId,
  setSelectedZoneId,
  setSelectedCustomerId,
  resetNavigation,
  updateLastActive,
} = navigationSlice.actions

export default navigationSlice.reducer
