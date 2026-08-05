-- Lab results / медкарта: run once in Supabase SQL editor
create table if not exists lab_results (
  id bigint generated always as identity primary key,
  created_at timestamptz default now(),
  child text not null check (child in ('lev','mark')),
  date date not null,
  type text default 'blood',            -- blood | urine | visit | other
  title text,                           -- "Blood test (CBC)"
  value_name text,                      -- e.g. 'hemoglobin'
  value_num numeric,                    -- e.g. 118
  unit text,                            -- 'g/L'
  note text,
  file_urls jsonb default '[]'::jsonb   -- array of storage URLs
);
alter table lab_results enable row level security;
create policy "anon all lab_results" on lab_results
  for all using (true) with check (true);

-- Storage bucket for scans/photos of results:
-- Dashboard → Storage → New bucket: name "labs", public = ON
