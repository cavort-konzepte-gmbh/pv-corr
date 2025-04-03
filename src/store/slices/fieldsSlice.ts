import { createEntityAdapter, createSlice } from "@reduxjs/toolkit";
import { Field } from "@/types/projects";
import { getAllFieldsByProjectId } from "@/services/fields";

interface FieldState {
  status: "idle" | "loading" | "succeeded" | "failed";
}

const fieldsAdapter = createEntityAdapter<Field>({
  sortComparer: (x, y) => x - y,
});

const initialState = fieldsAdapter.getInitialState<FieldState>({
  status: "failed",
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
      });
  },
});

export const {
  selectAll: selectAllFields,
  selectById: selectFieldById,
  selectIds: selectFieldIds,
} = fieldsAdapter.getSelectors((state: any) => state.fields);
