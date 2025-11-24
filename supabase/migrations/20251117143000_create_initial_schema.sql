-- migration: create initial schema for 10xcards application
-- description: creates tables for flashcards, generations, and error logs with rls policies
-- affected tables: flashcards, generations, generation_error_logs
-- notes:
--   - users table is managed by supabase auth and is not created here
--   - all tables have rls enabled with policies for authenticated users
--   - trigger automatically updates updated_at column in flashcards table

-- ============================================================================
-- table: generations
-- ============================================================================
-- stores metadata about ai generation sessions including model used,
-- counts of generated and accepted flashcards, and performance metrics

create table generations (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  model varchar not null,
  generated_count integer not null,
  accepted_unedited_count integer,
  accepted_edited_count integer,
  source_text_hash varchar not null,
  source_text_length integer not null check (source_text_length between 1000 and 10000),
  generation_duration integer not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- create index on user_id for efficient filtering by user
create index idx_generations_user_id on generations(user_id);

-- add helpful comment to the table
comment on table generations is 'stores metadata about ai flashcard generation sessions';
comment on column generations.source_text_hash is 'hash of the source text used for generation to prevent duplicates';
comment on column generations.source_text_length is 'length of source text in characters, must be between 1000 and 10000';
comment on column generations.generation_duration is 'duration of generation process in milliseconds';

-- ============================================================================
-- table: flashcards
-- ============================================================================
-- stores individual flashcards with front/back content and source tracking

create table flashcards (
  id bigserial primary key,
  front varchar(200) not null,
  back varchar(500) not null,
  source varchar not null check (source in ('ai-full', 'ai-edited', 'manual')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  generation_id bigint references generations(id) on delete set null,
  user_id uuid not null references auth.users(id) on delete cascade
);

-- create indexes for efficient querying
create index idx_flashcards_user_id on flashcards(user_id);
create index idx_flashcards_generation_id on flashcards(generation_id);

-- add helpful comments to the table
comment on table flashcards is 'stores user flashcards with front and back content';
comment on column flashcards.source is 'indicates how the flashcard was created: ai-full (fully ai generated), ai-edited (ai generated but user edited), or manual (user created)';
comment on column flashcards.generation_id is 'optional reference to the generation session that created this flashcard';

-- ============================================================================
-- trigger: auto-update updated_at on flashcards
-- ============================================================================
-- automatically updates the updated_at timestamp whenever a flashcard is modified

-- create the trigger function that updates the updated_at column
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- attach the trigger to the flashcards table
create trigger trigger_flashcards_updated_at
  before update on flashcards
  for each row
  execute function update_updated_at_column();

comment on function update_updated_at_column is 'automatically sets updated_at to current timestamp on row update';

-- ============================================================================
-- table: generation_error_logs
-- ============================================================================
-- stores errors that occurred during ai generation attempts for debugging and monitoring

create table generation_error_logs (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  model varchar not null,
  source_text_hash varchar not null,
  source_text_length integer not null check (source_text_length between 1000 and 10000),
  error_code varchar(100) not null,
  error_message text not null,
  created_at timestamptz not null default now()
);

-- create index on user_id for efficient filtering by user
create index idx_generation_error_logs_user_id on generation_error_logs(user_id);

-- add helpful comments to the table
comment on table generation_error_logs is 'logs errors that occur during flashcard generation attempts';
comment on column generation_error_logs.error_code is 'standardized error code for categorizing errors';
comment on column generation_error_logs.error_message is 'detailed error message for debugging';

-- ============================================================================
-- row level security (rls) policies
-- ============================================================================
-- enable rls on all tables to ensure users can only access their own data

-- enable rls on generations table
alter table generations enable row level security;

-- policy: authenticated users can select their own generations
create policy "authenticated users can select own generations"
  on generations
  for select
  to authenticated
  using (auth.uid() = user_id);

-- policy: authenticated users can insert their own generations
create policy "authenticated users can insert own generations"
  on generations
  for insert
  to authenticated
  with check (auth.uid() = user_id);

-- policy: authenticated users can update their own generations
create policy "authenticated users can update own generations"
  on generations
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- policy: authenticated users can delete their own generations
create policy "authenticated users can delete own generations"
  on generations
  for delete
  to authenticated
  using (auth.uid() = user_id);

-- policy: anonymous users cannot access generations
-- (no policy needed - rls will deny by default)

-- enable rls on flashcards table
alter table flashcards enable row level security;

-- policy: authenticated users can select their own flashcards
create policy "authenticated users can select own flashcards"
  on flashcards
  for select
  to authenticated
  using (auth.uid() = user_id);

-- policy: authenticated users can insert their own flashcards
create policy "authenticated users can insert own flashcards"
  on flashcards
  for insert
  to authenticated
  with check (auth.uid() = user_id);

-- policy: authenticated users can update their own flashcards
create policy "authenticated users can update own flashcards"
  on flashcards
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- policy: authenticated users can delete their own flashcards
create policy "authenticated users can delete own flashcards"
  on flashcards
  for delete
  to authenticated
  using (auth.uid() = user_id);

-- policy: anonymous users cannot access flashcards
-- (no policy needed - rls will deny by default)

-- enable rls on generation_error_logs table
alter table generation_error_logs enable row level security;

-- policy: authenticated users can select their own error logs
create policy "authenticated users can select own error logs"
  on generation_error_logs
  for select
  to authenticated
  using (auth.uid() = user_id);

-- policy: authenticated users can insert their own error logs
create policy "authenticated users can insert own error logs"
  on generation_error_logs
  for insert
  to authenticated
  with check (auth.uid() = user_id);

-- policy: authenticated users can update their own error logs
-- note: updates to error logs are typically not needed, but included for completeness
create policy "authenticated users can update own error logs"
  on generation_error_logs
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- policy: authenticated users can delete their own error logs
create policy "authenticated users can delete own error logs"
  on generation_error_logs
  for delete
  to authenticated
  using (auth.uid() = user_id);

-- policy: anonymous users cannot access error logs
-- (no policy needed - rls will deny by default)

-- ============================================================================
-- end of migration
-- ============================================================================
