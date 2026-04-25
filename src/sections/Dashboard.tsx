import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface SummaryData {
  mortgage: number;
  portfolio: number;
  luce: { price: number; kWh: number; month: number; year: number } | null;
  gas: { price: number; mc: number; month: number; year: number } | null;
}

const Dashboard: React.FC = () => {
  const [data, setData] = useState<SummaryData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 1. Recuperiamo il token dal localStorage (salvato al login)
    const token = localStorage.getItem('token');
    const API_URL = import.meta.env.VITE_API_URL || 'https://api.casa-boschetto.com';

    // 2. Eseguiamo la chiamata includendo l'Authorization Header
    axios.get(`${API_URL}/api/dashboard/summary`, {
      headers: {
        Authorization: `Bearer ${token}` // Fondamentale per passare il controllo JWT
      }
    })
    .then(res => {
      setData(res.data);
    })
    .catch(err => {
      console.error("Errore Dashboard:", err);
      if (err.response?.status === 401) {
        setError("Sessione scaduta. Per favore, effettua di nuovo il login.");
      } else {
        setError("Errore nel caricamento dei dati.");
      }
    });
  }, []);

  if (error) return <div className="error-message">{error}</div>;
  if (!data) return <div className="loading">Caricamento in corso...</div>;

  return (
    <div className="dashboard-home animate-in">
      <header>
        <h1>Bentornato, Yuri</h1>
        <p>Ecco la situazione attuale del tuo patrimonio e delle spese.</p>
      </header>

      <div className="summary-grid">
        {/* Card Patrimonio */}
        <div className="summary-card highlight">
          <h3>Patrimonio Totale</h3>
          <p className="value">{Number(data.portfolio).toLocaleString('it-IT', { minimumFractionDigits: 2 })}€</p>
          <span className="label">Valore attuale investimenti</span>
        </div>

        {/* Card Mutuo */}
        <div className="summary-card">
          <h3>Ultima Rata Mutuo</h3>
          <p className="value">{Number(data.mortgage).toLocaleString('it-IT')}€</p>
          <span className="label">Quota capitale/rata</span>
        </div>

        {/* Card Luce */}
        <div className="summary-card bill">
          <h3>Ultima Bolletta Luce</h3>
          {data.luce ? (
            <>
              <p className="value">{Number(data.luce.price).toFixed(2)}€</p>
              <p className="sub-value">{data.luce.kWh || "-"} kWh - {data.luce.month}/{data.luce.year}</p>
            </>
          ) : <p>Nessun dato</p>}
        </div>

        {/* Card Gas */}
        <div className="summary-card bill">
          <h3>Ultima Bolletta Gas</h3>
          {data.gas ? (
            <>
              <p className="value">{Number(data.gas.price).toFixed(2)}€</p>
              <p className="sub-value">{data.gas.mc} Smc - {data.gas.month}/{data.gas.year}</p>
            </>
          ) : <p>Nessun dato</p>}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;