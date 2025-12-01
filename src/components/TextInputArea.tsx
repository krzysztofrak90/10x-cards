import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface TextInputAreaProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  isValid: boolean;
  currentLength: number;
}

const MIN_LENGTH = 1000;
const MAX_LENGTH = 10000;

/**
 * TextInputArea - Text input component with validation
 *
 * Allows users to input text for flashcard generation
 * Validates text length (1000-10000 characters)
 * Displays character count and validation status
 */
export function TextInputArea({
  value,
  onChange,
  disabled = false,
  isValid,
  currentLength,
}: TextInputAreaProps) {
  /**
   * Determines validation message based on current text length
   */
  const getValidationMessage = () => {
    if (currentLength === 0) {
      return `Wklej tekst (minimum ${MIN_LENGTH} znaków, maksimum ${MAX_LENGTH} znaków)`;
    }
    if (currentLength < MIN_LENGTH) {
      return `Potrzebujesz jeszcze ${MIN_LENGTH - currentLength} znaków`;
    }
    if (currentLength > MAX_LENGTH) {
      return `Przekroczono limit o ${currentLength - MAX_LENGTH} znaków`;
    }
    return "Tekst spełnia wymagania";
  };

  /**
   * Determines CSS classes for validation state
   */
  const getValidationClasses = () => {
    if (currentLength === 0) {
      return "text-muted-foreground";
    }
    if (currentLength < MIN_LENGTH) {
      return "text-yellow-600 dark:text-yellow-400";
    }
    if (currentLength > MAX_LENGTH) {
      return "text-red-600 dark:text-red-400";
    }
    return "text-green-600 dark:text-green-400";
  };

  /**
   * Determines border color based on validation state
   */
  const getBorderClasses = () => {
    if (currentLength === 0) {
      return "";
    }
    if (!isValid) {
      return "border-red-500 focus-visible:ring-red-500";
    }
    return "border-green-500 focus-visible:ring-green-500";
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="source-text" className="text-base font-medium">
        Tekst źródłowy
      </Label>

      <Textarea
        id="source-text"
        placeholder="Wklej tutaj tekst, z którego chcesz wygenerować fiszki..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`min-h-[200px] resize-y ${getBorderClasses()}`}
        aria-describedby="char-count validation-message"
        aria-invalid={!isValid && currentLength > 0}
      />

      <div className="flex justify-between items-center text-sm">
        <span
          id="validation-message"
          className={`${getValidationClasses()} font-medium`}
          role="status"
          aria-live="polite"
        >
          {getValidationMessage()}
        </span>

        <span
          id="char-count"
          className={`${getValidationClasses()}`}
          aria-live="polite"
        >
          {currentLength.toLocaleString()} / {MAX_LENGTH.toLocaleString()}
        </span>
      </div>
    </div>
  );
}
