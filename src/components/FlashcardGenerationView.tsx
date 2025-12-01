import { useState } from "react";
import { TextInputArea } from "./TextInputArea";
import { GenerateButton } from "./GenerateButton";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { useGenerateFlashcards } from "./hooks/useGenerateFlashcards";
import { useSaveFlashcards } from "./hooks/useSaveFlashcards";
import { FlashcardList } from "./FlashcardList";
import { FlashcardSkeletonLoader } from "./FlashcardSkeletonLoader";
import { BulkSaveButton } from "./BulkSaveButton";

/**
 * FlashcardGenerationView - Main view component for flashcard generation
 *
 * This component handles the complete workflow:
 * 1. User inputs text (1000-10000 characters)
 * 2. Text is sent to API for AI generation
 * 3. User reviews, accepts, edits, or rejects proposals
 * 4. Accepted flashcards are saved to database
 */
export default function FlashcardGenerationView() {
  // Form state
  const [textValue, setTextValue] = useState<string>("");

  // Generation API logic from custom hook
  const {
    isLoading,
    errorMessage,
    flashcards,
    generationId,
    generateFlashcards,
    clearError,
    toggleAccepted,
    updateFlashcard,
    removeFlashcard,
    reset: resetGeneration,
  } = useGenerateFlashcards();

  // Save API logic from custom hook
  const {
    isSaving,
    saveError,
    saveSuccess,
    savedCount,
    saveFlashcards,
    clearSaveError,
    clearSuccess,
  } = useSaveFlashcards();

  /**
   * Validates text input length
   * Must be between 1000 and 10000 characters
   */
  const isTextValid = textValue.length >= 1000 && textValue.length <= 10000;

  /**
   * Handles text input changes
   */
  const handleTextChange = (value: string) => {
    setTextValue(value);
    // Clear error message when user starts typing
    if (errorMessage) {
      clearError();
    }
  };

  /**
   * Handles flashcard generation request
   * Sends POST request to /api/generations endpoint
   */
  const handleGenerate = async () => {
    if (!isTextValid) {
      return;
    }

    await generateFlashcards(textValue);
  };

  /**
   * Handles flashcard acceptance toggle
   */
  const handleAccept = (id: string) => {
    toggleAccepted(id);
  };

  /**
   * Handles flashcard editing
   * Updates the flashcard content and marks it as edited
   * Changes source from "ai-full" to "ai-edited"
   */
  const handleEdit = (id: string, front: string, back: string) => {
    updateFlashcard(id, {
      front,
      back,
      edited: true,
      source: "ai-edited",
    });
  };

  /**
   * Handles flashcard rejection
   * Removes the flashcard from the list
   */
  const handleReject = (id: string) => {
    removeFlashcard(id);
  };

  /**
   * Handles saving all flashcards
   */
  const handleSaveAll = async () => {
    const result = await saveFlashcards(flashcards, generationId);

    if (result.success) {
      // Clear the form and reset generation state after successful save
      setTimeout(() => {
        setTextValue("");
        resetGeneration();
        clearSuccess();
      }, 3000);
    }
  };

  /**
   * Handles saving only accepted flashcards
   */
  const handleSaveAccepted = async () => {
    const acceptedFlashcards = flashcards.filter((f) => f.accepted);
    const result = await saveFlashcards(acceptedFlashcards, generationId);

    if (result.success) {
      // Clear the form and reset generation state after successful save
      setTimeout(() => {
        setTextValue("");
        resetGeneration();
        clearSuccess();
      }, 3000);
    }
  };

  // Calculate counts for UI
  const acceptedCount = flashcards.filter((f) => f.accepted).length;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold">
            Generuj fiszki z AI
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Text Input Section */}
          <div className="space-y-4">
            <TextInputArea
              value={textValue}
              onChange={handleTextChange}
              disabled={isLoading}
              isValid={isTextValid}
              currentLength={textValue.length}
            />

            <GenerateButton
              onClick={handleGenerate}
              disabled={!isTextValid || isLoading}
              isLoading={isLoading}
            />
          </div>

          {/* Error Display - Generation */}
          {errorMessage && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-800">{errorMessage}</p>
            </div>
          )}

          {/* Error Display - Save */}
          {saveError && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-800">{saveError}</p>
            </div>
          )}

          {/* Success Display */}
          {saveSuccess && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-800 font-medium">
                ✓ Zapisano pomyślnie {savedCount} fiszek!
              </p>
            </div>
          )}

          {/* Loading State */}
          {isLoading && <FlashcardSkeletonLoader count={3} />}

          {/* Flashcards List */}
          {!isLoading && flashcards.length > 0 && (
            <>
              <FlashcardList
                flashcards={flashcards}
                onAccept={handleAccept}
                onEdit={handleEdit}
                onReject={handleReject}
              />

              {/* Bulk Save Buttons */}
              <BulkSaveButton
                onSaveAll={handleSaveAll}
                onSaveAccepted={handleSaveAccepted}
                disabled={saveSuccess}
                isSaving={isSaving}
                totalCount={flashcards.length}
                acceptedCount={acceptedCount}
              />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
