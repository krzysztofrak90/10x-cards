# Integracja Supabase z Astro - FlashLearn AI

## Przegląd

FlashLearn AI wykorzystuje Supabase jako BaaS (Backend-as-a-Service). Ten dokument opisuje konfigurację integracji Supabase z projektem Astro.

## Wymagania Wstępne

**Weryfikuj przed wykonaniem kroków poniżej:**

- ✅ Projekt używa: Astro 5.x, TypeScript 5.x, React 19.x, Tailwind 4.x
- ✅ Zainstalowany package: `@supabase/supabase-js`
  ```bash
  npm install @supabase/supabase-js
  ```
- ✅ Istnieje plik: `supabase/config.toml` (Supabase CLI init)
- ✅ Istnieje plik: `src/db/database.types.ts` (wygenerowane typy)
  ```bash
  npx supabase gen types typescript --local > src/db/database.types.ts
  ```

**STOP:** Jeśli powyższe warunki nie są spełnione, rozwiąż problemy przed kontynuacją.

## Struktura Plików

```
src/
├── db/
│   ├── supabase.client.ts    # Inicjalizacja klienta Supabase
│   └── database.types.ts      # Typy wygenerowane z bazy danych
├── middleware/
│   └── index.ts               # Middleware dodający Supabase do context
└── env.d.ts                   # Definicje typów dla environment i globals
```

---

## 1. Klient Supabase

**Plik:** `src/db/supabase.client.ts`

```typescript
import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

// Odczyt zmiennych środowiskowych
const supabaseUrl = import.meta.env.SUPABASE_URL;
const supabaseAnonKey = import.meta.env.SUPABASE_KEY;

// Utworzenie klienta z typowaniem bazy danych
export const supabaseClient = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);
```

**Kluczowe elementy:**
- Type parameter `<Database>` zapewnia type-safety dla wszystkich operacji DB
- `persistSession: true` - sesja użytkownika jest zachowywana
- `autoRefreshToken: true` - automatyczne odświeżanie JWT tokenów

---

## 2. Middleware Astro

**Plik:** `src/middleware/index.ts`

```typescript
import { defineMiddleware } from 'astro:middleware';
import { supabaseClient } from '../db/supabase.client';

/**
 * Middleware dodający instancję Supabase client do context.locals
 * Umożliwia dostęp do Supabase w każdej stronie i endpoint
 */
export const onRequest = defineMiddleware((context, next) => {
  // Dodanie klienta do locals
  context.locals.supabase = supabaseClient;

  return next();
});
```

**Korzyści:**
- Centralne miejsce dla logiki Supabase
- `context.locals.supabase` dostępne w `.astro` files i API routes

**Użycie w kodzie:**
```typescript
// W stronie .astro
const { supabase } = Astro.locals;

// W API endpoint
export const GET: APIRoute = async ({ locals }) => {
  const { data } = await locals.supabase
    .from('flashcards')
    .select('*');
  // ...
};
```

---

## 3. Definicje TypeScript

**Plik:** `src/env.d.ts`

```typescript
/// <reference types="astro/client" />

import type { SupabaseClient, Session } from '@supabase/supabase-js';
import type { Database } from './db/database.types';

/**
 * Augmentacja globalnych typów Astro
 */
declare global {
  namespace App {
    interface Locals {
      supabase: SupabaseClient<Database>;
      session: Session | null;
    }
  }
}

/**
 * Typy dla import.meta.env
 */
interface ImportMetaEnv {
  readonly SUPABASE_URL: string;
  readonly SUPABASE_KEY: string;
  readonly OPENROUTER_API_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

export {};
```

**Co to daje:**
- IntelliSense dla `context.locals.supabase`
- IntelliSense dla `import.meta.env.SUPABASE_URL`
- Compile-time errors przy błędach typowania

---

## 4. Zmienne Środowiskowe

**Plik:** `.env` (nie commituj do git!)

```bash
# Supabase Configuration
SUPABASE_URL=http://127.0.0.1:54331
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# AI Generation (opcjonalnie)
OPENROUTER_API_KEY=sk-or-v1-...
```

---

## Weryfikacja Konfiguracji

### Test połączenia z bazą

```typescript
import { supabaseClient } from './src/db/supabase.client';

const testConnection = async () => {
  const { data, error } = await supabaseClient
    .from('flashcards')
    .select('count');

  if (error) {
    console.error('❌ Connection failed:', error);
  } else {
    console.log('✅ Connection successful');
  }
};

testConnection();
```