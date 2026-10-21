// NEED ELECTRO ERP — Persistent State Store for Image Recovery Engine
import fs from 'node:fs';
import path from 'node:path';
import { RecoveryJobState, RecoveryLogEntry, RecoverySettings, ReviewQueueItem } from './types';

interface PersistentRecoveryData {
  job: RecoveryJobState;
  settings: RecoverySettings;
  reviewQueue: ReviewQueueItem[];
  logs: RecoveryLogEntry[];
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'image-recovery-state.json');

const DEFAULT_SETTINGS: RecoverySettings = {
  autoRecoverFutureProducts: false,
  minConfidenceAutoApprove: 80,
  batchSize: 5,
  requestDelayMs: 1000,
  searchEnginePreference: 'AUTO',
};

const DEFAULT_JOB: RecoveryJobState = {
  status: 'IDLE',
  totalProductsScanned: 0,
  totalNeedingImages: 0,
  totalRecovered: 0,
  totalSkippedValid: 0,
  totalAwaitingReview: 0,
  totalFailed: 0,
  currentIndex: 0,
};

function ensureInitialized(): PersistentRecoveryData {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, 'utf8');
      const parsed = JSON.parse(content);
      return {
        job: { ...DEFAULT_JOB, ...(parsed.job || {}) },
        settings: { ...DEFAULT_SETTINGS, ...(parsed.settings || {}) },
        reviewQueue: Array.isArray(parsed.reviewQueue) ? parsed.reviewQueue : [],
        logs: Array.isArray(parsed.logs) ? parsed.logs : [],
      };
    }
  } catch (err) {
    console.warn('Notice reading image-recovery-state.json, defaulting state:', err);
  }

  const initialData: PersistentRecoveryData = {
    job: DEFAULT_JOB,
    settings: DEFAULT_SETTINGS,
    reviewQueue: [],
    logs: [],
  };

  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2), 'utf8');
  } catch (e) {
    console.error('Failed to write initial state file:', e);
  }

  return initialData;
}

function persistData(data: PersistentRecoveryData): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    // Keep max 200 recent logs to prevent file growth
    if (data.logs.length > 200) {
      data.logs = data.logs.slice(0, 200);
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('Failed to save image recovery state:', err);
  }
}

export const recoveryStateStore = {
  getData(): PersistentRecoveryData {
    return ensureInitialized();
  },

  getJob(): RecoveryJobState {
    return ensureInitialized().job;
  },

  updateJob(patch: Partial<RecoveryJobState>): RecoveryJobState {
    const data = ensureInitialized();
    data.job = { ...data.job, ...patch };
    persistData(data);
    return data.job;
  },

  getSettings(): RecoverySettings {
    return ensureInitialized().settings;
  },

  updateSettings(patch: Partial<RecoverySettings>): RecoverySettings {
    const data = ensureInitialized();
    data.settings = { ...data.settings, ...patch };
    persistData(data);
    return data.settings;
  },

  getReviewQueue(): ReviewQueueItem[] {
    return ensureInitialized().reviewQueue;
  },

  addToReviewQueue(item: ReviewQueueItem): void {
    const data = ensureInitialized();
    // Prevent duplicate entries for same product
    const existingIdx = data.reviewQueue.findIndex((q) => q.productId === item.productId);
    if (existingIdx >= 0) {
      data.reviewQueue[existingIdx] = item;
    } else {
      data.reviewQueue.unshift(item);
    }
    persistData(data);
  },

  removeFromReviewQueue(productId: string): void {
    const data = ensureInitialized();
    data.reviewQueue = data.reviewQueue.filter((q) => q.productId !== productId);
    persistData(data);
  },

  getLogs(): RecoveryLogEntry[] {
    return ensureInitialized().logs;
  },

  addLog(entry: Omit<RecoveryLogEntry, 'id' | 'timestamp'>): RecoveryLogEntry {
    const data = ensureInitialized();
    const newLog: RecoveryLogEntry = {
      id: 'log-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      timestamp: new Date().toISOString(),
      ...entry,
    };
    data.logs.unshift(newLog);
    persistData(data);
    return newLog;
  },
};
