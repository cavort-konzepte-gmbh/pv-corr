import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store";
import { useUrlParams } from "./useUrlParams";
import { useCallback } from "react";
import {
  setView,
  setSelectedProjectId,
  setSelectedFieldId,
  setSelectedZoneId,
  setSelectedCustomerId,
  setSelectedReportId,
  resetNavigation,
  updateLastActive,
} from "../store/slices/navigationSlice";
import { useEffect } from "react";

export const useAppNavigation = () => {
  const dispatch = useDispatch();
  const navigation = useSelector((state: RootState) => state.navigation);

  const handleParamChange = useCallback(
    (key: string, value: string | null) => {
      switch (key) {
        case "view":
          if (value && value !== navigation.view) {
            dispatch(setView(value as typeof navigation.view));
          }
          break;
        case "customerId":
          dispatch(setSelectedCustomerId(value));
          break;
        case "projectId":
          dispatch(setSelectedProjectId(value || undefined));
          break;
        case "fieldId":
          dispatch(setSelectedFieldId(value || undefined));
          break;
        case "zoneId":
          dispatch(setSelectedZoneId(value || undefined));
          break;
        case "reportId":
          dispatch(setSelectedReportId(value || undefined));
          break;
      }
    },
    [dispatch, navigation.view],
  );

  // Sync navigation state with URL parameters
  useUrlParams(
    {
      view: navigation.view,
      customerId: navigation.selectedCustomerId,
      projectId: navigation.selectedProjectId,
      fieldId: navigation.selectedFieldId,
      zoneId: navigation.selectedZoneId,
      reportId: navigation.selectedReportId,
    },
    handleParamChange,
  );

  useEffect(() => {
    // Update last active timestamp when tab becomes visible
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        dispatch(updateLastActive());
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [dispatch]);

  return {
    view: navigation.view,
    selectedProjectId: navigation.selectedProjectId,
    selectedFieldId: navigation.selectedFieldId,
    selectedZoneId: navigation.selectedZoneId,
    selectedCustomerId: navigation.selectedCustomerId,
    selectedReportId: navigation.selectedReportId,
    lastActive: navigation.lastActive,
    setView: (view: typeof navigation.view) => dispatch(setView(view)),
    setSelectedProjectId: (id: string | undefined) => dispatch(setSelectedProjectId(id)),
    setSelectedFieldId: (id: string | undefined) => dispatch(setSelectedFieldId(id)),
    setSelectedZoneId: (id: string | undefined) => dispatch(setSelectedZoneId(id)),
    setSelectedCustomerId: (id: string | null) => dispatch(setSelectedCustomerId(id)),
    setSelectedReportId: (id: string | undefined) => dispatch(setSelectedReportId(id)),
    resetNavigation: () => dispatch(resetNavigation()),
  };
};