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

  // Caricamento dati
  const fetchData = async () => {
    try {
      const [resAssets, resHistory] = await Promise.all([
        axios.get<IAsset[]>('http://api.casa-boschetto.com/api/assets'),
        axios.get<IPortfolioHistory[]>('http://api.casa-boschetto.com/api/portfolio-history')
      ]);
      setAssets(resAssets.data);
      setHistory(resHistory.data);
    } catch (err) {
      console.error("Errore caricamento investimenti:", err);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // Calcolo dati per la torta (Valore monetario per ogni asset)
  const pieData = useMemo(() => {
    return assets.map(a => ({
      name: a.name,
      value: Number(a.shares) * Number(a.currentPrice || 0),
      color: a.color
    })).filter(a => a.value > 0);
  }, [assets]);

  const totalPortfolioValue = pieData.reduce((sum, item) => sum + item.value, 0);

  // Gestione Salvataggio Modifiche
  const handleUpdateAsset = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedAsset) return;

    try {
      await axios.put(`http://api.casa-boschetto.com/api/assets/${selectedAsset.id}`, {
        name: selectedAsset.name,
        shares: selectedAsset.shares,
        color: selectedAsset.color
      });
      setIsModalOpen(false);
      fetchData(); // Rinfresca i dati
    } catch (err) {
      alert("Errore durante l'aggiornamento");
    }
  };

  return (
    <div className="section animate-in">
      <header className="section-header">
        <h2>Patrimonio Investito: {totalPortfolioValue.toFixed(2)}€</h2>
      </header>

      <div className="investments-dashboard">
        {/* GRAFICO A TORTA */}
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
                // Rimuoviamo il tipo esplicito ": number" e usiamo un controllo di sicurezza
                formatter={(value: any) => value ? `${Number(value).toFixed(2)}€` : '0.00€'}
                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }}
                />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* GRAFICO ANDAMENTO STORICO */}
        <div className="chart-box">
          <h3>Performance Totale</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={history}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis dataKey="date" stroke="#94a3b8" tick={{fontSize: 10}} />
              <YAxis stroke="#94a3b8" domain={['auto', 'auto']} tickFormatter={(v) => `${v}€`} />
              <ChartTooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none' }} />
              <Line type="monotone" dataKey="total_value" stroke="#10b981" strokeWidth={3} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* TABELLA ASSET */}
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
            <td className="price-cell">{(asset.shares * asset.currentPrice).toFixed(2)}€</td>
            <td>
              <button className="btn-edit" onClick={() => { setSelectedAsset(asset); setIsModalOpen(true); }}>
                Modifica
              </button>
            </td>
          </tr>
        )}
      />

      {/* MODAL / DIALOG DI MODIFICA */}
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