import React, { useEffect, useState, useRef } from 'react';
import Spline from '@splinetool/react-spline';

const Home3D = () => {
  const [sensorData, setSensorData] = useState([]);
  const splineRef = useRef(null);

  // 1. Funzione per convertire Temperatura in Colore (HEX)
  const getTempColor = (temp:any) => {
    // Semplice gradazione: <18 Freddo (Blu), 20-22 OK (Verde/Arancio), >25 Caldo (Rosso)
    if (temp <= 18) return '#00aaff'; // Azzurro Blueprint
    if (temp <= 21) return '#00ffaa'; // Verde acqua
    if (temp <= 23) return '#ffaa00'; // Arancio
    return '#ff4400'; // Rosso fuoco
  };

  // 2. Funzione che aggiorna il modello 3D
  const updateVisuals = (splineApp:any, data:any) => {
    data.forEach((sensor:any) => {
      // Cerchiamo il pavimento corrispondente (es. Floor_Sala)
      // Assicurati che nel DB il "name" o un campo coincida con i nomi in Spline
      const floorName = `Floor_${sensor.name}`; 
      const sensorName = `Sensor_${sensor.name}`;
      
      const floorObj = splineApp.findObjectByName(floorName);
      const sensorObj = splineApp.findObjectByName(sensorName);
      const color = getTempColor(sensor.temperature);

      if (floorObj) {
        // Cambiamo il colore del materiale del pavimento
        // Spline a volte richiede l'update del colore tramite proprietà specifiche
        floorObj.emitEvent('mouseHover'); // Esempio se hai trigger, ma meglio via API:
        floorObj.material.color.set(color); 
      }
      
      if (sensorObj) {
        sensorObj.material.color.set(color);
      }
    });
  };

  function onLoad(splineApp:any) {
    splineRef.current = splineApp;
    // Carichiamo i dati appena il modello è pronto
    fetchData();
  }

  const fetchData = async () => {
    const res = await fetch('/api/home-status');
    const data = await res.json();
    setSensorData(data);
    
    if (splineRef.current) {
      updateVisuals(splineRef.current, data);
    }
  };

  // Polling ogni 5 minuti per aggiornare la dashboard senza ricaricare
  useEffect(() => {
    const interval = setInterval(fetchData, 300000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ width: '100%', height: '100vh', background: '#000' }}>
      <div style={{ position: 'absolute', padding: '20px', color: 'white', zIndex: 1 }}>
        <h1>Monolite Home 3D</h1>
        {sensorData.map((s:any) => (
          <div key={s.device_id}>
            {s.name}: <strong>{s.temperature}°C</strong>
          </div>
        ))}
      </div>
      
      <Spline 
        scene="https://prod.spline.design/zsWcmwUSjb9RKyY2/scene.splinecode" 
        onLoad={onLoad}
      />
    </div>
  );
};

export default Home3D;