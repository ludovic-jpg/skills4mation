import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

type Props = {
  dossierId: string;
  label: string;
  /** Clés React Query à rafraîchir après la suppression. */
  invalidateKeys?: string[];
};

/**
 * Supprime définitivement un dossier encore au statut « brouillon ».
 * Le dossier Google Drive éventuellement créé n'est pas touché.
 */
export function SupprimerDossierBouton({
  dossierId,
  label,
  invalidateKeys = ["mes-dossiers-liste", "admin-dossiers"],
}: Props) {
  const queryClient = useQueryClient();

  const supprimer = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("dossiers")
        .delete()
        .eq("id", dossierId)
        .eq("statut_crm", "brouillon");
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Brouillon supprimé.");
      for (const key of invalidateKeys) {
        void queryClient.invalidateQueries({ queryKey: [key] });
      }
    },
    onError: (error: unknown) =>
      toast.error(
        error instanceof Error ? error.message : "Suppression impossible pour le moment.",
      ),
  });

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Supprimer le brouillon"
          className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          onClick={(event) => event.stopPropagation()}
        >
          <Trash2 className="size-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent onClick={(event) => event.stopPropagation()}>
        <AlertDialogHeader>
          <AlertDialogTitle>Supprimer ce brouillon ?</AlertDialogTitle>
          <AlertDialogDescription>
            « {label} » sera définitivement supprimé de la base, ainsi que ses pièces et son
            historique. Le dossier Google Drive éventuellement créé reste inchangé. Cette action est
            irréversible.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            disabled={supprimer.isPending}
            onClick={(event) => {
              event.preventDefault();
              supprimer.mutate();
            }}
          >
            {supprimer.isPending ? "Suppression…" : "Supprimer définitivement"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
