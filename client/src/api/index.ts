import api from './axios';

// Auth
export const loginApi = (email: string, password: string) =>
  api.post('/auth/login', { email, password });

export const getMeApi = () => api.get('/auth/me');

// Teachers
export const getTeachersApi = () => api.get('/users');
export const createTeacherApi = (data: object) => api.post('/users', data);
export const updateTeacherApi = (id: string, data: object) => api.put(`/users/${id}`, data);
export const deleteTeacherApi = (id: string) => api.delete(`/users/${id}`);

// Groups
export const getGroupsApi = () => api.get('/groups');
export const getGroupApi = (id: string) => api.get(`/groups/${id}`);
export const createGroupApi = (data: object) => api.post('/groups', data);
export const updateGroupApi = (id: string, data: object) => api.put(`/groups/${id}`, data);
export const deleteGroupApi = (id: string) => api.delete(`/groups/${id}`);
export const addStudentToGroupApi = (groupId: string, studentId: string) =>
  api.post(`/groups/${groupId}/students`, { studentId });
export const removeStudentFromGroupApi = (groupId: string, studentId: string) =>
  api.delete(`/groups/${groupId}/students/${studentId}`);

// Students
export const getStudentsApi = () => api.get('/students');
export const getStudentApi = (id: string) => api.get(`/students/${id}`);
export const createStudentApi = (data: object) => api.post('/students', data);
export const updateStudentApi = (id: string, data: object) => api.put(`/students/${id}`, data);
export const deleteStudentApi = (id: string) => api.delete(`/students/${id}`);

// Sessions
export const getSessionsByGroupApi = (groupId: string, month?: number, year?: number) =>
  api.get(`/sessions/group/${groupId}`, { params: { month, year } });
export const createSessionApi = (data: object) => api.post('/sessions', data);

// Payments
export const getPaymentsApi = (month: string, groupId?: string) =>
  api.get('/payments', { params: { month, groupId } });
export const generatePaymentsApi = (month: string) =>
  api.post('/payments/generate', { month });
export const updatePaymentApi = (id: string, data: object) => api.put(`/payments/${id}`, data);
export const getStudentPaymentHistoryApi = (studentId: string) =>
  api.get(`/payments/history/${studentId}`);

// Dashboard
export const getDashboardApi = () => api.get('/dashboard');

// Change password (teacher updates themselves)
export const changePasswordApi = (id: string, data: object) => api.put(`/users/${id}`, data);
