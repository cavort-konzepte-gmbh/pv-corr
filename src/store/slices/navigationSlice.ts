import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface NavigationState {
  view: "customers" | "projects" | "fields" | "zones" | "datapoints" | "analyse" | "output" | "reports" | "settings";
  selectedProjectId?: string;
  selectedFieldId?: string;
  selectedZoneId?: string;
  selectedCustomerId: string | null;
  selectedReportId?: string;
  lastActive: number;
}

const initialState: NavigationState = {
  view: "customers",
  selectedProjectId: undefined,
  selectedFieldId: undefined,
  selectedZoneId: undefined,
  selectedCustomerId: null,
  selectedReportId: undefined,
  lastActive: Date.now(),
};

const navigationSlice = createSlice({
  name: "navigation",
  initialState,
  reducers: {
    setView: (state, action: PayloadAction<NavigationState["view"]>) => {
      state.view = action.payload;
    },
    setSelectedProjectId: (state, action: PayloadAction<string | undefined>) => {
      state.selectedProjectId = action.payload;
    },
    setSelectedFieldId: (state, action: PayloadAction<string | undefined>) => {
      state.selectedFieldId = action.payload;
    },
    setSelectedZoneId: (state, action: PayloadAction<string | undefined>) => {
      state.selectedZoneId = action.payload;
    },
    setSelectedCustomerId: (state, action: PayloadAction<string | null>) => {
      state.selectedCustomerId = action.payload;
    },
    setSelectedReportId: (state, action: PayloadAction<string | undefined>) => {
      state.selectedReportId = action.payload;
    },
    resetNavigation: (state) => {
      state.selectedProjectId = undefined;
      state.selectedFieldId = undefined;
      state.selectedZoneId = undefined;
      state.selectedCustomerId = null;
      state.selectedReportId = undefined;
      state.view = "customers";
    },
    updateLastActive: (state) => {
      state.lastActive = Date.now();
    },
  },
});

export const {
  setView,
  setSelectedProjectId,
  setSelectedFieldId,
  setSelectedZoneId,
  setSelectedCustomerId,
  setSelectedReportId,
  resetNavigation,
  updateLastActive,
} = navigationSlice.actions;

export default navigationSlice.reducer;
