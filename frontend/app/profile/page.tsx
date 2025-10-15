import { getAuthUser } from '@/lib/auth';
import LogoutButton from './_components/LogoutButton';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, User, Shield, Lock, CreditCard } from 'lucide-react';

interface FullUser {
  id: string;
  userName: string;
  email: string;
}

// FONCTION POUR RÉCUPÉRER LE PROFIL COMPLET DEPUIS LE BACKEND
async function fetchFullUserProfile(userId: string): Promise<FullUser | null> {
  const API_URL =
    process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

  const response = await fetch(`${API_URL}/user/${userId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    cache: 'no-store',
  });

  if (!response.ok) {
    console.error(
      'Erreur lors de la récupération du profil utilisateur complet'
    );
    return null;
  }

  return response.json();
}

export default async function ProfilePage() {
  // 1. RÉCUPÉRATION DU PAYLOAD JWT (CONTENANT SEULEMENT userId)
  const jwtPayload = await getAuthUser();

  if (!jwtPayload || !jwtPayload.userId) {
    return (
      <div className="container mx-auto p-4 max-w-2xl text-center">
        <h1 className="text-2xl font-bold mb-4">Accès Refusé</h1>
        <p>Veuillez vous connecter pour voir votre profil.</p>
      </div>
    );
  }

  // 2. APPEL POUR RÉCUPÉRER LES DONNÉES COMPLÈTES DE L'UTILISATEUR
  const fullUser = await fetchFullUserProfile(jwtPayload.userId);

  if (!fullUser) {
    return (
      <p className="text-center mt-10 text-red-500">
        Impossible de charger les données du profil.
      </p>
    );
  }

  // 3. AFFICHAGE UTILISANT LES DONNÉES COMPLÈTES (fullUser)

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8 flex items-center gap-2 text-gray-800">
        <User className="h-7 w-7 text-primary" /> Mon Profil
      </h1>

      <div className="grid gap-6 md:grid-cols-2">
        {/* 1. SECTION: INFORMATIONS DU COMPTE (CARD) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" /> Informations
            </CardTitle>
            <CardDescription>
              Aperçu des détails de votre compte.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* AFFICHAGE DU NOM D'UTILISATEUR */}
            <div className="flex items-center justify-between border-b pb-2">
              <strong className="text-sm text-gray-600">
                Nom d'utilisateur :
              </strong>
              <span className="font-medium text-sm">{fullUser.userName}</span>
            </div>

            {/* AFFICHAGE DE L'EMAIL */}
            <div className="flex items-center justify-between border-b pb-2">
              <strong className="text-sm text-gray-600">Email :</strong>
              <span className="font-medium text-sm">
                {fullUser.email || 'Non spécifié'}
              </span>
            </div>

            {/* AFFICHAGE DE L'ID */}
            <div className="flex items-center justify-between">
              <strong className="text-sm text-gray-600">ID Unique :</strong>
              <span className="text-xs text-gray-500">{fullUser.id}</span>
            </div>
          </CardContent>
        </Card>

        {/* 2. SECTION: SÉCURITÉ ET ACCÈS (CARD) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" /> Sécurité
            </CardTitle>
            <CardDescription>
              Gérez les paramètres de sécurité de votre compte.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              <Lock className="h-4 w-4 mr-2" /> Changer le mot de passe
            </Button>
          </CardContent>
          <CardFooter>
            <Button variant="destructive" className="w-full" disabled>
              Supprimer mon compte (À implémenter)
            </Button>
          </CardFooter>
        </Card>

        {/* 3. SECTION: ABONNEMENT (CARD - Préparation Stripe) */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" /> Abonnement
            </CardTitle>
            <CardDescription>
              Gérez votre plan actuel et vos options de facturation.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <div>
              <p className="text-lg font-semibold">
                Plan actuel : <span className="text-primary">Gratuit</span>
              </p>
              <p className="text-sm text-muted-foreground">
                Accès aux fonctionnalités de base.
              </p>
            </div>
            {/* Ce bouton sera le point d'entrée vers le portail Stripe */}
            <Button variant="default">Mettre à niveau vers Pro</Button>
          </CardContent>
        </Card>
      </div>

      {/* 4. SECTION: DÉCONNEXION (Gardé en bas pour la clarté) */}
      <div className="mt-10 pt-4 border-t border-gray-100 flex justify-end">
        <LogoutButton />
      </div>
    </div>
  );
}
