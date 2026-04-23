import React, { useState, useEffect,useMemo } from 'react';
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

  useEffect(() => {
    axios.get<ILuce[]>('http://api.casa-boschetto.com/api/luce')
      .then(res => {
        setData(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Errore nel caricamento dati luce:", err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="loading">Caricamento dati luce...</div>;

  return (
    <div className="section animate-in">
      <header className="section-header">
        <h2>Andamento Prezzi Luce</h2>
        <div className="stats-grid">
        <div className="stat-card"><span>Min Spesa</span><strong>{stats?.min.toFixed(2)}€</strong></div>
        <div className="stat-card"><span>Max Spesa</span><strong>{stats?.max.toFixed(2)}€</strong></div>
        <div className="stat-card"><span>Media</span><strong>{stats?.avg.toFixed(2)}€</strong></div>
      </div>
        <p>Riferimento bimestrale applicato al mese di competenza (+2 mesi)</p>
      </header>

      {/* GRAFICO LUCE */}
      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
            <XAxis 
              dataKey="id" 
              stroke="#94a3b8" 
              tick={{fill: '#94a3b8'}}
              label={{ value: 'Bimestre Rif.', position: 'insideBottom', offset: -10, fill: '#94a3b8' }}
            />
            <YAxis 
              stroke="#94a3b8" 
              tick={{fill: '#94a3b8'}}
              unit="€"
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
              itemStyle={{ color: '#fbbf24' }} 
            />
            <Legend verticalAlign="top" height={36}/>
            <Line 
              type="monotone" 
              dataKey="price" 
              name="Prezzo Energia" 
              stroke="#fbbf24" // Colore giallo/ambra per la luce
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
            <td className="price-cell">{Number(item.price).toFixed(2)}</td>
          </tr>
        )}
      />
    </div>
  );
};

export default LuceSection;