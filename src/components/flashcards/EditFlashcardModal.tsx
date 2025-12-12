import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

interface Flashcard {
  id: number;
  front: string;
  back: string;
  source: string;
}

interface EditFlashcardModalProps {
  flashcard: Flashcard;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditFlashcardModal({ flashcard, onClose, onSuccess }: EditFlashcardModalProps) {
  const [front, setFront] = useState(flashcard.front);
  const [back, setBack] = useState(flashcard.back);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setFront(flashcard.front);
    setBack(flashcard.back);
  }, [flashcard]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`/api/flashcards/${flashcard.id}/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ front, back }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Błąd aktualizacji fiszki');
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Wystąpił błąd');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Edytuj fiszkę</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="front">Przód fiszki</Label>
              <textarea
                id="front"
                value={front}
                onChange={(e) => setFront(e.target.value)}
                required
                maxLength={200}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500">{front.length}/200 znaków</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="back">Tył fiszki</Label>
              <textarea
                id="back"
                value={back}
                onChange={(e) => setBack(e.target.value)}
                required
                maxLength={500}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500">{back.length}/500 znaków</p>
            </div>

            <div className="flex gap-2">
              <Button type="submit" className="flex-1" disabled={loading}>
                {loading ? 'Zapisywanie...' : 'Zapisz zmiany'}
              </Button>
              <Button type="button" variant="outline" onClick={onClose}>
                Anuluj
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
