'use client';

import dynamic from 'next/dynamic';
import 'react-toastify/dist/ReactToastify.css';

// Lazy load ToastContainer for better initial load performance
const ToastContainer = dynamic(
  () => import('react-toastify').then(mod => mod.ToastContainer),
  { ssr: false }
);

export default function ToastProvider() {
  return (
    <ToastContainer
      position="top-right"
      autoClose={3000}
      hideProgressBar={false}
      newestOnTop
      closeOnClick
      rtl={false}
      pauseOnFocusLoss={false}
      draggable
      pauseOnHover
      theme="light"
      limit={3}
    />
  );
}
