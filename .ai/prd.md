# Dokument wymagań produktu (PRD) – FlashLearn AI

## 1. Przegląd produktu
FlashLearn AI to inteligentna aplikacja wspierająca efektywną naukę poprzez automatyczne generowanie i zarządzanie materiałami edukacyjnymi w formie fiszek. System wykorzystuje zaawansowane modele językowe do przekształcania dowolnych treści tekstowych w strukturyzowane pytania i odpowiedzi, umożliwiając użytkownikom błyskawiczne przygotowanie materiałów do nauki.

## 2. Problem użytkownika
Studenci i osoby uczące się często tracą cenny czas na ręczne przygotowywanie fiszek edukacyjnych, co skutkuje frustracją i rezygnacją z tej sprawdzonej metody nauki. Proces ten jest szczególnie czasochłonny przy dużych ilościach materiału, a jakość tworzonych fiszek bywa nierówna. FlashLearn AI rozwiązuje ten problem poprzez automatyzację procesu tworzenia fiszek przy zachowaniu możliwości pełnej personalizacji i kontroli nad treścią.

## 3. Wymagania funkcjonalne

### 3.1. Inteligentne generowanie materiałów edukacyjnych
- Przyjmowanie tekstów o długości 800-12000 znaków (elastyczne limity dostosowane do różnych źródeł)
- Komunikacja z API modeli językowych (OpenRouter) w celu ekstrakcji kluczowych informacji
- Generowanie zestawu 5-15 fiszek z automatycznym dopasowaniem liczby do objętości materiału
- **Inteligentna detekcja języka tekstu źródłowego:**
  - Dla tekstów w języku polskim: generowanie pytań i odpowiedzi w języku polskim
  - Dla tekstów w językach obcych (angielski, niemiecki, etc.): generowanie przodu fiszki w oryginalnym języku, a tyłu z tłumaczeniem/wyjaśnieniem po polsku
  - Wsparcie dla nauki języków obcych poprzez dwujęzyczne fiszki
- Prezentacja wygenerowanych propozycji w formie interaktywnej listy
- Możliwość indywidualnej akceptacji, modyfikacji lub odrzucenia każdej fiszki
- Obsługa różnych formatów odpowiedzi AI (pojedyncza tablica JSON, wiele tablic, markdown code blocks)

### 3.2. Pełne zarządzanie kolekcją fiszek
- Intuicyjny formularz do manualnego dodawania fiszek z walidacją długości
- Przegląd wszystkich fiszek w sekcji "Moja Kolekcja" z filtrowaniem i sortowaniem
- Edycja treści fiszek z automatycznym oznaczaniem modyfikacji
- Bezpieczne usuwanie fiszek z potwierdzeniem operacji
- Przypisywanie fiszek do kategorii i tagowanie

### 3.3. System kont użytkowników
- Rejestracja z wykorzystaniem adresu email i bezpiecznego hasła
- Logowanie z walidacją danych dostępowych
- Zarządzanie profilem użytkownika
- Możliwość trwałego usunięcia konta wraz ze wszystkimi powiązanymi danymi

### 3.4. Moduł efektywnej nauki
- Implementacja algorytmu interwałowych powtórek (spaced repetition) z gotowej biblioteki
- System oceny stopnia przyswojenia materiału (łatwe/średnie/trudne)
- Automatyczne planowanie kolejnych sesji nauki na podstawie wydajności użytkownika
- Minimalistyczny interfejs skupiony na koncentracji podczas nauki

### 3.5. Architektura danych
- Relacyjna baza danych zapewniająca integralność i bezpieczeństwo
- Mechanizmy Row Level Security dla izolacji danych użytkowników
- Automatyczne kopie zapasowe i możliwość odzyskiwania danych

### 3.6. Analityka i monitoring
- Rejestrowanie statystyk generowania (liczba wygenerowanych vs. zaakceptowanych fiszek)
- Tracking źródła powstania fiszek (AI bez edycji, AI z edycją, manualne)
- Monitoring długości sesji nauki i częstotliwości korzystania
- Logowanie błędów API dla celów diagnostycznych

### 3.7. Zgodność z regulacjami
- Przetwarzanie danych osobowych zgodnie z wymogami RODO
- Transparentność w zakresie przechowywania i wykorzystywania danych
- Realizacja prawa do dostępu, poprawy i usunięcia danych na żądanie użytkownika

## 4. Granice produktu

### 4.1. Funkcjonalności poza zakresem pierwszej wersji:
- Własnoręcznie opracowany algorytm spaced repetition (używamy sprawdzonej biblioteki open-source)
- System osiągnięć, poziomów i elementów grywalizacyjnych
- Natywne aplikacje mobilne na iOS i Android (focus na progressive web app)
- Bezpośredni import dokumentów w formatach PDF, DOCX, EPUB
- Publiczne REST API dla integracji z zewnętrznymi systemami
- Udostępnianie i współdzielenie zestawów fiszek pomiędzy użytkownikami
- System przypomnień push i email notifications
- Wyszukiwanie full-text z zaawansowanymi filtrami i operatorami
- Wsparcie dla wielu języków interfejsu (tylko angielski i polski w MVP)
- Integracja z zewnętrznymi platformami edukacyjnymi (Moodle, Canvas)

## 5. Historyjki użytkowników

### US-001: Założenie konta w systemie
**Jako:** Nowy użytkownik platformy
**Chcę:** Utworzyć własne konto w aplikacji
**Po to, aby:** Móc korzystać z funkcji generowania fiszek AI i mieć bezpieczny dostęp do moich materiałów edukacyjnych

**Kryteria akceptacji:**
- System prezentuje formularz z polami: email, hasło, potwierdzenie hasła
- Hasło musi spełniać wymagania bezpieczeństwa (minimum 8 znaków)
- Po udanej rejestracji użytkownik otrzymuje wizualne potwierdzenie
- System automatycznie loguje użytkownika i przekierowuje do głównego panelu
- Email musi być unikalny w systemie

### US-002: Autoryzacja w systemie
**Jako:** Posiadacz konta w FlashLearn AI
**Chcę:** Zalogować się do aplikacji używając swoich danych
**Po to, aby:** Uzyskać dostęp do mojej prywatnej kolekcji fiszek i kontynuować naukę

**Kryteria akceptacji:**
- Formularz logowania przyjmuje email i hasło
- Poprawne dane przekierowują do panelu generowania materiałów
- Niepoprawne dane wyświetlają czytelny komunikat błędu
- System zabezpiecza hasła poprzez szyfrowanie
- Po zalogowaniu sesja użytkownika jest bezpiecznie zarządzana

### US-003: Automatyczna kreacja fiszek z tekstu
**Jako:** Zalogowany student
**Chcę:** Wkleić fragment notatek i automatycznie otrzymać propozycje fiszek
**Po to, aby:** Znacząco przyspieszyć proces przygotowania materiałów do nauki bez ręcznego formatowania

**Kryteria akceptacji:**
- Interfejs udostępnia obszar tekstowy z licznikiem znaków
- System akceptuje teksty o długości 800-12000 znaków
- Po aktywacji funkcji następuje komunikacja z API modelu językowego
- Wygenerowane fiszki wyświetlają się jako lista z opcjami akcji
- Gdy występują problemy techniczne, użytkownik widzi informacyjny komunikat
- Wyświetlany jest loader podczas przetwarzania żądania

### US-004: Selekcja i akceptacja wygenerowanych materiałów
**Jako:** Użytkownik przeglądający wygenerowane przez AI fiszki
**Chcę:** Indywidualnie wybierać które propozycje zapisać w mojej kolekcji
**Po to, aby:** Zachować wysoką jakość moich materiałów i uwzględnić tylko wartościowe fiszki

**Kryteria akceptacji:**
- Propozycje fiszek wyświetlają się jako interaktywna lista poniżej obszaru wprowadzania
- Każda fiszka posiada kontrolki: akceptuj, edytuj, odrzuć
- Możliwość masowej akceptacji wszystkich propozycji jednym kliknięciem
- Zaakceptowane fiszki zostają trwale zapisane po potwierdzeniu
- System pokazuje licznik zaakceptowanych/odrzuconych fiszek

### US-005: Modyfikacja zawartości fiszek
**Jako:** Właściciel kolekcji fiszek
**Chcę:** Mieć możliwość edycji treści każdej mojej fiszki
**Po to, aby:** Poprawiać błędy, aktualizować informacje i personalizować pytania do moich potrzeb

**Kryteria akceptacji:**
- W sekcji "Moja Kolekcja" każda fiszka ma opcję edycji
- Kliknięcie aktywuje formularz z bieżącą treścią przodu i tyłu
- Zmiany zapisują się po zatwierdzeniu z walidacją długości
- System oznacza fiszki modyfikowane jako "edytowane"
- Timestamp ostatniej modyfikacji jest automatycznie aktualizowany

### US-006: Usuwanie niechcianych fiszek
**Jako:** Użytkownik zarządzający swoją kolekcją
**Chcę:** Móc trwale usunąć wybrane fiszki
**Po to, aby:** Utrzymać porządek i pozbyć się nieaktualnych lub niepotrzebnych materiałów

**Kryteria akceptacji:**
- Przycisk usuwania jest dostępny przy każdej fiszce w kolekcji
- System wymaga potwierdzenia przed wykonaniem operacji usunięcia
- Modal potwierdzenia jasno komunikuje nieodwracalność operacji
- Po potwierdzeniu fiszka znika z bazy danych i interfejsu
- Wyświetlane jest powiadomienie o pomyślnym usunięciu

### US-007: Manualne dodawanie fiszek
**Jako:** Użytkownik posiadający własne materiały
**Chcę:** Samodzielnie tworzyć fiszki bez wykorzystania AI
**Po to, aby:** Dodawać specyficzne pytania lub informacje, które nie pochodzą z automatycznie przetwarzanych tekstów

**Kryteria akceptacji:**
- Sekcja "Moja Kolekcja" zawiera wyraźny przycisk "Dodaj fiszkę"
- Formularz kreacji zawiera pola na przód i tył fiszki z podglądem liczby znaków
- Walidacja zapewnia niepuste pola i limit długości (200/500 znaków)
- Nowo utworzona fiszka od razu pojawia się na liście
- System oznacza źródło jako "manualne"

### US-008: Inteligentna sesja nauki
**Jako:** Student chcący efektywnie się uczyć
**Chcę:** Uczestniczyć w sesjach nauki kierowanych algorytmem interwałowych powtórek
**Po to, aby:** Maksymalizować retencję wiedzy poprzez naukę we właściwych momentach czasowych

**Kryteria akceptacji:**
- Dedykowana sekcja "Nauka" przygotowuje sesję z algorytmem spaced repetition
- Interfejs prezentuje pojedynczą fiszkę z przednią stroną na początku
- Interakcja użytkownika odkrywa tylną stronę z odpowiedzią
- System oferuje opcje oceny: łatwe/średnie/trudne
- Algorytm dostosowuje harmonogram kolejnych powtórek na podstawie oceny
- Po ocenie automatycznie wyświetla się kolejna fiszka w sesji

### US-009: Izolacja i prywatność danych
**Jako:** Użytkownik przechowujący prywatne materiały edukacyjne
**Chcę:** Mieć gwarancję że moje dane są dostępne wyłącznie dla mnie
**Po to, aby:** Czuć się bezpiecznie przechowując wrażliwe lub osobiste informacje w systemie

**Kryteria akceptacji:**
- Row Level Security w bazie danych izoluje dane poszczególnych użytkowników
- Brak jakichkolwiek mechanizmów publicznego udostępniania w MVP
- Próba dostępu do cudzych zasobów przez API kończy się błędem autoryzacji
- System weryfikuje właściciela przy każdej operacji CRUD
- Dokumentacja prywatności jasno komunikuje praktyki bezpieczeństwa

### US-010: Generowanie dwujęzycznych fiszek do nauki języków
**Jako:** Użytkownik uczący się języka obcego
**Chcę:** Wkleić tekst w języku obcym i otrzymać fiszki z terminem/pytaniem w oryginalnym języku oraz tłumaczeniem po polsku
**Po to, aby:** Efektywnie uczyć się nowych słówek i pojęć w kontekście bez konieczności ręcznego tłumaczenia

**Kryteria akceptacji:**
- System automatycznie wykrywa język tekstu źródłowego
- Dla tekstów w języku polskim: generuje pytanie i odpowiedź po polsku
- Dla tekstów w językach obcych (angielski, niemiecki, hiszpański, etc.):
  - Przód fiszki zawiera termin/pytanie w oryginalnym języku tekstu
  - Tył fiszki zawiera tłumaczenie i wyjaśnienie po polsku
- AI priorytetyzuje kluczowe słówka, zwroty i idiomy dla tekstów obcojęzycznych
- Każda fiszka zawiera kontekst użycia w wyjaśnieniu
- Użytkownik może edytować zarówno przód jak i tył fiszki po wygenerowaniu

## 6. Metryki sukcesu

### 6.1. Jakość generowania AI
- **Wskaźnik akceptacji:** Minimum 70% automatycznie wygenerowanych fiszek zostaje zaakceptowanych przez użytkowników
- **Ratio AI vs Manual:** Co najmniej 80% wszystkich nowych fiszek powstaje z wykorzystaniem funkcji AI
- **Wskaźnik edycji:** Nie więcej niż 40% zaakceptowanych fiszek wymaga modyfikacji przed zapisem

### 6.2. Aktywność użytkowników
- **Retencja D7:** 60% nowych użytkowników wraca do aplikacji w ciągu 7 dni od rejestracji
- **Średnia liczba sesji:** Użytkownik przeprowadza minimum 3 sesje generowania w pierwszym tygodniu
- **Rozmiar kolekcji:** Przeciętny aktywny użytkownik gromadzi co najmniej 50 fiszek w ciągu pierwszego miesiąca

### 6.3. Wydajność techniczna
- **Czas generowania:** 95% requestów do API zwraca wyniki w czasie poniżej 10 sekund
- **Wskaźnik błędów:** Mniej niż 5% prób generowania kończy się błędem
- **Uptime:** Aplikacja dostępna przez minimum 99% czasu w miesiącu

### 6.4. Zaangażowanie edukacyjne (jeśli moduł nauki jest zaimplementowany)
- **Częstotliwość nauki:** 40% użytkowników z fiskami przeprowadza sesję nauki przynajmniej raz w tygodniu
- **Completion rate:** 75% rozpoczętych sesji nauki jest dokończonych
- **Efekt spaced repetition:** Średnia ocena trudności fiszek spada o 20% po trzech powtórkach

## 7. Jakość kodu i testowanie

### 7.1. Strategia testowania
Aplikacja implementuje wielowarstwową strategię testowania zapewniającą wysoką jakość kodu i niezawodność:

**Testy jednostkowe (Unit Tests) - Vitest**
- Framework: Vitest z happy-dom
- Pokrycie: ≥80% dla logiki biznesowej
- Kluczowe obszary:
  - GenerationService (logika AI)
  - Parsowanie odpowiedzi z różnych modeli AI
  - Walidacja danych (Zod schemas)
  - Obsługa błędów API

**Testy integracyjne (Integration Tests)**
- Testowanie współpracy API endpoints z bazą danych
- Weryfikacja Row Level Security policies
- Testowanie middleware autentykacji

**Testy E2E (End-to-End) - Playwright**
- Symulacja kompletnych ścieżek użytkownika
- Testy rejestracji, logowania i głównych flow
- Weryfikacja protected routes
- Testy UI interactions

### 7.2. CI/CD i automatyzacja
- **GitHub Actions**: Automatyczne uruchamianie testów przy każdym push/PR
- **Lint & Format**: ESLint + Prettier przy pre-commit hooks
- **Build verification**: Weryfikacja buildu przed merge
- **Test Reports**: Generowanie raportów pokrycia testami

### 7.3. Dokumentacja techniczna
Projekt zawiera szczegółową dokumentację techniczną:
- **Test Plan** (`.ai/test-plan.md`): Strategia testowania, edge cases, cele pokrycia
- **Tech Stack** (`.ai/tech-stack.md`): Wybrane technologie i uzasadnienia
- **DB Plan** (`.ai/db-plan.md`): Schema bazy danych
- **API Plan** (`.ai/api-plan.md`): Specyfikacja endpointów API
- **PRD** (`.ai/prd.md`): Product Requirements Document

### 7.4. Monitoring i obsługa błędów
- Logowanie błędów generowania do tabeli `generation_error_logs`
- Tracking metadanych generacji (czas, liczba fiszek, model użyty)
- Graceful error handling z informacyjnymi komunikatami dla użytkownika
- Automatyczne retry przy rate limiting (429 errors)

## 8. Stack technologiczny (implementacja)

### 8.1. Frontend
- **Framework**: Astro 5.x (SSR)
- **UI Components**: React 19.x
- **Styling**: Tailwind CSS 4.x
- **UI Library**: Radix UI
- **State Management**: Zustand (jeśli potrzebne)
- **Form Validation**: Zod

### 8.2. Backend
- **Runtime**: Node.js 22.x
- **Framework**: Astro (API routes)
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **AI Integration**: OpenRouter API
  - Model: meta-llama/llama-3.2-3b-instruct:free (lub inne modele)
  - Alternatywy: Google Gemini, OpenAI GPT-4o-mini

### 8.3. Development & Testing
- **Package Manager**: npm
- **Unit Testing**: Vitest + happy-dom
- **E2E Testing**: Playwright
- **Linting**: ESLint + TypeScript ESLint
- **Formatting**: Prettier
- **Git Hooks**: Husky + lint-staged
- **CI/CD**: GitHub Actions

### 8.4. Infrastructure
- **Hosting**: TBD (Vercel, Netlify, lub self-hosted)
- **Database**: Supabase Cloud lub self-hosted
- **Environment Variables**: Bezpieczne przechowywanie w GitHub Secrets
- **Monitoring**: TBD (Sentry, LogRocket)

## 9. UI/UX Design

### 9.1. Filozofia designu
FlashLearn AI wykorzystuje minimalistyczną, accessibility-first filozofię designu skupioną na efektywnej nauce:

- **Mobile-first responsive design** - Aplikacja jest w pełni responsywna, z priorytetem dla urządzeń mobilnych
- **Minimalistyczny interfejs** - Skupienie na funkcjonalności, minimalna dystrakcja podczas nauki
- **Progressive disclosure** - Stopniowe pokazywanie informacji, unikanie cognitive overload
- **WCAG 2.1 Level AA compliance** - Pełne wsparcie dla keyboard navigation i screen readers

### 9.2. Design System
- **Framework UI**: Radix UI - accessible component primitives
- **Styling**: Tailwind CSS 4.x z semantycznym systemem kolorów
- **Typography**: System font stack dla optymalnej czytelności na wszystkich platformach
- **Spacing**: 4px base unit (Tailwind spacing scale) dla konsystentnych odstępów
- **Iconography**: Lucide React - spójny, minimalistyczny zestaw ikon

### 9.3. Kluczowe widoki

**Public Zone:**
- **Landing Page** (`/`) - Value proposition, features showcase, CTA do rejestracji
- **Register** (`/register`) - Formularz rejestracji z real-time validation
- **Login** (`/login`) - Formularz logowania z secure password handling

**Protected Zone:**
- **Dashboard** (`/dashboard`) - Hub aplikacji z quick stats i actions
- **Generator** (`/generator`) - AI-powered flashcard generation z inline editing
- **Moja Kolekcja** (`/collection`) - Grid/list view z filtering, sorting, CRUD operations
- **Nauka** (`/learn`) - Full-screen spaced repetition session (MVP: uproszczony)
- **Profil** (`/profile`) - Account management i danger zone (delete account)

### 9.4. Responsive Breakpoints
- **Mobile**: < 640px - Single column layout, hamburger menu
- **Tablet**: 640px - 1024px - 2 column grids, optimized touch targets
- **Desktop**: > 1024px - 3-4 column grids, horizontal navigation

### 9.5. Nawigacja

**Public Navigation:**
- Logo + Login/Register buttons
- Mobile: Hamburger menu

**Protected Navigation:**
- Desktop: Horizontal nav (Dashboard, Generator, Kolekcja, Nauka) + User dropdown
- Mobile: Sidebar navigation z focus trap
- Active state highlighting dla current page

### 9.6. Komponenty UI

**Layout Components:**
- `<PublicLayout>` - Header, main, footer dla public pages
- `<ProtectedLayout>` - Header z nav, main content area
- `<MinimalLayout>` - Fullscreen dla learn session

**UI Primitives (Radix UI):**
- Forms: `<Input>`, `<Textarea>`, `<Button>`, `<Label>`, `<FormError>`
- Feedback: `<Toast>`, `<Spinner>`, `<ProgressBar>`, `<Skeleton>`
- Overlays: `<Modal>`, `<ConfirmationDialog>`, `<DropdownMenu>`
- Cards: `<Card>`, `<FlashcardCard>`, `<StatCard>`

**Feature-Specific:**
- Generator: `<CharacterCounter>`, `<FlashcardProposal>`, `<BulkActions>`
- Collection: `<FlashcardsList>`, `<FilterBar>`, `<SortDropdown>`, `<Pagination>`
- Learn: `<FlashcardDisplay>`, `<DifficultyRating>`, `<SessionProgress>`

### 9.7. States i User Feedback

**Loading States:**
- Skeleton loaders dla initial loads (nie spinners)
- Progress indicators dla long operations (AI generation)
- Disabled buttons z spinners podczas API calls

**Empty States:**
- Ilustracje + helpful text + CTA buttons
- Przykłady: "Nie masz jeszcze fiszek. Wygeneruj pierwsze!"

**Error States:**
- Toast notifications dla system errors (top-right, auto-dismiss)
- Inline errors dla form validation (red border, icon, message)
- Retry buttons gdzie applicable
- User-friendly messages (bez stack traces)

**Success States:**
- Toast notifications (green checkmark, auto-dismiss 4s)
- Inline success feedback (checkmark icon w button)
- Smooth transitions między states

### 9.8. Accessibility Features

**Keyboard Navigation:**
- All interactive elements focusable (Tab)
- Visible focus indicators (2px outline)
- Logical tab order
- Skip to main content link
- Keyboard shortcuts (optional: g+g generator, g+c collection)

**Screen Reader Support:**
- Semantic HTML (nav, main, article, section)
- ARIA labels dla icon-only buttons
- aria-describedby dla form fields i errors
- aria-live dla dynamic content (character counter, toast)
- alt text dla wszystkich obrazów

**Color Contrast:**
- Text: Minimum 4.5:1 contrast ratio
- Large text (18pt+): Minimum 3:1
- Interactive elements: 3:1

### 9.9. Performance Targets
- **First Contentful Paint (FCP)**: < 2s
- **Largest Contentful Paint (LCP)**: < 2.5s
- **Time to Interactive (TTI)**: < 3s
- **Cumulative Layout Shift (CLS)**: < 0.1

### 9.10. User Flow - Główna podróż

```
Landing → Register → Dashboard (empty) → Generator →
Review AI proposals → Accept/Edit → Collection →
Learn session → Dashboard (updated stats)
```

**Detailed UI Architecture:** `.ai/ui-plan.md` zawiera kompletną specyfikację wszystkich widoków, komponentów, user flows, edge cases i accessibility requirements.

---

**Ostatnia aktualizacja**: 2025-12-13
**Wersja**: 1.2
**Status**: Active Development
