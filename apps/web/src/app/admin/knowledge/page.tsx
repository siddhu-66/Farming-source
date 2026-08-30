'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/api';
import { Button } from '@/components/ui/Button';

interface KnowledgeDocument {
  id: string;
  title: string;
  type?: string;
  category?: string;
  createdAt: string;
  updatedAt?: string;
}

export default function AdminKnowledgePage() {
  const { role } = useAuth();
  const [documents, setDocuments] = useState<KnowledgeDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: ''
  });

  useEffect(() => {
    if (role === 'ADMIN') {
      fetchDocuments();
    }
  }, [role]);

  const fetchDocuments = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/admin/knowledge');
      if (res.data.success) {
        setDocuments(res.data.data || []);
      } else {
        setError(res.data.message || 'Failed to fetch documents');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);
    try {
      const res = await api.post('/admin/knowledge', formData);
      if (res.data.success) {
        setMessage({ type: 'success', text: 'Document uploaded successfully!' });
        setFormData({ title: '', content: '' });
        fetchDocuments();
      } else {
        setMessage({ type: 'error', text: res.data.message || 'Upload failed' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || err.message || 'Server error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return;

    try {
      const res = await api.delete(`/admin/knowledge/${id}`);
      if (res.data.success) {
        setMessage({ type: 'success', text: 'Document deleted successfully!' });
        fetchDocuments();
      } else {
        setMessage({ type: 'error', text: res.data.message || 'Delete failed' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || err.message || 'Failed to delete' });
    }
  };

  if (role !== 'ADMIN') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🚫</div>
          <h1 className="text-2xl font-bold text-rose-600 dark:text-rose-400">Access Denied</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Admin privileges required</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-rose-600 dark:text-rose-400 mb-2">Knowledge Base Management</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage RAG documents for AI-powered responses</p>
      </div>

      {message && (
        <div className={`p-4 rounded-lg mb-6 ${
          message.type === 'success'
            ? 'bg-rose-50 text-rose-800 border border-rose-200 dark:bg-rose-900/20 dark:text-rose-300 dark:border-rose-800'
            : 'bg-red-50 text-red-800 border border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800'
        }`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Form */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-rose-200 dark:border-rose-900 shadow-sm">
          <h2 className="text-xl font-semibold text-rose-600 dark:text-rose-400 mb-4">Upload Document</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Title <span className="text-rose-500">*</span>
              </label>
              <input
                required
                type="text"
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
                placeholder="Enter document title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Content <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                rows={12}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent dark:bg-gray-700 dark:text-white font-mono text-sm"
                value={formData.content}
                onChange={e => setFormData({...formData, content: e.target.value})}
                placeholder="Paste document content here..."
              />
            </div>

            <Button
              type="submit"
              disabled={submitting}
              className="w-full justify-center bg-rose-600 hover:bg-rose-700 text-white disabled:bg-rose-300 dark:bg-rose-600 dark:hover:bg-rose-700 dark:disabled:bg-rose-800"
            >
              {submitting ? 'Uploading...' : 'Upload Document'}
            </Button>
          </form>
        </div>

        {/* Documents List */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-rose-200 dark:border-rose-900 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-rose-600 dark:text-rose-400">Documents</h2>
            <button
              onClick={fetchDocuments}
              className="text-sm text-rose-600 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300"
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Refresh'}
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-rose-600"></div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-3">⚠️</div>
              <p className="text-red-600 dark:text-red-400">{error}</p>
              <button
                onClick={fetchDocuments}
                className="mt-4 text-sm text-rose-600 hover:text-rose-700 dark:text-rose-400"
              >
                Try Again
              </button>
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-3">📄</div>
              <p className="text-gray-500 dark:text-gray-400">No documents yet</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Upload your first document to get started</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-rose-300 dark:hover:border-rose-700 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 dark:text-white truncate">
                        {doc.title}
                      </h3>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 dark:text-gray-400">
                        {doc.type && (
                          <span className="px-2 py-0.5 bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 rounded">
                            {doc.type}
                          </span>
                        )}
                        {doc.category && (
                          <span className="px-2 py-0.5 bg-gray-200 dark:bg-gray-600 rounded">
                            {doc.category}
                          </span>
                        )}
                        <span>
                          {new Date(doc.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(doc.id)}
                      className="ml-3 text-rose-600 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300"
                      title="Delete document"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
