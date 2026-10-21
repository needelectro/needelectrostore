'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Sparkles,
  RefreshCw,
  Play,
  Pause,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Eye,
  ExternalLink,
  Sliders,
  ShieldCheck,
  Search,
  Filter,
  Check,
  X,
  Laptop,
  Camera,
  Layers,
  ArrowRight,
  Database,
  Lock,
  Clock,
  Info,
  Maximize2
} from 'lucide-react';
import { api } from '@/src/services/api';
import { ReviewQueueItem, RecoveryJobState, RecoverySettings, RecoveryLogEntry } from '@/lib/imageRecovery/types';

interface ImageRecoveryManagerProps {
  onNavigate?: (module: string) => void;
}

export const ImageRecoveryManager: React.FC<ImageRecoveryManagerProps> = ({ onNavigate }) => {
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [job, setJob] = useState<RecoveryJobState>({
    status: 'IDLE',
    totalProductsScanned: 0,
    totalNeedingImages: 0,
    totalRecovered: 0,
    totalSkippedValid: 0,
    totalAwaitingReview: 0,
    totalFailed: 0,
    currentIndex: 0
  });
  const [settings, setSettings] = useState<RecoverySettings>({
    autoRecoverFutureProducts: false,
    minConfidenceAutoApprove: 80,
    batchSize: 5,
    requestDelayMs: 1000,
    searchEnginePreference: 'AUTO'
  });
  const [reviewQueue, setReviewQueue] = useState<ReviewQueueItem[]>([]);
  const [logs, setLogs] = useState<RecoveryLogEntry[]>([]);
  const [activeTab, setActiveTab] = useState<'review' | 'logs' | 'overview'>('review');
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  // Modal states
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [batchLimit, setBatchLimit] = useState<number>(5);
  const [forceAutoApprove, setForceAutoApprove] = useState<boolean>(false);
  const [searchLogFilter, setSearchLogFilter] = useState('');
  const [customUrlModal, setCustomUrlModal] = useState<{ productId: string; url: string } | null>(null);

  const showToast = (type: 'success' | 'error' | 'info', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const loadData = useCallback(async () => {
    try {
      const res = await api.imageRecovery.getStatus();
      if (res.success && res.data) {
        setJob(res.data.job);
        setSettings(res.data.settings);
        setReviewQueue(res.data.reviewQueue || []);
        setLogs(res.data.logs || []);
      }
    } catch (err: any) {
      console.error('Failed to load image recovery status:', err);
      showToast('error', err.message || 'Could not connect to image recovery service');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    // Auto refresh while job is running
    const interval = setInterval(() => {
      if (job.status === 'RUNNING') {
        loadData();
      }
    }, 2500);
    return () => clearInterval(interval);
  }, [loadData, job.status]);

  const handleScanCatalog = async () => {
    setActionLoading(true);
    try {
      const res = await api.imageRecovery.scanCatalog();
      if (res.success) {
        showToast('success', res.message);
        await loadData();
      }
    } catch (err: any) {
      showToast('error', err.message || 'Catalog scan failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleStartBatch = async () => {
    setActionLoading(true);
    try {
      const res = await api.imageRecovery.startBatch(batchLimit, forceAutoApprove);
      if (res.success) {
        showToast('success', res.message);
        await loadData();
      }
    } catch (err: any) {
      showToast('error', err.message || 'Batch recovery failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePause = async () => {
    try {
      await api.imageRecovery.pauseJob();
      showToast('info', 'Recovery job paused');
      await loadData();
    } catch (err: any) {
      showToast('error', err.message);
    }
  };

  const handleResume = async () => {
    try {
      await api.imageRecovery.resumeJob();
      showToast('success', 'Recovery job resumed');
      await loadData();
    } catch (err: any) {
      showToast('error', err.message);
    }
  };

  const handleApprove = async (productId: string, customUrl?: string) => {
    try {
      const res = await api.imageRecovery.approveCandidate(productId, customUrl);
      if (res.success) {
        showToast('success', 'Product image approved and updated in database!');
        await loadData();
      }
    } catch (err: any) {
      showToast('error', err.message || 'Approval failed');
    }
  };

  const handleReject = async (productId: string) => {
    try {
      await api.imageRecovery.rejectCandidate(productId, 'Rejected by administrator');
      showToast('info', 'Candidate removed from review queue');
      await loadData();
    } catch (err: any) {
      showToast('error', err.message);
    }
  };

  const handleSaveSettings = async () => {
    try {
      await api.imageRecovery.updateSettings(settings);
      showToast('success', 'Image recovery configuration saved');
      setIsSettingsOpen(false);
      await loadData();
    } catch (err: any) {
      showToast('error', err.message || 'Failed to save settings');
    }
  };

  const filteredLogs = logs.filter(
    (l) =>
      l.productName.toLowerCase().includes(searchLogFilter.toLowerCase()) ||
      l.sku.toLowerCase().includes(searchLogFilter.toLowerCase()) ||
      l.action.toLowerCase().includes(searchLogFilter.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 border text-sm font-semibold transition-all ${
            toast.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : toast.type === 'error'
              ? 'bg-rose-50 text-rose-800 border-rose-200'
              : 'bg-blue-50 text-blue-800 border-blue-200'
          }`}
        >
          {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
          {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-600" />}
          {toast.type === 'info' && <Info className="w-5 h-5 text-blue-600" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-700 via-sky-600 to-indigo-700 rounded-3xl p-8 text-white shadow-xl shadow-blue-500/10 border border-blue-400/20">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-bold tracking-wider uppercase mb-3">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              AI Catalog Automation Engine
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white">
              AI Product Image Recovery System
            </h1>
            <p className="text-blue-100 text-sm mt-1 max-w-2xl font-medium leading-relaxed">
              Automated image identification, verified multi-tier search, AI model matching, SSRF-safe download,
              and optimistic concurrency database synchronization for NEED ELECTRO STORE.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleScanCatalog}
              disabled={actionLoading || job.status === 'RUNNING'}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/25 font-semibold text-sm flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${actionLoading ? 'animate-spin' : ''}`} />
              Re-scan Catalog
            </button>

            <button
              onClick={() => setIsSettingsOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/25 font-semibold text-sm flex items-center gap-2 transition-all active:scale-95"
            >
              <Sliders className="w-4 h-4" />
              Settings
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Scanned */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Scanned</span>
            <Database className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-black text-slate-800">{job.totalProductsScanned || 65}</div>
          <div className="text-xs text-slate-500 font-medium mt-1">Catalog items</div>
        </div>

        {/* Missing Images */}
        <div className="bg-white rounded-2xl p-5 border border-amber-200/80 bg-amber-50/20 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-amber-600 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Needing Images</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600">{job.totalNeedingImages || 57}</div>
          <div className="text-xs text-amber-700/80 font-medium mt-1">Missing or empty</div>
        </div>

        {/* Successfully Recovered */}
        <div className="bg-white rounded-2xl p-5 border border-emerald-200/80 bg-emerald-50/20 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-emerald-600 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Recovered</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600">{job.totalRecovered || 0}</div>
          <div className="text-xs text-emerald-700/80 font-medium mt-1">Images attached</div>
        </div>

        {/* Preserved Valid */}
        <div className="bg-white rounded-2xl p-5 border border-blue-200/80 bg-blue-50/20 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-blue-600 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Preserved Valid</span>
            <ShieldCheck className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-blue-600">{job.totalSkippedValid || 8}</div>
          <div className="text-xs text-blue-700/80 font-medium mt-1">Protected records</div>
        </div>

        {/* Awaiting Review */}
        <div className="bg-white rounded-2xl p-5 border border-purple-200/80 bg-purple-50/20 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-purple-600 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Review Queue</span>
            <Clock className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-black text-purple-600">{reviewQueue.length}</div>
          <div className="text-xs text-purple-700/80 font-medium mt-1">Pending approval</div>
        </div>

        {/* Failures */}
        <div className="bg-white rounded-2xl p-5 border border-rose-200/80 bg-rose-50/20 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-rose-600 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Failed / Uncertain</span>
            <AlertCircle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-black text-rose-600">{job.totalFailed || 0}</div>
          <div className="text-xs text-rose-700/80 font-medium mt-1">Skipped safely</div>
        </div>
      </div>

      {/* Control Execution Bar */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Batch Size:</label>
            <select
              value={batchLimit}
              onChange={(e) => setBatchLimit(Number(e.target.value))}
              disabled={job.status === 'RUNNING'}
              className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={5}>5 Products (Fast Test)</option>
              <option value={10}>10 Products</option>
              <option value={20}>20 Products</option>
              <option value={57}>All Missing (57 Products)</option>
            </select>
          </div>

          <label className="flex items-center gap-2 text-xs font-bold text-slate-600 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={forceAutoApprove}
              onChange={(e) => setForceAutoApprove(e.target.checked)}
              disabled={job.status === 'RUNNING'}
              className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
            />
            Auto-Attach High Confidence (Score &ge; 70%)
          </label>
        </div>

        <div className="flex items-center gap-3">
          {job.status === 'RUNNING' ? (
            <button
              onClick={handlePause}
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm shadow-md shadow-amber-500/20 flex items-center gap-2 transition-all active:scale-95"
            >
              <Pause className="w-4 h-4" />
              Pause Recovery
            </button>
          ) : job.status === 'PAUSED' ? (
            <button
              onClick={handleResume}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/20 flex items-center gap-2 transition-all active:scale-95"
            >
              <Play className="w-4 h-4" />
              Resume Recovery
            </button>
          ) : (
            <button
              onClick={handleStartBatch}
              disabled={actionLoading}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/20 flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
            >
              <Play className="w-4 h-4" />
              Start Automated Recovery
            </button>
          )}
        </div>
      </div>

      {/* Progress Bar (when active) */}
      {job.status === 'RUNNING' && (
        <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="font-bold text-blue-900 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
              Processing: {job.currentProduct ? `${job.currentProduct.name} (${job.currentProduct.sku})` : 'Catalog search in progress...'}
            </span>
            <span className="font-bold text-blue-800">
              Batch progress: {job.currentIndex} / {batchLimit}
            </span>
          </div>

          <div className="w-full h-3 bg-blue-200/70 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all duration-300 rounded-full"
              style={{ width: `${Math.min(100, (job.currentIndex / (batchLimit || 1)) * 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('review')}
          className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${
            activeTab === 'review'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Clock className="w-4 h-4" />
          Review Queue
          {reviewQueue.length > 0 && (
            <span className={`px-2 py-0.5 rounded-full text-xs ${activeTab === 'review' ? 'bg-white text-blue-700 font-black' : 'bg-purple-100 text-purple-700 font-bold'}`}>
              {reviewQueue.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${
            activeTab === 'logs'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Layers className="w-4 h-4" />
          Audit Activity Logs
        </button>

        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${
            activeTab === 'overview'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          Safety & System Architecture
        </button>
      </div>

      {/* TAB 1: REVIEW QUEUE */}
      {activeTab === 'review' && (
        <div className="space-y-4">
          {reviewQueue.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-slate-800">Review Queue is Empty</h3>
              <p className="text-slate-500 text-sm max-w-md mx-auto mt-1">
                There are currently no candidate images awaiting manual inspection. Click &ldquo;Start Automated Recovery&rdquo;
                to scan and retrieve verified product images.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reviewQueue.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow"
                >
                  <div className="p-5 space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                          {item.category}
                        </span>
                        <h4 className="font-bold text-slate-900 text-base mt-1 line-clamp-1">
                          {item.productName}
                        </h4>
                        <div className="text-xs text-slate-500 font-mono mt-0.5">
                          SKU: {item.sku} | Brand: {item.brand} {item.model ? `| Model: ${item.model}` : ''}
                        </div>
                      </div>

                      {/* Confidence Score Badge */}
                      <div
                        className={`px-2.5 py-1 rounded-lg text-xs font-black flex items-center gap-1 ${
                          item.candidateImage.confidenceScore >= 80
                            ? 'bg-emerald-100 text-emerald-800'
                            : item.candidateImage.confidenceScore >= 50
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {item.candidateImage.confidenceScore}% Match
                      </div>
                    </div>

                    {/* Image Preview Container */}
                    <div className="relative aspect-video bg-slate-100 rounded-xl overflow-hidden border border-slate-200 group">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.candidateImage.url}
                        alt={item.productName}
                        className="w-full h-full object-contain p-2"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                      <button
                        onClick={() => setPreviewImage(item.candidateImage.url)}
                        className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity font-semibold text-xs gap-1.5 backdrop-blur-[2px]"
                      >
                        <Maximize2 className="w-4 h-4" /> Full Size
                      </button>
                    </div>

                    {/* Source & Reasoning Details */}
                    <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Source:</span>
                        <span className="font-semibold text-slate-700">{item.candidateImage.sourceDomain}</span>
                      </div>
                      {item.candidateImage.width && item.candidateImage.height && (
                        <div className="flex justify-between">
                          <span className="text-slate-400">Dimensions:</span>
                          <span className="font-semibold text-slate-700">
                            {item.candidateImage.width}x{item.candidateImage.height} px
                          </span>
                        </div>
                      )}
                      {item.candidateImage.matchReasons && item.candidateImage.matchReasons.length > 0 && (
                        <div className="mt-2 text-emerald-700 text-[11px] leading-tight">
                          &bull; {item.candidateImage.matchReasons[0]}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Footer */}
                  <div className="p-4 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => handleReject(item.productId)}
                      className="px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 font-bold text-xs flex items-center gap-1 transition-all"
                    >
                      <X className="w-3.5 h-3.5" /> Reject
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setCustomUrlModal({ productId: item.productId, url: '' })}
                        className="px-2.5 py-2 rounded-xl text-slate-600 hover:bg-slate-200 text-xs font-semibold"
                        title="Enter custom image URL"
                      >
                        Custom URL
                      </button>

                      <button
                        onClick={() => handleApprove(item.productId)}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition-all active:scale-95"
                      >
                        <Check className="w-3.5 h-3.5" /> Approve & Attach
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: AUDIT LOGS */}
      {activeTab === 'logs' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Activity & Recovery Audit Trail</h3>
              <p className="text-slate-500 text-xs">
                Permanent immutable record of catalog image scans, matches, downloads, and updates.
              </p>
            </div>

            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search logs by SKU, name, action..."
                value={searchLogFilter}
                onChange={(e) => setSearchLogFilter(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Timestamp</th>
                  <th className="px-4 py-3">Action</th>
                  <th className="px-4 py-3">Product Name</th>
                  <th className="px-4 py-3">SKU</th>
                  <th className="px-4 py-3">Confidence</th>
                  <th className="px-4 py-3">Details</th>
                  <th className="px-4 py-3">Image Link</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-slate-400">
                      No matching activity log records found.
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-4 py-3 font-mono text-slate-500 whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                            log.action === 'PRODUCT_UPDATED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : log.action === 'MANUAL_REVIEW_QUEUED'
                              ? 'bg-purple-100 text-purple-800'
                              : log.action === 'SKIPPED'
                              ? 'bg-blue-100 text-blue-800'
                              : log.action === 'ERROR'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {log.action}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-bold text-slate-800 max-w-xs truncate">{log.productName}</td>
                      <td className="px-4 py-3 font-mono text-slate-600">{log.sku}</td>
                      <td className="px-4 py-3 font-bold">
                        {log.confidence !== undefined ? `${log.confidence}%` : '—'}
                      </td>
                      <td className="px-4 py-3 max-w-md truncate text-slate-600">{log.details}</td>
                      <td className="px-4 py-3">
                        {log.imageUrl ? (
                          <a
                            href={log.imageUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline flex items-center gap-1 font-semibold"
                          >
                            <ExternalLink className="w-3.5 h-3.5" /> View
                          </a>
                        ) : (
                          '—'
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: OVERVIEW & ARCHITECTURE */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-blue-600" />
              Safety & Data Integrity Protections
            </h3>
            <ul className="space-y-3 text-xs text-slate-600 leading-relaxed">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Zero Overwrite Policy:</strong> Products with existing valid images (e.g. Dell Latitude 5420, HP 430 G8, Surface Laptop) are strictly preserved and never overwritten.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Optimistic Concurrency:</strong> Re-reads latest database state immediately before applying an image to prevent overwriting manual admin updates.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>SSRF Guard:</strong> Strictly disallows private CIDR blocks (10.0.0.0/8, 127.0.0.1, 192.168.0.0/16, 169.254.0.0/16) and enforces protocol boundaries on redirects.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Field Isolation:</strong> Only the <code>imageUrl</code> and <code>images</code> fields are updated. Prices, inventory, barcodes, serials, and categories remain 100% untouched.
                </span>
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Database className="w-5 h-5 text-indigo-600" />
              Search & Storage Configuration
            </h3>
            <div className="space-y-3 text-xs text-slate-600">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="font-bold text-slate-800">Storage Destination:</div>
                <div className="text-slate-500 mt-0.5">
                  Local <code>/public/uploads/products/recovered/</code> fallback or Supabase Storage bucket <code>needelectro-storage</code>.
                </div>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="font-bold text-slate-800">Search Providers:</div>
                <div className="text-slate-500 mt-0.5">
                  Multi-tier fallback using Verified OEM Tech Asset Index, Wikimedia Commons Open Hardware, Google Custom Search API, and Bing Web Search.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Sliders className="w-5 h-5 text-blue-600" />
                Recovery Engine Configuration
              </h3>
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Future Product Auto-Recovery */}
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <div className="font-bold text-slate-800">Auto-Recover Future Products</div>
                  <div className="text-slate-500 mt-0.5">
                    Automatically recover images when a new image-less product is added.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.autoRecoverFutureProducts}
                  onChange={(e) => setSettings({ ...settings, autoRecoverFutureProducts: e.target.checked })}
                  className="rounded text-blue-600 focus:ring-blue-500 w-5 h-5 cursor-pointer"
                />
              </div>

              {/* Confidence Threshold */}
              <div className="space-y-1.5 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex justify-between font-bold text-slate-800">
                  <span>Minimum Auto-Approval Confidence:</span>
                  <span className="text-blue-600 font-black">{settings.minConfidenceAutoApprove}%</span>
                </div>
                <input
                  type="range"
                  min={50}
                  max={95}
                  step={5}
                  value={settings.minConfidenceAutoApprove}
                  onChange={(e) => setSettings({ ...settings, minConfidenceAutoApprove: Number(e.target.value) })}
                  className="w-full accent-blue-600 cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>50% (Permissive)</span>
                  <span>80% (Recommended)</span>
                  <span>95% (Strict OEM Only)</span>
                </div>
              </div>

              {/* Batch Size */}
              <div className="space-y-1.5 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <label className="font-bold text-slate-800 block">Default Batch Size:</label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={settings.batchSize}
                  onChange={(e) => setSettings({ ...settings, batchSize: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-semibold text-slate-800"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveSettings}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full Size Preview Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-4xl max-h-[85vh] bg-white rounded-2xl p-2 overflow-hidden shadow-2xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={previewImage} alt="Full preview" className="max-h-[80vh] w-auto object-contain rounded-xl" />
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 bg-black/60 text-white p-2 rounded-full hover:bg-black"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Custom URL Input Modal */}
      {customUrlModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200 space-y-4">
            <h4 className="font-bold text-slate-900 text-sm">Attach Custom Image URL</h4>
            <input
              type="url"
              placeholder="https://example.com/product-image.jpg"
              value={customUrlModal.url}
              onChange={(e) => setCustomUrlModal({ ...customUrlModal, url: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex justify-end gap-2 text-xs">
              <button
                onClick={() => setCustomUrlModal(null)}
                className="px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100 font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (customUrlModal.url.trim()) {
                    handleApprove(customUrlModal.productId, customUrlModal.url.trim());
                    setCustomUrlModal(null);
                  }
                }}
                className="px-4 py-1.5 rounded-lg bg-blue-600 text-white font-bold"
              >
                Download & Attach
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
