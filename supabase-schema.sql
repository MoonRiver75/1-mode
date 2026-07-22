create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  device_id text unique not null,
  display_name text default '1 MODE',
  identity_goal text default 'Atleta en recuperación y aprendiz de por vida',
  created_at timestamptz default now()
);

create table if not exists settings (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id) on delete cascade,
  wake_time time default '06:15',
  sleep_time time default '22:45',
  screens_off_time time default '22:15',
  target_sleep_hours numeric default 7.5,
  created_at timestamptz default now()
);

create table if not exists daily_logs (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id) on delete cascade,
  log_date date not null,
  heavy_day boolean default false,
  progress integer default 0,
  created_at timestamptz default now(),
  unique(profile_id, log_date)
);

create table if not exists habit_completions (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id) on delete cascade,
  log_date date not null,
  habit_id text not null,
  completed boolean default false,
  block text check (block in ('mañana', 'trabajo', 'noche')),
  created_at timestamptz default now(),
  unique(profile_id, log_date, habit_id)
);

create table if not exists sleep_logs (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id) on delete cascade,
  log_date date not null,
  sleep_hours numeric not null,
  quality integer check (quality between 1 and 5),
  created_at timestamptz default now()
);

create table if not exists mood_logs (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id) on delete cascade,
  log_date date not null,
  anxiety integer check (anxiety between 1 and 5),
  energy integer check (energy between 1 and 5),
  stress integer check (stress between 1 and 5),
  created_at timestamptz default now()
);

create table if not exists body_metrics (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id) on delete cascade,
  log_date date not null,
  steps integer default 0,
  weight_kg numeric,
  waist_cm numeric,
  created_at timestamptz default now()
);

create table if not exists workouts (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id) on delete cascade,
  log_date date not null,
  workout_type text check (workout_type in ('gym', 'casa', 'caminar', 'descanso')),
  minutes integer default 0,
  notes text,
  created_at timestamptz default now()
);

create table if not exists learning_logs (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id) on delete cascade,
  log_date date not null,
  deep_work_minutes integer default 0,
  topic text,
  project text,
  friction_note text,
  created_at timestamptz default now()
);

create table if not exists insights (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id) on delete cascade,
  log_date date not null,
  insight text not null,
  source text default 'rules-engine',
  created_at timestamptz default now()
);

create table if not exists rescue_prompts (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id) on delete cascade,
  log_date date not null,
  problem text not null,
  step_one text,
  completed boolean default false,
  created_at timestamptz default now()
);
