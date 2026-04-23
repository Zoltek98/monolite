import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface SummaryData {
  mortgage: number;
  portfolio: number;
  luce: { price: number; kwh: number; month: number; year: number } | null;
  gas: { price: number; mc: number; month: number; year: number } | null;
}

const Dashboard: React.FC = () => {
  const [data, setData] = useState<SummaryData | null>(null);

  useEffect(() => {
    axios.get('https://api.casa-boschetto.com/api/dashboard/summary')
      .then(res => setData(res.data))
      .catch(err => console.error(err));
  }, []);

  if (!data) return <div>Caricamento...</div>;

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
          <p className="value">{Number(data.portfolio).toFixed(2)}€</p>
          <span className="label">Valore attuale investimenti</span>
        </div>

        {/* Card Mutuo */}
        <div className="summary-card">
          <h3>Ultima Rata Mutuo</h3>
          <p className="value">{data.mortgage.toLocaleString()}€</p>
          <span className="label">Capitale da rimborsare</span>
        </div>

        {/* Card Luce */}
        <div className="summary-card bill">
          <h3>Ultima Bolletta Luce</h3>
          {data.luce ? (
            <>
              <p className="value">{Number(data.luce.price).toFixed(2)}€</p>
              <p className="sub-value">{data?.luce?.kwh || "-"} kWh - {data.luce.month}/{data.luce.year}</p>
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