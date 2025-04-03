import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import navigationReducer from "./slices/navigationSlice";
import { projectsSlice } from "./slices/projectsSlice";

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["navigation"], // Only navigation will be persisted
  version: 1,
  migrate: (state: any) => {
    // Return a promise that resolves to the transformed state
    return Promise.resolve(state);
  },
};

const rootReducer = combineReducers({
  navigation: navigationReducer,
  projects: projectsSlice.reducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
