// Base HTTP client with automatic JWT header and standardized responses

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

export async function apiClient(endpoint, { body, ...customConfig } = {}) {
  const token = localStorage.getItem('campuspulse_token');

  const headers = {
    'Content-Type': 'application/json',
    ...customConfig.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    method: body ? 'POST' : 'GET',
    ...customConfig,
    headers,
  };

  if (body && !(body instanceof FormData)) {
    config.body = JSON.stringify(body);
  } else if (body instanceof FormData) {
    // Let browser set multipart boundary
    delete headers['Content-Type'];
    config.body = body;
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, config);
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMsg = data?.message || `Request failed with status ${response.status}`;
    const error = new Error(errorMsg);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export default apiClient;
