import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import FlashcardCard from './FlashcardCard';
import CreateFlashcardModal from './CreateFlashcardModal';
import EditFlashcardModal from './EditFlashcardModal';

interface Flashcard {
  id: number;
  front: string;
  back: string;
  source: string;
  created_at: string;
}

export default function FlashcardsList() {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingFlashcard, setEditingFlashcard] = useState<Flashcard | null>(null);
  const [filter, setFilter] = useState<'all' | 'manual' | 'ai'>('all');

  const fetchFlashcards = async () => {
    try {
      const response = await fetch('/api/flashcards');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Błąd pobierania fiszek');
      }

      setFlashcards(data.flashcards);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Wystąpił błąd');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlashcards();
  }, []);

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/flashcards/${id}/delete`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Błąd usuwania fiszki');
      }

      // Odśwież listę
      await fetchFlashcards();
    } catch (err) {
      alert('Nie udało się usunąć fiszki');
      throw err;
    }
  };

  const handleEdit = (flashcard: Flashcard) => {
    setEditingFlashcard(flashcard);
  };

  const handleSuccess = () => {
    fetchFlashcards();
  };

  const filteredFlashcards = flashcards.filter(flashcard => {
    if (filter === 'all') return true;
    if (filter === 'manual') return flashcard.source === 'manual';
    if (filter === 'ai') return flashcard.source === 'ai-full' || flashcard.source === 'ai-edited';
    return true;
  });

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Ładowanie fiszek...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Moja Kolekcja</h1>
          <p className="text-gray-600 mt-1">
            {flashcards.length} {flashcards.length === 1 ? 'fiszka' : 'fiszek'}
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          Dodaj fiszkę
        </Button>
      </div>

      {/* Filtry */}
      <div className="flex gap-2 mb-6">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('all')}
        >
          Wszystkie ({flashcards.length})
        </Button>
        <Button
          variant={filter === 'manual' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('manual')}
        >
          Ręczne ({flashcards.filter(f => f.source === 'manual').length})
        </Button>
        <Button
          variant={filter === 'ai' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('ai')}
        >
          AI ({flashcards.filter(f => f.source === 'ai-full' || f.source === 'ai-edited').length})
        </Button>
      </div>

      {filteredFlashcards.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed">
          <p className="text-gray-600 mb-4">
            {filter === 'all' ? 'Nie masz jeszcze żadnych fiszek' : 'Brak fiszek w tej kategorii'}
          </p>
          {filter === 'all' && (
            <Button onClick={() => setShowCreateModal(true)}>
              Dodaj pierwszą fiszkę
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredFlashcards.map((flashcard) => (
            <FlashcardCard
              key={flashcard.id}
              flashcard={flashcard}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      {showCreateModal && (
        <CreateFlashcardModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleSuccess}
        />
      )}

      {editingFlashcard && (
        <EditFlashcardModal
          flashcard={editingFlashcard}
          onClose={() => setEditingFlashcard(null)}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
}
