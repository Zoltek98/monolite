import React, { useState } from 'react';
import axios from 'axios';

interface LoginProps {
  onLogin: (token: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://api.casa-boschetto/api/login', { username, password });
      onLogin(res.data.token);
    } catch (err) {
      alert("Accesso negato");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>🔒 Accesso Riservato</h2>
        <form onSubmit={handleSubmit}>
          <input type="text" placeholder="Username" onChange={e => setUsername(e.target.value)} />
          <input type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} />
          <button type="submit" className="btn-save">Entra</button>
        </form>
      </div>
    </div>
  );
};

export default Login;