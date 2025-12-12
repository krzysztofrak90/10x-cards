import { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';

interface Flashcard {
  id: number;
  front: string;
  back: string;
  source: string;
  created_at: string;
}

interface FlashcardCardProps {
  flashcard: Flashcard;
  onEdit: (flashcard: Flashcard) => void;
  onDelete: (id: number) => void;
}

export default function FlashcardCard({ flashcard, onEdit, onDelete }: FlashcardCardProps) {
  const [showBack, setShowBack] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm('Czy na pewno chcesz usunąć tę fiszkę?')) {
      return;
    }

    setIsDeleting(true);
    try {
      await onDelete(flashcard.id);
    } catch (error) {
      setIsDeleting(false);
    }
  };

  const getSourceLabel = (source: string) => {
    switch (source) {
      case 'manual':
        return 'Ręczne';
      case 'ai-full':
        return 'AI';
      case 'ai-edited':
        return 'AI (edytowane)';
      default:
        return source;
    }
  };

  const getSourceVariant = (source: string): "default" | "secondary" | "outline" => {
    switch (source) {
      case 'manual':
        return 'outline';
      case 'ai-full':
        return 'default';
      case 'ai-edited':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <Badge variant={getSourceVariant(flashcard.source)}>
            {getSourceLabel(flashcard.source)}
          </Badge>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onEdit(flashcard)}
            >
              Edytuj
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Usuwanie...' : 'Usuń'}
            </Button>
          </div>
        </div>

        <div
          className="cursor-pointer"
          onClick={() => setShowBack(!showBack)}
        >
          <div className="mb-3">
            <p className="text-sm text-gray-500 mb-1">Przód:</p>
            <p className="text-gray-900">{flashcard.front}</p>
          </div>

          {showBack && (
            <div className="pt-3 border-t">
              <p className="text-sm text-gray-500 mb-1">Tył:</p>
              <p className="text-gray-900">{flashcard.back}</p>
            </div>
          )}

          <p className="text-xs text-gray-400 mt-2">
            {showBack ? 'Kliknij aby ukryć odpowiedź' : 'Kliknij aby pokazać odpowiedź'}
          </p>
        </div>

        <p className="text-xs text-gray-400 mt-3">
          Utworzono: {new Date(flashcard.created_at).toLocaleDateString('pl-PL')}
        </p>
      </CardContent>
    </Card>
  );
}
