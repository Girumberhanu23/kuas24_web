declare module "*.css";

declare module "react-hot-toast" {
  import type { ComponentType, ReactNode } from "react";

  export interface ToastPromiseParams<T> {
    loading: string;
    success: string | ((data: T) => string);
    error: string | ((error: unknown) => string);
  }

  export const toast: {
    error: (message: string) => void;
    success: (message: string) => void;
    loading: (message: string) => void;
    promise: <T>(promise: Promise<T>, messages: ToastPromiseParams<T>) => Promise<T>;
  };

  export const Toaster: ComponentType<{ position?: string; children?: ReactNode }>;

  export default toast;
}
