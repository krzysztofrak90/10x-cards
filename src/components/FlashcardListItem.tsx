import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import type { FlashcardProposalViewModel } from "./hooks/useGenerateFlashcards";

interface FlashcardListItemProps {
  flashcard: FlashcardProposalViewModel;
  onAccept: (id: string) => void;
  onEdit: (id: string, front: string, back: string) => void;
  onReject: (id: string) => void;
}

const MAX_FRONT_LENGTH = 200;
const MAX_BACK_LENGTH = 500;

/**
 * FlashcardListItem - Single flashcard proposal item
 *
 * Displays a flashcard proposal with actions:
 * - Accept: Mark flashcard for saving
 * - Edit: Enable inline editing with validation
 * - Reject: Remove flashcard from list
 *
 * Supports inline editing mode with character count validation
 */
export function FlashcardListItem({ flashcard, onAccept, onEdit, onReject }: FlashcardListItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedFront, setEditedFront] = useState(flashcard.front);
  const [editedBack, setEditedBack] = useState(flashcard.back);

  /**
   * Validates edited content
   */
  const isEditValid =
    editedFront.trim().length > 0 &&
    editedFront.length <= MAX_FRONT_LENGTH &&
    editedBack.trim().length > 0 &&
    editedBack.length <= MAX_BACK_LENGTH;

  /**
   * Handles edit mode activation
   */
  const handleEditClick = () => {
    setIsEditing(true);
    setEditedFront(flashcard.front);
    setEditedBack(flashcard.back);
  };

  /**
   * Handles edit cancellation
   */
  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedFront(flashcard.front);
    setEditedBack(flashcard.back);
  };

  /**
   * Handles edit confirmation
   */
  const handleSaveEdit = () => {
    if (isEditValid) {
      onEdit(flashcard.id, editedFront.trim(), editedBack.trim());
      setIsEditing(false);
    }
  };

  /**
   * Handles accept/unaccept toggle
   */
  const handleAcceptClick = () => {
    onAccept(flashcard.id);
  };

  /**
   * Handles flashcard rejection
   */
  const handleRejectClick = () => {
    if (confirm("Czy na pewno chcesz odrzucić tę fiszkę? Tej operacji nie można cofnąć.")) {
      onReject(flashcard.id);
    }
  };

  return (
    <Card className={flashcard.accepted ? "border-green-500 border-2" : ""}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant={flashcard.accepted ? "default" : "secondary"}>
              {flashcard.accepted ? "Zaakceptowana" : "Do przeglądu"}
            </Badge>
            {flashcard.edited && (
              <Badge variant="outline" className="text-blue-600">
                Edytowana
              </Badge>
            )}
          </div>
          <Badge variant="outline">{flashcard.source}</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {isEditing ? (
          <>
            {/* Edit Mode */}
            <div className="space-y-2">
              <Label htmlFor={`front-${flashcard.id}`}>Przód fiszki</Label>
              <Textarea
                id={`front-${flashcard.id}`}
                value={editedFront}
                onChange={(e) => setEditedFront(e.target.value)}
                className={`min-h-[80px] ${editedFront.length > MAX_FRONT_LENGTH ? "border-red-500" : ""}`}
                maxLength={MAX_FRONT_LENGTH + 50}
              />
              <p
                className={`text-sm ${
                  editedFront.length > MAX_FRONT_LENGTH ? "text-red-600" : "text-muted-foreground"
                }`}
              >
                {editedFront.length} / {MAX_FRONT_LENGTH}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor={`back-${flashcard.id}`}>Tył fiszki</Label>
              <Textarea
                id={`back-${flashcard.id}`}
                value={editedBack}
                onChange={(e) => setEditedBack(e.target.value)}
                className={`min-h-[120px] ${editedBack.length > MAX_BACK_LENGTH ? "border-red-500" : ""}`}
                maxLength={MAX_BACK_LENGTH + 50}
              />
              <p
                className={`text-sm ${editedBack.length > MAX_BACK_LENGTH ? "text-red-600" : "text-muted-foreground"}`}
              >
                {editedBack.length} / {MAX_BACK_LENGTH}
              </p>
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={handleCancelEdit}>
                Anuluj
              </Button>
              <Button onClick={handleSaveEdit} disabled={!isEditValid}>
                Zapisz zmiany
              </Button>
            </div>
          </>
        ) : (
          <>
            {/* Display Mode */}
            <div className="space-y-2">
              <Label className="text-muted-foreground">Przód</Label>
              <div className="p-3 bg-muted rounded-md">
                <p className="text-sm whitespace-pre-wrap">{flashcard.front}</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-muted-foreground">Tył</Label>
              <div className="p-3 bg-muted rounded-md">
                <p className="text-sm whitespace-pre-wrap">{flashcard.back}</p>
              </div>
            </div>

            <div className="flex gap-2 justify-end flex-wrap">
              <Button variant="outline" onClick={handleRejectClick} className="text-red-600 hover:text-red-700">
                Odrzuć
              </Button>
              <Button variant="outline" onClick={handleEditClick}>
                Edytuj
              </Button>
              <Button variant={flashcard.accepted ? "secondary" : "default"} onClick={handleAcceptClick}>
                {flashcard.accepted ? "Cofnij akceptację" : "Zatwierdź"}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
