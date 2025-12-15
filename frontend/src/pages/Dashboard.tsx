import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { api } from '../utils/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './Dashboard.css';

interface Competitor {
  name: string;
  platform: string;
  lastScrapedAt?: string;
  lastScrapedPrice?: number;
  scrapingMethod?: string;
}

interface Hotel {
  _id: string;
  name: string;
  city: string;
  rating?: number;
  competitors?: Competitor[];
}

interface Price2026 {
  platform: string;
  price: number;
  checkInDate?: string;
  createdAt: string;
  currency: string;
}

interface DashboardProps {
  showToast?: (message: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
}

export default function Dashboard({ showToast }: DashboardProps) {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [prices2026, setPrices2026] = useState<{ [hotelId: string]: Price2026[] }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastScrapeTimes, setLastScrapeTimes] = useState<{ [hotelId: string]: Date }>({});

  useEffect(() => {
    fetchHotels();
    
    // Scraping durumunu her 30 saniyede bir kontrol et
    const interval = setInterval(() => {
      checkScrapingStatus();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Fetch 2026 prices for all hotels
    if (hotels.length > 0) {
      hotels.forEach((hotel) => {
        fetch2026Prices(hotel._id);
      });
      checkScrapingStatus();
    }
  }, [hotels]);

  const checkScrapingStatus = async () => {
    if (hotels.length === 0) return;
    
      hotels.forEach(async (hotel) => {
        try {
          const response = await api.get(`/hotels/${hotel._id}`);
        const updatedHotel = response.data;
        
        // Son scraping zamanlarını kontrol et
        if (updatedHotel.competitors) {
          const lastScrapes = updatedHotel.competitors
            .map((c: Competitor) => c.lastScrapedAt ? new Date(c.lastScrapedAt) : null)
            .filter((d: Date | null) => d !== null)
            .sort((a: Date, b: Date) => b.getTime() - a.getTime());
          
          if (lastScrapes.length > 0) {
            const latestScrape = lastScrapes[0];
            const previousScrape = lastScrapeTimes[hotel._id];
            
            // Yeni scraping tespit edildi
            if (!previousScrape || latestScrape.getTime() > previousScrape.getTime()) {
              setLastScrapeTimes((prev) => ({
                ...prev,
                [hotel._id]: latestScrape,
              }));
              
              if (showToast && previousScrape) {
                showToast(`🔄 ${hotel.name}: Yeni fiyatlar güncellendi`, 'success');
              }
              
              // Fiyatları yenile
              fetch2026Prices(hotel._id);
            }
          }
        }
      } catch (err) {
        // Sessizce hata yok say
      }
    });
  };

  const fetchHotels = async () => {
    try {
      setLoading(true);
      const response = await api.get('/hotels');
      setHotels(response.data);
      setError(null);
      
      if (showToast && response.data.length > 0) {
        showToast(`📊 ${response.data.length} otel yüklendi`, 'info');
      }
    } catch (err: any) {
      setError('Failed to load hotels');
      if (showToast) {
        const errorMsg = err?.response?.data?.error || err?.message || 'Backend\'e bağlanılamıyor';
        showToast(`❌ Oteller yüklenemedi: ${errorMsg}`, 'error');
      }
      console.error('API Error:', err);
      console.error('API URL:', process.env.REACT_APP_API_URL);
    } finally {
      setLoading(false);
    }
  };

  const fetch2026Prices = async (hotelId: string) => {
    try {
      const response = await api.get(`/prices/year-2026/${hotelId}`);
      setPrices2026((prev) => ({
        ...prev,
        [hotelId]: response.data,
      }));
    } catch (err) {
      // Sessizce hata yok say (2026 fiyatları opsiyonel)
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' });
  };

  const getLastScrapedInfo = (hotel: Hotel) => {
    if (!hotel.competitors || hotel.competitors.length === 0) {
      return { hasData: false, lastScraped: null, totalCompetitors: 0 };
    }

    const lastScrapedDates = hotel.competitors
      .map((c) => c.lastScrapedAt)
      .filter((d) => d)
      .map((d) => new Date(d!))
      .sort((a, b) => b.getTime() - a.getTime());

    return {
      hasData: lastScrapedDates.length > 0,
      lastScraped: lastScrapedDates[0] || null,
      totalCompetitors: hotel.competitors.length,
      scrapedCount: hotel.competitors.filter((c) => c.lastScrapedAt).length,
    };
  };

  const prepareChartData = (prices: Price2026[]) => {
    if (!prices || prices.length === 0) return [];

    // Group by date and platform
    const grouped: { [key: string]: { [platform: string]: number } } = {};

    prices.forEach((price) => {
      const dateKey = price.checkInDate
        ? formatDate(price.checkInDate)
        : formatDate(price.createdAt);
      
      if (!grouped[dateKey]) {
        grouped[dateKey] = {};
      }
      grouped[dateKey][price.platform] = price.price;
    });

    // Convert to array format for Recharts
    return Object.keys(grouped)
      .sort()
      .map((date) => ({
        date,
        ...grouped[date],
      }));
  };

  if (loading) return <div className="dashboard"><p>Loading...</p></div>;
  if (error) return <div className="dashboard error"><p>{error}</p></div>;

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Hotel Price Tracker Dashboard</h1>
        <p className="subtitle">Monitor competitor prices in real-time</p>
      </div>

      {hotels.length === 0 ? (
        <div className="empty-state">
          <p>No hotels tracked yet.</p>
          <Link to="/hotels" className="btn btn-primary">Add a Hotel</Link>
        </div>
      ) : (
        <>
          <div className="hotels-grid">
            {hotels.map((hotel) => {
              const scrapeInfo = getLastScrapedInfo(hotel);
              const chartData = prepareChartData(prices2026[hotel._id] || []);
              const platforms = Array.from(
                new Set((prices2026[hotel._id] || []).map((p) => p.platform))
              );

              return (
                <div key={hotel._id} className="hotel-card-wrapper">
                  <Link to={`/hotels/${hotel._id}`} className="hotel-card">
                    <div className="hotel-card-content">
                      <div className="hotel-header-section">
                        <h2>{hotel.name}</h2>
                        <p className="location">{hotel.city}</p>
                        {hotel.rating && (
                          <div className="rating">
                            <span className="stars">⭐ {hotel.rating.toFixed(1)}</span>
                          </div>
                        )}
                      </div>

                      {/* Scraping Info Box */}
                      <div className="scraping-info-box">
                        <div className="scraping-info-header">
                          <span className="scraping-icon">📊</span>
                          <span className="scraping-title">Scraping Durumu</span>
                        </div>
                        <div className="scraping-info-content">
                          {scrapeInfo.hasData ? (
                            <>
                              <div className="scraping-info-item">
                                <span className="info-label">Son Scrape:</span>
                                <span className="info-value">
                                  {scrapeInfo.lastScraped
                                    ? formatDate(scrapeInfo.lastScraped.toISOString())
                                    : 'Henüz yok'}
                                </span>
                              </div>
                              <div className="scraping-info-item">
                                <span className="info-label">Rakip Sayısı:</span>
                                <span className="info-value">
                                  {scrapeInfo.scrapedCount}/{scrapeInfo.totalCompetitors}
                                </span>
                              </div>
                            </>
                          ) : (
                            <div className="scraping-info-item">
                              <span className="info-value no-data">Henüz scraping yapılmadı</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>

                  {/* 2026 Price Chart */}
                  {chartData.length > 0 && (
                    <div className="chart-container-2026">
                      <h3 className="chart-title">2026 Yılı Fiyat Trendi</h3>
                      <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis 
                            dataKey="date" 
                            angle={-45}
                            textAnchor="end"
                            height={60}
                            tick={{ fontSize: 10 }}
                          />
                          <YAxis tick={{ fontSize: 10 }} />
                          <Tooltip />
                          <Legend />
                          {platforms.map((platform, idx) => {
                            const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00'];
                            return (
                              <Line
                                key={platform}
                                type="monotone"
                                dataKey={platform}
                                stroke={colors[idx % colors.length]}
                                strokeWidth={2}
                                dot={{ r: 3 }}
                              />
                            );
                          })}
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
