import { toast } from "sonner";

type ToastType = "default" | "success" | "error" | "warning" | "loading";

interface ToastOptions {
  id?: string;
  duration?: number;
  icon?: React.ReactNode;
  description?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
  cancel?: {
    label: string;
    onClick?: () => void;
  };
  onDismiss?: () => void;
  onAutoClose?: () => void;
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "top-center" | "bottom-center";
}

export const showToast = (message: string, type: ToastType = "default", options?: ToastOptions) => {
  switch (type) {
    case "success":
      return toast.success(message, options);
    case "error":
      return toast.error(message, options);
    case "warning":
      return toast.warning(message, options);
    case "loading":
      return toast.loading(message, options);
    default:
      return toast(message, options);
  }
};

export const dismissToast = (id?: string) => {
  if (id) {
    toast.dismiss(id);
  } else {
    toast.dismiss();
  }
};

export const updateToast = (id: string, message: string, type: ToastType = "default", options?: Omit<ToastOptions, "id">) => {
  switch (type) {
    case "success":
      return toast.success(message, { id, ...options });
    case "error":
      return toast.error(message, { id, ...options });
    case "warning":
      return toast.warning(message, { id, ...options });
    case "loading":
      return toast.loading(message, { id, ...options });
    default:
      return toast(message, { id, ...options });
  }
};

export const promiseToast = <T>(
  promise: Promise<T>,
  {
    loading = "Loading...",
    success = "Success!",
    error = "Something went wrong",
  }: {
    loading?: string;
    success?: string | ((data: T) => string);
    error?: string | ((error: any) => string);
  } = {},
) => {
  return toast.promise(promise, {
    loading,
    success: (data) => (typeof success === "function" ? success(data) : success),
    error: (err) => (typeof error === "function" ? error(err) : error),
  });
};
