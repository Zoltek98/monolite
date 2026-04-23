import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Legend 
} from 'recharts';
import { ILuce } from '../types';
import DataTable from '../components/DataTable';

const LuceSection: React.FC = () => {
  const [data, setData] = useState<ILuce[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const API_URL = import.meta.env.VITE_API_URL;

  const stats = useMemo(() => {
    if (data.length === 0) return null;
    const prices = data.map(d => Number(d.price));
    const max = Math.max(...prices);
    const min = Math.min(...prices);
    const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
    
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

  useEffect(() => {
    const token = localStorage.getItem('token');

    setLoading(true);
    axios.get<ILuce[]>(`${API_URL}/api/luce`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(res => {
        setData(res.data);
      })
      .catch(err => {
        console.error("Errore nel caricamento dati luce:", err);
        if (err.response?.status === 401) {
          alert("Sessione scaduta, effettua nuovamente il login");
        }
      })
      .finally(() => setLoading(false));
  }, [API_URL]);

  if (loading) return <div className="loading">Caricamento dati luce...</div>;

  return (
    <div className="section animate-in">
      <header className="section-header">
        <h2>Andamento Prezzi Luce</h2>
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
        </div>
        <p className="description">Riferimento bimestrale applicato al mese di competenza (+2 mesi)</p>
      </header>

      {/* GRAFICO LUCE */}
      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
            <XAxis 
              dataKey="month_ref" // Usiamo month_ref invece dell'ID per chiarezza
              stroke="#94a3b8" 
              tick={{fill: '#94a3b8', fontSize: 12}}
            />
            <YAxis 
              stroke="#94a3b8" 
              tick={{fill: '#94a3b8'}}
              unit="€"
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
              itemStyle={{ color: '#fbbf24' }} 
              formatter={(value: any) => [`${Number(value).toFixed(2)}€`, "Prezzo Energia"]}
            />
            <Legend verticalAlign="top" height={36}/>
            <Line 
              type="monotone" 
              dataKey="price" 
              name="Prezzo Energia" 
              stroke="#fbbf24" 
              strokeWidth={3} 
              dot={{ r: 5, fill: '#fbbf24' }}
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* TABELLA LUCE */}
      <DataTable 
        columns={['Anno', 'Riferimento', 'Prezzo (€)']}
        data={data}
        renderRow={(item: ILuce) => (
          <tr key={item.id}>
            <td>{item.year}</td>
            <td className="text-muted">{item.month_ref}</td>
            <td className="price-cell highlight-luce">
              {Number(item.price).toFixed(2)}€
            </td>
          </tr>
        )}
      />
    </div>
  );
};

export default LuceSection;