# Test API Endpoint: POST /api/generations

## Uruchomienie serwera
```bash
npm run dev
```

## Przykładowe zapytania (użyj narzędzia jak curl, Postman, lub Thunder Client)

### 1. Test walidacji - za krótki tekst (oczekiwany błąd 400)
```bash
curl -X POST http://localhost:4321/api/generations \
  -H "Content-Type: application/json" \
  -d '{"source_text": "To jest za krótki tekst"}'
```

**Oczekiwany wynik:**
```json
{
  "error": "Błędne dane wejściowe",
  "details": [
    {
      "field": "source_text",
      "message": "Tekst musi zawierać co najmniej 1000 znaków"
    }
  ]
}
```

### 2. Test walidacji - tekst o odpowiedniej długości (1000-10000 znaków)
Potrzebny token autoryzacji z Supabase:

```bash
curl -X POST http://localhost:4321/api/generations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SUPABASE_ACCESS_TOKEN" \
  -d '{"source_text": "Lorem ipsum dolor sit amet... [tekst o długości 1000-10000 znaków]"}'
```

**Oczekiwany wynik (HTTP 201):**
```json
{
  "generation_id": 1,
  "flashcards_proposals": [
    {
      "front": "Pytanie 1 wygenerowane przez AI",
      "back": "Odpowiedź 1 na podstawie tekstu źródłowego",
      "source": "ai-full"
    },
    {
      "front": "Pytanie 2 wygenerowane przez AI",
      "back": "Odpowiedź 2 na podstawie tekstu źródłowego",
      "source": "ai-full"
    }
    // ... więcej propozycji
  ],
  "generated_count": 5
}
```

### 3. Test bez autoryzacji (oczekiwany błąd 401)
```bash
curl -X POST http://localhost:4321/api/generations \
  -H "Content-Type: application/json" \
  -d '{"source_text": "Lorem ipsum... [1000+ znaków]"}'
```

**Oczekiwany wynik:**
```json
{
  "error": "Nieautoryzowany dostęp. Musisz być zalogowany."
}
```

## Weryfikacja w bazie danych

Po pomyślnym wygenerowaniu sprawdź tabele:

### Tabela `generations`
```sql
SELECT * FROM generations ORDER BY created_at DESC LIMIT 1;
```

Powinna zawierać:
- `id` - wygenerowane ID
- `user_id` - ID użytkownika
- `model` - "mock-gpt-4"
- `generated_count` - 5
- `source_text_hash` - hash SHA-256
- `source_text_length` - długość tekstu
- `generation_duration` - czas w ms
- `created_at`, `updated_at` - timestampy

### Tabela `generation_error_logs` (w przypadku błędu)
```sql
SELECT * FROM generation_error_logs ORDER BY created_at DESC LIMIT 1;
```

## Generowanie tekstu testowego (1000+ znaków)

Możesz użyć tego skryptu w Node.js:
```javascript
const testText = "Lorem ipsum dolor sit amet. ".repeat(40); // ~1120 znaków
console.log(JSON.stringify({ source_text: testText }));
```
