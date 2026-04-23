import React, { useState } from 'react';
import axios from 'axios';

interface LoginProps {
  onLogin: (token: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Usiamo la variabile d'ambiente definita su Vercel
  const API_URL = import.meta.env.VITE_API_URL;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Chiamata al backend su Render
      const res = await axios.post(`${API_URL}/api/login`, { username, password });
      
      // Se il login va a buon fine, passiamo il token al componente padre (App.tsx)
      onLogin(res.data.token);
    } catch (err: any) {
      console.error("Errore login:", err.response?.data || err.message);
      alert("Accesso negato: credenziali errate o server non raggiungibile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>🔒 Accesso Riservato</h2>
        <form onSubmit={handleSubmit}>
          <input 
            type="text" 
            placeholder="Username" 
            value={username}
            onChange={e => setUsername(e.target.value)} 
            required 
          />
          <input 
            type="password" 
            placeholder="Password" 
            value={password}
            onChange={e => setPassword(e.target.value)} 
            required 
          />
          <button type="submit" className="btn-save" disabled={loading}>
            {loading ? "Verifica in corso..." : "Entra"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;