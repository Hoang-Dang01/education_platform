const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('accessToken');
  const headers = new Headers(options.headers || {});
  
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    // Session expired or invalid token
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    window.location.hash = '';
    window.location.reload(); // Force page reload to trigger login screen
    throw new ApiError(401, 'Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.');
  }

  if (!response.ok) {
    let errMsg = 'Đã xảy ra lỗi hệ thống.';
    try {
      const errorData = await response.json();
      errMsg = errorData.message || errMsg;
    } catch (e) {
      // Ignored
    }
    throw new ApiError(response.status, errMsg);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json() as Promise<T>;
}

export const api = {
  // Auth
  login: (body: any) => request<any>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(body),
  }),
  
  register: (body: any) => request<any>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(body),
  }),

  changePassword: (body: any) => request<any>('/auth/change-password', {
    method: 'POST',
    body: JSON.stringify(body),
  }),
  
  getMe: () => request<any>('/auth/me', {
    method: 'GET',
  }),

  // Courses
  getCourses: () => request<any[]>('/courses', {
    method: 'GET',
  }),

  // Classes
  getClasses: () => request<any[]>('/classes', {
    method: 'GET',
  }),

  // Sessions
  getUpcomingSessions: () => request<any[]>('/sessions/upcoming', {
    method: 'GET',
  }),

  getHistorySessions: () => request<any[]>('/sessions/history', {
    method: 'GET',
  }),

  getSessionReport: (id: string) => request<any>(`/sessions/${id}/report`, {
    method: 'GET',
  }),

  startSession: (id: string) => request<any>(`/sessions/${id}/start`, {
    method: 'POST',
  }),

  joinSession: (id: string) => request<any>(`/sessions/${id}/join`, {
    method: 'POST',
  }),

  endSession: (id: string) => request<any>(`/sessions/${id}/end`, {
    method: 'POST',
  }),

  createAdhocSession: (classId: string) => request<any>('/sessions/adhoc', {
    method: 'POST',
    body: JSON.stringify({ classId }),
  }),

  attendanceJoin: (id: string) => request<any>(`/sessions/${id}/attendance/join`, {
    method: 'POST',
  }),

  attendanceLeave: (id: string, joinedAtSeconds: number) => request<any>(`/sessions/${id}/attendance/leave`, {
    method: 'POST',
    body: JSON.stringify({ joinedAtSeconds }),
  }),

  ingestTelemetry: (body: {
    sessionId: string;
    pingMs: number;
    packetLoss: number;
    jitterMs: number;
    bitrateKbps?: number;
    fps?: number;
  }) => request<any>('/telemetry/ingest', {
    method: 'POST',
    body: JSON.stringify(body),
  }),

  // Materials
  uploadMaterial: (formData: FormData) => request<any>('/materials/upload', {
    method: 'POST',
    body: formData,
  }),

  getPersonalMaterials: () => request<any[]>('/materials/personal', {
    method: 'GET',
  }),

  deleteMaterial: (id: string) => request<any>(`/materials/${id}`, {
    method: 'DELETE',
  }),
};
