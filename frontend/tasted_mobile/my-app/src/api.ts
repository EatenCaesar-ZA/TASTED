/**
 * api.ts — Shared Axios instance for backend requests
 *
 * Set VITE_API_URL in your environment to point at the Django server.
 * Example: VITE_API_URL=http://127.0.0.1:8000
 *
 * Using a single instance helps apply interceptors/cookies globally later.
 */

import axios from 'axios';

// 🧠 Use Vite-native environment variable for backend base URL
const resolvedBaseURL = import.meta.env.VITE_API_URL || '';

if (!resolvedBaseURL) {
  // Non-breaking: warn once at runtime to help setup env
  // eslint-disable-next-line no-console
  console.warn('[api] VITE_API_URL is not set. Configure it in your .env (e.g., VITE_API_URL=http://127.0.0.1:8000)');
}

const api = axios.create({
  baseURL: resolvedBaseURL,
});

export default api;