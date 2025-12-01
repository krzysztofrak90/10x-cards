import { Button } from "@/components/ui/button";

interface GenerateButtonProps {
  onClick: () => void;
  disabled?: boolean;
  isLoading?: boolean;
}

/**
 * GenerateButton - Button to initiate flashcard generation
 *
 * Triggers API request to generate flashcards from source text
 * Disabled when text validation fails or during loading
 */
export function GenerateButton({
  onClick,
  disabled = false,
  isLoading = false,
}: GenerateButtonProps) {
  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      size="lg"
      className="w-full sm:w-auto"
      aria-busy={isLoading}
    >
      {isLoading ? "Generuję..." : "Generuj fiszki"}
    </Button>
  );
}
