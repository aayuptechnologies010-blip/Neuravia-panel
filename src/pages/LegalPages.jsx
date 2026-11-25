import React, { useState, useEffect } from 'react';
import api from '../api/client';
import toast from 'react-hot-toast';
import { MdGavel, MdSave, MdFormatListBulleted, MdTitle } from 'react-icons/md';

export default function LegalPages() {
  const [activeTab, setActiveTab] = useState('privacyPolicy');
  const [content, setContent] = useState({
    privacyPolicy: '',
    termsConditions: '',
    aboutApp: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchLegal = async () => {
      try {
        const res = await api.get('/customer/legal');
        if (res.data?.success && res.data.data) {
          setContent({
            privacyPolicy: res.data.data.privacyPolicy || '',
            termsConditions: res.data.data.termsConditions || '',
            aboutApp: res.data.data.aboutApp || ''
          });
        }
      } catch (err) {
        toast.error('Failed to load legal content');
      } finally {
        setLoading(false);
      }
    };
    fetchLegal();
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      const res = await api.put('/customer/legal', content);
      if (res.data?.success) {
        toast.success('Updated! Changes are now live on App & Website.');
      }
    } catch (err) {
      toast.error('Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const insertSnippet = (snippet) => {
    setContent((prev) => ({
      ...prev,
      [activeTab]: prev[activeTab] + snippet
    }));
  };

  const tabs = [
    { id: 'privacyPolicy', label: 'Privacy Policy' },
    { id: 'termsConditions', label: 'Terms & Conditions' },
    { id: 'aboutApp', label: 'About Neuravia' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#083058] flex items-center gap-2">
            <MdGavel className="text-teal-600" />
            Legal &amp; Policy Editor
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Edit Privacy Policy, Terms &amp; Conditions, and About App. Updates sync live to the Mobile App &amp; Website.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving || loading}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#083058] text-white rounded-xl text-sm font-bold hover:bg-[#0c4a6e] disabled:opacity-50"
        >
          <MdSave size={18} />
          {saving ? 'Saving...' : 'Save & Publish'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-[#00839a] text-[#083058]'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Editor */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500 uppercase mr-2">Quick Format:</span>
          <button
            type="button"
            onClick={() => insertSnippet('\n\n1. Section Title:\n')}
            className="flex items-center gap-1 px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-medium hover:bg-slate-100"
          >
            <MdTitle size={14} /> Add Section
          </button>
          <button
            type="button"
            onClick={() => insertSnippet('\n• ')}
            className="flex items-center gap-1 px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-medium hover:bg-slate-100"
          >
            <MdFormatListBulleted size={14} /> Bullet Point
          </button>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-400 text-sm">Loading editor...</div>
        ) : (
          <textarea
            value={content[activeTab]}
            onChange={(e) => setContent({ ...content, [activeTab]: e.target.value })}
            rows={16}
            placeholder="Enter policy text here..."
            className="w-full p-5 text-sm text-slate-800 leading-relaxed focus:outline-none resize-y"
          />
        )}
      </div>
    </div>
  );
}
