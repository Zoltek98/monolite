import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import DataTable from '../components/DataTable';

interface TFRModel {
  tfr_history: { valore: number; id: number; data_osservazione: string; created_at: string }[];
  tfr_quotas: { number: number; id: number; date: string } | null; // Gestiamo il caso in cui sia null o assente
}

const TFRSection: React.FC = () => {
  // Inizializzazione sicura dello stato per evitare undefined.length
  const [data, setData] = useState<TFRModel>({
    tfr_history: [],
    tfr_quotas: null
  });
  const [loading, setLoading] = useState<boolean>(true);

  const API_URL = import.meta.env.VITE_API_URL || 'https://api.casa-boschetto.com';

  useEffect(() => {
    const token = localStorage.getItem('token');
    
    setLoading(true);
    axios.get<any>(`${API_URL}/api/tfr`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    .then(res => {
      setData(res.data);
    })
    .catch(err => {
      console.error("Errore caricamento TFR:", err);
      if (err.response?.status === 401) {
        alert("Sessione scaduta, effettua nuovamente il login");
      }
    })
    .finally(() => setLoading(false));
  }, [API_URL]);

  // Calcolo Statistiche
  const stats = useMemo(() => {
    if (!data.tfr_history || data.tfr_history.length === 0) return null;
    const prices = data.tfr_history.map(d => Number(d.valore));
    const max = Math.max(...prices);
    const min = Math.min(...prices);
    const avg = prices.reduce((a, b) => a + b, 0) / prices.length;

    return { max, min, avg };
  }, [data.tfr_history]);

  if (loading) return <div className="loading">Analisi dati quote tfr...</div>;
  if (!data.tfr_history || data.tfr_history.length === 0) return <div className="no-data">Nessun dato disponibile per il TFR.</div>;

  // Calcolo sicuro del valore attuale (Prezzo * Numero di quote)
  const quotaNumber = data.tfr_quotas?.number || 0;
  const ultimoPrezzo = data.tfr_history[0]?.valore || 0;
  const valoreAttualeTotale = ultimoPrezzo * quotaNumber;

  return (
    <div className="section animate-in">
      <h2>Andamento Quote TFR</h2>

      {/* WIDGET STATISTICHE */}
      <div className="stats-grid">
         <div className="stat-card highlight-mortgage">
          <span>Valore attuale totale</span>
          <strong>{valoreAttualeTotale.toFixed(2)}€</strong>
        </div>
        <div className="stat-card">
          <span>Minimo Quota</span>
          <strong>{stats?.min.toFixed(2)}€</strong>
        </div>
        <div className="stat-card">
          <span>Massimo Quota</span>
          <strong>{stats?.max.toFixed(2)}€</strong>
        </div>
        <div className="stat-card highlight-mortgage">
          <span>Media Quota</span>
          <strong>{stats?.avg.toFixed(2)}€</strong>
        </div>
      </div>

      <div className="chart-wrapper" style={{ marginTop: '2rem' }}>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data.tfr_history}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
            <XAxis 
              dataKey="data_osservazione" 
              tickFormatter={(value:string) => {
                value = value.substring(0,10);
                // Formatta la data YYYY-MM-DD in qualcosa di più leggibile (es. DD/MM) se vuoi
                if (!value) return '';
                const parts = value.split('-');
                return parts.length === 3 ? `${parts[2]}/${parts[1]}` : value;
              }}
              stroke="#94a3b8" 
              tick={{fontSize: 12}}
            />
            <YAxis 
              domain={['dataMin - 5', 'dataMax + 5']} // Ridotto il padding da 20 a 5 per dare più granularità visiva alle quote
              stroke="#94a3b8" 
              tickFormatter={(value) => `${value}€`}
            />
            <Tooltip 
               labelFormatter={(value) => {
                 // value qui corrisponde alla data_osservazione impostata come dataKey nell'XAxis
                 if (!value) return '';
                 value = value.substring(0,10);
                 const parts = value.split('-');
                 return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : value;
               }}
               contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }} 
            />
            <Line 
              type="monotone" 
              dataKey="valore" // FIX: Cambiato da "price" a "valore" coerentemente con il TFRModel
              name="Valore Quota"
              stroke="#38bdf8" 
              strokeWidth={3} 
              dot={{ r: 4, fill: '#38bdf8' }}
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <DataTable 
        columns={['Data Osservazione', 'Valore Quota (€)']}
        data={data.tfr_history}
        renderRow={(item: any) => (
          <tr key={item.id}>
            <td>
              {item.data_osservazione.split('-').reverse().join('/')}
            </td>
            <td className="price-cell highlight-mortgage">
              {Number(item.valore).toFixed(3)}€
            </td>
          </tr>
        )}
      />
    </div>
  );
};

export default TFRSection;