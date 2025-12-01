import { useState } from "react";
import type {
  CreateGenerationCommand,
  CreateGenerationResponse,
  FlashcardProposalDTO,
} from "@/types";

/**
 * FlashcardProposalViewModel - Extended model for managing flashcard proposal state
 * Includes UI-specific fields for tracking acceptance and editing state
 */
export interface FlashcardProposalViewModel extends FlashcardProposalDTO {
  accepted: boolean;
  edited: boolean;
  id: string; // temporary client-side ID for list management
}

/**
 * useGenerateFlashcards - Custom hook for flashcard generation API logic
 *
 * Handles:
 * - API calls to POST /api/generations
 * - Loading state management
 * - Error handling
 * - Flashcard proposals state management
 *
 * @returns Object containing state and functions for flashcard generation
 */
export function useGenerateFlashcards() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [flashcards, setFlashcards] = useState<FlashcardProposalViewModel[]>([]);
  const [generationId, setGenerationId] = useState<number | null>(null);

  /**
   * Generates flashcards from source text
   * @param sourceText - Text to generate flashcards from (1000-10000 characters)
   */
  const generateFlashcards = async (sourceText: string) => {
    setIsLoading(true);
    setErrorMessage("");
    setFlashcards([]);

    try {
      const command: CreateGenerationCommand = {
        source_text: sourceText,
      };

      const response = await fetch("/api/generations", {
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
        if (response.status === 500) {
          throw new Error("Błąd serwera. Spróbuj ponownie później.");
        }
        throw new Error("Wystąpił nieoczekiwany błąd.");
      }

      const data: CreateGenerationResponse = await response.json();

      // Transform proposals to view models with client-side IDs
      const viewModels: FlashcardProposalViewModel[] =
        data.flashcards_proposals.map((proposal, index) => ({
          ...proposal,
          accepted: false,
          edited: false,
          id: `proposal-${Date.now()}-${index}`,
        }));

      setFlashcards(viewModels);
      setGenerationId(data.generation_id);

      return { success: true, data };
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Wystąpił nieoczekiwany błąd.";
      setErrorMessage(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Clears error message
   */
  const clearError = () => {
    setErrorMessage("");
  };

  /**
   * Resets all state to initial values
   */
  const reset = () => {
    setIsLoading(false);
    setErrorMessage("");
    setFlashcards([]);
    setGenerationId(null);
  };

  /**
   * Updates a specific flashcard in the list
   */
  const updateFlashcard = (
    id: string,
    updates: Partial<FlashcardProposalViewModel>
  ) => {
    setFlashcards((prev) =>
      prev.map((card) => (card.id === id ? { ...card, ...updates } : card))
    );
  };

  /**
   * Removes a flashcard from the list (reject action)
   */
  const removeFlashcard = (id: string) => {
    setFlashcards((prev) => prev.filter((card) => card.id !== id));
  };

  /**
   * Toggles the accepted state of a flashcard
   */
  const toggleAccepted = (id: string) => {
    setFlashcards((prev) =>
      prev.map((card) =>
        card.id === id ? { ...card, accepted: !card.accepted } : card
      )
    );
  };

  return {
    // State
    isLoading,
    errorMessage,
    flashcards,
    generationId,

    // Actions
    generateFlashcards,
    clearError,
    reset,
    updateFlashcard,
    removeFlashcard,
    toggleAccepted,
  };
}
