import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { IGas } from '../types';
import DataTable from '../components/DataTable';
import { getMonthName } from '../utils/formatters';

const GasSection: React.FC = () => {
  const [data, setData] = useState<IGas[]>([]);

  useEffect(() => {
    axios.get<IGas[]>('http://api.casa-boschetto.com/api/gas').then(res => setData(res.data));
  }, []);

  const stats = useMemo(() => {
    if (data.length === 0) return null;
    const prices = data.map(d => Number(d.price));
    return {
      min: Math.min(...prices),
      max: Math.max(...prices),
      avg: prices.reduce((a, b) => a + b, 0) / prices.length,
      totalMc: data.reduce((a, b) => a + b.mc, 0)
    };
  }, [data]);

  return (
    <div className="section animate-in">
      <h2>Andamento Gas</h2>
      
      <div className="stats-grid">
        <div className="stat-card"><span>Min Spesa</span><strong>{stats?.min.toFixed(2)}€</strong></div>
        <div className="stat-card"><span>Max Spesa</span><strong>{stats?.max.toFixed(2)}€</strong></div>
        <div className="stat-card"><span>Media</span><strong>{stats?.avg.toFixed(2)}€</strong></div>
        <div className="stat-card highlight-gas"><span>Totale MC</span><strong>{stats?.totalMc} m³</strong></div>
      </div>

      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
            <XAxis dataKey="id" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" unit="€" />
            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none' }} />
            <Legend />
            <Line type="monotone" dataKey="price" name="Spesa (€)" stroke="#ef4444" strokeWidth={3} />
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
            <td className="price-cell highlight-gas">{Number(item.price).toFixed(2)}</td>
          </tr>
        )}
      />
    </div>
  );
};

export default GasSection;