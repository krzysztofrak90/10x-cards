# Test Plan - FlashLearn AI

## 1. Przegląd

FlashLearn AI to aplikacja do automatycznego generowania i zarządzania fiszkami edukacyjnymi z wykorzystaniem AI. Ten dokument definiuje strategię testowania aplikacji, identyfikuje kluczowe obszary wymagające pokrycia testami oraz określa narzędzia i metodologie.

## 2. Zakres testowania

### 2.1. Komponenty do testowania

#### Backend/API
- **GenerationService** (`src/lib/generation.service.ts`)
  - Logika generowania fiszek przez AI
  - Parsowanie odpowiedzi z OpenRouter API
  - Obsługa błędów API
  - Walidacja danych wejściowych

- **API Endpoints**
  - `/api/generations` - generowanie fiszek
  - `/api/flashcards` - CRUD operacje na fiszkach
  - `/api/auth/*` - autentykacja użytkowników

#### Frontend Components
- **FlashcardGenerationView** - widok generowania fiszek
- **FlashcardsList** - lista fiszek użytkownika
- **StudySession** - sesja nauki

#### Database Layer
- Integracja z Supabase
- Row Level Security policies
- Migracje

### 2.2. Obszary poza zakresem (w MVP)
- Testy wydajnościowe/load testing
- Testy bezpieczeństwa penetration testing
- Testy kompatybilności przeglądarek (poza Chromium)
- Testy accessibility (A11Y) - zaplanowane na późniejszy etap

## 3. Strategie testowania

### 3.1. Testy jednostkowe (Unit Tests) - Vitest
**Cel**: Weryfikacja izolowanych fragmentów logiki biznesowej

**Framework**: Vitest 1.x
- Szybki, kompatybilny z Vite/Astro
- Wsparcie dla ESM
- Wbudowane mocking capabilities

**Priorytetowe obszary**:

1. **GenerationService**
   - ✅ Poprawne wywołanie OpenRouter API
   - ✅ Parsowanie pojedynczej tablicy JSON
   - ✅ Parsowanie wielu tablic JSON (Llama format)
   - ✅ Obsługa błędów API (401, 429, 500)
   - ✅ Walidacja długości tekstu źródłowego
   - ✅ Obliczanie hash SHA-256
   - ✅ Logowanie błędów do bazy

2. **Parsowanie odpowiedzi AI**
   - ✅ Wyciąganie JSON z markdown code blocks
   - ✅ Obsługa różnych formatów odpowiedzi
   - ✅ Walidacja struktury fiszek

3. **Walidacja Zod**
   - ✅ Schemat CreateGenerationCommand
   - ✅ Walidacja długości tekstu (1000-10000 znaków)

### 3.2. Testy integracyjne (Integration Tests) - Vitest
**Cel**: Weryfikacja współpracy między komponentami

**Obszary**:
1. **API Endpoints z Supabase**
   - Poprawne zapisywanie do bazy
   - Weryfikacja RLS policies
   - Obsługa błędów bazy danych

2. **Auth flow**
   - Rejestracja → zapis do bazy
   - Login → ustawienie sesji
   - Middleware authorization

### 3.3. Testy E2E (End-to-End) - Playwright
**Cel**: Weryfikacja kompletnych przepływów użytkownika

**Framework**: Playwright
- Symulacja rzeczywistych interakcji użytkownika
- Headless browser testing
- Wsparcie dla screenshots i video

**Istniejące testy**:
- ✅ Complete user journey (register → login → CRUD flashcards)
- ✅ Protected routes authorization
- ✅ Invalid credentials handling

**Do dodania**:
- 🔲 AI flashcard generation flow
- 🔲 Bilingual flashcard validation (English → Polish)
- 🔲 Study session flow
- 🔲 Error states (API failures)

## 4. Środowisko testowe

### 4.1. Konfiguracja
```json
{
  "test": "vitest run",           // Single run dla CI
  "test:watch": "vitest",         // Watch mode dla dev
  "test:ui": "vitest --ui",       // UI mode
  "test:coverage": "vitest run --coverage"
}
```

### 4.2. Zmienne środowiskowe
Testy używają:
- **Lokalnie**: Supabase uruchomiony przez `npx supabase start`
- **CI**: Supabase uruchomiony w Docker przez GitHub Actions
- **Mock OpenRouter API**: Używamy `vi.mock()` do mockowania zewnętrznych API

### 4.3. Test Database
- Każdy test suite resetuje stan bazy
- Używamy transakcji lub separate test database
- Cleanup hooks w `afterEach`/`afterAll`

## 5. Pokrycie testami (Coverage)

### 5.1. Cele pokrycia
- **Statements**: ≥ 80%
- **Branches**: ≥ 75%
- **Functions**: ≥ 80%
- **Lines**: ≥ 80%

### 5.2. Priorytetowe obszary (100% coverage)
- `GenerationService.generateFlashcards()`
- `GenerationService.callAiService()`
- API endpoint handlers (`POST /api/generations`)
- Zod validation schemas

## 6. Edge Cases i Scenariusze Specjalne

### 6.1. GenerationService
- ❗ OpenRouter rate limit (429)
- ❗ API timeout
- ❗ Niepoprawny format JSON od AI
- ❗ AI zwraca pusty array
- ❗ AI zwraca fiszki z brakującymi polami
- ❗ Bardzo długi tekst wejściowy (>10000 znaków)
- ❗ Tekst z Unicode/emoji
- ❗ Wielokrotne tablice JSON w odpowiedzi (Llama)

### 6.2. Bilingual Flashcards
- ❗ Detekcja języka tekstu źródłowego
- ❗ Polski tekst → fiszki po polsku
- ❗ Angielski tekst → przód EN, tył PL
- ❗ Mieszane języki w tekście
- ❗ Języki z nie-łacińskimi alfabetami

### 6.3. Database & Auth
- ❗ Concurrent użytkownicy
- ❗ RLS policy violations
- ❗ Expired session tokens
- ❗ Race conditions przy zapisie fiszek

## 7. Narzędzia i Biblioteki

### 7.1. Unit/Integration Testing
- **Vitest** - test runner
- **@vitest/ui** - UI mode
- **happy-dom** lub **jsdom** - DOM simulation
- **msw** (Mock Service Worker) - HTTP mocking

### 7.2. E2E Testing
- **Playwright** - browser automation
- **@playwright/test** - test runner

### 7.3. Dodatkowe
- **faker** - generowanie test data
- **supertest** - testowanie API endpoints

## 8. CI/CD Integration

### 8.1. GitHub Actions
```yaml
test:
  - Install dependencies
  - Start Supabase (npx supabase start)
  - Run Vitest (npm run test)
  - Run Playwright (npm run test:e2e)
  - Upload coverage reports
```

### 8.2. Pre-commit Hooks
- Uruchamianie testów jednostkowych przed commitem
- Lint + format check

## 9. Maintenance i Best Practices

### 9.1. Test Organization
```
tests/
├── unit/
│   ├── lib/
│   │   └── generation.service.test.ts
│   └── api/
│       └── generations.test.ts
├── integration/
│   └── flashcards-crud.test.ts
└── e2e/
    └── user-flow.spec.ts
```

### 9.2. Naming Convention
- Test files: `*.test.ts` dla unit/integration
- E2E files: `*.spec.ts` dla Playwright
- Test suites: `describe('ComponentName', () => {...})`
- Test cases: `test('should do something', () => {...})`

### 9.3. Mocking Strategy
- Mock external APIs (OpenRouter, Supabase Auth)
- Nie mockuj własnej logiki biznesowej
- Używaj `vi.fn()` dla funkcji spy
- Reset mocks w `afterEach()`

## 10. Metryki i Monitoring

### 10.1. KPIs
- Test execution time: < 30s dla unit tests
- E2E test time: < 5min
- Flakiness rate: < 5%
- Coverage trend: wzrostowy

### 10.2. Reporting
- Coverage reports w CI artifacts
- Playwright HTML reports
- Slack notifications dla failed tests w CI

---

**Wersja dokumentu**: 1.0
**Data utworzenia**: 2025-12-12
**Autor**: Claude Code AI
**Status**: Active
