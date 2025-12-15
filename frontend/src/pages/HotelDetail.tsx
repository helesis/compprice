import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import PriceChart from '../components/PriceChart';
import './HotelDetail.css';

interface Price {
  _id: string;
  platform: string;
  price: number;
  rating?: number;
  createdAt: string;
}

interface Hotel {
  _id: string;
  name: string;
  address: string;
  city: string;
  rating: number;
  competitors: any[];
}

interface HotelDetailProps {
  showToast?: (message: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
}

export default function HotelDetail({ showToast }: HotelDetailProps) {
  const { id } = useParams();
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [prices, setPrices] = useState<Price[]>([]);
  const [comparison, setComparison] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [days, setDays] = useState(30);

  useEffect(() => {
    if (id) {
      fetchHotelData(id);
    }
  }, [id, days]);

  const fetchHotelData = async (hotelId: string) => {
    try {
      setLoading(true);
      
      const [hotelRes, pricesRes, comparisonRes] = await Promise.all([
        axios.get(`http://localhost:5001/api/hotels/${hotelId}`),
        axios.get(`http://localhost:5001/api/prices/hotel/${hotelId}?days=${days}`),
        axios.get(`http://localhost:5001/api/prices/comparison/${hotelId}`),
      ]);

      setHotel(hotelRes.data);
      setPrices(pricesRes.data);
      setComparison(comparisonRes.data);
      setError(null);
    } catch (err) {
      setError('Failed to load hotel data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleScrapeNow = async () => {
    if (!id) return;
    try {
      if (showToast) showToast('🔄 Scraping başlatılıyor...', 'info');
      const response = await axios.post(`http://localhost:5001/api/scrapers/scrape/${id}`);
      
      const results = response.data.results || [];
      const successCount = results.filter((r: any) => r.price && !r.error).length;
      
      if (showToast) {
        if (successCount > 0) {
          showToast(`✅ ${successCount} fiyat başarıyla çekildi`, 'success');
        } else {
          showToast('⚠️ Fiyat bulunamadı', 'warning');
        }
      }
      
      // Refresh data after a short delay
      setTimeout(() => {
        if (id) fetchHotelData(id);
      }, 2000);
    } catch (err) {
      if (showToast) {
        showToast('❌ Scraping başlatılamadı', 'error');
      } else {
        alert('Failed to start scraping');
      }
    }
  };

  if (loading) return <div className="hotel-detail"><p>Loading...</p></div>;
  if (error) return <div className="hotel-detail error"><p>{error}</p></div>;
  if (!hotel) return <div className="hotel-detail"><p>Hotel not found</p></div>;

  return (
    <div className="hotel-detail">
      <div className="hotel-header">
        <h1>{hotel.name}</h1>
        <p className="location">{hotel.address}, {hotel.city}</p>
        {hotel.rating && <p className="rating">⭐ {hotel.rating}</p>}
      </div>

      <div className="controls">
        <select 
          value={days} 
          onChange={(e) => setDays(Number(e.target.value))}
          className="select"
        >
          <option value={7}>Last 7 days</option>
          <option value={30}>Last 30 days</option>
          <option value={90}>Last 90 days</option>
        </select>
        <button onClick={handleScrapeNow} className="btn btn-primary">
          Scrape Now
        </button>
      </div>

      {comparison.length > 0 && (
        <div className="chart-container">
          <PriceChart 
            data={comparison.map(c => ({
              platform: c._id,
              price: c.latestPrice,
            }))}
            title="Current Price Comparison"
          />
        </div>
      )}

      <div className="price-history">
        <h2>Price History</h2>
        <table className="price-table">
          <thead>
            <tr>
              <th>Platform</th>
              <th>Price</th>
              <th>Rating</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {prices.slice(0, 20).map((price) => (
              <tr key={price._id}>
                <td>{price.platform}</td>
                <td>${price.price.toFixed(2)}</td>
                <td>{price.rating ? `⭐ ${price.rating}` : 'N/A'}</td>
                <td>{new Date(price.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
