import { toast, ToastOptions } from 'react-toastify';

const defaultOptions: ToastOptions = {
  position: 'top-right',
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
};

export const adminToast = {
  success: (message: string, options?: ToastOptions) => {
    return toast.success(message, {
      ...defaultOptions,
      ...options,
    });
  },
  error: (message: string, options?: ToastOptions) => {
    return toast.error(message, {
      ...defaultOptions,
      autoClose: 4000,
      ...options,
    });
  },
  info: (message: string, options?: ToastOptions) => {
    return toast.info(message, {
      ...defaultOptions,
      ...options,
    });
  },
  warning: (message: string, options?: ToastOptions) => {
    return toast.warning(message, {
      ...defaultOptions,
      ...options,
    });
  },
  promise: <T>(
    promise: Promise<T>,
    {
      pending = 'Processing...',
      success = 'Operation successful!',
      error = 'Operation failed!',
    }: {
      pending?: string;
      success?: string;
      error?: string;
    }
  ) => {
    return toast.promise(
      promise,
      {
        pending,
        success,
        error,
      },
      defaultOptions
    );
  },
};
