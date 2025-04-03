import { TypedUseSelectorHook, useSelector, useDispatch } from "react-redux";
import { store } from "../index";

const useAppDispatch: () => typeof store.dispatch = useDispatch;
const useAppSelector: TypedUseSelectorHook<ReturnType<typeof store.getState>> = useSelector;

export { useAppDispatch, useAppSelector };
