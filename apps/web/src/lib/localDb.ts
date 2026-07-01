const DB_NAME = 'edumeet_db';
const DB_VERSION = 1;
const STORE_NAME = 'materials';

export interface LocalMaterial {
  id: string;
  courseId: string;
  title: string;
  fileName: string;
  fileType: 'pdf' | 'slide' | 'video' | 'image';
  fileSize: string;
  fileBlob: Blob;
  uploadedAt: string; // ISO date string
  uploadedBy: string; // Name of uploader
  isPrivate?: boolean; // True if it's personal document
}

export interface SessionReportDetail {
  name: string;
  role: string;
  presentTimeMins: number;
  totalTimeMins: number;
  pct: number;
  telemetry: {
    ping: number;
    jitter: number;
    loss: number;
  };
}

export interface SessionReport {
  id: string;
  roomName: string;
  date: string;
  presentStudents: number;
  totalStudents: number;
  avgDurationMins: number;
  avgConnectionQuality: 'excellent' | 'good' | 'poor' | 'critical';
  details: SessionReportDetail[];
}

// Khởi tạo IndexedDB
export function initDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('IndexedDB open error:', request.error);
      reject(request.error);
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event: any) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('courseId', 'courseId', { unique: false });
      }
    };
  });
}

// Lưu tài liệu vào IndexedDB
export async function saveMaterial(material: LocalMaterial): Promise<void> {
  const db = await initDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(material);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// Lấy tất cả tài liệu của khóa học
export async function getMaterials(courseId: string): Promise<LocalMaterial[]> {
  const db = await initDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const index = store.index('courseId');
    const request = index.getAll(courseId);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Xóa tài liệu
export async function deleteMaterial(id: string): Promise<void> {
  const db = await initDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// Lấy tất cả tài liệu cá nhân của một người dùng
export async function getPersonalMaterials(userName: string): Promise<LocalMaterial[]> {
  const db = await initDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => {
      const all = request.result as LocalMaterial[];
      const filtered = all.filter(m => m.isPrivate === true && m.uploadedBy === userName);
      resolve(filtered);
    };
    request.onerror = () => reject(request.error);
  });
}

// --- LocalStorage Helpers cho Báo cáo Điểm danh ---
const STORAGE_KEY_REPORTS = 'edumeet_session_reports';

export function getSessionReports(): SessionReport[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY_REPORTS);
    if (!data) return [];
    
    return JSON.parse(data);
  } catch (e) {
    console.error('Error reading session reports from localStorage:', e);
    return [];
  }
}

export function saveSessionReport(report: SessionReport): void {
  try {
    const current = getSessionReports();
    // Thêm bản ghi mới lên đầu danh sách
    const updated = [report, ...current];
    localStorage.setItem(STORAGE_KEY_REPORTS, JSON.stringify(updated));
  } catch (e) {
    console.error('Error saving session report to localStorage:', e);
  }
}

// --- LocalStorage Helpers cho Lịch học (Scheduled Classes) ---
export interface ScheduledClass {
  id: string;
  subject: string;
  time: string; // ví dụ: "10:00 - 11:30"
  date: string; // định dạng YYYY-MM-DD
  teacher: string;
  room: string;
  status: 'live' | 'scheduled';
}

const STORAGE_KEY_SCHEDULE = 'edumeet_scheduled_classes';

// Mock ban đầu nếu chưa có lịch học nào lưu dưới local
const MOCK_INITIAL_CLASSES: ScheduledClass[] = [];

export function getScheduledClasses(): ScheduledClass[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY_SCHEDULE);
    if (!data) {
      // Lưu mock ban đầu vào localStorage luôn
      localStorage.setItem(STORAGE_KEY_SCHEDULE, JSON.stringify(MOCK_INITIAL_CLASSES));
      return MOCK_INITIAL_CLASSES;
    }
    return JSON.parse(data);
  } catch (e) {
    console.error('Error reading scheduled classes:', e);
    return MOCK_INITIAL_CLASSES;
  }
}

export function saveScheduledClass(cls: ScheduledClass): void {
  try {
    const current = getScheduledClasses();
    const idx = current.findIndex(c => c.id === cls.id);
    let updated: ScheduledClass[];
    if (idx > -1) {
      updated = current.map(c => c.id === cls.id ? cls : c);
    } else {
      updated = [...current, cls];
    }
    localStorage.setItem(STORAGE_KEY_SCHEDULE, JSON.stringify(updated));
  } catch (e) {
    console.error('Error saving scheduled class:', e);
  }
}

export function deleteScheduledClass(id: string): void {
  try {
    const current = getScheduledClasses();
    const updated = current.filter(c => c.id !== id);
    localStorage.setItem(STORAGE_KEY_SCHEDULE, JSON.stringify(updated));
  } catch (e) {
    console.error('Error deleting scheduled class:', e);
  }
}
