# Architektura Komponentów - Widok Generowania Fiszek

## Przegl ąd

Widok generowania fiszek (`/generate`) składa się z:
1. **Formularz wejściowy** - obszar tekstowy do wprowadzenia źródła (800-12000 znaków)
2. **Generator** - przycisk wywołujący AI API
3. **Lista propozycji** - wyświetlanie i edycja wygenerowanych fiszek
4. **Panel zapisu** - zbiorczy zapis zaakceptowanych fiszek

---

## Główne Komponenty

### 1. FlashcardGenerationView (Container)
**Plik:** `src/components/FlashcardGenerationView.tsx`

**Odpowiedzialności:**
- Główna logika flow generowania
- Zarządzanie stanem (text input, flashcards, errors)
- Koordynacja między child components

**State Management:**
```typescript
// Custom hooks
const { isLoading, flashcards, generateFlashcards } = useGenerateFlashcards();
const { isSaving, saveFlashcards } = useSaveFlashcards();

// Local state
const [textValue, setTextValue] = useState("");
```

**Render Logic:**
1. Zawsze: TextInputArea + GenerateButton
2. Jeśli loading: FlashcardSkeletonLoader
3. Jeśli error: ErrorDisplay
4. Jeśli flashcards: FlashcardList + BulkSaveButton
5. Jeśli saveSuccess: SuccessMessage

---

### 2. TextInputArea
**Plik:** `src/components/TextInputArea.tsx`

**Props:**
```typescript
interface TextInputAreaProps {
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
  isValid: boolean;
  currentLength: number;
}
```

**Features:**
- Textarea z licznikiem znaków (XXX / 12000)
- Walidacja min 800, max 12000 znaków
- Visual feedback (border color) przy błędnej długości
- Disabled podczas generowania

**Implementacja:**
```tsx
<div>
  <Label>Wklej tekst do analizy</Label>
  <Textarea
    value={value}
    onChange={(e) => onChange(e.target.value)}
    disabled={disabled}
    className={!isValid ? "border-red-500" : ""}
    rows={10}
  />
  <p className="text-sm text-gray-500">
    {currentLength} / 12000 znaków (minimum 800)
  </p>
</div>
```

---

### 3. GenerateButton
**Plik:** `src/components/GenerateButton.tsx`

**Props:**
```typescript
interface GenerateButtonProps {
  onClick: () => void;
  disabled: boolean;
  isLoading: boolean;
}
```

**States:**
- Disabled: tekst za krótki/długi lub w trakcie generowania
- Loading: pokazuje spinner + "Generuję..."
- Active: "Wygeneruj fiszki"

---

### 4. FlashcardList
**Plik:** `src/components/FlashcardList.tsx`

**Props:**
```typescript
interface FlashcardListProps {
  flashcards: FlashcardProposal[];
  onAccept: (id: string) => void;
  onEdit: (id: string, front: string, back: string) => void;
  onReject: (id: string) => void;
}
```

**Wyświetla:**
- Lista FlashcardListItem dla każdej fiszki
- Licznik: X zaakceptowanych / Y total

---

### 5. FlashcardListItem
**Plik:** `src/components/FlashcardListItem.tsx`

**Props:**
```typescript
interface FlashcardListItemProps {
  flashcard: FlashcardProposal;
  onAccept: () => void;
  onEdit: (front: string, back: string) => void;
  onReject: () => void;
}

interface FlashcardProposal {
  id: string;
  front: string;
  back: string;
  accepted: boolean;
  edited: boolean;
  source: 'ai-full' | 'ai-edited';
}
```

**Modes:**
1. **Display Mode** (default):
   - Wyświetla front i back jako tekst
   - Przyciski: Odrzuć | Edytuj | Zatwierdź
   - Badge pokazujący status (zaakceptowana/nowa)

2. **Edit Mode** (po kliknięciu "Edytuj"):
   - Textareas dla front i back
   - Przyciski: Anuluj | Zapisz
   - Walidacja długości (200/500 znaków)

**Visual States:**
- Zaakceptowana: zielony border, checkmark
- Edytowana: żółty badge "Edytowano"
- Normalna: szary border

---

### 6. BulkSaveButton
**Plik:** `src/components/BulkSaveButton.tsx`

**Props:**
```typescript
interface BulkSaveButtonProps {
  onSaveAll: () => void;
  onSaveAccepted: () => void;
  disabled: boolean;
  isSaving: boolean;
  totalCount: number;
  acceptedCount: number;
}
```

**Buttons:**
1. "Zapisz zaakceptowane (X)" - disabled jeśli acceptedCount === 0
2. "Zapisz wszystkie (Y)" - zapisuje wszystkie niezależnie od accepted flag

---

### 7. FlashcardSkeletonLoader
**Plik:** `src/components/FlashcardSkeletonLoader.tsx`

**Props:**
```typescript
interface FlashcardSkeletonLoaderProps {
  count: number; // Ile skeleton cards wyświetlić
}
```

**Wyświetla:**
- Animowane placeholder cards (Shadcn Skeleton)
- Domyślnie 3-5 skeleton items

---

## Custom Hooks

### useGenerateFlashcards()
**Plik:** `src/components/hooks/useGenerateFlashcards.ts`

**API:**
```typescript
const {
  isLoading: boolean,
  errorMessage: string | null,
  flashcards: FlashcardProposal[],
  generationId: number | null,

  generateFlashcards: (text: string) => Promise<void>,
  toggleAccepted: (id: string) => void,
  updateFlashcard: (id: string, updates: Partial<FlashcardProposal>) => void,
  removeFlashcard: (id: string) => void,
  clearError: () => void,
  reset: () => void,
} = useGenerateFlashcards();
```

**Odpowiedzialności:**
- POST `/api/generations` - wywołanie AI
- Zarządzanie listą propozycji fiszek
- Lokalne operacje (accept, edit, reject)

---

### useSaveFlashcards()
**Plik:** `src/components/hooks/useSaveFlashcards.ts`

**API:**
```typescript
const {
  isSaving: boolean,
  saveError: string | null,
  saveSuccess: boolean,
  savedCount: number,

  saveFlashcards: (flashcards: FlashcardProposal[], generationId: number) => Promise<{success: boolean}>,
  clearSaveError: () => void,
  clearSuccess: () => void,
} = useSaveFlashcards();
```

**Odpowiedzialności:**
- POST `/api/flashcards` - bulk create
- Transformacja FlashcardProposal → CreateFlashcardDTO
- Obsługa błędów zapisu

---

## Data Flow

### 1. Generowanie Fiszek

```
User Input (800-12000 chars)
    ↓
TextInputArea (onChange)
    ↓
FlashcardGenerationView (state: textValue)
    ↓
GenerateButton (onClick)
    ↓
useGenerateFlashcards.generateFlashcards()
    ↓
POST /api/generations { source_text }
    ↓
Response: { generation_id, flashcards_proposals[], generated_count }
    ↓
FlashcardList (renders proposals)
```

### 2. Edycja i Akceptacja

```
FlashcardListItem (Display Mode)
    ↓
User clicks "Edytuj"
    ↓
FlashcardListItem (Edit Mode)
    ↓
User modifies front/back
    ↓
User clicks "Zapisz"
    ↓
onEdit(id, newFront, newBack)
    ↓
useGenerateFlashcards.updateFlashcard()
    ↓
Local state update: { edited: true, source: 'ai-edited' }
```

### 3. Zapis do Bazy

```
User clicks "Zapisz zaakceptowane"
    ↓
BulkSaveButton.onSaveAccepted()
    ↓
FlashcardGenerationView.handleSaveAccepted()
    ↓
Filter: flashcards.filter(f => f.accepted)
    ↓
useSaveFlashcards.saveFlashcards(acceptedFlashcards, generationId)
    ↓
Transform: FlashcardProposal[] → CreateFlashcardDTO[]
    ↓
POST /api/flashcards { flashcards: [...], generation_id }
    ↓
Response: { flashcards: [...], created_count }
    ↓
Success message + clear form after 3s
```

---

## Walidacja

### Frontend Validation

**TextInputArea:**
- Min 800 znaków (soft limit - pokazuje warning)
- Max 12000 znaków (hard limit - disabled button)

**FlashcardListItem (Edit Mode):**
- `front`: max 200 znaków
- `back`: max 500 znaków
- Oba pola required (nie mogą być puste)

### Backend Validation (Zod)

**POST /api/generations:**
```typescript
z.object({
  source_text: z.string().min(800).max(12000)
})
```

**POST /api/flashcards:**
```typescript
z.object({
  flashcards: z.array(z.object({
    front: z.string().max(200),
    back: z.string().max(500),
    source: z.enum(['ai-full', 'ai-edited', 'manual']),
    generation_id: z.number().nullable()
  }))
})
```

---

## Error Handling

### Typy Błędów

1. **Validation Error (400)**
   - Tekst za krótki/długi
   - Fiszka invalid (front/back za długie)
   - Display: ErrorDisplay z listą pól

2. **Auth Error (401)**
   - Brak sesji użytkownika
   - Redirect do /login

3. **AI API Error (500)**
   - OpenRouter timeout/error
   - Display: "Błąd generowania, spróbuj ponownie"
   - Logowane do generation_error_logs

4. **Database Error (500)**
   - Błąd zapisu fiszek
   - Display: "Błąd zapisu, sprawdź połączenie"

### User Feedback

**Loading States:**
- Generowanie: Skeleton loader (3 cards)
- Zapisywanie: Disabled buttons + spinner

**Success States:**
- Zielony banner: "Zapisano X fiszek pomyślnie!"
- Auto-clear po 3 sekundach

**Error States:**
- Czerwony banner z dokładnym komunikatem
- Możliwość retry (nie czyści formularza)

---

## Shadcn/ui Components Used

- `Card`, `CardHeader`, `CardTitle`, `CardContent`
- `Button` (variants: default, outline, destructive)
- `Badge` (variants: default, secondary, outline)
- `Label`
- `Textarea`
- `Skeleton`

All styled with Tailwind CSS, fully responsive.
