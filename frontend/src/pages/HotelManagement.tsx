import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { api } from '../utils/api';
import './HotelManagement.css';

interface Competitor {
  _id?: string;
  name: string;
  url: string;
  platform?: string;
}

interface Hotel {
  _id?: string;
  name?: string;
  address?: string;
  city?: string;
  rating?: number;
  competitors: Competitor[];
}

interface HotelManagementProps {
  showToast?: (message: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
}

export default function HotelManagement({ showToast }: HotelManagementProps) {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Hotel>({
    competitors: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHotels();
  }, []);

  const fetchHotels = async () => {
    try {
      setLoading(true);
      const response = await api.get('/hotels');
      setHotels(response.data);
    } catch (error) {
      console.error('Failed to fetch hotels:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCompetitor = () => {
    setFormData({
      ...formData,
      competitors: [...formData.competitors, { 
        name: '', 
        url: '', 
        platform: 'competitor',
      }],
    });
  };

  const handleCompetitorChange = (
    index: number,
    field: keyof Competitor,
    value: any
  ) => {
    const newCompetitors = [...formData.competitors];
    newCompetitors[index] = { ...newCompetitors[index], [field]: value };
    setFormData({ ...formData, competitors: newCompetitors });
  };

  const handleRemoveCompetitor = (index: number) => {
    setFormData({
      ...formData,
      competitors: formData.competitors.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (formData._id) {
        await api.put(`/hotels/${formData._id}`, formData);
        if (showToast) showToast('✅ Otel güncellendi', 'success');
      } else {
        await api.post('/hotels', formData);
        if (showToast) showToast(`✅ ${formData.competitors.length} otel eklendi, scraping başlatıldı`, 'success');
      }
      setFormData({
        competitors: [],
      });
      setShowForm(false);
      fetchHotels();
    } catch (error: any) {
      const errorMessage = error?.response?.data?.error || error?.message || 'Network error - Backend\'e bağlanılamıyor';
      if (showToast) {
        showToast(`❌ Hata: ${errorMessage}`, 'error');
      } else {
        alert(`Failed to save hotel: ${errorMessage}`);
      }
      console.error('Error details:', error);
      console.error('API URL:', process.env.REACT_APP_API_URL);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this hotel?')) {
      try {
        await api.delete(`/hotels/${id}`);
        if (showToast) showToast('✅ Otel silindi', 'success');
        fetchHotels();
      } catch (error) {
        if (showToast) {
          showToast('❌ Otel silinemedi', 'error');
        } else {
          alert('Failed to delete hotel');
        }
      }
    }
  };

  if (loading) return <div className="hotel-management"><p>Loading...</p></div>;

  return (
    <div className="hotel-management">
      <div className="header">
        <h1>Hotel Management</h1>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="btn btn-primary"
        >
          {showForm ? 'Cancel' : 'Add Hotel'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="hotel-form">
          <div className="competitors-section">
            <h3>Otellerinizi Ekleyin</h3>
            {formData.competitors.length === 0 && (
              <p style={{ color: '#666', marginBottom: '20px' }}>
                Otel eklemek için "Otel Ekle" butonuna tıklayın
              </p>
            )}
            {formData.competitors.map((competitor, index) => (
              <div key={index} className="competitor-card">
                <div className="competitor-header">
                  <input
                    type="text"
                    value={competitor.name}
                    onChange={(e) => handleCompetitorChange(index, 'name', e.target.value)}
                    placeholder="Otel adı (örn: Hilton Istanbul)"
                    required
                    className="competitor-name-input"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveCompetitor(index)}
                    className="btn btn-danger btn-small"
                  >
                    Sil
                  </button>
                </div>

                <div className="form-group">
                  <label>Rakip Otel Web Sitesi URL'si</label>
                  <input
                    type="url"
                    value={competitor.url}
                    onChange={(e) => handleCompetitorChange(index, 'url', e.target.value)}
                    placeholder="https://example-hotel.com"
                    required
                  />
                  <small style={{ color: '#666', marginTop: '5px', display: 'block' }}>
                    URL'den otomatik olarak güncel fiyat bilgisi çekilecek
                  </small>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={handleAddCompetitor}
              className="btn btn-secondary"
            >
              + Otel Ekle
            </button>
          </div>

          <button type="submit" className="btn btn-primary btn-large">
            Otelleri Kaydet
          </button>
        </form>
      )}

      <div className="hotels-list">
        {hotels.length === 0 ? (
          <p className="empty">No hotels added yet.</p>
        ) : (
          <table className="hotels-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>City</th>
                <th>Rating</th>
                <th>Competitors</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {hotels.map((hotel) => (
                <tr key={hotel._id}>
                  <td>{hotel.name}</td>
                  <td>{hotel.city}</td>
                  <td>{hotel.rating ? `${hotel.rating.toFixed(1)}` : 'N/A'}</td>
                  <td>{hotel.competitors?.length || 0}</td>
                  <td>
                    <button 
                      onClick={() => handleDelete(hotel._id || '')}
                      className="btn btn-danger btn-small"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
