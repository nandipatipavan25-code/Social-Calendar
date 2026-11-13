import React, { useState } from 'react';
import { X, Plus, Calendar, Clock, Sparkles } from 'lucide-react';
import { createPost } from '../api';

export default function NewPostModal({ clients, initialPostingDate, initialClient, onSuccess, onClose }) {
  const [client, setClient] = useState(initialClient || (clients[0] ? clients[0].name : ''));
  const [postingDate, setPostingDate] = useState(initialPostingDate || '2026-11-16');
  const [postType, setPostType] = useState('Creative');
  const [topic, setTopic] = useState('');
  const [imgContent, setImgContent] = useState('');
  const [description, setDescription] = useState('');
  const [creativeLink, setCreativeLink] = useState('');
  const [internalDeadline, setInternalDeadline] = useState('');
  const [clientApproval, setClientApproval] = useState('Pending');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!client || !postingDate) {
      setError('Please select a client and posting date.');
      return;
    }
    setSubmitting(true);
    setError(null);

    try {
      await createPost({
        client,
        postingDate,
        postType,
        topic,
        imgContent,
        description,
        creativeLink,
        internalDeadline: internalDeadline || null,
        clientApproval
      });
      onSuccess();
    } catch (err) {
      setError(err.message || 'Failed to create post');
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in">
      <div 
        className="bg-white rounded-xl shadow-2xl border border-zinc-200 w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden text-zinc-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-zinc-200 flex items-center justify-between bg-zinc-50/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-100 text-emerald-800 rounded-lg">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-base text-zinc-900">Schedule New Social Post</h3>
              <p className="text-xs text-zinc-500">Auto-timestamps Data Entry Date in compliance with entry tracking</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-lg text-emerald-950 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              <strong>Real-Time Timestamping:</strong> This new entry will be recorded with Data Entry Date ={' '}
              <code className="bg-emerald-100 px-1 py-0.5 rounded text-[11px] font-mono">{new Date().toISOString().substring(0, 10)}</code> (separately from Posting Date).
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-medium text-zinc-700 block mb-1">Client Worksheet *</label>
              <select
                value={client}
                onChange={(e) => setClient(e.target.value)}
                required
                className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-lg focus:outline-emerald-600 text-xs"
              >
                {clients.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-medium text-zinc-700 block mb-1">Actual Posting Date *</label>
              <input
                type="date"
                value={postingDate}
                onChange={(e) => setPostingDate(e.target.value)}
                required
                className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-lg focus:outline-emerald-600 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-medium text-zinc-700 block mb-1">Post Type</label>
              <select
                value={postType}
                onChange={(e) => setPostType(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-lg focus:outline-emerald-600 text-xs"
              >
                <option value="Creative">Creative</option>
                <option value="Video">Video</option>
                <option value="Carousel">Carousel</option>
                <option value="Infographic">Infographic</option>
                <option value="Festival / Special Day">Festival / Special Day</option>
                <option value="Standard Creative">Standard Creative</option>
              </select>
            </div>

            <div>
              <label className="font-medium text-zinc-700 block mb-1">Internal Deadline</label>
              <input
                type="date"
                value={internalDeadline}
                onChange={(e) => setInternalDeadline(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-lg focus:outline-emerald-600 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="font-medium text-zinc-700 block mb-1">Topic</label>
            <input
              type="text"
              placeholder="e.g. Website Maintenance Tips, Product Showcase, etc."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-lg focus:outline-emerald-600 text-xs"
            />
          </div>

          <div>
            <label className="font-medium text-zinc-700 block mb-1">Image Content (Headline / Copy on Creative)</label>
            <textarea
              rows={2}
              placeholder="Text appearing inside the graphic banner..."
              value={imgContent}
              onChange={(e) => setImgContent(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-lg focus:outline-emerald-600 text-xs"
            />
          </div>

          <div>
            <label className="font-medium text-zinc-700 block mb-1">Post Description (Body Copy &amp; Caption)</label>
            <textarea
              rows={3}
              placeholder="Full social media caption / body copy..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-lg focus:outline-emerald-600 text-xs"
            />
          </div>

          <div>
            <label className="font-medium text-zinc-700 block mb-1">Creative Link (Google Drive / Canva / URL)</label>
            <input
              type="url"
              placeholder="https://drive.google.com/..."
              value={creativeLink}
              onChange={(e) => setCreativeLink(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-lg focus:outline-emerald-600 text-xs"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-zinc-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-zinc-300 hover:bg-zinc-100 rounded-lg text-zinc-700 font-medium transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition shadow-xs flex items-center gap-1.5 disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              {submitting ? 'Saving Post...' : 'Save & Schedule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
