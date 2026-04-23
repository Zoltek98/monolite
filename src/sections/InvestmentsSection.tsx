import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { 
  PieChart, Pie, Cell, Tooltip as ChartTooltip, ResponsiveContainer, 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Legend 
} from 'recharts';
import { IAsset, IPortfolioHistory } from '../types';
import DataTable from '../components/DataTable';

const InvestmentsSection: React.FC = () => {
  const [assets, setAssets] = useState<IAsset[]>([]);
  const [history, setHistory] = useState<IPortfolioHistory[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<IAsset | null>(null);
  const [loading, setLoading] = useState(true);

 const API_URL = import.meta.env.VITE_API_URL || 'https://api.casa-boschetto.com';

  // Caricamento dati con Token
  const fetchData = async () => {
    const token = localStorage.getItem('token');
    try {
      setLoading(true);
      const [resAssets, resHistory] = await Promise.all([
        axios.get<IAsset[]>(`${API_URL}/api/assets`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get<IPortfolioHistory[]>(`${API_URL}/api/portfolio-history`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      setAssets(resAssets.data);
      setHistory(resHistory.data);
    } catch (err) {
      console.error("Errore caricamento investimenti:", err);
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        alert("Sessione scaduta");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // Calcolo dati per la torta
  const pieData = useMemo(() => {
    return assets.map(a => ({
      name: a.name,
      value: Number(a.shares) * Number(a.currentPrice || 0),
      color: a.color
    })).filter(a => a.value > 0);
  }, [assets]);

  const totalPortfolioValue = pieData.reduce((sum, item) => sum + item.value, 0);

  // Gestione Salvataggio Modifiche (anche qui serve il token!)
  const handleUpdateAsset = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedAsset) return;

    const token = localStorage.getItem('token');
    try {
      await axios.put(`${API_URL}/api/assets/${selectedAsset.id}`, {
        name: selectedAsset.name,
        shares: selectedAsset.shares,
        color: selectedAsset.color
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setIsModalOpen(false);
      fetchData(); // Rinfresca i dati
    } catch (err) {
      alert("Errore durante l'aggiornamento");
    }
  };

  if (loading && assets.length === 0) return <div className="loading">Analisi portafoglio...</div>;

  return (
    <div className="section animate-in">
      <header className="section-header">
        <h2>Patrimonio Investito: {totalPortfolioValue.toLocaleString('it-IT', { minimumFractionDigits: 2 })}€</h2>
      </header>

      <div className="investments-dashboard">
        <div className="chart-box">
          <h3>Asset Allocation</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%" cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <ChartTooltip 
                formatter={(value: any) => `${Number(value).toFixed(2)}€`}
                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-box">
          <h3>Performance Totale</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={history}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis dataKey="date" stroke="#94a3b8" tick={{fontSize: 10}} />
              <YAxis 
                stroke="#94a3b8" 
                domain={['auto', 'auto']} 
                tickFormatter={(v) => `${v.toLocaleString('it-IT')}€`} 
              />
              <ChartTooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none' }} />
              <Line type="monotone" dataKey="total_value" stroke="#10b981" strokeWidth={3} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <DataTable 
        columns={['Asset', 'Ticker', 'Prezzo', 'Quote', 'Totale', 'Azione']}
        data={assets}
        renderRow={(asset: IAsset) => (
          <tr key={asset.id}>
            <td>
              <span className="color-dot" style={{ backgroundColor: asset.color }}></span>
              {asset.name}
            </td>
            <td className="text-muted">{asset.ticker}</td>
            <td>{Number(asset.currentPrice).toFixed(2)}€</td>
            <td>{asset.shares}</td>
            <td className="price-cell">
                {(Number(asset.shares) * Number(asset.currentPrice)).toFixed(2)}€
            </td>
            <td>
              <button className="btn-edit" onClick={() => { setSelectedAsset(asset); setIsModalOpen(true); }}>
                Modifica
              </button>
            </td>
          </tr>
        )}
      />

      {isModalOpen && selectedAsset && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Modifica {selectedAsset.ticker}</h3>
            <form onSubmit={handleUpdateAsset}>
              <label>Nome Asset</label>
              <input 
                type="text" 
                value={selectedAsset.name} 
                onChange={e => setSelectedAsset({...selectedAsset, name: e.target.value})} 
              />
              
              <label>Numero Quote</label>
              <input 
                type="number" step="any"
                value={selectedAsset.shares} 
                onChange={e => setSelectedAsset({...selectedAsset, shares: parseFloat(e.target.value)})} 
              />

              <label>Colore Grafico</label>
              <input 
                type="color" 
                value={selectedAsset.color} 
                onChange={e => setSelectedAsset({...selectedAsset, color: e.target.value})} 
              />

              <div className="modal-actions">
                <button type="button" onClick={() => setIsModalOpen(false)}>Annulla</button>
                <button type="submit" className="btn-save">Salva Cambiamenti</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvestmentsSection;