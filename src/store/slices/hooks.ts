import { TypedUseSelectorHook, useSelector, useDispatch } from "react-redux";
import { store } from "../index";

export type RootState = ReturnType<typeof store.getState>;
const useAppDispatch: () => typeof store.dispatch = useDispatch;
const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
export { useAppDispatch, useAppSelector };
