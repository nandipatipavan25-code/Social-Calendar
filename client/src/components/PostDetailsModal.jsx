import React, { useState } from 'react';
import { 
  X, 
  ExternalLink, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  FileText, 
  Image as ImageIcon, 
  Copy, 
  Check, 
  ChevronLeft, 
  ChevronRight,
  Tag,
  AlertCircle,
  Database
} from 'lucide-react';

export default function PostDetailsModal({ posts, clientName, date, onClose }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  if (!posts || posts.length === 0) return null;

  const currentPost = posts[currentIndex] || posts[0];
  const total = posts.length;

  const handleCopyText = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatDateLabel = (dStr) => {
    if (!dStr) return '';
    try {
      const parts = dStr.split('-');
      const dt = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
      return dt.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dStr;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in">
      <div 
        className="bg-white rounded-xl shadow-2xl border border-zinc-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden text-zinc-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-200 flex items-center justify-between bg-zinc-50/80">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm">
              {clientName.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-base text-zinc-900 leading-tight">{clientName}</h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-200 text-zinc-700 font-medium">
                  Row #{currentPost.rowIndex || 'N/A'}
                </span>
              </div>
              <p className="text-xs text-zinc-500 flex items-center gap-1.5 mt-0.5">
                <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                Scheduled for {formatDateLabel(date)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {total > 1 && (
              <div className="flex items-center gap-1 mr-2 bg-zinc-200/80 rounded-lg p-1">
                <button
                  type="button"
                  onClick={() => setCurrentIndex((prev) => (prev > 0 ? prev - 1 : total - 1))}
                  className="p-1 rounded hover:bg-white text-zinc-700 transition"
                  title="Previous post on this date"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-semibold px-1 text-zinc-700">
                  {currentIndex + 1} of {total}
                </span>
                <button
                  type="button"
                  onClick={() => setCurrentIndex((prev) => (prev < total - 1 ? prev + 1 : 0))}
                  className="p-1 rounded hover:bg-white text-zinc-700 transition"
                  title="Next post on this date"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Multi-post tabs if > 1 */}
        {total > 1 && (
          <div className="flex border-b border-zinc-200 bg-zinc-50/50 px-6 gap-2 overflow-x-auto py-1.5">
            {posts.map((p, idx) => (
              <button
                key={p.id || idx}
                onClick={() => setCurrentIndex(idx)}
                className={`text-xs px-3 py-1 rounded-md font-medium transition whitespace-nowrap ${
                  currentIndex === idx
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-zinc-600 hover:bg-zinc-200'
                }`}
              >
                Post #{idx + 1}: {p.topic ? (p.topic.length > 20 ? p.topic.slice(0, 20) + '...' : p.topic) : p.postType}
              </button>
            ))}
          </div>
        )}

        {/* Content body */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm">
          {/* Top metadata pill row */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-2.5 rounded-lg border border-zinc-200 bg-zinc-50/60">
              <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider block">Post Type</span>
              <span className="inline-flex items-center gap-1 font-semibold text-zinc-800 mt-0.5">
                <Tag className="w-3.5 h-3.5 text-emerald-600" />
                {currentPost.postType || 'Standard Creative'}
              </span>
            </div>

            <div className="p-2.5 rounded-lg border border-zinc-200 bg-zinc-50/60">
              <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider block">Internal Deadline</span>
              <span className="font-semibold text-zinc-800 mt-0.5 block">
                {currentPost.internalDeadline || 'Not specified'}
              </span>
            </div>

            <div className="p-2.5 rounded-lg border border-zinc-200 bg-zinc-50/60 col-span-2 sm:col-span-1">
              <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider block">Client Approval</span>
              <span className={`inline-flex items-center gap-1 font-semibold mt-0.5 ${
                currentPost.clientApproval && currentPost.clientApproval.toLowerCase().includes('approved')
                  ? 'text-emerald-700'
                  : 'text-zinc-700'
              }`}>
                {currentPost.clientApproval ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    {currentPost.clientApproval}
                  </>
                ) : 'Not Recorded'}
              </span>
            </div>
          </div>

          {/* Topic */}
          <div>
            <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">Post Topic</h4>
            <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-lg font-medium text-zinc-900">
              {currentPost.topic || 'No explicit topic specified'}
            </div>
          </div>

          {/* Image Content / Visual Copy */}
          {currentPost.imgContent && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-zinc-400" />
                  Image Content (Copy on Creative)
                </h4>
                <button
                  type="button"
                  onClick={() => handleCopyText(currentPost.imgContent)}
                  className="text-xs text-zinc-500 hover:text-zinc-800 flex items-center gap-1"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
              <div className="p-3 bg-zinc-50/80 border border-zinc-200 rounded-lg text-zinc-700 whitespace-pre-wrap leading-relaxed text-xs">
                {currentPost.imgContent}
              </div>
            </div>
          )}

          {/* Post Description / Body Copy */}
          {currentPost.description && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-zinc-400" />
                  Post Description / Body Copy
                </h4>
                <button
                  type="button"
                  onClick={() => handleCopyText(currentPost.description)}
                  className="text-xs text-zinc-500 hover:text-zinc-800 flex items-center gap-1"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
              <div className="p-3.5 bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-800 whitespace-pre-wrap leading-relaxed text-xs">
                {currentPost.description}
              </div>
            </div>
          )}

          {/* Creative / Drive Link */}
          {currentPost.creativeLink ? (
            <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-2 overflow-hidden mr-3">
                <ExternalLink className="w-4 h-4 text-emerald-700 shrink-0" />
                <div className="truncate">
                  <p className="text-xs font-medium text-emerald-900">Creative Asset Attached</p>
                  <p className="text-[11px] text-emerald-700 truncate">{currentPost.creativeLink}</p>
                </div>
              </div>
              <a
                href={currentPost.creativeLink}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-lg shrink-0 flex items-center gap-1 transition shadow-xs"
              >
                <span>Open Link</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          ) : (
            <div className="p-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-500 text-xs flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
              <span>No creative asset link attached to this entry</span>
            </div>
          )}

          {/* Date Tracking Breakdown (Strict separate Posting Date vs Data Entry Date) */}
          <div className="p-3.5 bg-zinc-50 border border-zinc-200 rounded-lg space-y-2">
            <h5 className="text-[11px] font-semibold text-zinc-600 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-zinc-400" />
              Date Tracking & Entry Audit
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="bg-white p-2 rounded border border-zinc-200">
                <span className="text-[11px] text-zinc-500 block">Scheduled Posting Date:</span>
                <span className="font-semibold text-emerald-700">{currentPost.postingDate}</span>
              </div>

              <div className="bg-white p-2 rounded border border-zinc-200">
                <span className="text-[11px] text-zinc-500 block">Data-Entry Date (Added to Sheet):</span>
                {currentPost.dataEntryDate && currentPost.dataEntryDate !== 'Not Available' ? (
                  <span className="font-semibold text-blue-700">
                    {new Date(currentPost.dataEntryDate).toLocaleString()}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 font-medium text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded text-[11px]">
                    <AlertCircle className="w-3 h-3" />
                    Not Available (Historical Record)
                  </span>
                )}
              </div>

              {currentPost.structuringDate && (
                <div className="bg-white p-2 rounded border border-zinc-200 col-span-1 sm:col-span-2">
                  <span className="text-[11px] text-zinc-500 block">Content Structuring Date (Col B):</span>
                  <span className="font-medium text-zinc-800">{currentPost.structuringDate}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-zinc-200 bg-zinc-50 flex items-center justify-between text-xs text-zinc-500">
          <span className="flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-zinc-400" />
            Worksheet: <strong>{currentPost.sheetName}</strong>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-zinc-800 hover:bg-zinc-900 text-white rounded-lg font-medium transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
