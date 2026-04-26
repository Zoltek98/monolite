import React, { useEffect, useState, useRef } from 'react';
import Spline from '@splinetool/react-spline';
import axios from 'axios';

// Recupero l'URL dal file .env (assicurati di avere VITE_API_URL nel tuo file .env)
const API_URL = import.meta.env.VITE_API_URL || 'https://api.casa-boschetto.com';

const Home3D = () => {
  const [sensorData, setSensorData] = useState<any[]>([]);
  const splineRef = useRef<any>(null);

  const getTempColor = (temp: number) => {
    if (temp <= 18) return '#00aaff'; 
    if (temp <= 21) return '#00ffaa'; 
    if (temp <= 23) return '#ffaa00'; 
    return '#ff4400'; 
  };

const updateVisuals = (splineApp: any, data: any[]) => {
  data.forEach((sensor: any) => {
    const color = getTempColor(sensor.temperature);
    
    // Cerchiamo le mesh per nome
    const floorObj = splineApp.findObjectByName(`Floor_${sensor.name}`);
    const sensorObj = splineApp.findObjectByName(`Sensor_${sensor.name}`);

    const applyColor = (obj: any, name: string) => {
      if (!obj) return;

      try {
        // 1. Controlliamo se l'oggetto ha dei materiali con layer (Standard di Spline)
        if (obj.material && obj.material.layers) {
          // Cerchiamo il primo layer che sia di tipo 'Color'
          const colorLayer = obj.material.layers.find((l: any) => l.type === 'Color' || l.id);
          
          if (colorLayer) {
            colorLayer.color = color;
            console.log(`✅ Colore applicato al layer di ${name}`);
          } else {
            // Se non trova il tipo, prova a forzare il primo layer
            obj.material.layers[0].color = color;
          }
        } 
        // 2. Fallback per mesh semplici (Three.js style)
        else if (obj.material && obj.material.color) {
          obj.material.color.set(color);
        }
      } catch (err) {
        console.error(`Errore su ${name}:`, err);
      }
    };

    console.log(`Tentativo su: ${sensor.name}`);
    applyColor(floorObj, `Floor_${sensor.name}`);
    applyColor(sensorObj, `Sensor_${sensor.name}`);
  });
};
  const fetchData = async () => {
    const token = localStorage.getItem('token');
    try {
      // Chiamata all'URL assoluto del backend
      const res = await axios.get(`${API_URL}/api/home-status`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (Array.isArray(res.data)) {
        setSensorData(res.data);
        if (splineRef.current) {
          updateVisuals(splineRef.current, res.data);
        }
      }
    } catch (error: any) {
      console.error("Errore Fetch API:", error.response?.data || error.message);
    }
  };

  function onLoad(splineApp: any) {
    splineRef.current = splineApp;
    // Log per debuggare i nomi degli oggetti reali caricati da Spline
    console.log("Oggetti nella scena:", splineApp.getAllObjects());
    fetchData();
  }

  useEffect(() => {
    const interval = setInterval(fetchData, 300000); // 5 min
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ width: '100%', height: '100vh', background: '#000', position: 'relative' }}>
      <div style={{ 
        position: 'absolute', top: '20px', left: '20px', padding: '20px', 
        color: 'white', zIndex: 10, background: 'rgba(0,0,0,0.6)',
        borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)',
        pointerEvents: 'none', backdropFilter: 'blur(4px)'
      }}>
        <h1 style={{ margin: '0 0 15px 0', fontSize: '18px', letterSpacing: '1px' }}>CASA BOSCHETTO 3D</h1>
        {sensorData.length > 0 ? sensorData.map((s: any) => (
          <div key={s.device_id} style={{ marginBottom: '8px', fontSize: '14px' }}>
            <span style={{ opacity: 0.7 }}>{s.name}:</span> 
            <span style={{ color: getTempColor(s.temperature), marginLeft: '8px', fontWeight: 'bold' }}>
              {s.temperature}°C
            </span>
          </div>
        )) : <p style={{ fontSize: '12px', opacity: 0.5 }}>In attesa dei sensori...</p>}
      </div>
      
      <Spline 
        scene="https://prod.spline.design/zsWcmwUSjb9RKyY2/scene.splinecode?v=1" 
        onLoad={onLoad}
      />
    </div>
  );
};

export default Home3D;