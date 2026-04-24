import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface INotification {
  id: number;
  created_at: string;
  category: string;
  message: string;
  status: string;
}

const NotificationWidget: React.FC = () => {
  const [notifications, setNotifications] = useState<INotification[]>([]);
  const [loading, setLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL || 'https://api.casa-boschetto.com';

  const fetchNotifications = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await axios.get(`${API_URL}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(res.data);
    } catch (err) {
      console.error("Errore notifiche", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  if (loading) return <div>Caricamento log...</div>;

  return (
    <div className="section animate-in">
      <h3>🔔 Centro Notifiche Automazioni</h3>
      <div className="notification-container">
        {notifications.length === 0 ? (
          <p className="text-muted">Nessuna attività recente.</p>
        ) : (
          notifications.map((n) => (
            <div key={n.id} className="notification-card">
              <div className="notification-header">
                <span className={`badge ${n.category.toLowerCase()}`}>{n.category}</span>
                <span className="timestamp">{new Date(n.created_at).toLocaleString('it-IT')}</span>
              </div>
              <p className="notification-body">{n.message}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationWidget;