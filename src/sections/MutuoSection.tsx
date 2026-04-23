import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { IMutuo } from '../types';
import DataTable from '../components/DataTable';
import { getMonthName } from '../utils/formatters';

const MutuoSection: React.FC = () => {
  const [data, setData] = useState<IMutuo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const API_URL = import.meta.env.VITE_API_URL || 'https://api.casa-boschetto.com';

  useEffect(() => {
    const token = localStorage.getItem('token');
    
    setLoading(true);
    axios.get<IMutuo[]>(`${API_URL}/api/mutuo`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    .then(res => {
      setData(res.data);
    })
    .catch(err => {
      console.error("Errore caricamento mutuo:", err);
      if (err.response?.status === 401) {
        alert("Sessione scaduta, effettua nuovamente il login");
      }
    })
    .finally(() => setLoading(false));
  }, [API_URL]);

  // Calcolo Statistiche
  const stats = useMemo(() => {
    if (data.length === 0) return null;
    const prices = data.map(d => Number(d.price));
    const max = Math.max(...prices);
    const min = Math.min(...prices);
    const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
    
    // Media per anno
    const years = Array.from(new Set(data.map(d => d.year)));
    const yearlyAvg = years.map(y => {
      const yearPrices = data.filter(d => d.year === y).map(d => Number(d.price));
      return { 
        year: y, 
        avg: yearPrices.reduce((a, b) => a + b, 0) / yearPrices.length 
      };
    });

    return { max, min, avg, yearlyAvg };
  }, [data]);

  if (loading) return <div className="loading">Analisi piano di ammortamento...</div>;
  if (data.length === 0) return <div className="no-data">Nessun dato disponibile per il mutuo.</div>;

  return (
    <div className="section animate-in">
      <h2>Andamento Rate Mutuo</h2>

      {/* WIDGET STATISTICHE */}
      <div className="stats-grid">
        <div className="stat-card">
          <span>Minimo</span>
          <strong>{stats?.min.toFixed(2)}€</strong>
        </div>
        <div className="stat-card">
          <span>Massimo</span>
          <strong>{stats?.max.toFixed(2)}€</strong>
        </div>
        <div className="stat-card highlight-mortgage">
          <span>Media Totale</span>
          <strong>{stats?.avg.toFixed(2)}€</strong>
        </div>
      </div>

      <div className="stats-grid" style={{ marginTop: '1rem' }}>
        {stats?.yearlyAvg.map(y => (
          <div className="stat-card yearly" key={y.year}>
            <span>Media {y.year}</span>
            <strong>{y.avg.toFixed(2)}€</strong>
          </div>
        ))}
      </div>

      <div className="chart-wrapper" style={{ marginTop: '2rem' }}>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
            <XAxis 
              dataKey="id" 
              tickFormatter={(value, index) => {
                const item = data[index];
                return item ? `${getMonthName(item.month)} ${item.year}` : value;
              }}
              stroke="#94a3b8" 
              tick={{fontSize: 12}}
            />
            <YAxis 
              domain={['dataMin - 20', 'dataMax + 20']} 
              stroke="#94a3b8" 
              unit="€"
              tickFormatter={(value) => `${value}€`}
            />
            <Tooltip 
               labelFormatter={(value, payload) => {
                 if(payload && payload[0]) return `${getMonthName(payload[0].payload.month)} ${payload[0].payload.year}`;
                 return value;
               }}
               contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }} 
            />
            <Line 
              type="monotone" 
              dataKey="price" 
              name="Rata"
              stroke="#38bdf8" 
              strokeWidth={3} 
              dot={{ r: 4, fill: '#38bdf8' }}
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <DataTable 
        columns={['Anno', 'Mese', 'Prezzo (€)']}
        data={data}
        renderRow={(item: IMutuo) => (
          <tr key={item.id}>
            <td>{item.year}</td>
            <td>{getMonthName(item.month)}</td>
            <td className="price-cell highlight-mortgage">
              {Number(item.price).toFixed(2)}€
            </td>
          </tr>
        )}
      />
    </div>
  );
};

export default MutuoSection;