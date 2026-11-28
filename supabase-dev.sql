-- Development / Развитие: ticks "done" for games. Run once in Supabase SQL editor.
create table if not exists dev_entries (
  id bigint generated always as identity primary key,
  created_at timestamptz default now(),
  child text not null check (child in ('lev','mark')),
  date date not null,
  activity text not null,          -- exercise id from dev.js, e.g. 'cruise', 'book'
  note text
);
create index if not exists dev_entries_date on dev_entries(date);
alter table dev_entries enable row level security;
create policy "anon all dev_entries" on dev_entries
  for all using (true) with check (true);
