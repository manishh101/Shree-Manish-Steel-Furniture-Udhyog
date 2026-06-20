/**
 * Broken Links Monitor Component
 * Admin dashboard for viewing and managing broken links
 */
'use client';

import React, { useState, useEffect } from 'react';

interface BrokenLink {
  _id: string;
  path: string;
  referrer: string | null;
  hitCount: number;
  firstSeen: string;
  lastSeen: string;
  resolved: boolean;
}

interface BrokenLinkStats {
  total: number;
  resolved: number;
  unresolved: number;
  topBrokenLinks: Array<{ path: string; hitCount: number }>;
}

const BrokenLinksMonitor: React.FC = () => {
  const [stats, setStats] = useState<BrokenLinkStats | null>(null);
  const [brokenLinks, setBrokenLinks] = useState<BrokenLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [showResolved, setShowResolved] = useState(false);
  const [crawling, setCrawling] = useState(false);

  useEffect(() => {
    fetchStats();
    fetchBrokenLinks();
  }, [showResolved]);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/broken-links?action=stats', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching broken link stats:', error);
    }
  };

  const fetchBrokenLinks = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/admin/broken-links?action=list&resolved=${showResolved}&limit=100`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      const data = await response.json();
      if (data.success) {
        setBrokenLinks(data.links);
      }
    } catch (error) {
      console.error('Error fetching broken links:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsResolved = async (path: string) => {
    try {
      const response = await fetch('/api/admin/broken-links', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ path }),
      });
      const data = await response.json();
      if (data.success) {
        fetchStats();
        fetchBrokenLinks();
      }
    } catch (error) {
      console.error('Error marking link as resolved:', error);
    }
  };

  const runCrawler = async () => {
    try {
      setCrawling(true);
      const response = await fetch(
        '/api/admin/broken-links?action=crawl&maxPages=50',
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      const data = await response.json();
      if (data.success) {
        alert(`Crawl complete!\nTotal links: ${data.results.totalLinks}\nBroken links: ${data.results.brokenLinks.length}\nValid links: ${data.results.validLinks}`);
        fetchStats();
        fetchBrokenLinks();
      }
    } catch (error) {
      console.error('Error running crawler:', error);
      alert('Error running crawler');
    } finally {
      setCrawling(false);
    }
  };

  const cleanupOldLinks = async () => {
    if (!confirm('Delete all resolved links older than 90 days?')) return;

    try {
      const response = await fetch('/api/admin/broken-links?daysOld=90', {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        alert(`Deleted ${data.deletedCount} old resolved links`);
        fetchStats();
      }
    } catch (error) {
      console.error('Error cleaning up links:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Broken Links Monitor</h2>
        <div className="flex gap-2">
          <button
            onClick={runCrawler}
            disabled={crawling}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
          >
            {crawling ? 'Crawling...' : 'Run Link Crawler'}
          </button>
          <button
            onClick={cleanupOldLinks}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Cleanup Old Links
          </button>
        </div>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-500 text-sm font-medium">Total 404 Errors</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-500 text-sm font-medium">Unresolved</h3>
            <p className="text-3xl font-bold text-red-600 mt-2">{stats.unresolved}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-500 text-sm font-medium">Resolved</h3>
            <p className="text-3xl font-bold text-green-600 mt-2">{stats.resolved}</p>
          </div>
        </div>
      )}

      {/* Top Broken Links */}
      {stats && stats.topBrokenLinks.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Top 10 Broken Links
          </h3>
          <div className="space-y-2">
            {stats.topBrokenLinks.map((link, index) => (
              <div
                key={index}
                className="flex justify-between items-center p-3 bg-gray-50 rounded"
              >
                <span className="font-mono text-sm text-gray-700">{link.path}</span>
                <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                  {link.hitCount} hits
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Broken Links List */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">
              {showResolved ? 'Resolved Links' : 'Unresolved Broken Links'}
            </h3>
            <button
              onClick={() => setShowResolved(!showResolved)}
              className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
            >
              {showResolved ? 'Show Unresolved' : 'Show Resolved'}
            </button>
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : brokenLinks.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No {showResolved ? 'resolved' : 'unresolved'} broken links found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Path
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Hits
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    First Seen
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Last Seen
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Referrer
                  </th>
                  {!showResolved && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Action
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {brokenLinks.map((link) => (
                  <tr key={link._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-mono text-gray-900">
                      {link.path}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {link.hitCount}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(link.firstSeen).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(link.lastSeen).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                      {link.referrer || '-'}
                    </td>
                    {!showResolved && (
                      <td className="px-6 py-4 text-sm">
                        <button
                          onClick={() => markAsResolved(link.path)}
                          className="text-green-600 hover:text-green-900 font-medium"
                        >
                          Mark Resolved
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default BrokenLinksMonitor;
