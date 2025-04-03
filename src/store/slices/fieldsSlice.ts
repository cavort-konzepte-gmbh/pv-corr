import { createEntityAdapter, createSlice } from "@reduxjs/toolkit";
import { Field } from "@/types/projects";
import { addField, getAllFieldsByProjectId, removeField, setField } from "@/services/fields";

interface FieldState {
  status: "idle" | "loading" | "succeeded" | "failed";
}

const fieldsAdapter = createEntityAdapter<Field>({
  sortComparer: (x, y) => x - y,
});

const initialState = fieldsAdapter.getInitialState<FieldState>({
  status: "idle",
});

export const fieldsSlice = createSlice({
  name: "fields",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getAllFieldsByProjectId.pending, (state) => {
        state.status = "loading";
      })
      .addCase(getAllFieldsByProjectId.fulfilled, (state, action) => {
        state.status = "succeeded";
        fieldsAdapter.setAll(state, action.payload);
      })
      .addCase(getAllFieldsByProjectId.rejected, (state) => {
        state.status = "failed";
      })
      .addCase(addField.pending, (state) => {
        state.status = "loading";
      })
      .addCase(addField.fulfilled, (state, action) => {
        state.status = "succeeded";
        fieldsAdapter.addOne(state, action.payload);
      })
      .addCase(addField.rejected, (state) => {
        state.status = "failed";
      })
      .addCase(removeField.pending, (state) => {
        state.status = "loading";
      })
      .addCase(removeField.fulfilled, (state, action) => {
        state.status = "succeeded";
        fieldsAdapter.removeOne(state, action.payload);
      })
      .addCase(removeField.rejected, (state) => {
        state.status = "failed";
      })
      .addCase(setField.pending, (state) => {
        state.status = "loading";
      })
      .addCase(setField.fulfilled, (state, action) => {
        state.status = "succeeded";
        fieldsAdapter.upsertOne(state, action.payload);
      })
      .addCase(setField.rejected, (state) => {
        state.status = "failed";
      });
  },
});

export const {
  selectAll: selectAllFields,
  selectById: selectFieldById,
  selectIds: selectFieldIds,
} = fieldsAdapter.getSelectors((state: any) => state.fields);
