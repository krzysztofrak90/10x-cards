# Struktura komponentów widoku Generowania Fiszek

## Hierarchia komponentów

```
📄 /generate (Astro Page)
└── 🔷 FlashcardGenerationView (Main Container)
    ├── 📦 Card (Shadcn UI)
    │   ├── 📦 CardHeader
    │   │   └── 📦 CardTitle
    │   │
    │   └── 📦 CardContent
    │       ├── 📝 TextInputArea
    │       │   ├── 📦 Label
    │       │   └── 📦 Textarea
    │       │
    │       ├── 🔘 GenerateButton
    │       │   └── 📦 Button
    │       │
    │       ├── ⚠️ ErrorDisplay (conditional)
    │       ├── ✅ SuccessDisplay (conditional)
    │       │
    │       ├── ⏳ FlashcardSkeletonLoader (when loading)
    │       │   └── 📦 Skeleton (x3)
    │       │       └── 📦 Card
    │       │
    │       └── 📋 FlashcardList (when flashcards exist)
    │           ├── 🎴 FlashcardListItem (x N)
    │           │   ├── 📦 Card
    │           │   │   ├── 📦 CardHeader
    │           │   │   │   ├── 📦 Badge (status)
    │           │   │   │   └── 📦 Badge (source)
    │           │   │   │
    │           │   │   └── 📦 CardContent
    │           │   │       ├── Display Mode:
    │           │   │       │   ├── 📦 Label (front)
    │           │   │       │   ├── 📦 Label (back)
    │           │   │       │   └── Action Buttons:
    │           │   │       │       ├── 📦 Button (Odrzuć)
    │           │   │       │       ├── 📦 Button (Edytuj)
    │           │   │       │       └── 📦 Button (Zatwierdź)
    │           │   │       │
    │           │   │       └── Edit Mode:
    │           │   │           ├── 📦 Label + 📦 Textarea (front)
    │           │   │           ├── 📦 Label + 📦 Textarea (back)
    │           │   │           └── Action Buttons:
    │           │   │               ├── 📦 Button (Anuluj)
    │           │   │               └── 📦 Button (Zapisz)
    │           │
    │           └── 💾 BulkSaveButton
    │               ├── 📦 Button (Zapisz zaakceptowane)
    │               └── 📦 Button (Zapisz wszystkie)
```

## Przepływ danych (Data Flow)

```
┌─────────────────────────────────────────────────────────────┐
│                FlashcardGenerationView                      │
│                                                             │
│  State Management:                                          │
│  ├── textValue (local state)                               │
│  ├── useGenerateFlashcards() hook:                         │
│  │   ├── isLoading                                         │
│  │   ├── errorMessage                                      │
│  │   ├── flashcards[]                                      │
│  │   ├── generationId                                      │
│  │   └── actions: generate, accept, edit, reject, etc.    │
│  │                                                          │
│  └── useSaveFlashcards() hook:                            │
│      ├── isSaving                                          │
│      ├── saveError                                         │
│      ├── saveSuccess                                       │
│      ├── savedCount                                        │
│      └── actions: saveFlashcards                          │
└─────────────────────────────────────────────────────────────┘
         │                                   │
         │ (text input)                     │ (API calls)
         ▼                                   ▼
┌──────────────────┐              ┌──────────────────┐
│  TextInputArea   │              │   API Endpoints  │
│  - value         │              │                  │
│  - onChange      │              │ POST /api/       │
│  - validation    │              │ generations      │
└──────────────────┘              │                  │
         │                        │ POST /api/       │
         ▼                        │ flashcards       │
┌──────────────────┐              └──────────────────┘
│ GenerateButton   │                       │
│  - onClick ───────────────────────────────┘
│  - disabled      │              (responses)
└──────────────────┘                       │
         │                                 ▼
         │ (on success)          ┌──────────────────┐
         └──────────────────────►│  FlashcardList   │
                                 │  - flashcards[]  │
                                 │  - onAccept      │
                                 │  - onEdit        │
                                 │  - onReject      │
                                 └──────────────────┘
                                          │
                          ┌───────────────┴────────────────┐
                          ▼                                 ▼
                 ┌──────────────────┐            ┌──────────────────┐
                 │FlashcardListItem │            │ BulkSaveButton   │
                 │  - flashcard     │            │  - onSaveAll     │
                 │  - actions       │            │  - onSaveAccepted│
                 └──────────────────┘            └──────────────────┘
```

## Interakcje użytkownika (User Interactions)

```
1. INPUT TEXT
   User types → TextInputArea → handleTextChange()
                                 └─► Updates textValue
                                 └─► Validates length
                                 └─► Updates UI feedback

2. GENERATE FLASHCARDS
   User clicks → GenerateButton → handleGenerate()
                                  └─► POST /api/generations
                                  └─► Sets isLoading = true
                                  └─► Shows SkeletonLoader
                                  └─► On success:
                                      └─► Updates flashcards[]
                                      └─► Sets generationId

3. ACCEPT FLASHCARD
   User clicks → FlashcardListItem → handleAccept(id)
                                     └─► toggleAccepted(id)
                                     └─► Updates flashcard.accepted
                                     └─► Visual feedback (border)

4. EDIT FLASHCARD
   User clicks "Edytuj" → FlashcardListItem → Enter edit mode
                                              └─► Local state for editing
   User edits content → Validates length
   User clicks "Zapisz" → handleEdit(id, front, back)
                          └─► updateFlashcard()
                          └─► Sets edited = true
                          └─► Changes source to "ai-edited"
                          └─► Exits edit mode

5. REJECT FLASHCARD
   User clicks "Odrzuć" → Confirmation dialog
                          └─► If confirmed:
                              └─► handleReject(id)
                              └─► removeFlashcard(id)
                              └─► Removes from list

6. SAVE FLASHCARDS
   User clicks → BulkSaveButton → handleSaveAll() OR
                                   handleSaveAccepted()
                                   └─► Filters flashcards
                                   └─► Validates data
                                   └─► POST /api/flashcards
                                   └─► Shows success message
                                   └─► Auto-clears form (3s)
```

## Zarządzanie stanem (State Management)

### Local Component State
```typescript
FlashcardGenerationView:
  - textValue: string (user input)

FlashcardListItem:
  - isEditing: boolean
  - editedFront: string
  - editedBack: string
```

### useGenerateFlashcards Hook State
```typescript
{
  isLoading: boolean           // API request in progress
  errorMessage: string         // Error message to display
  flashcards: FlashcardProposalViewModel[]
  generationId: number | null  // ID from generation API
}

Actions:
  - generateFlashcards(text)
  - clearError()
  - reset()
  - updateFlashcard(id, updates)
  - removeFlashcard(id)
  - toggleAccepted(id)
```

### useSaveFlashcards Hook State
```typescript
{
  isSaving: boolean           // Save request in progress
  saveError: string          // Save error message
  saveSuccess: boolean       // Save succeeded
  savedCount: number         // Number of saved flashcards
}

Actions:
  - saveFlashcards(flashcards, generationId)
  - clearSaveError()
  - clearSuccess()
  - resetSaveState()
```

## Walidacja (Validation)

### Input Text Validation
```typescript
Length: 1000 ≤ length ≤ 10000

States:
  - Empty (0): Gray - "Wklej tekst..."
  - Too short (< 1000): Yellow - "Potrzebujesz jeszcze X znaków"
  - Too long (> 10000): Red - "Przekroczono limit o X znaków"
  - Valid (1000-10000): Green - "Tekst spełnia wymagania"
```

### Flashcard Edit Validation
```typescript
Front: 1 ≤ length ≤ 200
Back: 1 ≤ length ≤ 500

UI Feedback:
  - Character counter (real-time)
  - Red border when exceeded
  - "Zapisz" button disabled when invalid
```

### Save Validation
```typescript
Before POST /api/flashcards:
  - generationId must exist
  - flashcards array must not be empty
  - Each flashcard must pass validation:
    ✓ front.trim().length > 0 && ≤ 200
    ✓ back.trim().length > 0 && ≤ 500
```

## Responsywność (Responsive Design)

### Breakpoints
```css
Mobile (< 640px):
  - Full width buttons
  - Stacked layout
  - Single column cards

Tablet (640px - 1024px):
  - Flexible layout
  - Buttons can be inline
  - Comfortable spacing

Desktop (> 1024px):
  - Max width: 6xl (1152px)
  - Optimal spacing
  - Inline actions
```

## Dostępność (Accessibility)

### ARIA Attributes
```typescript
TextInputArea:
  - aria-describedby="char-count validation-message"
  - aria-invalid={!isValid}
  - aria-live="polite" (for counters)

Buttons:
  - aria-busy={isLoading}

SkeletonLoader:
  - role="status"
  - aria-live="polite"
  - aria-label="Ładowanie fiszek"

FlashcardListItem:
  - Semantic labels for form fields
  - Screen reader announcements
```

### Keyboard Navigation
- All interactive elements accessible via Tab
- Enter/Space for button activation
- Escape to cancel edit mode
- Focus management on modal open/close
```

## Referencje do plików

### Komponenty
- `src/pages/generate.astro` (strona)
- `src/components/FlashcardGenerationView.tsx:16` (główny widok)
- `src/components/TextInputArea.tsx:23` (pole tekstowe)
- `src/components/GenerateButton.tsx:8` (przycisk generowania)
- `src/components/FlashcardList.tsx:10` (lista)
- `src/components/FlashcardListItem.tsx:27` (element listy)
- `src/components/FlashcardSkeletonLoader.tsx:11` (loader)
- `src/components/BulkSaveButton.tsx:8` (przyciski zapisu)

### Hooki
- `src/components/hooks/useGenerateFlashcards.ts:15` (generowanie)
- `src/components/hooks/useSaveFlashcards.ts:11` (zapis)

### Typy
- `src/types.ts` (wszystkie DTOs i interfejsy)
