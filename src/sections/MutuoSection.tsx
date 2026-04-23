import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { IMutuo } from '../types';
import DataTable from '../components/DataTable';
import { getMonthName } from '../utils/formatters';

const MutuoSection: React.FC = () => {
  const [data, setData] = useState<IMutuo[]>([]);

  useEffect(() => {
    axios.get<IMutuo[]>('https://api.casa-boschetto.com/api/mutuo').then(res => setData(res.data));
  }, []);

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

  if (data.length === 0) return <div>Caricamento...</div>;

  return (
    <div className="section animate-in">
      <h2>Andamento Mutuo</h2>

      {/* WIDGET STATISTICHE */}
      <div className="stats-grid">
        <div className="stat-card"><span>Min</span><strong>{stats?.min.toFixed(2)}€</strong></div>
        <div className="stat-card"><span>Max</span><strong>{stats?.max.toFixed(2)}€</strong></div>
        <div className="stat-card"><span>Media Tot.</span><strong>{stats?.avg.toFixed(2)}€</strong></div>
        </div>
      <div className="stats-grid">
        {stats?.yearlyAvg.map(y => (
          <div className="stat-card yearly" key={y.year}>
            <span>Media {y.year}</span><strong>{y.avg.toFixed(2)}€</strong>
          </div>
        ))}
      </div>

      <div className="chart-wrapper">
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
            />
            {/* RESTRIZIONE ASSE Y: dataMin e dataMax restringono lo zero */}
            <YAxis 
              domain={['dataMin - 20', 'dataMax + 20']} 
              stroke="#94a3b8" 
              unit="€"
            />
            <Tooltip 
               labelFormatter={(value, payload) => {
                 if(payload && payload[0]) return `${getMonthName(payload[0].payload.month)} ${payload[0].payload.year}`;
                 return value;
               }}
               contentStyle={{ backgroundColor: '#1e293b', border: 'none' }} 
            />
            <Line type="monotone" dataKey="price" stroke="#38bdf8" strokeWidth={3} dot={{ r: 4 }} />
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
            <td className="price-cell">{Number(item.price).toFixed(2)}</td>
          </tr>
        )}
      />
    </div>
  );
};

export default MutuoSection;