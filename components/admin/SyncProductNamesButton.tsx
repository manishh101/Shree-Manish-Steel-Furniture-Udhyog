'use client';

import { useState } from 'react';
import { toast } from 'react-toastify';

export default function SyncProductNamesButton() {
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = async () => {
    if (!confirm('This will sync all product names with their current category/subcategory names. Continue?')) {
      return;
    }

    setIsSyncing(true);
    const loadingToastId = toast.loading('Syncing product names...');

    try {
      // Get token from localStorage
      const token = localStorage.getItem('token');
      
      const response = await fetch('/api/admin/sync-product-names', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });

      const data = await response.json();

      if (response.ok) {
        toast.dismiss(loadingToastId);
        toast.success(
          `Sync completed! Updated ${data.updatedCount} of ${data.totalProducts} products.`,
          { autoClose: 5000 }
        );
        // Log debug info to console
        if (data.debug) {
          console.log('Sync Debug Info:', data.debug);
        }
      } else {
        toast.dismiss(loadingToastId);
        toast.error(data.error || 'Failed to sync product names');
      }
    } catch (error) {
      console.error('Error syncing product names:', error);
      toast.dismiss(loadingToastId);
      toast.error('Failed to sync product names');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <button
      onClick={handleSync}
      disabled={isSyncing}
      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      {isSyncing ? 'Syncing...' : 'Sync Product Names'}
    </button>
  );
}
