'use client';

import { useState, useEffect, useCallback } from 'react';

type User = {
  id: string;
  userName: string;
  email: string;
};

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // La fonction `login` gère maintenant le stockage du token et la récupération de l'utilisateur.
  const login = async (token: string) => {
    setLoading(true);
    localStorage.setItem('token', token);
    try {
      const res = await fetch('http://localhost:3001/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        localStorage.removeItem('token');
        throw new Error('Non autorisé');
      }
      const data = await res.json();
      console.log('Données utilisateur reçues:', data);
      setUser(data.user || data);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Erreur inconnue');
      }
      setUser(null);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const fetchUser = useCallback(async () => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('Pas de token trouvé, utilisateur non connecté.');
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const res = await fetch('http://localhost:3001/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error('Non autorisé');
      const data = await res.json();
      console.log('Données utilisateur reçues:', data);
      setUser(data.user || data);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Erreur inconnue');
      }
      setUser(null);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    console.log("Tentative d'initialisation");
    fetchUser();
  }, [fetchUser]);

  return {
    user,
    loading,
    error,
    refreshUser: fetchUser,
    login,
    logout,
    setUser,
  };
}
