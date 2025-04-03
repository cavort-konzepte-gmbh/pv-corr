import { addZone, getAllZonesByFieldId, removeZone, setZone } from "@/services/zones";
import { Zone } from "@/types/projects";
import { createEntityAdapter, createSlice } from "@reduxjs/toolkit";

interface ZonesState {
  status: "idle" | "loading" | "succeeded" | "failed";
}

const zonesAdapter = createEntityAdapter<Zone>({
  sortComparer: (x, y) => x.id.localeCompare(y.id),
});

const initialState = zonesAdapter.getInitialState<ZonesState>({
  status: "idle",
});

export const zonesSlice = createSlice({
  name: "zones",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getAllZonesByFieldId.pending, (state) => {
        state.status = "loading";
      })
      .addCase(getAllZonesByFieldId.fulfilled, (state, action) => {
        state.status = "succeeded";
        zonesAdapter.setAll(state, action.payload);
      })
      .addCase(getAllZonesByFieldId.rejected, (state) => {
        state.status = "failed";
      })
      .addCase(setZone.pending, (state) => {
        state.status = "loading";
      })
      .addCase(setZone.fulfilled, (state, action) => {
        state.status = "succeeded";
        zonesAdapter.upsertOne(state, action.payload);
      })
      .addCase(setZone.rejected, (state) => {
        state.status = "failed";
      })
      .addCase(addZone.pending, (state) => {
        state.status = "loading";
      })
      .addCase(addZone.fulfilled, (state, action) => {
        state.status = "succeeded";
        zonesAdapter.addOne(state, action.payload);
      })
      .addCase(addZone.rejected, (state) => {
        state.status = "failed";
      })
      .addCase(removeZone.pending, (state) => {
        state.status = "loading";
      })
      .addCase(removeZone.fulfilled, (state, action) => {
        state.status = "succeeded";
        // Could generate errors
        zonesAdapter.removeOne(state, action.payload as any);
      })
      .addCase(removeZone.rejected, (state) => {
        state.status = "failed";
      });
  },
});

export const {
  selectAll: selectAllZones,
  selectById: selectZoneById,
  selectIds: selectZoneIds,
} = zonesAdapter.getSelectors((state: any) => state.zones);
