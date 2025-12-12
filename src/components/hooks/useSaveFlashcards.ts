import { useState } from "react";
import type { CreateFlashcardsCommand, CreateFlashcardsResponse, CreateFlashcardDTO } from "@/types";
import type { FlashcardProposalViewModel } from "./useGenerateFlashcards";

/**
 * useSaveFlashcards - Custom hook for saving flashcards to the database
 *
 * Handles:
 * - API calls to POST /api/flashcards
 * - Loading state management
 * - Error handling
 * - Success state tracking
 * - Transformation from FlashcardProposalViewModel to CreateFlashcardDTO
 *
 * @returns Object containing state and functions for flashcard saving
 */
export function useSaveFlashcards() {
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<string>("");
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [savedCount, setSavedCount] = useState<number>(0);

  /**
   * Transforms FlashcardProposalViewModel to CreateFlashcardDTO
   * Validates that required fields are present and within limits
   */
  const transformToDTO = (flashcard: FlashcardProposalViewModel, generationId: number): CreateFlashcardDTO => {
    return {
      front: flashcard.front.trim(),
      back: flashcard.back.trim(),
      source: flashcard.source,
      generation_id: generationId,
    };
  };

  /**
   * Validates flashcard data before saving
   * Checks front and back length constraints
   */
  const validateFlashcard = (flashcard: FlashcardProposalViewModel): boolean => {
    const frontLength = flashcard.front.trim().length;
    const backLength = flashcard.back.trim().length;

    if (frontLength === 0 || frontLength > 200) {
      return false;
    }

    if (backLength === 0 || backLength > 500) {
      return false;
    }

    return true;
  };

  /**
   * Saves flashcards to the database
   * @param flashcards - Array of flashcard proposals to save
   * @param generationId - ID of the generation these flashcards belong to
   * @returns Promise with success status and data/error
   */
  const saveFlashcards = async (flashcards: FlashcardProposalViewModel[], generationId: number | null) => {
    if (!generationId) {
      setSaveError("Brak ID generacji. Wygeneruj fiszki ponownie.");
      return { success: false, error: "Missing generation ID" };
    }

    if (flashcards.length === 0) {
      setSaveError("Brak fiszek do zapisania.");
      return { success: false, error: "No flashcards to save" };
    }

    // Validate all flashcards
    const invalidFlashcards = flashcards.filter((f) => !validateFlashcard(f));
    if (invalidFlashcards.length > 0) {
      setSaveError(
        `${invalidFlashcards.length} fiszek nie spełnia wymagań walidacji (przód ≤200 znaków, tył ≤500 znaków).`
      );
      return { success: false, error: "Validation failed" };
    }

    setIsSaving(true);
    setSaveError("");
    setSaveSuccess(false);

    try {
      // Transform to DTOs
      const flashcardDTOs = flashcards.map((f) => transformToDTO(f, generationId));

      const command: CreateFlashcardsCommand = {
        flashcards: flashcardDTOs,
      };

      const response = await fetch("/api/flashcards", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(command),
      });

      if (!response.ok) {
        if (response.status === 400) {
          const error = await response.json();
          throw new Error(error.message || "Błąd walidacji danych.");
        }
        if (response.status === 401) {
          throw new Error("Musisz być zalogowany, aby zapisać fiszki.");
        }
        if (response.status === 500) {
          throw new Error("Błąd serwera. Spróbuj ponownie później.");
        }
        throw new Error("Wystąpił nieoczekiwany błąd.");
      }

      const data: CreateFlashcardsResponse = await response.json();

      setSaveSuccess(true);
      setSavedCount(data.flashcards.length);

      return { success: true, data };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Wystąpił nieoczekiwany błąd.";
      setSaveError(message);
      return { success: false, error: message };
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Clears save error message
   */
  const clearSaveError = () => {
    setSaveError("");
  };

  /**
   * Clears success state
   */
  const clearSuccess = () => {
    setSaveSuccess(false);
    setSavedCount(0);
  };

  /**
   * Resets all state to initial values
   */
  const resetSaveState = () => {
    setIsSaving(false);
    setSaveError("");
    setSaveSuccess(false);
    setSavedCount(0);
  };

  return {
    // State
    isSaving,
    saveError,
    saveSuccess,
    savedCount,

    // Actions
    saveFlashcards,
    clearSaveError,
    clearSuccess,
    resetSaveState,
  };
}
