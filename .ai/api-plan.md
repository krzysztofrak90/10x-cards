# Plan API - FlashLearn AI

## Architektura API

FlashLearn AI wykorzystuje **RESTful API** zbudowane na Astro Server Endpoints. Wszystkie endpointy są chronione przez:
- **Supabase Auth** (JWT tokens)
- **Row Level Security** na poziomie bazy danych
- **Zod validation** dla wszystkich request payloadów

## Konwencje

### Status Codes
- `200 OK` - Sukces operacji GET, PUT
- `201 Created` - Sukces operacji POST (utworzenie zasobu)
- `204 No Content` - Sukces operacji DELETE
- `400 Bad Request` - Błędne dane wejściowe (validation error)
- `401 Unauthorized` - Brak lub nieprawidłowy token autoryzacji
- `403 Forbidden` - Brak uprawnień do zasobu
- `404 Not Found` - Zasób nie istnieje
- `500 Internal Server Error` - Błąd serwera

### Headers
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

### Error Response Format
```json
{
  "error": "Human-readable error message",
  "details": [
    {
      "field": "front",
      "message": "Maksymalna długość to 200 znaków"
    }
  ]
}
```

---

## Endpointy - Authentication

### POST `/api/auth/register`
Rejestracja nowego użytkownika.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Validation:**
- `email`: Poprawny format email, unikalny w systemie
- `password`: Minimum 6 znaków (preferowane 8+)

**Response (201):**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com"
  }
}
```

**Errors:**
- `400` - Nieprawidłowy email lub słabe hasło
- `409` - Email już istnieje w systemie
- `500` - Błąd Supabase Auth

---

### POST `/api/auth/login`
Logowanie użytkownika.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response (200):**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com"
  }
}
```

**Side Effects:**
- Ustawia HTTP-only cookies: `sb-access-token`, `sb-refresh-token`
- Session jest zarządzana przez Supabase

**Errors:**
- `400` - Brak wymaganych pól
- `401` - Nieprawidłowe dane logowania
- `500` - Błąd Supabase Auth

---

### POST `/api/auth/logout`
Wylogowanie użytkownika.

**Request:** Brak body (wykorzystuje cookies)

**Response (200):**
```json
{
  "message": "Logged out successfully"
}
```

**Side Effects:**
- Usuwa cookies sesji
- Invalidates JWT token w Supabase

---

## Endpointy - Flashcards

### GET `/api/flashcards`
Pobiera listę fiszek użytkownika.

**Query Parameters:**
- `source` (optional) - Filtruj po źródle: `ai-full`, `ai-edited`, `manual`
- `page` (optional, default: 1) - Numer strony (dla paginacji)
- `limit` (optional, default: 50) - Liczba wyników per strona
- `sort` (optional, default: `created_at`) - Kolumna sortowania
- `order` (optional, default: `desc`) - Kierunek sortowania: `asc`, `desc`

**Example:**
```
GET /api/flashcards?source=ai-full&page=1&limit=20
```

**Response (200):**
```json
{
  "flashcards": [
    {
      "id": 1,
      "front": "Co to jest React?",
      "back": "Biblioteka JavaScript do budowania interfejsów użytkownika",
      "source": "ai-full",
      "generation_id": 42,
      "created_at": "2025-01-15T10:30:00Z",
      "updated_at": "2025-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8
  }
}
```

**Authorization:**
- RLS automatycznie filtruje fiszki tylko tego użytkownika

**Errors:**
- `401` - Brak autoryzacji

---

### GET `/api/flashcards/:id`
Pobiera szczegóły pojedynczej fiszki.

**Response (200):**
```json
{
  "id": 1,
  "front": "Co to jest React?",
  "back": "Biblioteka JavaScript do budowania interfejsów użytkownika",
  "source": "ai-full",
  "generation_id": 42,
  "created_at": "2025-01-15T10:30:00Z",
  "updated_at": "2025-01-15T10:30:00Z"
}
```

**Errors:**
- `401` - Brak autoryzacji
- `404` - Fiszka nie istnieje lub nie należy do użytkownika (RLS)

---

### POST `/api/flashcards`
Tworzy nowe fiszki (bulk create - jedna lub więcej).

**Request Body:**
```json
{
  "flashcards": [
    {
      "front": "Pytanie 1",
      "back": "Odpowiedź 1",
      "source": "manual",
      "generation_id": null
    },
    {
      "front": "Pytanie 2",
      "back": "Odpowiedź 2",
      "source": "ai-full",
      "generation_id": 42
    }
  ]
}
```

**Validation:**
- `front`: Required, max 200 znaków
- `back`: Required, max 500 znaków
- `source`: Required, enum: `'ai-full'`, `'ai-edited'`, `'manual'`
- `generation_id`:
  - Required dla `ai-full` i `ai-edited`
  - Musi być `null` dla `manual`
  - Musi istnieć w tabeli `generations` i należeć do użytkownika

**Response (201):**
```json
{
  "flashcards": [
    {
      "id": 1,
      "front": "Pytanie 1",
      "back": "Odpowiedź 1",
      "source": "manual",
      "generation_id": null,
      "created_at": "2025-01-15T10:30:00Z"
    }
  ],
  "created_count": 1
}
```

**Errors:**
- `400` - Validation errors (każda fiszka jest walidowana osobno)
- `401` - Brak autoryzacji
- `500` - Błąd zapisu do bazy

---

### PUT `/api/flashcards/:id`
Aktualizuje istniejącą fiszkę.

**Request Body:**
```json
{
  "front": "Zaktualizowane pytanie",
  "back": "Zaktualizowana odpowiedź"
}
```

**Validation:**
- Wszystkie pola opcjonalne (można update część pól)
- `front`: max 200 znaków (jeśli podane)
- `back`: max 500 znaków (jeśli podane)
- `source` nie może być zmieniony przez ten endpoint

**Response (200):**
```json
{
  "id": 1,
  "front": "Zaktualizowane pytanie",
  "back": "Zaktualizowana odpowiedź",
  "source": "manual",
  "generation_id": null,
  "created_at": "2025-01-15T10:30:00Z",
  "updated_at": "2025-01-15T11:45:00Z"
}
```

**Side Effects:**
- Trigger automatycznie update'uje `updated_at`

**Errors:**
- `400` - Validation errors
- `401` - Brak autoryzacji
- `404` - Fiszka nie istnieje lub nie należy do użytkownika

---

### DELETE `/api/flashcards/:id`
Usuwa fiszkę.

**Response (200):**
```json
{
  "message": "Fiszka została usunięta",
  "id": 1
}
```

**Errors:**
- `401` - Brak autoryzacji
- `404` - Fiszka nie istnieje lub nie należy do użytkownika

---

## Endpointy - AI Generation

### POST `/api/generations`
Inicjuje proces generowania fiszek przez AI.

**Request Body:**
```json
{
  "source_text": "Długi tekst do analizy (min 800, max 12000 znaków)..."
}
```

**Validation:**
- `source_text`: Required, min 800 znaków, max 12000 znaków

**Business Logic:**
1. Walidacja długości tekstu
2. Obliczenie SHA-256 hash z `source_text`
3. Wywołanie OpenRouter API (Claude 3.5 Sonnet)
4. Parsowanie JSON response z AI
5. Zapis metadanych do tabeli `generations`
6. Zwrócenie propozycji fiszek do frontend

**Response (201):**
```json
{
  "generation_id": 42,
  "flashcards_proposals": [
    {
      "front": "Co to jest TypeScript?",
      "back": "Nadzbiór JavaScript z statycznym typowaniem",
      "source": "ai-full"
    },
    {
      "front": "Jakie są zalety TypeScript?",
      "back": "Lepsze tooling, wczesne wykrywanie błędów, dokumentacja przez typy",
      "source": "ai-full"
    }
  ],
  "generated_count": 5
}
```

**Timeout:**
- Maksymalny czas: 60 sekund
- Po przekroczeniu zwraca `500` z timeout error

**Errors:**
- `400` - Validation error (tekst za krótki/długi)
- `401` - Brak autoryzacji
- `500` - Błąd AI API (zapisywany do `generation_error_logs`)
  - Brak klucza API
  - Rate limit exceeded
  - AI model unavailable
  - Parsing error (AI nie zwrócił valid JSON)

**Error Logging:**
- Każdy błąd 500 jest logowany do `generation_error_logs`:
  ```json
  {
    "user_id": "uuid",
    "model": "anthropic/claude-3.5-sonnet",
    "error_code": "OPENROUTER_API_ERROR",
    "error_message": "Rate limit exceeded",
    "source_text_hash": "sha256...",
    "source_text_length": 1500
  }
  ```

---

### GET `/api/generations`
Pobiera historię generacji użytkownika.

**Query Parameters:**
- `page`, `limit`, `sort`, `order` - analogicznie jak w flashcards

**Response (200):**
```json
{
  "generations": [
    {
      "id": 42,
      "model": "anthropic/claude-3.5-sonnet",
      "generated_count": 5,
      "accepted_unedited_count": 3,
      "accepted_edited_count": 1,
      "source_text_length": 1500,
      "generation_duration": 2340,
      "created_at": "2025-01-15T10:30:00Z"
    }
  ]
}
```

**Use Cases:**
- Wyświetlanie historii generacji w UI
- Analityka użycia AI
- Cost tracking

---

### GET `/api/generations/:id`
Pobiera szczegóły konkretnej generacji wraz z powiązanymi fiszkami.

**Response (200):**
```json
{
  "id": 42,
  "model": "anthropic/claude-3.5-sonnet",
  "generated_count": 5,
  "accepted_unedited_count": 3,
  "accepted_edited_count": 1,
  "source_text_hash": "abc123...",
  "source_text_length": 1500,
  "generation_duration": 2340,
  "created_at": "2025-01-15T10:30:00Z",
  "flashcards": [
    {
      "id": 1,
      "front": "...",
      "back": "...",
      "source": "ai-full"
    }
  ]
}
```

**Errors:**
- `401` - Brak autoryzacji
- `404` - Generacja nie istnieje lub nie należy do użytkownika

---

## Security & Best Practices

### Authentication Flow
1. User loguje się przez `/api/auth/login`
2. Backend ustawia HTTP-only cookies z JWT
3. Każdy protected endpoint:
   - Czyta cookies
   - Weryfikuje JWT przez Supabase
   - Uzyskuje `user_id` z tokena
   - RLS w bazie automatycznie filtruje dane

### Rate Limiting (opcjonalne w production)
- `/api/generations`: Max 10 requestów / godzinę per user
- `/api/auth/login`: Max 5 prób / 15 minut per IP

### CORS
- Development: `http://localhost:4321`
- Production: Tylko frontend domain

### Input Sanitization
- Wszystkie endpointy używają **Zod** do walidacji
- HTML entities są escapowane w responses
- SQL injection jest niemożliwy dzięki Supabase SDK (prepared statements)

### Logging
- Wszystkie requesty logowane w console (development)
- Production: Structured logging do Supabase logs lub external service
- PII (email, hasła) nigdy nie są logowane
