import { getAuthUser, UserPayload } from '@/lib/auth';
import LogoutButton from './_components/LogoutButton';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Mail, User, Shield, CreditCard } from 'lucide-react';
import { ChangePasswordDialog } from './_components/ChangePasswordDialog';
import { DeleteAccountDialog } from './_components/DeleteAccountDialog';
import { SubscribeButton } from './_components/SubscribeButton';

export default async function ProfilePage() {
  const user: UserPayload = await getAuthUser();

  if (!user || typeof user.id !== 'string') {
    return (
      <div className="container mx-auto p-4 max-w-2xl text-center">
        <h1 className="text-2xl font-bold mb-4">Accès Refusé</h1>
        <p>Veuillez vous connecter pour voir votre profil.</p>
      </div>
    );
  }

  const isPremium = user.plan === 'PREMIUM';

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8 flex items-center gap-2 text-gray-800">
        <User className="h-7 w-7 text-primary" /> Mon Profil
      </h1>
      <div className="grid gap-6 md:grid-cols-2">
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
            <div className="flex items-center justify-between border-b pb-2">
              <strong className="text-sm text-gray-600">
                Nom d'utilisateur :
              </strong>
              <span className="font-medium text-sm">{user.userName}</span>
            </div>
            <div className="flex items-center justify-between border-b pb-2">
              <strong className="text-sm text-gray-600">Email :</strong>
              <span className="font-medium text-sm">
                {user.email || 'Non spécifié'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <strong className="text-sm text-gray-600">ID Unique :</strong>
              <span className="text-xs text-gray-500">{user.id}</span>
            </div>
          </CardContent>
        </Card>
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
            <ChangePasswordDialog />
          </CardContent>
          <CardFooter>
            <DeleteAccountDialog />
          </CardFooter>
        </Card>
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
                Plan actuel :{' '}
                <span className="text-primary">
                  {isPremium ? ' Premium' : ' Gratuit'}
                </span>
              </p>
              <p className="text-sm text-muted-foreground">
                {isPremium
                  ? 'Accès à toutes les fonctionnalités de collaboration.'
                  : 'Accès aux fonctionnalités de base.'}
              </p>
            </div>
            {!isPremium && <SubscribeButton />}
          </CardContent>
        </Card>
      </div>
      <div className="mt-10 pt-4 border-t border-gray-100 flex justify-end">
        <LogoutButton />
      </div>
    </div>
  );
}
