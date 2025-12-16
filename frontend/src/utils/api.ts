import axios, { AxiosError } from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

// Log API URL on initialization
console.log('🔗 API Base URL:', API_BASE_URL);

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds timeout
});

// Request interceptor - log requests
api.interceptors.request.use(
  (config) => {
    console.log('📤 API Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - log responses and handle errors
api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', response.config.url, response.status);
    return response;
  },
  (error: AxiosError) => {
    console.error('❌ API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      statusText: error.response?.statusText,
      message: error.message,
      code: error.code,
      baseURL: API_BASE_URL,
    });

    // Provide more detailed error messages
    if (error.code === 'ECONNABORTED') {
      error.message = 'Request timeout - Backend yanıt vermiyor';
    } else if (error.code === 'ERR_NETWORK') {
      error.message = 'Network Error - Backend\'e erişilemiyor. URL: ' + API_BASE_URL;
    } else if (error.response) {
      // Server responded with error status
      const responseData = error.response.data as { error?: string } | undefined;
      error.message = responseData?.error || error.response.statusText || 'Server error';
    } else if (error.request) {
      // Request made but no response
      error.message = 'No response from server - Backend çalışmıyor olabilir';
    }

    return Promise.reject(error);
  }
);

// Hotels API
export const hotelsAPI = {
  getAll: () => api.get('/hotels'),
  getById: (id: string) => api.get(`/hotels/${id}`),
  create: (data: any) => api.post('/hotels', data),
  update: (id: string, data: any) => api.put(`/hotels/${id}`, data),
  delete: (id: string) => api.delete(`/hotels/${id}`),
};

// Prices API
export const pricesAPI = {
  getForHotel: (hotelId: string, days: number = 30) =>
    api.get(`/prices/hotel/${hotelId}?days=${days}`),
  getComparison: (hotelId: string) =>
    api.get(`/prices/comparison/${hotelId}`),
  getTrends: (hotelId: string, days: number = 30) =>
    api.get(`/prices/trends/${hotelId}?days=${days}`),
  create: (data: any) => api.post('/prices', data),
};

// Scrapers API
export const scrapersAPI = {
  scrapeHotel: (hotelId: string) =>
    api.post(`/scrapers/scrape/${hotelId}`),
  scrapeSeason: (hotelId: string, options: { year?: number; nights?: number; intervalDays?: number }) =>
    api.post(`/scrapers/scrape-season/${hotelId}`, options),
  scrapeETSTur: (hotelId: string, dates: { checkin: string; checkout: string; nights?: number }) =>
    api.post(`/scrapers/scrape-etstur/${hotelId}`, dates),
  getStatus: () => api.get('/scrapers/status'),
};
