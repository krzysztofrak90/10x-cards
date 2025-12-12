# Stos Technologiczny - FlashLearn AI

## Warstwa Prezentacji (Frontend)

### Astro v5 - Meta-framework
- Architektura oparta na wyspach (Islands Architecture) minimalizująca ilość JavaScript po stronie klienta
- Server-Side Rendering (SSR) dla lepszej wydajności i SEO
- Natywne wsparcie dla TypeScript bez dodatkowej konfiguracji
- Routing oparty na systemie plików (file-based routing)

### React v19 - Biblioteka UI
- Komponenty interaktywne z hydracją tylko tam gdzie jest potrzebna
- Hook-based architecture dla zarządzania stanem lokalnym
- Wsparcie dla Server Components (eksperymentalne w Astro)

### TypeScript v5 - Typowanie
- Statyczna analiza typów redukująca błędy runtime
- Inteligentne podpowiedzi w IDE (IntelliSense)
- Lepsze developer experience przy refaktoringu kodu

### Tailwind CSS v4 - Styling
- Utility-first approach przyspieszający rozwój UI
- Automatyczne usuwanie nieużywanych styli (tree-shaking)
- Responsywność out-of-the-box
- Dark mode support

### shadcn/ui - Komponenty UI
- Predefiniowane, dostępne komponenty React
- Pełna kontrola nad kodem (komponenty kopiowane do projektu, nie jako npm package)
- Zgodność z WCAG 2.1 (dostępność)
- Integracja z Radix UI primitives

## Warstwa Danych (Backend)

### Supabase - Backend-as-a-Service
**PostgreSQL Database:**
- Relacyjna baza danych z pełnym wsparciem SQL
- Row Level Security (RLS) dla izolacji danych użytkowników
- Real-time subscriptions (opcjonalnie)
- Automatyczne backupy

**Authentication:**
- Email/password authentication out-of-the-box
- JWT-based sessions
- Secure password hashing (bcrypt)
- Session management

**SDK:**
- Oficjalne biblioteki JavaScript/TypeScript
- Type-safe database queries
- Automatyczna walidacja i sanityzacja

**Local Development:**
- Supabase CLI dla lokalnego developmentu
- Docker containers dla kompletnego środowiska deweloperskiego
- Migracje bazy danych z wersjonowaniem

## Integracja AI

### OpenRouter.ai - AI Gateway
- Unified API dla dostępu do multiple AI providers (Anthropic Claude, OpenAI GPT, Google Gemini)
- Cost optimization przez wybór najbardziej efektywnego modelu
- Built-in rate limiting i spending caps
- Fallback mechanisms w przypadku niedostępności jednego providera
- Transparentne ceny per-token

**Wybór modelu:**
- Development: Claude 3.5 Sonnet (balans jakość/koszt)
- Production: możliwość switchowania między modelami

## Deployment i DevOps

### GitHub Actions - CI/CD
- Automatyczne testy przy każdym push/pull request
- Linting i type checking w pipeline
- Build verification
- Automated deployment po merge do main

### Hosting
**Development/MVP:**
- Vercel dla frontend (zero-config deployment dla Astro)
- Supabase Cloud dla backend (free tier)

**Production (opcjonalnie):**
- DigitalOcean App Platform lub Droplet
- Supabase self-hosted (dla pełnej kontroli nad danymi)
- Docker containerization dla łatwego deploymentu

## Narzędzia Deweloperskie

### Testing
- Playwright - End-to-end testing
- Vitest - Unit testing (opcjonalnie)

### Code Quality
- ESLint - linting JavaScript/TypeScript
- Prettier - code formatting
- Husky - pre-commit hooks (opcjonalnie)

### Monitoring (production)
- Supabase Dashboard - database monitoring
- Vercel Analytics - performance metrics
- OpenRouter Dashboard - AI usage tracking

## Uzasadnienie Wyborów

**Dlaczego Astro?**
- Minimalna ilość JavaScript = szybsze ładowanie strony
- Świetne DX (Developer Experience)
- Łatwa integracja z React dla komponentów wymagających interaktywności

**Dlaczego Supabase?**
- Redukuje czas developmentu (auth, database, API w jednym)
- Open-source = brak vendor lock-in
- Możliwość self-hostingu w przyszłości

**Dlaczego OpenRouter?**
- Elastyczność w wyborze modelu AI
- Kontrola kosztów
- Jeden endpoint dla wielu providerów
