'use client';

import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/api';
import { Button } from '@/components/ui/Button';

export default function AdminKnowledgePage() {
  const { role } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    source: '',
    sourceUrl: '',
    category: '',
    language: 'en',
    content: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  if (role !== 'ADMIN') {
    return <div className="p-8 text-center text-red-500">Access Denied. Admins only.</div>;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const res = await api.post('/ai/knowledge/ingest', formData);
      if (res.data.success) {
        setMessage({ type: 'success', text: `Document ingested successfully! ID: ${res.data.data.documentId}` });
        setFormData({ title: '', description: '', source: '', sourceUrl: '', category: '', language: 'en', content: '' });
      } else {
        setMessage({ type: 'error', text: res.data.message || 'Ingestion failed' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || err.message || 'Server error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Knowledge Base Ingestion (RAG)</h1>
      
      {message && (
        <div className={`p-4 rounded-md mb-6 ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title *</label>
            <input required type="text" className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
            <input type="text" className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} placeholder="e.g. Crop Disease, Market Price" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Language</label>
            <select className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" value={formData.language} onChange={e => setFormData({...formData, language: e.target.value})}>
              <option value="en">English</option>
              <option value="hi">Hindi</option>
              <option value="te">Telugu</option>
              <option value="mr">Marathi</option>
              {/* Other languages... */}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Source Name</label>
            <input type="text" className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" value={formData.source} onChange={e => setFormData({...formData, source: e.target.value})} placeholder="e.g. ICAR, Ministry of Agriculture" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
          <input type="text" className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Document Content (Text) *</label>
          <textarea required rows={10} className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 font-mono text-sm" value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} placeholder="Paste the raw text content here..." />
        </div>

        <Button type="submit" variant="primary" disabled={loading} className="w-full justify-center">
          {loading ? 'Processing & Embedding...' : 'Ingest Document to Vector DB'}
        </Button>
      </form>
    </div>
  );
}
