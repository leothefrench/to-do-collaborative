'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { searchUsers } from '@/actions/contactActions';

export default function ContactPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const { data: searchResults, isLoading } = useQuery({
    queryKey: ['searchUsers', searchTerm],
    queryFn: () => searchUsers(searchTerm),
    enabled: isSearching && searchTerm.length > 0,
  });

  const handleSearch = () => {
    setIsSearching(true);
  };

  return (
    <main className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 text-center">
        Trouver de nouveaux contacts
      </h1>

      <div className="flex w-full max-w-md items-center space-x-2 mx-auto mb-6">
        <Input
          type="text"
          placeholder="Rechercher par nom ou e-mail..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Button onClick={handleSearch}>Rechercher</Button>
      </div>

      <Separator className="my-6 max-w-md mx-auto" />

      {isLoading ? (
        <p className="text-center">Recherche en cours...</p>
      ) : searchResults && searchResults.length > 0 ? (
        <div className="max-w-md mx-auto">
          <h2 className="text-lg font-semibold mb-4">
            Résultats de la recherche
          </h2>
          <ul className="space-y-3">
            {searchResults.map((user) => (
              <li
                key={user.id}
                className="p-4 border rounded-lg shadow-sm flex justify-between items-center bg-card"
              >
                <div>

                <span className="font-semibold">{user.userName}</span>
                <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
                <Button variant="outline">Ajouter</Button>
              </li>
            ))}
          </ul>
        </div>
      ) : isSearching && searchTerm.length > 0 ? (
        <p className="text-center text-muted-foreground">
          Aucun utilisateur trouvé.
        </p>
      ) : null}

      <div className="mt-8 max-w-md mx-auto">
        <h2 className="text-lg font-semibold mb-4">Mes contacts</h2>
        {/* Ici, vous afficherez la liste des contacts existants, si vous en avez */}
        <p className="text-center text-muted-foreground">
          Liste des contacts...
        </p>
      </div>
    </main>
  );
}
