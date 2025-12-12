# Generate View - Implementation Specification

## Overview

**Route:** `/generate`
**Component:** `FlashcardGenerationView`
**Purpose:** AI-assisted flashcard creation interface

This document specifies the implementation requirements for the core AI generation feature of FlashLearn AI.

---

## Functional Requirements

### FR-1: Source Text Input
**User Story:** As a student, I want to paste study material so that AI can generate flashcards from it.

**Acceptance Criteria:**
- Multi-line textarea accepting 800-12000 characters
- Real-time character counter display
- Visual feedback for validation states (valid/invalid)
- Disabled state during API processing
- Clear button to reset textarea

**Technical Implementation:**
- Component: `TextInputArea.tsx`
- Validation: Zod schema client-side + server-side
- Debouncing: No (instant counter update)

---

### FR-2: AI Generation Trigger
**User Story:** As a user, I want to click a button to generate flashcards from my text.

**Acceptance Criteria:**
- Button disabled when text length invalid
- Loading state with spinner during API call
- Button text changes: "Wygeneruj fiszki" → "Generowanie..."
- Timeout after 60 seconds with error message
- Retry capability on failure

**Technical Implementation:**
- Component: `GenerateButton.tsx`
- API: `POST /api/generations`
- Hook: `useGenerateFlashcards()`

---

### FR-3: Proposal Display & Management
**User Story:** As a user, I want to review AI-generated suggestions before saving them.

**Acceptance Criteria:**
- List of 5-8 flashcard proposals displayed
- Each proposal shows front and back content
- Status indicators: pending / accepted / edited
- Counter showing "X accepted / Y total"
- Individual actions: accept, edit, reject

**Technical Implementation:**
- Component: `FlashcardList.tsx` + `FlashcardListItem.tsx`
- State management: React useState in parent component
- Local state only (not persisted until save)

---

### FR-4: Inline Editing
**User Story:** As a user, I want to modify AI suggestions before saving.

**Acceptance Criteria:**
- Click "Edytuj" enters edit mode
- Textareas replace display text
- Character limits: front (200) / back (500)
- Real-time character counters
- "Zapisz" commits changes locally
- "Anuluj" reverts to original
- Edited proposals marked with badge

**Technical Implementation:**
- Edit mode toggle in `FlashcardListItem`
- Validation: max length checks
- Source metadata update: `ai-full` → `ai-edited`

---

### FR-5: Batch Persistence
**User Story:** As a user, I want to save selected flashcards to my collection.

**Acceptance Criteria:**
- "Zapisz wszystkie" button saves all proposals
- "Zapisz zaakceptowane" button saves only checked proposals
- Disabled if no proposals to save
- Loading state during save operation
- Success message with count: "Zapisano X fiszek!"
- Form clears automatically after 3 seconds
- Error messages for failed saves

**Technical Implementation:**
- Component: `BulkSaveButton.tsx`
- Hook: `useSaveFlashcards()`
- API: `POST /api/flashcards` (bulk insert)
- Transformation: Proposal[] → CreateFlashcardDTO[]

---

## Component Architecture

```
FlashcardGenerationView (Container)
├── Card (shadcn/ui)
│   ├── CardHeader
│   │   └── CardTitle: "Generuj fiszki z AI"
│   │
│   └── CardContent
│       ├── TextInputArea
│       │   ├── Label
│       │   ├── Textarea (controlled)
│       │   └── Character counter
│       │
│       ├── GenerateButton
│       │   └── Button with loading state
│       │
│       ├── Error/Success Display (conditional)
│       │
│       ├── FlashcardSkeletonLoader (when loading)
│       │   └── 3x Skeleton cards
│       │
│       └── Results Section (when flashcards exist)
│           ├── FlashcardList
│           │   └── FlashcardListItem (x N)
│           │       ├── Badge (status)
│           │       ├── Display Mode:
│           │       │   ├── Front/Back text
│           │       │   └── Buttons: Accept, Edit, Reject
│           │       └── Edit Mode:
│           │           ├── Textareas
│           │           └── Buttons: Save, Cancel
│           │
│           └── BulkSaveButton
│               ├── Save All
│               └── Save Accepted
```

---

## State Management

### Local Component State
```typescript
const [textValue, setTextValue] = useState<string>('');
```

### Generation Hook State
```typescript
const {
  isLoading,           // API request in progress
  errorMessage,        // Error from API or validation
  flashcards,          // Array of proposals with local edits
  generationId,        // ID from generation API response
  generateFlashcards,  // Trigger API call
  toggleAccepted,      // Toggle accepted flag
  updateFlashcard,     // Apply edits
  removeFlashcard,     // Remove from list
  reset,               // Clear all state
} = useGenerateFlashcards();
```

### Save Hook State
```typescript
const {
  isSaving,            // Save operation in progress
  saveError,           // Error from save API
  saveSuccess,         // Success flag
  savedCount,          // Number of flashcards saved
  saveFlashcards,      // Trigger save API
  clearSuccess,        // Reset success state
} = useSaveFlashcards();
```

---

## API Integration

### Generation API
**Endpoint:** `POST /api/generations`

**Request:**
```json
{
  "source_text": "..."
}
```

**Response:**
```json
{
  "generation_id": 42,
  "flashcards_proposals": [
    {
      "front": "Question",
      "back": "Answer",
      "source": "ai-full"
    }
  ],
  "generated_count": 5
}
```

### Save API
**Endpoint:** `POST /api/flashcards`

**Request:**
```json
{
  "flashcards": [
    {
      "front": "Question",
      "back": "Answer",
      "source": "ai-full",
      "generation_id": 42
    }
  ]
}
```

**Response:**
```json
{
  "flashcards": [...],
  "created_count": 3
}
```

---

## Validation Rules

### Client-Side (Immediate Feedback)
- **Text Input:**
  - Min: 800 characters (warning, not blocking)
  - Max: 12000 characters (blocking)
  - Display: "XXX / 12000 znaków (minimum 800)"

- **Edit Mode:**
  - Front: max 200 characters
  - Back: max 500 characters
  - Both required (non-empty)

### Server-Side (API Validation)
- Zod schemas enforce same rules
- Returns 400 with details on validation failure

---

## Error Handling

### Generation Errors
| Error Type | User Message | Recovery |
|------------|--------------|----------|
| 400 Validation | "Tekst musi zawierać 800-12000 znaków" | Edit text |
| 401 Auth | "Musisz być zalogowany" | Redirect to login |
| 500 AI | "Błąd generowania. Spróbuj ponownie." | Retry button |
| Timeout | "Przekroczono czas oczekiwania" | Retry button |

### Save Errors
| Error Type | User Message | Recovery |
|------------|--------------|----------|
| 400 Validation | "Nieprawidłowe dane fiszek" | Fix and retry |
| 401 Auth | "Sesja wygasła" | Redirect to login |
| 500 DB | "Błąd zapisu. Spróbuj ponownie." | Retry button |

---

## Loading States

### During Generation
- Button disabled with spinner
- Textarea disabled
- SkeletonLoader (3 cards) displayed
- Text: "Generowanie fiszek..."

### During Save
- Save buttons disabled with spinner
- List items disabled (no editing/rejection)
- Text: "Zapisywanie..."

---

## Success Flow

1. User pastes text (1200 characters)
2. Counter shows "1200 / 12000 znaków (minimum 800)"
3. Button enabled (green border)
4. User clicks "Wygeneruj fiszki"
5. API called → 5 proposals returned
6. List displays 5 cards (all pending)
7. User accepts 3, edits 1, rejects 1
8. Counter shows "4 zaakceptowanych / 4 total"
9. User clicks "Zapisz zaakceptowane"
10. API saves 4 flashcards successfully
11. Success message: "Zapisano 4 fiszki pomyślnie!"
12. Form clears after 3 seconds

---

## Accessibility (WCAG 2.1 AA)

- [ ] Textarea has `<label>` with visible text
- [ ] Character counter is `aria-live="polite"`
- [ ] Generate button has `aria-busy="true"` when loading
- [ ] Error messages linked via `aria-describedby`
- [ ] Each flashcard list item is keyboard focusable
- [ ] Edit mode textareas have labels
- [ ] Save buttons have `aria-disabled` when disabled
- [ ] Success message is announced to screen readers

---

## Performance Considerations

- **Debouncing:** No debouncing on text input (instant counter)
- **Virtualization:** Not needed for 5-8 items
- **Memoization:** Use `React.memo` for FlashcardListItem
- **Bundle Size:** Lazy load only if needed
- **API Timeout:** 60 seconds max
- **Optimistic Updates:** Local state updates immediate

---

## Testing Strategy

### Unit Tests
- Validation logic (min/max character counts)
- State transformations (accept, edit, reject)
- DTO conversions

### Integration Tests
- Mock API responses
- Hook behavior with various states
- Error handling paths

### E2E Tests
- Full flow: input → generate → edit → save
- Error scenarios
- Edge cases (empty list, timeout, etc.)
