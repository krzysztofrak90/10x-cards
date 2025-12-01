import { Button } from "@/components/ui/button";

interface BulkSaveButtonProps {
  onSaveAll: () => void;
  onSaveAccepted: () => void;
  disabled?: boolean;
  isSaving?: boolean;
  totalCount: number;
  acceptedCount: number;
}

/**
 * BulkSaveButton - Component for bulk saving flashcards
 *
 * Provides two save options:
 * 1. Save All - Saves all flashcard proposals
 * 2. Save Accepted - Saves only accepted flashcards
 *
 * Displays count information and handles disabled/loading states
 */
export function BulkSaveButton({
  onSaveAll,
  onSaveAccepted,
  disabled = false,
  isSaving = false,
  totalCount,
  acceptedCount,
}: BulkSaveButtonProps) {
  const hasFlashcards = totalCount > 0;
  const hasAcceptedFlashcards = acceptedCount > 0;

  if (!hasFlashcards) {
    return null;
  }

  return (
    <div className="space-y-4 pt-6 border-t">
      <div className="flex flex-col sm:flex-row gap-3 justify-end">
        <Button
          onClick={onSaveAccepted}
          disabled={!hasAcceptedFlashcards || disabled || isSaving}
          variant="outline"
          size="lg"
          className="w-full sm:w-auto"
          aria-busy={isSaving}
        >
          {isSaving
            ? "Zapisywanie..."
            : `Zapisz zaakceptowane (${acceptedCount})`}
        </Button>

        <Button
          onClick={onSaveAll}
          disabled={disabled || isSaving}
          size="lg"
          className="w-full sm:w-auto"
          aria-busy={isSaving}
        >
          {isSaving ? "Zapisywanie..." : `Zapisz wszystkie (${totalCount})`}
        </Button>
      </div>

      {!hasAcceptedFlashcards && hasFlashcards && (
        <p className="text-sm text-muted-foreground text-center sm:text-right">
          Zaakceptuj co najmniej jedną fiszkę, aby móc zapisać zaakceptowane.
        </p>
      )}
    </div>
  );
}
