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
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

export default api;