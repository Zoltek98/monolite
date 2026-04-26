import React, { useEffect, useState, useRef } from 'react';
import Spline from '@splinetool/react-spline';
import axios from 'axios'; // Assicurati di aver fatto: npm install axios

const Home3D = () => {
  const [sensorData, setSensorData] = useState([]);
  const splineRef = useRef(null);

  // 1. Funzione per convertire Temperatura in Colore (HEX)
  const getTempColor = (temp: any) => {
    if (temp <= 18) return '#00aaff'; // Freddo
    if (temp <= 21) return '#00ffaa'; // Ideale
    if (temp <= 23) return '#ffaa00'; // Tiepido
    return '#ff4400'; // Caldo
  };

  // 2. Funzione che aggiorna il modello 3D
  const updateVisuals = (splineApp: any, data: any) => {
    data.forEach((sensor: any) => {
      // Pulizia del nome: trasformiamo spazi in underscore se necessario 
      // (Dipende da come hai nominato gli oggetti in Spline)
      const sanitizedName = sensor.name.replace(/\s+/g, '_'); 
      
      const floorName = `Floor_${sensor.name}`; // Prova prima con nome esatto
      const sensorName = `Sensor_${sensor.name}`;
      
      const floorObj = splineApp.findObjectByName(floorName);
      const sensorObj = splineApp.findObjectByName(sensorName);
      const color = getTempColor(sensor.temperature);

      console.log(`Update ${sensor.name}:`, { floorObj, sensorObj, color });

      if (floorObj) {
        // Applichiamo il colore al materiale
        if (floorObj.material) {
          floorObj.material.color.set(color);
        }
      }
      
      if (sensorObj) {
        if (sensorObj.material) {
          sensorObj.material.color.set(color);
        }
        sensorObj.visible = true; // Forza visibilità
      }
    });
  };

  const fetchData = async () => {
    const token = localStorage.getItem('token');
    
    try {
      const res = await axios.get('/api/home-status', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log("Dati ricevuti da Axios:", res.data);
      setSensorData(res.data);
      
      if (splineRef.current) {
        updateVisuals(splineRef.current, res.data);
      }
    } catch (error: any) {
      console.error("Errore nel fetch con Axios:", error.response?.data || error.message);
      
      // Fallback per test visivo se il server non risponde
      const mockData = [{ name: 'Piano terra', temperature: 20.4 }]; 
      if (splineRef.current) updateVisuals(splineRef.current, mockData);
    }
  };

  function onLoad(splineApp: any) {
    splineRef.current = splineApp;
    fetchData();
  }

  useEffect(() => {
    // Polling ogni 5 minuti
    const interval = setInterval(fetchData, 300000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ width: '100%', height: '100vh', background: '#000', position: 'relative' }}>
      {/* Overlay Dati Leggibili */}
      <div style={{ 
        position: 'absolute', 
        top: '20px', 
        left: '20px', 
        padding: '20px', 
        color: 'white', 
        zIndex: 10,
        background: 'rgba(0,0,0,0.5)',
        borderRadius: '8px',
        pointerEvents: 'none' // Permette di cliccare il 3D attraverso il testo
      }}>
        <h1 style={{ margin: '0 0 10px 0', fontSize: '20px' }}>Monolite Home 3D</h1>
        {sensorData.length > 0 ? sensorData.map((s: any) => (
          <div key={s.device_id} style={{ marginBottom: '5px' }}>
            {s.name}: <span style={{ color: getTempColor(s.temperature), fontWeight: 'bold' }}>
              {s.temperature}°C
            </span>
          </div>
        )) : <p>Caricamento dati...</p>}
      </div>
      
      <Spline 
        scene="https://prod.spline.design/zsWcmwUSjb9RKyY2/scene.splinecode" 
        onLoad={onLoad}
      />
    </div>
  );
};

export default Home3D;