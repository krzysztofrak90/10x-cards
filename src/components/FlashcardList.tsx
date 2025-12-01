import type { FlashcardProposalViewModel } from "./hooks/useGenerateFlashcards";
import { FlashcardListItem } from "./FlashcardListItem";

interface FlashcardListProps {
  flashcards: FlashcardProposalViewModel[];
  onAccept: (id: string) => void;
  onEdit: (id: string, front: string, back: string) => void;
  onReject: (id: string) => void;
}

/**
 * FlashcardList - List of flashcard proposals
 *
 * Displays all generated flashcard proposals
 * Delegates individual flashcard actions to FlashcardListItem
 */
export function FlashcardList({
  flashcards,
  onAccept,
  onEdit,
  onReject,
}: FlashcardListProps) {
  if (flashcards.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">
          Brak wygenerowanych fiszek. Wklej tekst i kliknij "Generuj fiszki".
        </p>
      </div>
    );
  }

  const acceptedCount = flashcards.filter((f) => f.accepted).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">
          Wygenerowane propozycje ({flashcards.length})
        </h3>
        <p className="text-sm text-muted-foreground">
          Zaakceptowano: <span className="font-medium">{acceptedCount}</span> /{" "}
          {flashcards.length}
        </p>
      </div>

      <div className="space-y-4">
        {flashcards.map((flashcard) => (
          <FlashcardListItem
            key={flashcard.id}
            flashcard={flashcard}
            onAccept={onAccept}
            onEdit={onEdit}
            onReject={onReject}
          />
        ))}
      </div>
    </div>
  );
}
