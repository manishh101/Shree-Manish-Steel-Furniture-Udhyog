'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { faqAPI, FAQItem } from '@/services/api';
import { FaSave, FaUndo, FaPlus, FaTrash, FaInfoCircle, FaEye, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import Link from 'next/link';

type FAQCategory = 'general' | 'delivery' | 'payment' | 'warranty' | 'custom_orders';

const CATEGORY_LABELS: Record<FAQCategory, string> = {
  general: 'General Questions',
  delivery: 'Delivery & Service Areas',
  payment: 'Payment Methods & Options',
  warranty: 'Warranty & Returns',
  custom_orders: 'Custom Orders & Customization',
};

const CATEGORY_EMOJIS: Record<FAQCategory, string> = {
  general: '❓',
  delivery: '🚚',
  payment: '💳',
  warranty: '🛡️',
  custom_orders: '🔧',
};

const ALL_CATEGORIES: FAQCategory[] = ['general', 'delivery', 'payment', 'warranty', 'custom_orders'];

interface GroupedFAQs {
  general: FAQItem[];
  delivery: FAQItem[];
  payment: FAQItem[];
  warranty: FAQItem[];
  custom_orders: FAQItem[];
}

const emptyGroup = (): GroupedFAQs => ({
  general: [],
  delivery: [],
  payment: [],
  warranty: [],
  custom_orders: [],
});

const AdminFAQ = () => {
  const [groupedFAQs, setGroupedFAQs] = useState<GroupedFAQs>(emptyGroup());
  const [originalGrouped, setOriginalGrouped] = useState<GroupedFAQs>(emptyGroup());
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [hasChanges, setHasChanges] = useState(false);
  const [activeCategory, setActiveCategory] = useState<FAQCategory>('general');
  const [collapsedGroups, setCollapsedGroups] = useState<Record<FAQCategory, boolean>>({
    general: false,
    delivery: true,
    payment: true,
    warranty: true,
    custom_orders: true,
  });

  useEffect(() => {
    setHasChanges(JSON.stringify(groupedFAQs) !== JSON.stringify(originalGrouped));
  }, [groupedFAQs, originalGrouped]);

  const groupFAQsByCategory = (faqs: FAQItem[]): GroupedFAQs => {
    const grouped = emptyGroup();
    for (const faq of faqs) {
      const cat = faq.category as FAQCategory;
      if (grouped[cat]) {
        grouped[cat].push(faq);
      }
    }
    return grouped;
  };

  const fetchFAQs = useCallback(async () => {
    try {
      setFetching(true);
      const response = await faqAPI.getAll();
      if (response?.success && response.data) {
        const grouped = groupFAQsByCategory(response.data);
        setGroupedFAQs(grouped);
        setOriginalGrouped(JSON.parse(JSON.stringify(grouped)));
      }
    } catch (error) {
      console.error('Error fetching FAQs:', error);
      showMessage('Error loading FAQs', 'error');
    } finally {
      setFetching(false);
    }
  }, []);

  useEffect(() => {
    fetchFAQs();
  }, [fetchFAQs]);

  const showMessage = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 4000);
  };

  const handleFAQChange = (category: FAQCategory, index: number, field: 'question' | 'answer', value: string) => {
    setGroupedFAQs(prev => ({
      ...prev,
      [category]: prev[category].map((faq, i) =>
        i === index ? { ...faq, [field]: value } : faq
      )
    }));
  };

  const addFAQ = (category: FAQCategory) => {
    setGroupedFAQs(prev => ({
      ...prev,
      [category]: [...prev[category], { question: '', answer: '', category, displayOrder: prev[category].length }]
    }));
  };

  const removeFAQ = (category: FAQCategory, index: number) => {
    setGroupedFAQs(prev => ({
      ...prev,
      [category]: prev[category].filter((_, i) => i !== index)
    }));
  };

  const moveFAQ = (category: FAQCategory, index: number, direction: 'up' | 'down') => {
    const arr = [...groupedFAQs[category]];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= arr.length) return;
    [arr[index], arr[targetIndex]] = [arr[targetIndex], arr[index]];
    setGroupedFAQs(prev => ({ ...prev, [category]: arr }));
  };

  const handleReset = () => {
    setGroupedFAQs(JSON.parse(JSON.stringify(originalGrouped)));
    showMessage('Changes discarded', 'success');
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Flatten all grouped FAQs into a single array for the API, with displayOrder set
      const allFAQs: FAQItem[] = [];
      for (const cat of ALL_CATEGORIES) {
        groupedFAQs[cat]
          .filter(f => f.question.trim() && f.answer.trim())
          .forEach((faq, idx) => {
            allFAQs.push({
              question: faq.question.trim(),
              answer: faq.answer.trim(),
              category: cat,
              displayOrder: idx,
            });
          });
      }

      const response = await faqAPI.updateAll(allFAQs);
      if (response?.success) {
        const grouped = groupFAQsByCategory(response.data);
        setGroupedFAQs(grouped);
        setOriginalGrouped(JSON.parse(JSON.stringify(grouped)));
        showMessage('FAQs updated successfully!', 'success');
      } else {
        throw new Error('Failed to update FAQs');
      }
    } catch (error) {
      console.error('Error saving FAQs:', error);
      showMessage('Error saving FAQs', 'error');
    } finally {
      setLoading(false);
    }
  };

  const toggleCollapse = (cat: FAQCategory) => {
    setCollapsedGroups(prev => ({ ...prev, [cat]: !prev[cat] }));
    setActiveCategory(cat);
  };

  const totalFAQs = ALL_CATEGORIES.reduce((sum, cat) => sum + groupedFAQs[cat].length, 0);

  if (fetching) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading FAQs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">FAQ Manager</h1>
          <p className="text-gray-600 mt-1">
            Manage all FAQs on the <Link href="/faq" target="_blank" className="text-primary underline">/faq page</Link>.
            Total: <span className="font-semibold">{totalFAQs}</span> FAQs across 5 categories.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/faq"
            target="_blank"
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <FaEye /> Preview
          </Link>
        </div>
      </div>

      {/* Status Messages */}
      {message.text && (
        <div className={`mb-6 p-4 rounded-lg flex items-center gap-2 ${
          message.type === 'error'
            ? 'bg-red-50 text-red-700 border border-red-200'
            : 'bg-green-50 text-green-700 border border-green-200'
        }`}>
          <FaInfoCircle />
          {message.text}
        </div>
      )}

      {/* Unsaved Changes Warning */}
      {hasChanges && (
        <div className="mb-6 p-4 rounded-lg bg-yellow-50 text-yellow-700 border border-yellow-200 flex items-center gap-2">
          <FaInfoCircle />
          You have unsaved changes
        </div>
      )}

      {/* Category Sections */}
      <div className="space-y-4">
        {ALL_CATEGORIES.map((cat) => {
          const isCollapsed = collapsedGroups[cat];
          const faqs = groupedFAQs[cat];

          return (
            <div key={cat} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {/* Category Header */}
              <button
                type="button"
                className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
                onClick={() => toggleCollapse(cat)}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{CATEGORY_EMOJIS[cat]}</span>
                  <div className="text-left">
                    <h2 className="text-lg font-semibold text-gray-800">{CATEGORY_LABELS[cat]}</h2>
                    <span className="text-sm text-gray-500">{faqs.length} FAQs</span>
                  </div>
                </div>
                {isCollapsed ? <FaChevronDown className="text-gray-400" /> : <FaChevronUp className="text-gray-400" />}
              </button>

              {/* FAQ Items */}
              {!isCollapsed && (
                <div className="px-6 pb-6 space-y-4 border-t border-gray-100 pt-4">
                  {faqs.length === 0 && (
                    <p className="text-center text-gray-400 py-4">No FAQs in this category yet. Add one below.</p>
                  )}

                  {faqs.map((faq, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                      <div className="flex justify-between items-center mb-3">
                        <span className="font-medium text-gray-600 text-sm">FAQ #{index + 1}</span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => moveFAQ(cat, index, 'up')}
                            disabled={index === 0}
                            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                            title="Move up"
                          >
                            <FaChevronUp className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveFAQ(cat, index, 'down')}
                            disabled={index === faqs.length - 1}
                            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                            title="Move down"
                          >
                            <FaChevronDown className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeFAQ(cat, index)}
                            className="text-red-400 hover:text-red-600 transition-colors"
                          >
                            <FaTrash className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Question</label>
                          <input
                            type="text"
                            value={faq.question}
                            onChange={(e) => handleFAQChange(cat, index, 'question', e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                            placeholder="Enter question..."
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Answer</label>
                          <textarea
                            value={faq.answer}
                            onChange={(e) => handleFAQChange(cat, index, 'answer', e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg h-24 focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm resize-y"
                            placeholder="Enter answer..."
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={() => addFAQ(cat)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors text-sm"
                  >
                    <FaPlus /> Add FAQ to {CATEGORY_LABELS[cat]}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Sticky Action Bar */}
      <div className="mt-8 flex flex-col sm:flex-row justify-end gap-3 sticky bottom-4 bg-white p-4 rounded-xl shadow-lg border border-gray-200">
        <button
          type="button"
          onClick={handleReset}
          disabled={!hasChanges || loading}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <FaUndo /> Discard Changes
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={loading || !hasChanges}
          className="flex items-center justify-center gap-2 px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <FaSave /> {loading ? 'Saving...' : 'Save All FAQs'}
        </button>
      </div>
    </div>
  );
};

export default AdminFAQ;
