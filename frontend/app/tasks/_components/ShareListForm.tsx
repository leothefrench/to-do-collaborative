'use client';
import { useState, useTransition } from 'react';
import { shareTaskListAction } from '@/actions/shareActions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useRouter } from 'next/navigation';
import { TaskList } from '../page'; 
import { UserPayload } from '@/lib/auth';

interface ShareFormProps {
  taskLists: TaskList[];
  onClose: () => void;
  user: UserPayload;
}

const ONE_MONTH_IN_MS = 30 * 24 * 60 * 60 * 1000;

export default function ShareListForm({
  taskLists,
  onClose,
  user,
}: ShareFormProps) {
  const router = useRouter();
  const [collaboratorUserName, setCollaboratorUserName] = useState('');
  const [selectedListId, setSelectedListId] = useState('');
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{
    text: string;
    type: 'success' | 'error';
  } | null>(null);

  const isTrialStarted = !!user.premiumTrialActivatedAt;
  const isTrialActive = isTrialStarted
    ? Date.now() -
        new Date(user.premiumTrialActivatedAt as string | Date).getTime() <
      ONE_MONTH_IN_MS
    : false;
  const isPremium = user.plan === 'PREMIUM';

  const userOwnedTaskLists = taskLists.filter(
    (list) => list.ownerId === user.id
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!selectedListId) {
      setMessage({
        text: 'Veuillez sélectionner une liste à partager.',
        type: 'error',
      });
      return;
    }
    if (
      user.userName &&
      user.userName.toLowerCase() === collaboratorUserName.toLowerCase()
    ) {
      setMessage({
        text: 'Vous ne pouvez pas partager une liste avec vous-même.',
        type: 'error',
      });
      return;
    }

    // REMPLACER LE BLOC 'startTransition' COMPLET DANS ShareListForm.tsx
    startTransition(async () => {
      const result = await shareTaskListAction(
        selectedListId,
        collaboratorUserName
      );

      if (result.success) {
        setMessage({ text: result.message, type: 'success' }); // Condition finale : Rafraîchir si l'essai vient d'être activé OU si l'utilisateur est déjà premium/en essai
        if (result.trialActivated || isPremium || isTrialActive) {
          router.refresh();
        }
        setTimeout(onClose, 2000);
      } else {
        setMessage({ text: result.message, type: 'error' });
      }
    });
  }; // FIN DE handleSubmit

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pt-4">
           {' '}
      {!isPremium && user.plan === 'FREE' && (
        <div
          className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-3"
          role="alert"
        >
                   {' '}
          {isTrialStarted ? (
            <p className="text-sm font-medium">
                            Essai Premium actif ! Vous pouvez partager des
              listes pendant 30               jours (Limite : 5 invités).      
                   {' '}
            </p>
          ) : (
            <p className="text-sm font-medium">
                            Ceci active votre **essai Premium gratuit de 30
              jours** pour le               partage collaboratif !            {' '}
            </p>
          )}
                 {' '}
        </div>
      )}
           {' '}
      <div className="space-y-2">
                <Label htmlFor="list-select">Liste à partager</Label>       {' '}
        <Select
          value={selectedListId}
          onValueChange={setSelectedListId}
          name="list-select"
        >
                   {' '}
          <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez une liste..." /> 
                   {' '}
          </SelectTrigger>
                   {' '}
          <SelectContent>
                       {' '}
            {userOwnedTaskLists.map(
              (
                list // MODIFIÉ : Utilise la liste filtrée
              ) => (
                <SelectItem key={list.id} value={list.id}>
                                  {list.name}             {' '}
                </SelectItem>
              )
            )}
                     {' '}
          </SelectContent>
                 {' '}
        </Select>
             {' '}
      </div>
           {' '}
      <div className="space-y-2">
               {' '}
        <Label htmlFor="collaborator-username">
                    Nom d'utilisateur du collaborateur        {' '}
        </Label>
               {' '}
        <Input
          id="collaborator-username"
          type="text"
          placeholder="Entrez le nom d'utilisateur (ex: john_doe)"
          value={collaboratorUserName}
          onChange={(e) => setCollaboratorUserName(e.target.value)}
          required
        />
             {' '}
      </div>
           {' '}
      {message && (
        <div
          className={`p-3 rounded text-sm ${
            message.type === 'success'
              ? 'bg-green-100 text-green-700'
              : 'bg-red-100 text-red-700'
          }`}
        >
                    {message.text}       {' '}
        </div>
      )}
           {' '}
      <Button
        type="submit"
        className="w-full"
        disabled={isPending || !collaboratorUserName || !selectedListId}
      >
               {' '}
        {isPending ? 'Invitation en cours...' : 'Inviter le collaborateur'}     {' '}
      </Button>
         {' '}
    </form>
  );
}
