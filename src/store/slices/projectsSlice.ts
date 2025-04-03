import { createSlice, createEntityAdapter } from "@reduxjs/toolkit";
import { Field, Project } from "@/types/projects";
import { addProject, getAllProjects, removeProject, setProject } from "@/services/projects";
interface ProjectState {
  status: "idle" | "loading" | "succeeded" | "failed";
}

const projectsAdapter = createEntityAdapter<Project>({
  sortComparer: (x, y) => x - y,
});

const fieldsAdapter = createEntityAdapter<Field>({
  sortComparer: (x, y) => x - y,
});

const initialState = projectsAdapter.getInitialState<ProjectState>({
  status: "idle",
});

export const projectsSlice = createSlice({
  name: "projects",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getAllProjects.pending, (state) => {
        state.status = "loading";
      })
      .addCase(getAllProjects.fulfilled, (state, action) => {
        state.status = "succeeded";
        projectsAdapter.setAll(state, action.payload);
      })
      .addCase(getAllProjects.rejected, (state) => {
        state.status = "failed";
      })
      .addCase(setProject.pending, (state) => {
        state.status = "loading";
      })
      .addCase(setProject.fulfilled, (state, action) => {
        state.status = "succeeded";
        projectsAdapter.upsertOne(state, action.payload);
      })
      .addCase(setProject.rejected, (state) => {
        state.status = "failed";
      })
      .addCase(removeProject.pending, (state) => {
        state.status = "loading";
      })
      .addCase(removeProject.fulfilled, (state, action) => {
        state.status = "succeeded";
        projectsAdapter.removeOne(state, action.payload);
      })
      .addCase(removeProject.rejected, (state) => {
        state.status = "failed";
      })
      .addCase(addProject.pending, (state) => {
        state.status = "loading";
      })
      .addCase(addProject.fulfilled, (state, action) => {
        state.status = "succeeded";
        projectsAdapter.addOne(state, action.payload);
      })
      .addCase(addProject.rejected, (state) => {
        state.status = "failed";
      });
  },
});

export const { selectAll: selectAllFields, selectById: selectFieldById, selectIds: selectFieldIds } = fieldsAdapter.getSelectors();
export const { selectAll: selectAllProjects, selectById: selectProjectById, selectIds: selectProjectIds } = projectsAdapter.getSelectors();
