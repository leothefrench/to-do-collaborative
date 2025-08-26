'use client';
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';

// Type pour représenter l'utilisateur
type User = { id: string; userName: string; email: string };

// Type du contexte Auth
type AuthContextType = {
  user: User | null; // Utilisateur courant ou null si non connecté
  loading: boolean; // Pour savoir si on est en train de récupérer l'user
  login: (token: string) => Promise<void>; // Fonction pour se connecter
  logout: () => void; // Fonction pour se déconnecter
};

// Création du contexte
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider Auth
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Fonction login qui stocke le token et récupère l'utilisateur
  const login = async (token: string) => {
    localStorage.setItem('token', token);
    try {
      const res = await fetch('http://localhost:3001/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      // Mettre à jour l'état user avec les infos renvoyées par le backend
      setUser(data.user || data);
    } catch (err) {
      console.error('Erreur login:', err);
      setUser(null);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  // Fonction logout qui supprime le token et réinitialise l'utilisateur
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  // Au montage du provider, on vérifie si un token existe et on récupère l'utilisateur
  useEffect(() => {
    const initUser = async () => {
      const token = localStorage.getItem('token');
      if (!token) return setLoading(false);

      try {
        const res = await fetch('http://localhost:3001/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setUser(data.user || data);
      } catch (err) {
        console.error('Erreur récupération user:', err);
        setUser(null);
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };

    initUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook pour accéder au contexte dans n'importe quel composant
export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context)
    throw new Error('useAuthContext must be used within AuthProvider');
  return context;
};
