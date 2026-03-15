import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_BASE,
    headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token on every request
api.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('runnerpro_token');
        if (token) config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Auth
export const registerUser = (data: { name: string; email: string; password: string; weight: number }) =>
    api.post('/auth/register', data);
export const loginUser = (data: { email: string; password: string }) =>
    api.post('/auth/login', data);
export const getMe = () => api.get('/auth/me');
export const updateProfile = (data: any) => api.put('/auth/profile', data);

// Runs
export const logRun = (data: any) => api.post('/runs', data);
export const getRuns = (page = 1, limit = 10) => api.get(`/runs?page=${page}&limit=${limit}`);
export const deleteRun = (id: string) => api.delete(`/runs/${id}`);

// Stats
export const getOverview = () => api.get('/stats/overview');
export const getWeeklyStats = () => api.get('/stats/weekly');
export const getMonthlyStats = () => api.get('/stats/monthly');
export const getPaceZones = () => api.get('/stats/pace-zones');

// AI
export const getAIInsights = () => api.get('/ai/insights');
export const getPaceAnalysis = () => api.get('/ai/pace-analysis');
export const getTrainingPlan = () => api.get('/ai/training-plan');
export const predictCalories = (data: { distance: number; pace: number }) =>
    api.post('/ai/predict-calories', data);

export default api;
