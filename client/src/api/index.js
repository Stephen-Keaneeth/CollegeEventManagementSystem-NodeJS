import apiClient from './client';

export const authApi = {
  login: (credentials) => apiClient('/auth/login', { body: credentials }),
  register: (userData) => apiClient('/auth/register', { body: userData }),
  getMe: () => apiClient('/auth/me'),
  updateProfile: (profileData) => apiClient('/auth/profile', { method: 'PUT', body: profileData }),
  changePassword: (passwordData) => apiClient('/auth/change-password', { method: 'PUT', body: passwordData }),
};

export const eventsApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') query.append(k, v);
    });
    const qs = query.toString() ? `?${query.toString()}` : '';
    return apiClient(`/events${qs}`);
  },
  getById: (id) => apiClient(`/events/${id}`),
  create: (eventData) => apiClient('/events', { body: eventData }),
  update: (id, eventData) => apiClient(`/events/${id}`, { method: 'PUT', body: eventData }),
  delete: (id) => apiClient(`/events/${id}`, { method: 'DELETE' }),
  changeStatus: (id, status, cancellation_reason = null) =>
    apiClient(`/events/${id}/status`, { method: 'PATCH', body: { status, cancellation_reason } }),
  uploadBanner: (formData) => apiClient('/events/upload-banner', { body: formData }),
};

export const registrationsApi = {
  register: (eventId) => apiClient(`/registrations/${eventId}`, { method: 'POST' }),
  cancel: (eventId) => apiClient(`/registrations/${eventId}`, { method: 'DELETE' }),
  getMyEvents: () => apiClient('/registrations/my-events'),
  getTicket: (ticketCode) => apiClient(`/registrations/ticket/${ticketCode}`),
  getEventAttendees: (eventId) => apiClient(`/registrations/event/${eventId}`),
};

export const attendanceApi = {
  getEventAttendance: (eventId) => apiClient(`/attendance/event/${eventId}`),
  markSingle: (registration_id, status, notes = '') =>
    apiClient('/attendance/mark', { body: { registration_id, status, notes } }),
  bulkMark: (event_id, registration_ids, status) =>
    apiClient('/attendance/bulk-mark', { body: { event_id, registration_ids, status } }),
  exportCsv: (eventId) => apiClient(`/attendance/export/${eventId}`),
};

export const feedbackApi = {
  submit: (eventId, rating, review) =>
    apiClient(`/feedback/${eventId}`, { body: { rating, review } }),
  getEventFeedback: (eventId) => apiClient(`/feedback/event/${eventId}`),
  getMyFeedback: () => apiClient('/feedback/my-feedback'),
};

export const dashboardApi = {
  getAdminStats: () => apiClient('/dashboard/admin'),
  getOrganizerStats: () => apiClient('/dashboard/organizer'),
  getStudentStats: () => apiClient('/dashboard/student'),
};

export const venuesApi = {
  getAll: () => apiClient('/venues'),
  getById: (id) => apiClient(`/venues/${id}`),
  create: (data) => apiClient('/venues', { body: data }),
  update: (id, data) => apiClient(`/venues/${id}`, { method: 'PUT', body: data }),
  delete: (id) => apiClient(`/venues/${id}`, { method: 'DELETE' }),
};

export const categoriesApi = {
  getAll: () => apiClient('/categories'),
  create: (data) => apiClient('/categories', { body: data }),
  update: (id, data) => apiClient(`/categories/${id}`, { method: 'PUT', body: data }),
  delete: (id) => apiClient(`/categories/${id}`, { method: 'DELETE' }),
};

export const usersApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiClient(`/users${query ? `?${query}` : ''}`);
  },
  changeRole: (userId, role) => apiClient(`/users/${userId}/role`, { method: 'PATCH', body: { role } }),
  toggleStatus: (userId, is_active) => apiClient(`/users/${userId}/status`, { method: 'PATCH', body: { is_active } }),
};

export const notificationsApi = {
  getAll: () => apiClient('/notifications'),
  markRead: (id) => apiClient(`/notifications/${id}/read`, { method: 'PATCH' }),
  markAllRead: () => apiClient('/notifications/mark-all-read', { method: 'POST' }),
};
