# Implementacja Endpointu: POST /api/generations

## Cel i Zakres

Endpoint `POST /api/generations` odpowiada za orkiestrację procesu generowania fiszek przez AI. Główne zadania:

1. **Walidacja** - Sprawdzenie długości i formatu tekstu źródłowego (800-12000 znaków)
2. **AI Integration** - Wywołanie OpenRouter API z modelem Claude 3.5 Sonnet
3. **Persistence** - Zapis metryk generowania do tabeli `generations`
4. **Error Handling** - Logowanie błędów do `generation_error_logs`
5. **Response** - Zwrócenie propozycji fiszek do frontend

---

## Request Specification

**HTTP Method:** `POST`
**Path:** `/api/generations`
**Content-Type:** `application/json`

### Request Body

```typescript
interface GenerateFlashcardsCommand {
  source_text: string; // 800-12000 characters
}
```

**Przykład:**
```json
{
  "source_text": "React to biblioteka JavaScript służąca do budowania interfejsów użytkownika... [800-12000 znaków]"
}
```

### Validation Rules (Zod Schema)

```typescript
const GenerateFlashcardsSchema = z.object({
  source_text: z.string()
    .min(800, 'Tekst musi zawierać co najmniej 800 znaków')
    .max(12000, 'Tekst nie może być dłuższy niż 12000 znaków')
    .trim()
});
```

---

## Response Specification

### Success Response (201 Created)

```typescript
interface CreateGenerationResponse {
  generation_id: number;
  flashcards_proposals: FlashcardProposalDTO[];
  generated_count: number;
}

interface FlashcardProposalDTO {
  front: string;
  back: string;
  source: 'ai-full';
}
```

**Przykład:**
```json
{
  "generation_id": 42,
  "flashcards_proposals": [
    {
      "front": "Co to jest React?",
      "back": "Biblioteka JavaScript do budowania interfejsów użytkownika",
      "source": "ai-full"
    },
    {
      "front": "Jakie są główne cechy React?",
      "back": "Komponentowa architektura, Virtual DOM, jednokierunkowy przepływ danych",
      "source": "ai-full"
    }
  ],
  "generated_count": 5
}
```

### Error Responses

**400 Bad Request** - Validation Error
```json
{
  "error": "Błędne dane wejściowe",
  "details": [
    {
      "field": "source_text",
      "message": "Tekst musi zawierać co najmniej 800 znaków"
    }
  ]
}
```

**401 Unauthorized** - Missing/Invalid Auth
```json
{
  "error": "Nieautoryzowany dostęp. Musisz być zalogowany."
}
```

**500 Internal Server Error** - AI/Database Failure
```json
{
  "error": "Wewnętrzny błąd serwera podczas generowania fiszek"
}
```

---

## Implementation Flow

### Phase 1: Request Validation

```typescript
// 1. Parse request body
const body = await context.request.json();

// 2. Validate with Zod
const validationResult = GenerateFlashcardsSchema.safeParse(body);

if (!validationResult.success) {
  return new Response(
    JSON.stringify({
      error: 'Błędne dane wejściowe',
      details: validationResult.error.errors
    }),
    { status: 400 }
  );
}

const { source_text } = validationResult.data;
```

### Phase 2: Authentication Check

```typescript
// Get authenticated user from Supabase
const { data: { user }, error: authError } =
  await context.locals.supabase.auth.getUser();

if (authError || !user) {
  return new Response(
    JSON.stringify({ error: 'Nieautoryzowany dostęp' }),
    { status: 401 }
  );
}
```

### Phase 3: AI Generation Service

```typescript
// Initialize generation service
const generationService = new GenerationService(context.locals.supabase);

// Call AI to generate flashcards
const result = await generationService.generateFlashcards(
  source_text,
  user.id
);
```

**GenerationService Responsibilities:**

1. **Hash Calculation**
   ```typescript
   const sourceTextHash = await crypto.subtle.digest('SHA-256', encoder.encode(source_text));
   ```

2. **OpenRouter API Call**
   ```typescript
   const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
     method: 'POST',
     headers: {
       'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
       'Content-Type': 'application/json'
     },
     body: JSON.stringify({
       model: 'anthropic/claude-3.5-sonnet',
       messages: [{ role: 'user', content: prompt }],
       temperature: 0.7,
       max_tokens: 2000
     })
   });
   ```

3. **Response Parsing**
   ```typescript
   const aiResponse = data.choices[0].message.content;
   const flashcardsData = JSON.parse(aiResponse); // Extract JSON from AI response
   ```

4. **Database Persistence**
   ```typescript
   const { data: generation } = await supabase
     .from('generations')
     .insert({
       user_id: userId,
       model: 'anthropic/claude-3.5-sonnet',
       generated_count: flashcardsData.length,
       source_text_hash: hashHex,
       source_text_length: source_text.length,
       generation_duration: Date.now() - startTime
     })
     .select()
     .single();
   ```

### Phase 4: Error Logging

```typescript
// On AI or DB error
await supabase.from('generation_error_logs').insert({
  user_id: userId,
  model: AI_MODEL,
  error_code: errorCode,
  error_message: errorMessage,
  source_text_hash: hashHex,
  source_text_length: source_text.length
});
```

### Phase 5: Response Return

```typescript
return new Response(
  JSON.stringify(result),
  {
    status: 201,
    headers: { 'Content-Type': 'application/json' }
  }
);
```

---

## Security Considerations

### Authentication & Authorization
- **JWT Verification:** Every request must include valid Supabase JWT token
- **User Scoping:** All operations scoped to authenticated user's ID
- **RLS Enforcement:** Database-level Row Level Security enforces data isolation

### Input Validation
- **Length Constraints:** 800-12000 characters (prevents abuse)
- **Type Safety:** Zod schema ensures correct data types
- **Sanitization:** Text is trimmed and validated before processing

### Error Information Disclosure
- **User-Facing Errors:** Generic messages only ("Błąd generowania")
- **Detailed Logging:** Full error details logged server-side only
- **No Stack Traces:** Never expose stack traces to client

### Rate Limiting (Production)
- **Per-User Limit:** 10 generations per hour
- **IP-Based Limit:** 20 requests per hour per IP (prevents abuse)
- **Implementation:** Middleware or external service (e.g., Upstash Rate Limit)

---

## Performance Optimization

### Timeouts
```typescript
const GENERATION_TIMEOUT_MS = 60000; // 60 seconds

const timeoutPromise = new Promise((_, reject) =>
  setTimeout(() => reject(new Error('Generation timeout')), GENERATION_TIMEOUT_MS)
);

const result = await Promise.race([
  generationService.generateFlashcards(source_text, user.id),
  timeoutPromise
]);
```

### Async Processing (Future Enhancement)
- Queue-based system for heavy loads
- Return `generation_id` immediately
- Client polls for completion status
- Reduces blocking requests

### Caching (Optional)
```typescript
// Check if identical source_text was already processed
const cachedGeneration = await supabase
  .from('generations')
  .select('*')
  .eq('source_text_hash', hashHex)
  .eq('user_id', userId)
  .order('created_at', { ascending: false })
  .limit(1)
  .maybeSingle();

if (cachedGeneration && isFresh(cachedGeneration.created_at)) {
  // Return cached results
}
```

---

## Monitoring & Observability

### Metrics to Track
- **Request Count:** Total generations per hour/day
- **Success Rate:** % of successful vs failed generations
- **Average Duration:** Mean time from request to response
- **AI Model Costs:** Track OpenRouter usage and costs
- **Error Rate by Type:** Validation vs AI vs DB errors

### Logging Strategy
```typescript
console.log('[POST /api/generations] Rozpoczęcie procesu generowania', {
  userId: user.id,
  sourceTextLength: source_text.length,
  timestamp: new Date().toISOString()
});

console.log('[POST /api/generations] Generowanie zakończone sukcesem', {
  generationId: result.generation_id,
  generatedCount: result.generated_count,
  totalDuration: `${totalDuration}ms`
});
```

---

## Testing Strategy

### Unit Tests
- Test validation logic with various input lengths
- Test hash calculation consistency
- Test error handling paths

### Integration Tests
- Mock OpenRouter API responses
- Test database insertion and retrieval
- Test error logging functionality

### E2E Tests
- Full flow: auth → generate → verify DB state
- Test with actual AI responses (in staging)
- Verify frontend receives correct data structure

---

## Deployment Checklist

- [ ] Environment variable `OPENROUTER_API_KEY` configured
- [ ] Database migrations applied (`generations` and `generation_error_logs` tables exist)
- [ ] RLS policies active on both tables
- [ ] Supabase Auth middleware properly configured
- [ ] Error monitoring service connected (e.g., Sentry)
- [ ] Rate limiting implemented
- [ ] Load testing performed (expected 100 concurrent users)
- [ ] Documentation updated with API examples
