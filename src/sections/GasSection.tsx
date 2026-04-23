import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { IGas } from '../types';
import DataTable from '../components/DataTable';

const GasSection: React.FC = () => {
  const [data, setData] = useState<IGas[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const API_URL = import.meta.env.VITE_API_URL || 'https://api.casa-boschetto.com';

    setLoading(true);
    axios.get<IGas[]>(`${API_URL}/api/gas`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    .then(res => {
      setData(res.data);
    })
    .catch(err => {
      console.error("Errore caricamento gas:", err);
      if (err.response?.status === 401) {
        alert("Sessione scaduta, effettua nuovamente il login");
      }
    })
    .finally(() => setLoading(false));
  }, []);

  const stats = useMemo(() => {
    if (data.length === 0) return null;
    // Assicuriamoci che i prezzi siano numeri per i calcoli
    const prices = data.map(d => Number(d.price));
    return {
      min: Math.min(...prices),
      max: Math.max(...prices),
      avg: prices.reduce((a, b) => a + b, 0) / prices.length,
      totalMc: data.reduce((a, b) => a + Number(b.mc), 0)
    };
  }, [data]);

  if (loading) return <div className="loading">Caricamento andamento gas...</div>;

  return (
    <div className="section animate-in">
      <h2>Andamento Gas</h2>
      
      <div className="stats-grid">
        <div className="stat-card">
          <span>Min Spesa</span>
          <strong>{stats?.min.toFixed(2)}€</strong>
        </div>
        <div className="stat-card">
          <span>Max Spesa</span>
          <strong>{stats?.max.toFixed(2)}€</strong>
        </div>
        <div className="stat-card">
          <span>Media</span>
          <strong>{stats?.avg.toFixed(2)}€</strong>
        </div>
        <div className="stat-card highlight-gas">
          <span>Totale MC</span>
          <strong>{stats?.totalMc.toFixed(1)} m³</strong>
        </div>
      </div>

      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
            {/* Usiamo month_ref per rendere l'asse X leggibile */}
            <XAxis dataKey="month_ref" stroke="#94a3b8" /> 
            <YAxis stroke="#94a3b8" unit="€" />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }}
              itemStyle={{ color: '#ef4444' }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="price" 
              name="Spesa (€)" 
              stroke="#ef4444" 
              strokeWidth={3} 
              dot={{ r: 4 }}
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <DataTable 
        columns={['Anno', 'Riferimento', 'Metri Cubi', 'Prezzo (€)']}
        data={data}
        renderRow={(item: IGas) => (
          <tr key={item.id}>
            <td>{item.year}</td>
            <td>{item.month_ref}</td>
            <td>{item.mc} m³</td>
            <td className="price-cell highlight-gas">
              {Number(item.price).toFixed(2)}€
            </td>
          </tr>
        )}
      />
    </div>
  );
};

export default GasSection;