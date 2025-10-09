import { getAuthUser } from '@/lib/auth'; 
import LogoutButton from './_components/LogoutButton';

export default async function ProfilePage() {
  const user = await getAuthUser();

  return (
    <div className="container mx-auto p-4 max-w-lg">
      <h1 className="text-3xl font-extrabold mb-6 text-gray-800">Mon Profil</h1>
      <div className="bg-white shadow-lg rounded-lg p-6 space-y-4 border border-gray-100">
        <p>
          <strong className="text-gray-600">Email :</strong>
          <span className="ml-2 font-medium">
            {user.email || 'Non spécifié'}
          </span>
        </p>
        <p>
          <strong className="text-gray-600">ID Unique :</strong>
          <span className="ml-2 text-gray-500">{user.id}</span>
        </p>
        <hr className="border-gray-100 mt-4 pt-4" />
        <p className="text-sm">
          <strong className="text-gray-600">Données du JWT :</strong>
          <span className="ml-2 text-gray-500">Authentifié.</span>
        </p>
      </div>
      <div className="mt-8 text-center">
        <LogoutButton />
      </div>
    </div>
  );
}
