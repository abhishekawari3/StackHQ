import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async function fetchSettings() {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API}/settings/company`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSettings(response.data);
      } catch (err) {
        // not blocking app load; notify user
        toast.error('Failed to load company settings');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, setSettings, loading }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return ctx;
}
