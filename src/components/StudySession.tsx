import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";

interface Flashcard {
  id: number;
  front: string;
  back: string;
  source: string;
  created_at: string;
}

/**
 * StudySession - Component for studying flashcards
 *
 * Features:
 * - Shows flashcards one by one
 * - Flip to reveal answer
 * - Track correct/incorrect answers
 * - Progress tracking
 * - Review session summary
 */
export default function StudySession() {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showBack, setShowBack] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessionStats, setSessionStats] = useState({
    correct: 0,
    incorrect: 0,
    completed: false,
  });

  // Fetch flashcards on mount
  useEffect(() => {
    fetchFlashcards();
  }, []);

  const fetchFlashcards = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/flashcards");

      if (!response.ok) {
        throw new Error("Nie udało się pobrać fiszek");
      }

      const data = await response.json();

      if (data.flashcards.length === 0) {
        setError('Nie masz jeszcze żadnych fiszek. Dodaj je w zakładce "Moja Kolekcja" lub "Generuj".');
      } else {
        // Shuffle flashcards for variety
        const shuffled = [...data.flashcards].sort(() => Math.random() - 0.5);
        setFlashcards(shuffled);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Wystąpił błąd podczas ładowania fiszek");
    } finally {
      setIsLoading(false);
    }
  };

  const flipCard = () => {
    setShowBack(!showBack);
  };

  const handleAnswer = (wasCorrect: boolean) => {
    // Update stats
    setSessionStats((prev) => ({
      ...prev,
      correct: prev.correct + (wasCorrect ? 1 : 0),
      incorrect: prev.incorrect + (wasCorrect ? 0 : 1),
    }));

    // Move to next card
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowBack(false);
    } else {
      // Session completed
      setSessionStats((prev) => ({
        ...prev,
        completed: true,
      }));
    }
  };

  const restartSession = () => {
    // Shuffle cards again
    const shuffled = [...flashcards].sort(() => Math.random() - 0.5);
    setFlashcards(shuffled);
    setCurrentIndex(0);
    setShowBack(false);
    setSessionStats({
      correct: 0,
      incorrect: 0,
      completed: false,
    });
  };

  const getSourceLabel = (source: string) => {
    switch (source) {
      case "manual":
        return "Ręczne";
      case "ai-full":
        return "AI";
      case "ai-edited":
        return "AI (edytowane)";
      default:
        return source;
    }
  };

  const getSourceVariant = (source: string): "default" | "secondary" | "outline" => {
    switch (source) {
      case "manual":
        return "outline";
      case "ai-full":
        return "default";
      case "ai-edited":
        return "secondary";
      default:
        return "outline";
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardContent className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-gray-600">Ładowanie fiszek...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardContent className="p-8">
            <div className="text-center">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={fetchFlashcards}>Spróbuj ponownie</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Session completed state
  if (sessionStats.completed) {
    const total = sessionStats.correct + sessionStats.incorrect;
    const percentage = Math.round((sessionStats.correct / total) * 100);

    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center">Sesja zakończona!</CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <div className="text-center space-y-4">
              <div className="text-6xl font-bold text-green-600">{percentage}%</div>
              <p className="text-xl text-gray-600">Twój wynik</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <p className="text-3xl font-bold text-green-600">{sessionStats.correct}</p>
                <p className="text-sm text-gray-600">Poprawnych</p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg text-center">
                <p className="text-3xl font-bold text-red-600">{sessionStats.incorrect}</p>
                <p className="text-sm text-gray-600">Niepoprawnych</p>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Button onClick={restartSession} size="lg" className="w-full">
                Rozpocznij nową sesję
              </Button>
              <Button
                onClick={() => (window.location.href = "/flashcards")}
                variant="outline"
                size="lg"
                className="w-full"
              >
                Wróć do kolekcji
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Active study session
  const currentCard = flashcards[currentIndex];
  const progress = ((currentIndex + 1) / flashcards.length) * 100;

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Card>
        <CardHeader>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <CardTitle className="text-2xl font-bold">Sesja nauki</CardTitle>
              <Badge variant="outline">
                {currentIndex + 1} / {flashcards.length}
              </Badge>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Stats */}
            <div className="flex gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-green-600 font-semibold">✓ {sessionStats.correct}</span>
                <span className="text-gray-400">poprawnych</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-red-600 font-semibold">✗ {sessionStats.incorrect}</span>
                <span className="text-gray-400">niepoprawnych</span>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-8 space-y-6">
          {/* Flashcard */}
          <div
            className="relative min-h-[300px] cursor-pointer select-none"
            role="button"
            tabIndex={0}
            onClick={flipCard}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                flipCard();
              }
            }}
          >
            <div className="absolute top-0 right-0">
              <Badge variant={getSourceVariant(currentCard.source)}>{getSourceLabel(currentCard.source)}</Badge>
            </div>

            <div className="flex flex-col items-center justify-center min-h-[300px] space-y-4">
              <div className="text-center space-y-2">
                <p className="text-sm text-gray-500 uppercase tracking-wide">{showBack ? "Odpowiedź" : "Pytanie"}</p>
                <p className="text-2xl font-medium leading-relaxed px-4">
                  {showBack ? currentCard.back : currentCard.front}
                </p>
              </div>

              <p className="text-sm text-gray-400 italic">
                {showBack ? "Kliknij aby ukryć odpowiedź" : "Kliknij aby pokazać odpowiedź"}
              </p>
            </div>
          </div>

          {/* Answer buttons - only show after revealing the back */}
          {showBack && (
            <div className="flex gap-4 pt-4 border-t">
              <Button
                onClick={() => handleAnswer(false)}
                variant="outline"
                size="lg"
                className="flex-1 border-red-200 hover:bg-red-50 hover:text-red-700"
              >
                ✗ Nie wiedziałem
              </Button>
              <Button
                onClick={() => handleAnswer(true)}
                variant="outline"
                size="lg"
                className="flex-1 border-green-200 hover:bg-green-50 hover:text-green-700"
              >
                ✓ Wiedziałem
              </Button>
            </div>
          )}

          {!showBack && (
            <div className="text-center text-sm text-gray-500 pt-4 border-t">
              Najpierw spróbuj odpowiedzieć, a następnie kliknij kartę aby zobaczyć odpowiedź
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
