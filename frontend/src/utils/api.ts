import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

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
  getStatus: () => api.get('/scrapers/status'),
};
