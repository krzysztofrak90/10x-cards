# UI Architecture Overview - FlashLearn AI

## Design System Foundation

**FlashLearn AI** uses a modern, component-based UI architecture built on:
- **Astro 5** - Server-side rendering framework
- **React 19** - Interactive components with hooks
- **Tailwind CSS 4** - Utility-first styling
- **shadcn/ui** - Accessible component library (Radix UI primitives)
- **TypeScript** - Type safety across the stack

**Design Principles:**
- Mobile-first responsive design
- WCAG 2.1 AA accessibility compliance
- Consistent spacing system (4px base unit)
- Clear visual hierarchy
- Progressive enhancement

---

## View Catalog

### 1. Authentication Views

**Routes:** `/login`, `/register`

**Purpose:** User authentication entry points

**Key Components:**
- Email/password input fields with validation
- Submit buttons with loading states
- Error message displays (inline + toast)
- "Forgot password" / "Create account" links

**Validation:**
- Email: RFC 5322 format
- Password: Min 6 characters (recommended 8+)
- Real-time feedback on input blur

**Security:**
- HTTPS only
- Password masking
- Rate limiting (5 attempts / 15 min)
- JWT-based sessions (HTTP-only cookies)

**Accessibility:**
- Proper `<label>` associations
- ARIA error announcements
- Keyboard navigation (Tab order)

---

### 2. AI Generation View

**Route:** `/generate`

**Purpose:** Core AI-powered flashcard creation workflow

**Key Components:**
- `TextInputArea` - Multi-line text input (800-12000 chars)
- `GenerateButton` - Trigger AI processing
- `FlashcardProposalList` - AI-generated suggestions
- `BulkSaveButtons` - Mass accept/save operations
- `SkeletonLoader` - Loading states

**User Flow:**
1. Paste source text → validate length
2. Click "Generate" → API call to `/api/generations`
3. Review proposals → accept/edit/reject each card
4. Save selected → batch insert to database

**Validation:**
- Min 800 characters (soft limit - warning)
- Max 12000 characters (hard limit - blocks submission)
- Real-time character counter display

**UX Details:**
- Inline editing for proposals
- Visual status indicators (badges, colors)
- Progress tracking (X accepted / Y total)
- Auto-clear form after successful save

---

### 3. Flashcard Collection View

**Route:** `/flashcards`

**Purpose:** Browse and manage saved flashcards

**Key Components:**
- `FlashcardsList` - Grid/list view toggle
- `FlashcardCard` - Individual card with flip animation
- `EditFlashcardModal` - Update front/back content
- `DeleteConfirmationDialog` - Destructive action confirmation
- `FilterControls` - Filter by source (manual/AI/edited)

**Operations:**
- View: Click card to flip (front ↔ back)
- Edit: Modal with form validation
- Delete: Confirmation prompt before DB removal
- Filter: Show only manual/AI/edited cards

**Accessibility:**
- Cards accessible via keyboard
- Screen reader announcements for flip states
- Focus management in modals

---

### 4. Edit Flashcard Modal

**Context:** Overlay on `/flashcards` view

**Purpose:** In-place editing without page navigation

**Key Components:**
- Form with "Front" and "Back" textareas
- Character counters (200/500 limits)
- "Save" and "Cancel" buttons
- Validation error displays

**Behavior:**
- Opens with current card content pre-filled
- Real-time validation as user types
- ESC key to cancel
- Click outside to close (with unsaved changes warning)

**Validation:**
- Front: max 200 characters
- Back: max 500 characters
- Both fields required (non-empty)

---

### 5. Study Session View

**Route:** `/study`

**Purpose:** Spaced repetition learning interface

**Key Components:**
- `StudyCard` - Large card display (front/back)
- `RevealButton` - Show answer
- `DifficultyButtons` - Easy/Medium/Hard rating
- `ProgressBar` - Session progress tracker
- `SessionSummary` - Results screen (% correct)

**User Flow:**
1. View question (front of card)
2. Try to recall answer mentally
3. Click "Show Answer" to reveal back
4. Rate difficulty → algorithm schedules next review
5. Move to next card automatically

**UX Details:**
- Minimalist, distraction-free interface
- Large, readable text (18-24px)
- High contrast colors
- Keyboard shortcuts (Space = reveal, 1/2/3 = difficulty)

**Algorithm:**
- Uses `ts-fsrs` library (SuperMemo SM-2 variant)
- Tracks: ease factor, interval, repetitions
- Updates `next_review_date` in database

---

## Common UI Patterns

### Navigation Component
- Logo + app name (links to home)
- Current route highlighting
- User avatar + email (dropdown menu)
- Logout button in dropdown

### Loading States
- Skeleton loaders for content (not spinners)
- Disabled buttons during async operations
- Progress indicators for long operations (>2s)

### Error Handling
- Toast notifications for system errors
- Inline errors for form validation
- Retry buttons where applicable
- Clear, user-friendly messages (no stack traces)

### Empty States
- Illustrations + helpful text
- CTA buttons to create first item
- Examples of what user can do

---

## Responsive Breakpoints

```css
sm: 640px   /* Mobile landscape */
md: 768px   /* Tablet */
lg: 1024px  /* Desktop */
xl: 1280px  /* Large desktop */
```

**Strategy:**
- Mobile-first CSS (base styles for mobile)
- Progressive enhancement for larger screens
- Touch-friendly targets (min 44x44px)
- Readable line lengths (max 80ch)

---

## Color Palette

**Brand:**
- Primary: Blue 600 (#2563eb)
- Secondary: Indigo 500 (#6366f1)

**Semantic:**
- Success: Green 500 (#22c55e)
- Warning: Yellow 500 (#eab308)
- Error: Red 500 (#ef4444)
- Info: Blue 400 (#60a5fa)

**Neutral:**
- Gray scale: 50-900
- Text: Gray 900 (light mode) / Gray 50 (dark mode)
- Background: White / Gray 950

---

## Accessibility Checklist

- [x] All interactive elements keyboard accessible
- [x] Focus indicators visible (2px outline)
- [x] Color contrast ratio ≥ 4.5:1 (text)
- [x] ARIA labels for icon-only buttons
- [x] Screen reader announcements for dynamic content
- [x] Skip to main content link
- [x] Form labels properly associated
- [x] Error messages linked to inputs (aria-describedby)

