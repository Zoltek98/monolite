import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import DataTable from '../components/DataTable';

interface TFRModel {
  tfr_history: { valore: number; id: number; data_osservazione: string; created_at: string }[];
  tfr_quotas: { number: number; id: number; date: string } | null;
}

const TFRSection: React.FC = () => {
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
      // INTERCETTAZIONE E NORMALIZZAZIONE DEI DATI MALFORMATI
      // Se l'API restituisce "14.7020" come stringa, qui lo trasformiamo in un float JavaScript pulito (14.702)
      const rawData = res.data;
      
      if (rawData && Array.isArray(rawData.tfr_history)) {
        rawData.tfr_history = rawData.tfr_history.map((item: any) => ({
          ...item,
          valore: Number(item.valore) // Cast sicuro a numero. Gestisce "14.7020" -> 14.702
        }));
      }

      setData(rawData);
    })
    .catch(err => {
      console.error("Errore caricamento TFR:", err);
      if (err.response?.status === 401) {
        alert("Sessione scaduta, effettua nuovamente il login");
      }
    })
    .finally(() => setLoading(false));
  }, [API_URL]);

  // Calcolo Statistiche (ora lavora su numeri già puliti)
  const stats = useMemo(() => {
    if (!data.tfr_history || data.tfr_history.length === 0) return null;
    const prices = data.tfr_history.map(d => d.valore);
    const max = Math.max(...prices);
    const min = Math.min(...prices);
    const avg = prices.reduce((a, b) => a + b, 0) / prices.length;

    return { max, min, avg };
  }, [data.tfr_history]);

  if (loading) return <div className="loading">Analisi dati quote tfr...</div>;
  if (!data.tfr_history || data.tfr_history.length === 0) return <div className="no-data">Nessun dato disponibile per il TFR.</div>;

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
          <strong>{stats?.min.toFixed(3)}€</strong> {/* Usato toFixed(3) se vuoi vedere il millesimo come nel DB */}
        </div>
        <div className="stat-card">
          <span>Massimo Quota</span>
          <strong>{stats?.max.toFixed(3)}€</strong>
        </div>
        <div className="stat-card highlight-mortgage">
          <span>Media Quota</span>
          <strong>{stats?.avg.toFixed(3)}€</strong>
        </div>
      </div>

      <div className="chart-wrapper" style={{ marginTop: '2rem' }}>
        <ResponsiveContainer width="100%" height={300}>
          {/* FIX: Usato lo spread operator per non mutare lo stato con .reverse() */}
          <LineChart data={[...data.tfr_history].reverse()}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
            <XAxis 
              dataKey="data_osservazione" 
              tickFormatter={(value: string) => {
                value = value.substring(0,10);
                if (!value) return '';
                const parts = value.split('-');
                return parts.length === 3 ? `${parts[2]}/${parts[1]}` : value;
              }}
              stroke="#94a3b8" 
              tick={{fontSize: 12}}
            />
            <YAxis 
              domain={['dataMin - 1', 'dataMax + 1']} // Ridotto il padding a 1 così il grafico respira ma non si schiaccia
              stroke="#94a3b8" 
              tickFormatter={(value) => `${value.toFixed(2)}€`}
            />
            <Tooltip 
               labelFormatter={(value) => {
                 if (!value) return '';
                 value = value.substring(0,10);
                 const parts = value.split('-');
                 return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : value;
               }}
               contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }} 
            />
            <Line 
              type="monotone" 
              dataKey="valore" 
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
              {item.data_osservazione.substring(0,10).split('-').reverse().join('/')}
            </td>
            <td className="price-cell highlight-mortgage">
              {item.valore.toFixed(4)}€ {/* Mantiene la precisione a 4 decimali solo per la tabella se necessario */}
            </td>
          </tr>
        )}
      />
    </div>
  );
};

export default TFRSection;