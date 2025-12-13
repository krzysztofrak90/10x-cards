# Architektura UI dla FlashLearn AI

## 1. Przegląd struktury UI

FlashLearn AI to aplikacja webowa typu SPA (Single Page Application) zbudowana na Astro 5.x z React 19.x dla komponentów interaktywnych. Architektura UI opiera się na następujących zasadach:

### 1.1. Filozofia designu
- **Mobile-first responsive design** - Aplikacja jest w pełni responsywna, priorytet dla urządzeń mobilnych
- **Minimalistyczny interfejs** - Skupienie na funkcjonalności, minimalna dystrakcja podczas nauki
- **Accessibility-first** - WCAG 2.1 Level AA compliance, keyboard navigation, screen reader support
- **Progressive disclosure** - Pokazywanie informacji stopniowo, unikanie cognitive overload
- **Dark mode ready** - Wsparcie dla jasnego i ciemnego motywu

### 1.2. Design System
- **Framework UI**: Radix UI (accessible primitives)
- **Styling**: Tailwind CSS 4.x
- **Typography**: System font stack dla optymalnej czytelności
- **Colors**: Semantyczny system kolorów z Tailwind palette
- **Spacing**: 4px base unit (Tailwind spacing scale)
- **Iconography**: Lucide React (spójny zestaw ikon)

### 1.3. Struktura nawigacji
Aplikacja dzieli się na dwie główne strefy:
- **Public zone**: Landing page, Login, Register
- **Protected zone**: Dashboard, Generator, Kolekcja, Nauka, Profil

### 1.4. State Management
- **Local state**: React useState/useReducer dla komponentów
- **Global state**: Zustand dla user session, toast notifications
- **Server state**: Native fetch z cache dla danych z API
- **Form state**: React Hook Form + Zod validation

---

## 2. Lista widoków

### 2.1. Landing Page (`/`)
**Typ**: Public
**Główny cel**: Prezentacja produktu i zachęcenie do rejestracji

**Kluczowe informacje:**
- Value proposition: "Automatycznie generuj fiszki z dowolnego tekstu"
- Hero section z CTA do rejestracji
- Features showcase (3-4 kluczowe funkcje)
- Social proof (optional w MVP)
- Footer z linkami (Privacy Policy, Terms)

**Kluczowe komponenty:**
- `<HeroSection>` - Main value prop + CTA
- `<FeaturesGrid>` - Showcase 3-4 key features
- `<CTASection>` - Secondary call to action
- `<Navigation>` - Public nav (Login, Register)
- `<Footer>` - Links, copyright

**UX Considerations:**
- Clear, compelling headline
- CTA buttons wyraźnie widoczne (kontrastowe kolory)
- Fast load time (<2s FCP)
- Mobile-optimized typography

**Accessibility:**
- Semantic HTML5 structure
- Proper heading hierarchy (h1 → h2 → h3)
- Alt text dla wszystkich obrazów
- Focus indicators dla keyboard navigation

**Security:**
- Brak wrażliwych danych
- HTTPS only

---

### 2.2. Register Page (`/register`)
**Typ**: Public
**Główny cel**: Rejestracja nowego użytkownika

**Kluczowe informacje:**
- Formularz rejestracji (email, hasło, potwierdzenie hasła)
- Wymagania hasła (min. 8 znaków)
- Link do logowania dla istniejących użytkowników
- Privacy policy notice/checkbox

**Kluczowe komponenty:**
- `<RegisterForm>` - Form z walidacją
  - `<Input type="email">` - Email field z validation
  - `<Input type="password">` - Password field
  - `<Input type="password">` - Confirm password field
  - `<Button type="submit">` - Submit button
  - `<FormError>` - Error messages display
- `<PasswordStrengthIndicator>` - Visual feedback na siłę hasła
- `<LoginLink>` - Link do `/login`

**User Flow:**
1. User wypełnia formularz (email, password, confirm password)
2. Real-time validation (email format, password strength, match)
3. Submit → `POST /api/auth/register`
4. Success → Auto login → Redirect do `/dashboard`
5. Error → Display error message below form

**Validation Rules:**
- Email: Valid format, unique (backend check)
- Password: Min 8 chars, mix of letters/numbers (recommended)
- Confirm password: Must match password field
- Real-time validation on blur

**UX Considerations:**
- Show/hide password toggle
- Password strength indicator (weak/medium/strong)
- Clear error messages ("Email już istnieje w systemie")
- Disabled submit podczas API call (loading state)
- Auto-focus na email field

**Accessibility:**
- Labels for all inputs (not just placeholders)
- aria-describedby for error messages
- aria-invalid on error fields
- Keyboard-accessible password toggle

**Security:**
- Client-side validation (UX)
- Server-side validation (Security)
- HTTPS only
- No password in URL/logs
- CSRF protection (Astro built-in)

**Edge Cases:**
- Email already exists → "Email już istnieje w systemie"
- Weak network → Loading state, timeout after 30s
- API error → Generic error + retry button

---

### 2.3. Login Page (`/login`)
**Typ**: Public
**Główny cel**: Autoryzacja istniejącego użytkownika

**Kluczowe informacje:**
- Formularz logowania (email, hasło)
- Link do rejestracji dla nowych użytkowników
- "Forgot password?" link (jeśli zaimplementowane)

**Kluczowe komponenty:**
- `<LoginForm>` - Form z walidacją
  - `<Input type="email">` - Email field
  - `<Input type="password">` - Password field
  - `<Button type="submit">` - Login button
  - `<FormError>` - Error display
- `<RegisterLink>` - Link do `/register`
- `<ForgotPasswordLink>` - (Optional w MVP)

**User Flow:**
1. User wpisuje email i hasło
2. Submit → `POST /api/auth/login`
3. Success → Redirect do `/dashboard`
4. Error 401 → "Nieprawidłowe dane logowania"
5. Error 500 → "Błąd serwera, spróbuj ponownie"

**UX Considerations:**
- Show/hide password toggle
- Remember me checkbox (optional)
- Auto-focus na email field
- Disabled submit podczas API call
- Clear, non-specific error message dla security ("Nieprawidłowe dane logowania" zamiast "Email nie istnieje")

**Accessibility:**
- Same as Register page
- Focus management (error → first invalid field)

**Security:**
- Rate limiting: Max 5 prób / 15 min per IP
- Generic error messages (nie ujawniaj czy email exists)
- HTTP-only cookies dla JWT
- CSRF protection

**Edge Cases:**
- Multiple failed attempts → Temporary lockout
- Network timeout → Retry button
- Already logged in → Redirect do `/dashboard`

---

### 2.4. Dashboard (`/dashboard`)
**Typ**: Protected
**Główny cel**: Główny hub aplikacji, szybki dostęp do wszystkich funkcji

**Kluczowe informacje:**
- Powitanie użytkownika (email lub name)
- Quick stats (liczba fiszek, ostatnia sesja nauki)
- Quick actions (Generator, Kolekcja, Nauka)
- Recent activity (ostatnio dodane fiszki, generacje)

**Kluczowe komponenty:**
- `<DashboardHeader>` - Welcome message, user avatar
- `<StatsCards>` - Grid kart ze statystykami
  - Total flashcards
  - Fiszki do powtórki
  - Ostatnia sesja nauki
- `<QuickActions>` - Duże przyciski CTA
  - "Generuj fiszki" → `/generator`
  - "Moja kolekcja" → `/collection`
  - "Rozpocznij naukę" → `/learn`
- `<RecentActivity>` - Lista ostatnich aktywności
  - Recent flashcards (5 najnowszych)
  - Recent generations (3 ostatnie)
- `<Navigation>` - Main app navigation (sticky/fixed)

**User Flow:**
1. User loguje się → Redirect do `/dashboard`
2. Dashboard ładuje stats z API (`GET /api/flashcards?limit=5`)
3. User wybiera akcję (Generator, Kolekcja, Nauka)

**API Calls:**
- `GET /api/flashcards?limit=5&sort=created_at&order=desc` - Recent flashcards
- `GET /api/generations?limit=3` - Recent generations
- (Optional) `GET /api/stats` - Aggregated stats

**UX Considerations:**
- Loading skeleton podczas ładowania danych
- Empty state jeśli user nie ma fiszek ("Zacznij od wygenerowania pierwszych fiszek!")
- Responsive grid layout (1 col mobile, 2-3 cols desktop)
- Smooth transitions between states

**Accessibility:**
- Landmark regions (main, nav, aside)
- Skip to main content link
- Keyboard shortcuts (?, g+g dla generator, g+c dla collection)

**Security:**
- Protected route (redirect do `/login` jeśli nie zalogowany)
- JWT verification w middleware
- RLS w bazie danych

---

### 2.5. Generator (`/generator`)
**Typ**: Protected
**Główny cel**: Generowanie fiszek AI z tekstu źródłowego

**Kluczowe informacje:**
- Textarea dla wklejenia tekstu (800-12000 znaków)
- Character counter (current/min/max)
- Lista wygenerowanych propozycji fiszek
- Bulk actions (Accept all, Reject all)
- Individual actions per flashcard (Accept, Edit, Reject)

**Kluczowe komponenty:**
- `<GeneratorForm>` - Main form
  - `<Textarea>` - Source text input (800-12000 chars)
  - `<CharacterCounter>` - Real-time char count display
  - `<Button type="submit">` - "Generuj fiszki" button
- `<FlashcardProposalsList>` - Generated proposals (po API call)
  - `<FlashcardProposalCard>` - Individual proposal
    - Front/Back preview
    - Actions: Accept, Edit, Reject buttons
  - `<BulkActions>` - Accept all / Reject all buttons
- `<GenerationStatus>` - Loading/Success/Error states
- `<ConfirmationDialog>` - Final confirmation przed zapisem

**User Flow - Happy Path:**
1. User wkleja tekst do textarea (np. 1500 znaków)
2. Character counter shows: "1500 / 800-12000"
3. Button "Generuj fiszki" staje się enabled (gdy >= 800 chars)
4. User klika "Generuj fiszki"
5. Loading state: Spinner + "Generuję fiszki..." (5-10s)
6. Success: API zwraca 5-10 propozycji
7. `<FlashcardProposalsList>` wyświetla propozycje
8. User przegląda każdą fiszkę:
   - Option 1: Click "Akceptuj" → fiszka zaznaczona do zapisu
   - Option 2: Click "Edytuj" → inline editor → zapisz → zaznaczona jako "ai-edited"
   - Option 3: Click "Odrzuć" → fiszka usuwana z listy
9. User klika "Zapisz zaakceptowane fiszki" (fixed bottom bar)
10. Confirmation dialog: "Zapisać X fiszek?"
11. Confirm → `POST /api/flashcards` (bulk create)
12. Success → Toast notification + redirect do `/collection`

**User Flow - Edit Flow:**
1. User klika "Edytuj" na propozycji
2. Karta zmienia się w inline edit mode:
   - `<Textarea>` dla front
   - `<Textarea>` dla back
   - Buttons: "Zapisz", "Anuluj"
3. User edytuje treść
4. Click "Zapisz" → źródło zmienia się na "ai-edited"
5. Karta wraca do preview mode z updated content

**API Calls:**
- `POST /api/generations` (body: {source_text})
  - Response: {generation_id, flashcards_proposals[], generated_count}
- `POST /api/flashcards` (bulk create accepted flashcards)
  - Body: {flashcards: [{front, back, source, generation_id}]}

**Validation:**
- Minimum 800 znaków
- Maximum 12000 znaków
- Real-time validation podczas pisania
- Disabled submit button jeśli validation fails

**UX Considerations:**
- Character counter wyraźny (red gdy < 800, green gdy >= 800)
- Loading state z animacją (pokazuje że coś się dzieje)
- Timeout po 60s z retry option
- Clear feedback po każdej akcji (visual confirmation)
- Sticky bottom bar z "Zapisz X fiszek" button
- Smooth animations przy accept/reject/edit

**Accessibility:**
- Label dla textarea
- aria-live dla character counter
- Keyboard shortcuts (a = accept, e = edit, r = reject, ESC = cancel edit)
- Focus management (po edit → focus na first textarea)

**Security:**
- Protected route
- Text sanitization (escape HTML)
- Rate limiting: Max 10 generacji / hour per user

**Edge Cases:**
- Text < 800 chars → Button disabled + helper text
- Text > 12000 chars → Show error + trim indicator
- API timeout (>60s) → Error message + retry button
- API error (429 rate limit) → "Rate limit exceeded, try in 1 hour"
- API error (500) → "Błąd serwera, spróbuj ponownie"
- AI returns 0 flashcards → "Nie udało się wygenerować fiszek z tego tekstu"
- No flashcards accepted → Confirmation dialog "Czy na pewno odrzucić wszystkie propozycje?"

**Empty States:**
- Initial state: "Wklej tekst, aby wygenerować fiszki"
- Post-generation with all rejected: "Wszystkie propozycje odrzucone"

**Loading States:**
- Generating: Spinner + "Generuję fiszki... To może potrwać 5-10 sekund"
- Saving: Spinner + "Zapisuję fiszki..."

**Success States:**
- Generated: "Wygenerowano X fiszek. Przejrzyj i zaakceptuj wybrane."
- Saved: Toast notification + redirect

**Error States:**
- Validation error: Inline message pod textarea
- API error: Error banner na górze z retry button
- Network error: "Brak połączenia z serwerem"

---

### 2.6. Moja Kolekcja (`/collection`)
**Typ**: Protected
**Główny cel**: Przeglądanie, edycja i zarządzanie kolekcją fiszek

**Kluczowe informacje:**
- Lista wszystkich fiszek użytkownika
- Filtry (source: ai-full, ai-edited, manual)
- Sortowanie (data utworzenia, alfabetycznie)
- Search/filter bar
- Actions per flashcard (Edit, Delete)
- Button "Dodaj fiszkę manualnie"

**Kluczowe komponenty:**
- `<CollectionHeader>` - Title + Stats + Actions
  - Total count
  - Filter buttons (All, AI-full, AI-edited, Manual)
  - Sort dropdown
  - "Dodaj fiszkę" button
- `<SearchBar>` - Search input (optional w MVP)
- `<FlashcardsList>` - Grid/List of flashcards
  - `<FlashcardCard>` - Individual card
    - Front/Back content
    - Source badge
    - Actions: Edit, Delete
- `<Pagination>` - Page controls (jeśli > 50 fiszek)
- `<EmptyState>` - Gdy brak fiszek
- `<DeleteConfirmationModal>` - Confirmation przed usunięciem
- `<AddFlashcardModal>` - Modal dla manual add
- `<EditFlashcardModal>` - Modal dla edycji

**User Flow - View Collection:**
1. User nawiguje do `/collection`
2. API call: `GET /api/flashcards?page=1&limit=50&sort=created_at&order=desc`
3. Flashcards render w grid/list
4. User może:
   - Filtrować po source
   - Sortować
   - Searchować (opcjonalne)
   - Paginate (jeśli > 50)

**User Flow - Add Manual Flashcard:**
1. User klika "Dodaj fiszkę"
2. Modal opens: `<AddFlashcardModal>`
3. Form fields:
   - Front (max 200 chars, required)
   - Back (max 500 chars, required)
4. User wypełnia form
5. Click "Dodaj"
6. Validation → `POST /api/flashcards`
7. Success → Modal closes + new flashcard appears in list + toast
8. Error → Show error in modal

**User Flow - Edit Flashcard:**
1. User klika "Edytuj" na flashcard
2. Modal opens: `<EditFlashcardModal>` (pre-filled)
3. User edytuje front/back
4. Click "Zapisz"
5. `PUT /api/flashcards/:id`
6. Success → Modal closes + updated card in list + toast
7. Error → Show error in modal

**User Flow - Delete Flashcard:**
1. User klika "Usuń" na flashcard
2. Confirmation modal: "Czy na pewno usunąć tę fiszkę? Operacja jest nieodwracalna."
3. User confirma
4. `DELETE /api/flashcards/:id`
5. Success → Card znika z listy + toast "Fiszka usunięta"
6. Error → Show error toast + card remains

**API Calls:**
- `GET /api/flashcards?page=1&limit=50&sort=created_at&order=desc`
- `GET /api/flashcards?source=ai-full` (filtering)
- `POST /api/flashcards` (manual add)
- `PUT /api/flashcards/:id` (edit)
- `DELETE /api/flashcards/:id` (delete)

**Filters:**
- All (default)
- AI-generated only (source=ai-full)
- AI-edited (source=ai-edited)
- Manual (source=manual)

**Sorting:**
- Newest first (created_at DESC) - default
- Oldest first (created_at ASC)
- Alphabetically (front ASC)

**UX Considerations:**
- Card hover states (subtle elevation)
- Loading skeleton podczas API calls
- Optimistic UI updates (edit/delete)
- Smooth animations (card remove, modal open/close)
- Pagination controls sticky na bottom
- Mobile: List layout, Desktop: Grid layout
- Visual badges dla source type (different colors)

**Accessibility:**
- Semantic HTML (section, article dla cards)
- aria-label dla action buttons ("Edytuj fiszkę: [front text]")
- Keyboard navigation (tab przez cards, enter dla actions)
- Focus trap w modals
- ESC closes modals

**Security:**
- Protected route
- RLS ensures user sees only their flashcards
- XSS protection (escape user content)

**Edge Cases:**
- Empty collection → EmptyState "Nie masz jeszcze żadnych fiszek. Wygeneruj pierwsze!"
- API error → Error banner + retry
- Delete last flashcard → EmptyState appears
- Network error during delete → Revert optimistic update

**Empty States:**
- No flashcards at all: "Nie masz jeszcze żadnych fiszek. Zacznij od wygenerowania lub dodaj manualnie!"
- No results after filter: "Brak fiszek w tej kategorii"

**Loading States:**
- Initial load: Skeleton grid (8 cards)
- Pagination: Spinner on pagination controls
- Delete: Fade out animation + spinner

---

### 2.7. Nauka (`/learn`)
**Typ**: Protected
**Główny cel**: Sesja nauki z algorytmem spaced repetition

**Kluczowe informacje:**
- Single flashcard view (focused, minimal distractions)
- Progress indicator (current / total)
- Front side → Reveal → Back side
- Difficulty rating (Easy, Medium, Hard)
- Session stats (cards reviewed, time elapsed)

**Kluczowe komponenty:**
- `<LearnSession>` - Main container
  - `<ProgressBar>` - Visual progress (3/20)
  - `<FlashcardDisplay>` - Current flashcard
    - Front side view (initial)
    - Back side view (after reveal)
  - `<RevealButton>` - "Pokaż odpowiedź"
  - `<DifficultyButtons>` - Easy, Medium, Hard (po reveal)
- `<SessionHeader>` - Progress counter + Exit button
- `<SessionComplete>` - End screen z stats
- `<EmptyState>` - Gdy brak fiszek do nauki

**User Flow - Learn Session:**
1. User klika "Rozpocznij naukę" z Dashboard
2. System wybiera fiszki do nauki (spaced repetition algorithm)
3. API call: `GET /api/learn/session` (returns cards due for review)
4. Session starts: First card shows FRONT only
5. User czyta front, myśli o odpowiedzi
6. User klika "Pokaż odpowiedź"
7. Back side reveals
8. Difficulty buttons appear: "Łatwe", "Średnie", "Trudne"
9. User ocenia trudność → Click button
10. API call: `POST /api/learn/rate` (card_id, difficulty)
11. Algorithm updates next review date
12. Next card loads automatically
13. Repeat 5-12 until session complete
14. Session complete screen: "Świetna robota! Powtórzyłeś X fiszek w Y minut"

**API Calls (future implementation):**
- `GET /api/learn/session` - Returns cards due for review
- `POST /api/learn/rate` - Rate card difficulty, updates SRS schedule
- `POST /api/learn/complete` - Mark session complete, save stats

**Algorithm (spaced repetition):**
- Use existing library (e.g., `supermemo`, `srs`)
- Easy: Next review in 4 days
- Medium: Next review in 1 day
- Hard: Next review in 10 minutes
- Track: last_reviewed, review_count, easiness_factor

**UX Considerations:**
- Full-screen focus mode (hide nav, minimal UI)
- Large, readable text
- Smooth flip animation (front → back)
- Keyboard shortcuts (Space = reveal, 1/2/3 = difficulty)
- Auto-advance after rating (no extra click)
- Session timer (optional display)
- Progress indicator (motivational)

**Accessibility:**
- High contrast text
- Large clickable areas (mobile-friendly)
- Keyboard-only navigation possible
- Screen reader announces: "Front: [text]" → "Back: [text]"
- Focus management (reveal button → difficulty buttons)

**Security:**
- Protected route
- RLS ensures user reviews only their cards

**Edge Cases:**
- No cards due for review → EmptyState "Świetna robota! Nie masz fiszek do powtórki. Wróć jutro!"
- User exits mid-session → Confirmation "Czy na pewno zakończyć sesję?"
- API error → Save progress, show error, allow retry

**Empty States:**
- No flashcards in collection: "Dodaj fiszki, aby rozpocząć naukę"
- No cards due: "Nie masz fiszek do powtórki. Wróć później!"

**Loading States:**
- Session loading: Spinner + "Przygotowuję sesję nauki..."

**Success States:**
- Session complete: Celebration screen + stats

**MVP Note:**
Moduł nauki może być uproszczony w MVP:
- Brak SRS algorithm (random/sequential review)
- Brak tracking review stats
- Simple flip cards bez difficulty rating
- Focus na core UX flow

---

### 2.8. Profil Użytkownika (`/profile`)
**Typ**: Protected
**Główny cel**: Zarządzanie kontem użytkownika

**Kluczowe informacje:**
- User details (email, registration date)
- Account stats (total flashcards, total generations)
- Settings (optional: email notifications, theme)
- Change password (optional w MVP)
- Delete account (danger zone)

**Kluczowe komponenty:**
- `<ProfileHeader>` - User avatar + email
- `<AccountStats>` - Stats cards
- `<SettingsForm>` - Account settings (optional)
- `<ChangePasswordForm>` - Password change (optional)
- `<DangerZone>` - Delete account section
  - Warning message
  - "Usuń konto" button
  - `<DeleteAccountModal>` - Confirmation modal

**User Flow - View Profile:**
1. User nawiguje do `/profile`
2. Display user info (from session)
3. Display stats (API calls)

**User Flow - Delete Account:**
1. User scrolls do "Danger Zone"
2. Reads warning: "Usunięcie konta jest nieodwracalne. Wszystkie fiszki zostaną trwale usunięte."
3. Clicks "Usuń konto"
4. Modal opens: "Czy na pewno chcesz usunąć konto? Wpisz 'USUŃ' aby potwierdzić."
5. User types "USUŃ"
6. Click "Potwierdź usunięcie"
7. `DELETE /api/user/account`
8. Success → Logout → Redirect do landing + toast "Konto zostało usunięte"

**API Calls:**
- `GET /api/user/stats` - Account statistics
- `PUT /api/user/password` - Change password (optional)
- `DELETE /api/user/account` - Delete account

**UX Considerations:**
- Clear separation: Safe zone vs Danger zone
- Red color scheme dla delete actions
- Strong confirmation flow (typing "USUŃ")
- No accidental deletes

**Accessibility:**
- aria-describedby dla danger zone
- Clear warnings read by screen readers

**Security:**
- Protected route
- Re-authentication required for sensitive actions (change password, delete account)
- CSRF protection

**Edge Cases:**
- Delete account fails → Show error, don't logout
- Network error → Retry option

**MVP Note:**
Profile can be minimal:
- Display email
- Delete account option
- No password change (use Supabase reset email instead)

---

## 3. Mapa podróży użytkownika

### 3.1. Główna podróż użytkownika (New User Onboarding)

```
Landing Page (/)
    ↓
    [Click "Zarejestruj się"]
    ↓
Register Page (/register)
    ↓
    [Submit form → POST /api/auth/register]
    ↓
    [Auto login → Set cookies]
    ↓
Dashboard (/dashboard)
    ↓
    [EmptyState: "Nie masz jeszcze fiszek"]
    ↓
    [Click "Generuj fiszki"]
    ↓
Generator (/generator)
    ↓
    [Paste text (1500 chars) → Click "Generuj"]
    ↓
    [POST /api/generations → AI processing]
    ↓
    [Review proposals → Accept 3, Edit 1, Reject 1]
    ↓
    [Click "Zapisz zaakceptowane fiszki"]
    ↓
    [POST /api/flashcards → Success]
    ↓
Collection (/collection)
    ↓
    [View 4 saved flashcards]
    ↓
    [Click "Rozpocznij naukę"]
    ↓
Learn (/learn)
    ↓
    [Complete learn session]
    ↓
Dashboard (/dashboard)
    ↓
    [Stats updated: 4 fiszki, 1 sesja nauki]
```

### 3.2. Returning User Journey

```
Landing Page (/) or Login Page (/login)
    ↓
    [Login → POST /api/auth/login]
    ↓
Dashboard (/dashboard)
    ↓
    [View stats: 50 fiszek, 10 do powtórki]
    ↓
    Option A: Generate more flashcards
        ↓ → Generator → Collection
    ↓
    Option B: Review flashcards
        ↓ → Learn → Complete session → Dashboard
    ↓
    Option C: Manage collection
        ↓ → Collection → Edit/Delete → Collection
```

### 3.3. Manual Flashcard Creation Journey

```
Dashboard (/dashboard)
    ↓
    [Click "Moja kolekcja"]
    ↓
Collection (/collection)
    ↓
    [Click "Dodaj fiszkę"]
    ↓
    [Modal opens: <AddFlashcardModal>]
    ↓
    [Fill form: front, back]
    ↓
    [Submit → POST /api/flashcards]
    ↓
    [Success → Modal closes → New flashcard in list]
```

### 3.4. Error Recovery Journeys

**API Error during Generation:**
```
Generator (/generator)
    ↓
    [Submit text → POST /api/generations]
    ↓
    [Error 500: API timeout]
    ↓
    [Error banner: "Błąd serwera" + Retry button]
    ↓
    [Click Retry → Success]
```

**Unauthorized Access:**
```
User types /dashboard (not logged in)
    ↓
    [Middleware checks: No JWT token]
    ↓
    [Redirect to /login with returnUrl=/dashboard]
    ↓
    [User logs in]
    ↓
    [Redirect back to /dashboard]
```

---

## 4. Układ i struktura nawigacji

### 4.1. Public Navigation
Widoczna na: Landing, Register, Login

```
┌────────────────────────────────────────────────────┐
│ [Logo: FlashLearn AI]    [Login]  [Zarejestruj się] │
└────────────────────────────────────────────────────┘
```

**Komponenty:**
- Logo (clickable → `/`)
- Login button (outline) → `/login`
- Register button (primary) → `/register`

**Responsive:**
- Mobile: Hamburger menu

---

### 4.2. Protected Navigation
Widoczna na: Dashboard, Generator, Collection, Learn, Profile

**Desktop Layout:**
```
┌────────────────────────────────────────────────────┐
│ [Logo]  [Dashboard] [Generator] [Kolekcja] [Nauka] │
│                                    [Avatar] [Logout]│
└────────────────────────────────────────────────────┘
```

**Mobile Layout:**
```
┌─────────────────────┐
│ [☰] [Logo] [Avatar] │
└─────────────────────┘

[Sidebar when open:]
┌─────────────────┐
│ Dashboard       │
│ Generator       │
│ Kolekcja        │
│ Nauka           │
│ ──────          │
│ Profil          │
│ Wyloguj         │
└─────────────────┘
```

**Komponenty:**
- `<MainNav>` - Horizontal nav (desktop) / Hamburger (mobile)
- `<NavLink>` - Navigation items z active state
- `<UserMenu>` - Dropdown
  - Profil → `/profile`
  - Wyloguj → `POST /api/auth/logout` → `/`

**Accessibility:**
- aria-current="page" dla active link
- Keyboard navigation (Tab, Enter)
- Mobile: Focus trap w open sidebar

**Active State:**
- Highlight current page (underline, bold, or background)

---

### 4.3. Navigation Hierarchy

```
Public Zone
├── / (Landing)
├── /login
└── /register

Protected Zone
├── /dashboard (Home)
├── /generator (Primary action)
├── /collection (Primary action)
├── /learn (Primary action)
└── /profile (Secondary, in user menu)
```

**Priority:**
- Primary actions: Dashboard, Generator, Collection, Learn (main nav)
- Secondary actions: Profile, Logout (user menu dropdown)

---

## 5. Kluczowe komponenty wspólne (Shared Components)

### 5.1. Layout Components

**`<PublicLayout>`**
- Header z public navigation
- Main content area
- Footer
- Used on: Landing, Login, Register

**`<ProtectedLayout>`**
- Header z protected navigation
- Sidebar (optional, desktop)
- Main content area
- Used on: Dashboard, Generator, Collection, Learn, Profile

**`<MinimalLayout>`**
- No header/footer (fullscreen focus)
- Used on: Learn session

---

### 5.2. UI Primitives (Radix UI + Custom)

**Forms:**
- `<Input>` - Text input
- `<Textarea>` - Multi-line input
- `<Button>` - Primary, Secondary, Danger variants
- `<Label>` - Form labels
- `<FormError>` - Error message display
- `<Checkbox>` - Checkboxes
- `<Select>` - Dropdown select

**Feedback:**
- `<Toast>` - Notifications (success, error, info)
- `<Spinner>` - Loading indicator
- `<ProgressBar>` - Progress visualization
- `<Skeleton>` - Loading placeholders

**Overlays:**
- `<Modal>` - Dialog/Modal
- `<ConfirmationDialog>` - Yes/No confirmations
- `<DropdownMenu>` - Dropdown menus

**Cards:**
- `<Card>` - Generic card container
- `<FlashcardCard>` - Flashcard display
- `<StatCard>` - Stats display

**Navigation:**
- `<NavLink>` - Navigation link with active state
- `<Breadcrumbs>` - Breadcrumb navigation (optional)

---

### 5.3. Feature-Specific Components

**Generator:**
- `<CharacterCounter>` - Real-time character count
- `<FlashcardProposal>` - AI-generated proposal card
- `<ProposalsList>` - List of proposals
- `<BulkActions>` - Accept/Reject all

**Collection:**
- `<FlashcardsList>` - Grid/List view
- `<FilterBar>` - Source filters
- `<SortDropdown>` - Sorting options
- `<Pagination>` - Page controls

**Learn:**
- `<FlashcardDisplay>` - Flip card UI
- `<DifficultyRating>` - Easy/Medium/Hard buttons
- `<SessionProgress>` - Progress indicator

---

## 6. States i Feedback

### 6.1. Loading States

**Global Loading:**
- Full page skeleton dla initial loads
- Spinner w center dla async operations

**Component Loading:**
- Skeleton cards w lists/grids
- Spinner on buttons podczas submit
- Progress bar dla long operations (AI generation)

**Examples:**
- `/collection` loading: Grid of skeleton cards
- Generator submit: Button disabled + spinner + "Generuję..."
- Dashboard stats: Skeleton cards → fade in real data

---

### 6.2. Empty States

**Collection Empty:**
```
┌─────────────────────────────┐
│      📚                      │
│  Nie masz jeszcze fiszek    │
│                             │
│  [Generuj fiszki] [Dodaj]   │
└─────────────────────────────┘
```

**Learn Empty:**
```
┌─────────────────────────────┐
│      ✅                      │
│  Świetna robota!            │
│  Nie masz fiszek do powtórki│
│                             │
│  Wróć jutro!                │
└─────────────────────────────┘
```

**Generator No Results:**
```
┌─────────────────────────────┐
│      ⚠️                      │
│  Nie udało się wygenerować  │
│  fiszek z tego tekstu       │
│                             │
│  [Spróbuj ponownie]         │
└─────────────────────────────┘
```

---

### 6.3. Error States

**Form Validation Errors:**
- Inline below field
- Red border na field
- Icon indicator

**API Errors:**
- Toast notification (top-right)
- Error banner (top of page)
- Inline error w component

**Error Messages:**
- User-friendly language
- Actionable (suggest solution)
- Non-technical

**Examples:**
- "Email już istnieje w systemie. Spróbuj się zalogować."
- "Tekst jest za krótki. Minimum 800 znaków."
- "Błąd połączenia. Sprawdź internet i spróbuj ponownie."

---

### 6.4. Success States

**Toast Notifications:**
- Green checkmark icon
- Short message
- Auto-dismiss (4s)

**Examples:**
- "Fiszki zapisane pomyślnie!"
- "Fiszka usunięta"
- "Zmiany zapisane"

**Inline Success:**
- Checkmark icon w button po success
- Color change (green)

---

## 7. Responsive Design Strategy

### 7.1. Breakpoints (Tailwind)
- **Mobile**: < 640px (sm)
- **Tablet**: 640px - 1024px (md, lg)
- **Desktop**: > 1024px (xl, 2xl)

### 7.2. Layout Adaptations

**Navigation:**
- Mobile: Hamburger menu + sidebar
- Desktop: Horizontal nav bar

**Dashboard:**
- Mobile: 1 column grid
- Tablet: 2 column grid
- Desktop: 3 column grid

**Collection:**
- Mobile: List view (stacked cards)
- Tablet: 2 column grid
- Desktop: 3-4 column grid

**Generator:**
- Mobile: Full width textarea, stacked proposals
- Desktop: Textarea + preview side-by-side (optional)

**Learn:**
- All breakpoints: Full screen focus mode (same layout)

---

## 8. Accessibility Compliance (WCAG 2.1 Level AA)

### 8.1. Keyboard Navigation
- All interactive elements focusable (Tab)
- Visible focus indicators
- Logical tab order
- Keyboard shortcuts (optional: ?, g+g, g+c, etc.)
- Skip to main content link

### 8.2. Screen Reader Support
- Semantic HTML (nav, main, article, section)
- aria-label dla icon buttons
- aria-describedby dla form fields
- aria-live dla dynamic content (character counter, toast)
- alt text dla images

### 8.3. Color Contrast
- Text: Minimum 4.5:1 contrast ratio
- Large text (18pt+): Minimum 3:1
- Interactive elements: 3:1

### 8.4. Form Accessibility
- Labels for all inputs (not just placeholders)
- Error messages linked via aria-describedby
- Required fields indicated
- Focus on first error field

---

## 9. Security Considerations w UI

### 9.1. Authentication UI
- No password in URL params
- Password inputs type="password"
- Show/hide password toggle
- Clear error messages (nie ujawniaj sensitive info)

### 9.2. Protected Routes
- Middleware redirect do /login jeśli unauthorized
- Clear feedback: "Musisz być zalogowany"
- Return URL preserved (redirect back po login)

### 9.3. User Content Display
- XSS protection: Escape user-generated content
- Sanitize HTML przed display
- No eval() lub dangerouslySetInnerHTML

### 9.4. CSRF Protection
- Astro built-in CSRF protection
- No need for manual tokens w forms

---

## 10. Performance Considerations

### 10.1. Code Splitting
- Route-based splitting (Astro automatic)
- Lazy load modals, heavy components
- Dynamic imports dla non-critical features

### 10.2. Image Optimization
- Use Astro Image component
- Lazy loading (loading="lazy")
- Responsive images (srcset)

### 10.3. API Optimization
- Cache GET requests (stale-while-revalidate)
- Debounce search inputs
- Optimistic UI updates
- Pagination for large lists

### 10.4. Loading Performance
- First Contentful Paint (FCP) < 2s
- Largest Contentful Paint (LCP) < 2.5s
- Time to Interactive (TTI) < 3s
- Cumulative Layout Shift (CLS) < 0.1

---

## 11. Mapowanie User Stories → UI Components

| User Story | Widok | Komponenty | API Endpoints |
|-----------|-------|-----------|---------------|
| **US-001**: Założenie konta | `/register` | `<RegisterForm>`, `<Input>`, `<Button>`, `<FormError>` | `POST /api/auth/register` |
| **US-002**: Autoryzacja | `/login` | `<LoginForm>`, `<Input>`, `<Button>`, `<FormError>` | `POST /api/auth/login` |
| **US-003**: Automatyczna kreacja fiszek | `/generator` | `<GeneratorForm>`, `<Textarea>`, `<CharacterCounter>`, `<ProposalsList>` | `POST /api/generations` |
| **US-004**: Selekcja i akceptacja | `/generator` | `<FlashcardProposal>`, `<BulkActions>`, `<ConfirmationDialog>` | `POST /api/flashcards` (bulk) |
| **US-005**: Modyfikacja zawartości | `/collection` | `<EditFlashcardModal>`, `<Form>` | `PUT /api/flashcards/:id` |
| **US-006**: Usuwanie fiszek | `/collection` | `<FlashcardCard>`, `<DeleteConfirmationModal>` | `DELETE /api/flashcards/:id` |
| **US-007**: Manualne dodawanie | `/collection` | `<AddFlashcardModal>`, `<Form>` | `POST /api/flashcards` |
| **US-008**: Sesja nauki | `/learn` | `<FlashcardDisplay>`, `<DifficultyRating>`, `<SessionProgress>` | `GET /api/learn/session`, `POST /api/learn/rate` |
| **US-009**: Izolacja danych | All protected | Middleware + RLS | All API endpoints (automatic) |
| **US-010**: Dwujęzyczne fiszki | `/generator` | `<FlashcardProposal>` (display only) | `POST /api/generations` (backend logic) |

---

## 12. Potencjalne Pain Points i Rozwiązania UI

### 12.1. Problem: AI generation takes too long (10s+)
**Solution:**
- Show progress indicator z estimated time
- Allow user to cancel
- Provide feedback: "To może potrwać 5-10 sekund"
- Optional: Email notification when done (future)

### 12.2. Problem: User rejects all AI proposals
**Solution:**
- Confirmation dialog: "Czy na pewno odrzucić wszystkie propozycje?"
- Suggest: "Spróbuj innego tekstu lub dodaj fiszki manualnie"
- Track analytics: High rejection rate → improve prompt

### 12.3. Problem: User forgets password
**Solution:**
- "Forgot password?" link on login
- Supabase password reset flow
- Clear instructions via email

### 12.4. Problem: User accidentally deletes flashcard
**Solution:**
- Confirmation modal with strong warning
- (Future) Trash/Archive instead of hard delete
- (Future) Undo option (5s grace period)

### 12.5. Problem: Mobile keyboard covers input
**Solution:**
- Ensure inputs scroll into view on focus
- Use native input behavior
- Test on real devices

### 12.6. Problem: Slow network → API timeouts
**Solution:**
- Show loading states
- Timeout after 30-60s with error message
- Retry button
- Offline detection: "Brak połączenia z internetem"

### 12.7. Problem: User doesn't understand source badges
**Solution:**
- Tooltip on hover: "AI-full: Generated by AI without edits"
- Help icon with explanation
- Onboarding tutorial (future)

---

## 13. Future Enhancements (Out of MVP)

### 13.1. Advanced Search
- Full-text search w collection
- Filter by tags, categories
- Search history

### 13.2. Dark Mode
- Toggle w profile settings
- System preference detection
- Persist choice in localStorage

### 13.3. Keyboard Shortcuts
- Global shortcuts panel (?)
- Navigation shortcuts (g+g, g+c)
- Learn shortcuts (space, 1/2/3)

### 13.4. Onboarding Tutorial
- Interactive walkthrough dla new users
- Tooltips on first use
- Progress tracker

### 13.5. Advanced Learn Features
- Study streaks
- Daily goals
- Statistics dashboard
- Progress charts

### 13.6. Collaboration
- Share flashcard decks
- Public/private decks
- Collaborative editing

### 13.7. Import/Export
- Import from CSV, Anki, Quizlet
- Export to PDF, CSV
- Print flashcards

---

## 14. Design Tokens (Tailwind Config)

### 14.1. Colors
```
Primary: blue-600 (CTA, links)
Secondary: gray-600 (secondary actions)
Success: green-600 (positive feedback)
Warning: yellow-600 (warnings)
Danger: red-600 (destructive actions)
Background: white (light), gray-900 (dark)
Text: gray-900 (primary), gray-600 (secondary)
Border: gray-300
```

### 14.2. Typography
```
Font Family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif
Font Sizes:
  - xs: 0.75rem (12px)
  - sm: 0.875rem (14px)
  - base: 1rem (16px) - body text
  - lg: 1.125rem (18px)
  - xl: 1.25rem (20px)
  - 2xl: 1.5rem (24px) - headings
  - 3xl: 1.875rem (30px)
  - 4xl: 2.25rem (36px) - hero
Line Height: 1.5 (body), 1.2 (headings)
```

### 14.3. Spacing
```
Base unit: 4px (Tailwind default)
Common spacing: 4, 8, 12, 16, 24, 32, 48, 64px
```

### 14.4. Border Radius
```
sm: 0.125rem (2px)
DEFAULT: 0.25rem (4px)
md: 0.375rem (6px)
lg: 0.5rem (8px) - cards, buttons
xl: 0.75rem (12px)
```

### 14.5. Shadows
```
sm: subtle card elevation
md: standard card shadow
lg: modal, dropdown shadow
```

---

## 15. Component Library Reference

### 15.1. Radix UI Components Used
- `@radix-ui/react-dialog` - Modals
- `@radix-ui/react-dropdown-menu` - User menu
- `@radix-ui/react-label` - Form labels
- `@radix-ui/react-slot` - Composition
- (Future) `@radix-ui/react-toast` - Notifications
- (Future) `@radix-ui/react-select` - Dropdowns

### 15.2. Custom Components
All located in `src/components/`:
- `src/components/ui/` - Shared primitives
- `src/components/layout/` - Layouts
- `src/components/features/` - Feature-specific
  - `features/auth/` - Login, Register forms
  - `features/generator/` - Generator components
  - `features/collection/` - Collection components
  - `features/learn/` - Learn components

---

## Podsumowanie

Architektura UI FlashLearn AI jest zaprojektowana z myślą o:
1. **Prostocie użytkowania** - Minimalistyczny, intuicyjny interfejs
2. **Dostępności** - WCAG 2.1 AA compliance
3. **Responsywności** - Mobile-first design
4. **Wydajności** - Szybkie ładowanie, optimistic UI
5. **Bezpieczeństwie** - Protected routes, input validation, XSS protection
6. **Skalowalności** - Modularna struktura komponentów

UI Architecture mapuje wszystkie User Stories z PRD i integruje się bezproblemowo z API Plan. Każdy widok jest zaprojektowany z uwzględnieniem user flow, edge cases, loading/error states oraz accessibility requirements.

---

**Wersja:** 1.0
**Data:** 2025-12-13
**Status:** Ready for Implementation
