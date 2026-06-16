import axios, { AxiosError, AxiosRequestConfig } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use(config => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
}, error => Promise.reject(error));

apiClient.interceptors.response.use(response => response, error => {
  if (error.response?.status === 401) {
    localStorage.removeItem('auth_token');
    window.location.href = '/auth/login';
  }
  return Promise.reject(error);
});

export async function request(method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE', url: string, data?: any, config?: AxiosRequestConfig) {
    const response = await apiClient({ method, url, data, ...config });
    return { success: true, data: response.data || response, error: null, message: 'Success' };
  } catch (error) {
    const axiosError = error as AxiosError;
    return { success: false, data: null, error: axiosError.message, message: (axiosError.response?.data as any)?.message || 'Request failed' };
  }
}

export const get = <T = any>(url: string, config?: AxiosRequestConfig) => request<T>('GET', url, undefined, config);
export const post = <T = any>(url: string, data: any, config?: AxiosRequestConfig) => request<T>('POST', url, data, config);
export const put = <T = any>(url: string, data: any, config?: AxiosRequestConfig) => request<T>('PUT', url, data, config);
export const patch = <T = any>(url: string, data: any, config?: AxiosRequestConfig) => request<T>('PATCH', url, data, config);
export const deleteRequest = <T = any>(url: string, config?: AxiosRequestConfig) => request<T>('DELETE', url, undefined, config);

export const api = {
  auth: {
    login: (email: string, password: string) => post('/auth/login', { email, password }),
    register: (email: string, password: string, fullName: string) => post('/auth/register', { email, password, full_name: fullName }),
    logout: () => post('/auth/logout', {}),
  },
  tickets: {
    list: (params?: any) => get('/tickets', { params }),
    get: (id: string) => get(`/tickets/${id}`),
    create: (data: any) => post('/tickets', data),
    update: (id: string, data: any) => patch(`/tickets/${id}`, data),
    delete: (id: string) => deleteRequest(`/tickets/${id}`),
  },
  specialists: {
    list: (params?: any) => get('/specialists', { params }),
    get: (id: string) => get(`/specialists/${id}`),
  },
  payments: {
    list: (params?: any) => get('/payments', { params }),
    create: (data: any) => post('/payments', data),
  },
  chat: {
    getConversations: () => get('/chat/conversations'),
    getMessages: (conversationId: string) => get(`/chat/conversations/${conversationId}/messages`),
    sendMessage: (conversationId: string, message: string) => post(`/chat/conversations/${conversationId}/messages`, { message }),
  },
  ai: {
    classifyTicket: (title: string, description: string) => post('/ai/classify', { title, description }),
  },
  reports: {
    getDashboard: () => get('/reports/dashboard'),
  },
};

export default apiClient;
