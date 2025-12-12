# FlashLearn AI - Inteligentne fiszki edukacyjne

FlashLearn AI to inteligentna aplikacja wspierająca efektywną naukę poprzez automatyczne generowanie i zarządzanie materiałami edukacyjnymi w formie fiszek. System wykorzystuje zaawansowane modele językowe do przekształcania dowolnych treści tekstowych w strukturyzowane pytania i odpowiedzi.

## Funkcjonalności

### Automatyczne generowanie fiszek
- Wklej tekst (800-12000 znaków), a AI automatycznie wygeneruje fiszki
- Generowanie 5-15 fiszek dostosowanych do objętości materiału
- Możliwość akceptacji, edycji lub odrzucenia każdej propozycji

### Zarządzanie kolekcją fiszek
- Przeglądanie wszystkich fiszek w sekcji "Moja Kolekcja"
- Ręczne tworzenie fiszek
- Edycja istniejących fiszek (automatyczne oznaczanie modyfikacji)
- Usuwanie fiszek z potwierdzeniem
- Filtrowanie fiszek według źródła (AI/ręczne)

### System uwierzytelniania
- Bezpieczna rejestracja z walidacją hasła
- Logowanie z zarządzaniem sesją
- Ochrona prywatności danych (Row Level Security)

## Technologie

- **Framework:** [Astro](https://astro.build/) v5.13.7 - szybkie, nowoczesne aplikacje webowe
- **UI Library:** [React](https://react.dev/) v19.1.1 - interaktywne komponenty
- **Język:** [TypeScript](https://www.typescriptlang.org/) v5 - bezpieczeństwo typów
- **Stylowanie:** [Tailwind CSS](https://tailwindcss.com/) v4.1.13 - utility-first CSS
- **Baza danych:** [Supabase](https://supabase.com/) - PostgreSQL z Row Level Security
- **Autentykacja:** Supabase Auth
- **AI Generation:** OpenRouter API
- **Testy:** [Playwright](https://playwright.dev/) - testy E2E
- **CI/CD:** GitHub Actions

## Wymagania

- Node.js v22.14.0 lub nowszy
- npm (dostarczany z Node.js)
- Konto Supabase (darmowe)
- Klucz API OpenRouter (opcjonalnie dla generowania AI)

## Instalacja i uruchomienie

### 1. Klonowanie repozytorium

```bash
git clone https://github.com/your-username/flashlearn-ai.git
cd flashlearn-ai
```

### 2. Instalacja zależności

```bash
npm install
```

### 3. Konfiguracja zmiennych środowiskowych

Skopiuj plik `.env.example` na `.env`:

```bash
cp .env.example .env
```

Następnie edytuj plik `.env` i uzupełnij dane:

```env
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key-here

# OpenRouter API Key
OPENROUTER_API_KEY=sk-or-v1-your-key-here
```

**Gdzie znaleźć dane:**
- Supabase URL i Key: [Supabase Dashboard](https://supabase.com/dashboard) → Twój projekt → Settings → API
- OpenRouter API Key: [OpenRouter Keys](https://openrouter.ai/keys)

### 4. Konfiguracja bazy danych

Projekt używa Supabase jako bazy danych. Migracje są już przygotowane w folderze `supabase/migrations/`.

**Opcja A: Użycie Supabase CLI (zalecane)**

```bash
# Zaloguj się do Supabase
npx supabase login

# Podłącz projekt
npx supabase link --project-ref your-project-ref

# Zastosuj migracje
npx supabase db push
```

**Opcja B: Ręczne wgranie przez Dashboard**

1. Otwórz Supabase Dashboard
2. Przejdź do SQL Editor
3. Skopiuj zawartość pliku `supabase/migrations/20251117143000_create_initial_schema.sql`
4. Uruchom zapytanie

### 5. Uruchomienie serwera deweloperskiego

```bash
npm run dev
```

Aplikacja będzie dostępna pod adresem: [http://localhost:4321](http://localhost:4321)

### 6. Budowanie dla produkcji

```bash
npm run build
```

Zbudowana aplikacja znajdzie się w folderze `dist/`.

### 7. Podgląd wersji produkcyjnej

```bash
npm run preview
```

## Uruchamianie testów

### Instalacja przeglądarek Playwright

```bash
npx playwright install
```

### Uruchomienie testów E2E

```bash
# Testy w trybie headless
npm run test

# Testy z interfejsem UI
npm run test:ui

# Testy z widoczną przeglądarką
npm run test:headed
```

## Dostępne skrypty

- `npm run dev` - Uruchom serwer deweloperski
- `npm run build` - Zbuduj projekt dla produkcji
- `npm run preview` - Podgląd zbudowanej wersji
- `npm run lint` - Sprawdź kod (ESLint)
- `npm run lint:fix` - Napraw błędy lintingu
- `npm run format` - Formatuj kod (Prettier)
- `npm run test` - Uruchom testy E2E
- `npm run test:ui` - Uruchom testy z interfejsem
- `npm run test:headed` - Uruchom testy z widoczną przeglądarką

## Struktura projektu

```
flashlearn-ai/
├── .ai/                      # Dokumenty projektowe (PRD, plany)
├── .github/
│   └── workflows/
│       └── ci.yml           # Pipeline CI/CD
├── src/
│   ├── components/
│   │   ├── auth/            # Komponenty autentykacji
│   │   ├── flashcards/      # Komponenty fiszek
│   │   ├── ui/              # Komponenty UI (shadcn)
│   │   └── Navigation.tsx   # Główna nawigacja
│   ├── db/
│   │   ├── database.types.ts    # Typy bazy danych
│   │   └── supabase.client.ts   # Klient Supabase
│   ├── layouts/
│   │   └── Layout.astro     # Główny layout
│   ├── lib/                 # Usługi i helpery
│   ├── middleware/
│   │   └── index.ts         # Middleware autoryzacji
│   ├── pages/
│   │   ├── api/             # API endpoints
│   │   │   ├── auth/        # Endpointy autentykacji
│   │   │   └── flashcards/  # CRUD fiszek
│   │   ├── index.astro      # Strona główna
│   │   ├── login.astro      # Logowanie
│   │   ├── register.astro   # Rejestracja
│   │   ├── generate.astro   # Generowanie fiszek
│   │   └── flashcards.astro # Lista fiszek
│   └── styles/
│       └── global.css       # Style globalne
├── supabase/
│   └── migrations/          # Migracje bazy danych
├── tests/
│   └── e2e/                 # Testy E2E (Playwright)
├── .env.example             # Przykładowa konfiguracja
├── playwright.config.ts     # Konfiguracja Playwright
└── package.json             # Zależności projektu
```

## Deployment

### Vercel (zalecane)

1. Połącz repozytorium z [Vercel](https://vercel.com)
2. Dodaj zmienne środowiskowe w ustawieniach projektu
3. Deploy automatycznie uruchomi się przy każdym pushu

### Inne platformy

Projekt można wdrożyć na:
- Netlify
- Cloudflare Pages
- AWS Amplify
- Dowolny serwer obsługujący Node.js

## CI/CD

Projekt zawiera skonfigurowany pipeline GitHub Actions, który:
1. Sprawdza kod (linting)
2. Buduje aplikację
3. Uruchamia testy E2E
4. Generuje raporty

Pipeline uruchamia się automatycznie przy:
- Push do branchy `main` lub `develop`
- Otwarciu Pull Request

**Wymagane Secrets w GitHub:**
- `SUPABASE_URL`
- `SUPABASE_KEY`
- `OPENROUTER_API_KEY`

## Bezpieczeństwo

- Row Level Security (RLS) w Supabase izoluje dane użytkowników
- Hasła są haszowane przez Supabase Auth
- Ciasteczka HTTPOnly dla tokenów sesji
- Walidacja danych po stronie serwera i klienta
- Ochrona tras przed nieautoryzowanym dostępem

## Wsparcie dla AI Development

Projekt zawiera konfigurację dla narzędzi AI:
- Cursor IDE: reguły w `.cursor/rules/`
- GitHub Copilot: instrukcje w `.github/copilot-instructions.md`
- Windsurf: konfiguracja w `.windsurfrules`

## Licencja

MIT

## Autor

Projekt zaliczeniowy 10xDevs II

---

**Potrzebujesz pomocy?** Otwórz issue na GitHubie lub skontaktuj się z autorami kursu.
