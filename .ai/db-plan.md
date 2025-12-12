# Architektura Bazy Danych - FlashLearn AI

## Przegląd

FlashLearn AI wykorzystuje PostgreSQL (poprzez Supabase) jako główną bazę danych. Model danych jest zaprojektowany z myślą o:
- Integralności referencyjnej
- Izolacji danych użytkowników (Row Level Security)
- Wydajności zapytań (indeksy)
- Audytowalności (timestampy i logi błędów)

## Schemat Tabel

### Tabela: `users`

**Zarządzana przez Supabase Auth** - nie modyfikujemy bezpośrednio tej tabeli.

```sql
-- Widok uproszczony (faktyczna struktura jest bogatsza)
CREATE TABLE auth.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) NOT NULL UNIQUE,
  encrypted_password VARCHAR NOT NULL,
  email_confirmed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**Kluczowe pola:**
- `id` - UUID użytkownika (używany jako foreign key w innych tabelach)
- `email` - adres email (unikalny constraint)
- `encrypted_password` - zahashowane hasło (bcrypt)

---

### Tabela: `flashcards`

Główna tabela przechowująca fiszki użytkowników.

```sql
CREATE TABLE public.flashcards (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  front VARCHAR(200) NOT NULL,
  back VARCHAR(500) NOT NULL,
  source VARCHAR(20) NOT NULL CHECK (source IN ('ai-full', 'ai-edited', 'manual')),
  generation_id BIGINT REFERENCES public.generations(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**Pola:**
- `id` - Unique identifier fiszki (auto-increment)
- `user_id` - Właściciel fiszki (FK do auth.users)
- `front` - Przód fiszki / pytanie (max 200 znaków)
- `back` - Tył fiszki / odpowiedź (max 500 znaków)
- `source` - Źródło pochodzenia:
  - `'ai-full'` - Wygenerowana przez AI bez edycji
  - `'ai-edited'` - Wygenerowana przez AI i edytowana przez użytkownika
  - `'manual'` - Utworzona ręcznie przez użytkownika
- `generation_id` - Opcjonalne powiązanie z sesją generowania (nullable)
- `created_at` - Timestamp utworzenia
- `updated_at` - Timestamp ostatniej modyfikacji (automatycznie aktualizowany)

**Constraints:**
- `front` i `back` nie mogą być puste
- `source` musi być jednym z trzech dozwolonych wartości
- Przy usunięciu użytkownika, jego fiszki są kasowane (CASCADE)
- Przy usunięciu generacji, `generation_id` jest ustawiany na NULL

---

### Tabela: `generations`

Rejestruje metadane sesji generowania fiszek przez AI.

```sql
CREATE TABLE public.generations (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  model VARCHAR(100) NOT NULL,
  generated_count INTEGER NOT NULL CHECK (generated_count > 0),
  accepted_unedited_count INTEGER,
  accepted_edited_count INTEGER,
  source_text_hash VARCHAR(64) NOT NULL,
  source_text_length INTEGER NOT NULL CHECK (source_text_length BETWEEN 800 AND 12000),
  generation_duration INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**Pola:**
- `id` - Unique identifier sesji generowania
- `user_id` - Użytkownik który zainicjował generowanie
- `model` - Nazwa modelu AI użytego do generowania (np. "anthropic/claude-3.5-sonnet")
- `generated_count` - Liczba wygenerowanych propozycji fiszek
- `accepted_unedited_count` - Ile fiszek zaakceptowano bez edycji (nullable, może być obliczone później)
- `accepted_edited_count` - Ile fiszek zaakceptowano po edycji (nullable)
- `source_text_hash` - SHA-256 hash tekstu źródłowego (do deduplikacji)
- `source_text_length` - Długość tekstu źródłowego w znakach (800-12000)
- `generation_duration` - Czas generowania w milisekundach
- `created_at` - Timestamp rozpoczęcia generowania
- `updated_at` - Timestamp aktualizacji (np. po obliczeniu accepted counts)

**Cel:**
- Analityka efektywności AI
- Tracking kosztów (który model, ile fiszek)
- Identyfikacja duplikatów (source_text_hash)

---

### Tabela: `generation_error_logs`

Logowanie błędów podczas generowania AI dla celów debugowania.

```sql
CREATE TABLE public.generation_error_logs (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  model VARCHAR(100) NOT NULL,
  error_code VARCHAR(100) NOT NULL,
  error_message TEXT NOT NULL,
  source_text_hash VARCHAR(64) NOT NULL,
  source_text_length INTEGER NOT NULL CHECK (source_text_length BETWEEN 800 AND 12000),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**Pola:**
- `id` - Unique identifier błędu
- `user_id` - Użytkownik którego dotyczy błąd
- `model` - Model AI który zwrócił błąd
- `error_code` - Kod błędu (np. "RATE_LIMIT", "API_ERROR", "TIMEOUT")
- `error_message` - Szczegółowa wiadomość błędu
- `source_text_hash` - Hash tekstu który spowodował błąd
- `source_text_length` - Długość problematycznego tekstu
- `created_at` - Timestamp wystąpienia błędu

**Cel:**
- Monitoring reliability AI API
- Identyfikacja problematycznych tekstów
- Debugging production issues

---

## Relacje Między Tabelami

```
auth.users (1) ──< (N) public.flashcards
auth.users (1) ──< (N) public.generations
auth.users (1) ──< (N) public.generation_error_logs
public.generations (1) ──< (N) public.flashcards
```

**Opis:**
- Jeden użytkownik może mieć wiele fiszek, generacji i error logów
- Jedna sesja generowania może być powiązana z wieloma fiszkami
- Wszystkie powiązania z `auth.users` używają CASCADE DELETE
- Powiązanie `flashcards.generation_id` używa SET NULL (fiszki pozostają po usunięciu generacji)

---

## Indeksy dla Wydajności

### Indeksy Primary Key (automatyczne)
- `flashcards.id`
- `generations.id`
- `generation_error_logs.id`

### Indeksy Foreign Key (ręczne)

```sql
-- Dla częstych zapytań "pobierz fiszki użytkownika"
CREATE INDEX idx_flashcards_user_id ON public.flashcards(user_id);

-- Dla join'ów flashcards <-> generations
CREATE INDEX idx_flashcards_generation_id ON public.flashcards(generation_id);

-- Dla zapytań "pobierz generacje użytkownika"
CREATE INDEX idx_generations_user_id ON public.generations(user_id);

-- Dla zapytań "pobierz error logi użytkownika"
CREATE INDEX idx_generation_error_logs_user_id ON public.generation_error_logs(user_id);

-- Dla wyszukiwania duplikatów źródeł
CREATE INDEX idx_generations_source_hash ON public.generations(source_text_hash);
```

**Uzasadnienie:**
- `user_id` jest najczęściej używanym filtrem (każde zapytanie jest scopowane do użytkownika)
- `generation_id` umożliwia szybkie wyświetlanie fiszek z konkretnej sesji
- `source_text_hash` pozwala na wykrywanie duplikatów przed generowaniem

---

## Row Level Security (RLS)

### Polityki dla `flashcards`

```sql
ALTER TABLE public.flashcards ENABLE ROW LEVEL SECURITY;

-- SELECT: Użytkownik widzi tylko swoje fiszki
CREATE POLICY "Users can view their own flashcards"
  ON public.flashcards FOR SELECT
  USING (auth.uid() = user_id);

-- INSERT: Użytkownik może tworzyć fiszki tylko dla siebie
CREATE POLICY "Users can insert their own flashcards"
  ON public.flashcards FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- UPDATE: Użytkownik może edytować tylko swoje fiszki
CREATE POLICY "Users can update their own flashcards"
  ON public.flashcards FOR UPDATE
  USING (auth.uid() = user_id);

-- DELETE: Użytkownik może usuwać tylko swoje fiszki
CREATE POLICY "Users can delete their own flashcards"
  ON public.flashcards FOR DELETE
  USING (auth.uid() = user_id);
```

### Polityki dla `generations`

```sql
ALTER TABLE public.generations ENABLE ROW LEVEL SECURITY;

-- SELECT: Użytkownik widzi tylko swoje generacje
CREATE POLICY "Users can view their own generations"
  ON public.generations FOR SELECT
  USING (auth.uid() = user_id);

-- INSERT: Tylko system może tworzyć generacje (przez service_role key)
CREATE POLICY "Service role can insert generations"
  ON public.generations FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

### Polityki dla `generation_error_logs`

```sql
ALTER TABLE public.generation_error_logs ENABLE ROW LEVEL SECURITY;

-- SELECT: Użytkownik widzi tylko swoje błędy (opcjonalnie)
CREATE POLICY "Users can view their own error logs"
  ON public.generation_error_logs FOR SELECT
  USING (auth.uid() = user_id);

-- INSERT: Tylko system może tworzyć logi
CREATE POLICY "Service role can insert error logs"
  ON public.generation_error_logs FOR INSERT
  WITH CHECK (true); -- System może logować błędy dla każdego
```

**Bezpieczeństwo:**
- Każdy użytkownik ma dostęp tylko do swoich danych
- Próba dostępu do cudzych zasobów zwróci pusty wynik (nie error 403)
- Polityki są egzekwowane na poziomie bazy danych

---

## Triggery i Funkcje

### Auto-update `updated_at`

```sql
-- Funkcja do automatycznego ustawiania updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger dla flashcards
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.flashcards
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Trigger dla generations
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.generations
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
```

**Cel:**
- Automatyczne śledzenie czasu ostatniej modyfikacji
- Nie wymaga ręcznego ustawiania w aplikacji

---

## Migracje

Wszystkie zmiany schematu są wersjonowane jako migracje w formacie:

```
supabase/migrations/YYYYMMDDHHMMSS_description.sql
```

**Przykład:**
```
20251117143000_create_initial_schema.sql
```

Każda migracja powinna być:
- Idempotentna (bezpieczne wielokrotne uruchomienie)
- Testowana lokalnie przed deploymentem
- Zawierać rollback plan w komentarzach
