'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
// import { useRouter } from 'next/navigation';

export function DeleteAccountDialog() {
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  // const router = useRouter();

  const API_URL =
    process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      // Envoi de la requête DELETE à la route /auth/account
      const response = await fetch(`${API_URL}/auth/account`, {
        method: 'DELETE',
        credentials: 'include', 
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression du compte.');
      }

      // 1. Succès : Afficher une notification
      toast.success('Compte Supprimé', {
        description:
          'Votre compte et toutes vos données ont été définitivement supprimés.',
      });
      // router.push('/');
      window.location.replace('/');
    } catch (error) {
      console.error('Erreur de suppression :', error);
      toast.error('Échec de la suppression', {
        description: 'Impossible de supprimer le compte. Veuillez réessayer.',
      });
    } finally {
      setIsDeleting(false);
      setOpen(false); // Ferme la modale en cas d'erreur
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {/* Bouton Destructif qui ouvre la modale, remplace l'ancien 'disabled' dans page.tsx */}
        <Button variant="destructive" className="w-full">
          Supprimer mon compte
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center text-red-600 gap-2">
            <AlertTriangle className="h-6 w-6" /> Confirmation de suppression
          </DialogTitle>
          <DialogDescription>
            Êtes-vous absolument sûr de vouloir supprimer votre compte ?
            <span className="block font-bold mt-2 text-red-600">
              Cette action est irréversible et entraînera la perte de toutes vos
              données.
            </span>
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="mt-4 flex flex-col sm:flex-row-reverse sm:justify-start">
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
            className="w-full sm:w-auto"
          >
            {isDeleting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              'Oui, supprimer définitivement'
            )}
          </Button>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isDeleting}
            className="mt-2 sm:mt-0 sm:mr-2 w-full sm:w-auto"
          >
            Annuler
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
