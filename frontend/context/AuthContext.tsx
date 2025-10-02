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
  loading: boolean; // Pour savoir si on est en train de récupérer l'user // La fonction login n'a plus besoin du token en argument car il est géré par le cookie côté serveur
  login: () => Promise<void>;
  logout: () => void; // Fonction pour se déconnecter
};

// Création du contexte
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// URL de base de votre backend (utilisée pour éviter la répétition)
const BACKEND_URL = 'http://localhost:3001';

/**
 * Fonction pour récupérer l'utilisateur actuel via le backend.
 * Elle repose sur la présence du cookie 'token' envoyé automatiquement.
 */
const fetchUser = async (): Promise<User | null> => {
  try {
    const res = await fetch(`${BACKEND_URL}/auth/me`, {
      // MODIFICATION IMPORTANTE : Inclure les cookies avec la requête
      credentials: 'include',
    });

    if (res.ok) {
      const data = await res.json();
      // Assurez-vous que le backend renvoie un objet utilisateur valide
      return data.user || data;
    }
    // Si la réponse n'est pas OK (ex: 401 Unauthorized), cela signifie que le cookie est invalide ou absent
    return null;
  } catch (err) {
    console.error('Erreur de vérification de session:', err);
    return null;
  }
};

// Provider Auth
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true); // MODIFICATION IMPORTANTE : La fonction login est simplifiée. // Elle met à jour l'état de l'utilisateur après un appel API (dans SignInForm.tsx) réussi

  // qui a déjà défini le cookie.
  const login = async () => {
    try {
      // Le cookie est déjà défini par la réponse POST /auth/login, on récupère juste l'utilisateur
      const fetchedUser = await fetchUser();
      setUser(fetchedUser);
    } catch (err) {
      console.error('Erreur login:', err);
      setUser(null);
    }
  }; // MODIFICATION IMPORTANTE : La fonction logout appelle la route Fastify /logout

  const logout = async () => {
    try {
      await fetch(`${BACKEND_URL}/auth/logout`, {
        method: 'POST', // ou GET, selon votre implémentation
        credentials: 'include', // Nécessaire pour envoyer le cookie à effacer
      });
      // Le serveur a effacé le cookie. On réinitialise l'état local.
      setUser(null);
    } catch (err) {
      console.error('Erreur logout:', err);
    }
  }; // Au montage du provider, on vérifie si l'utilisateur est connecté via le cookie

  useEffect(() => {
    const initUser = async () => {
      // MODIFICATION IMPORTANTE : Plus de localStorage
      const fetchedUser = await fetchUser();
      setUser(fetchedUser);
      setLoading(false);
    };

    initUser();
  }, []); // Le tableau de dépendances vide assure l'exécution une seule fois au montage

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
