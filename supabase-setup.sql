-- =====================================================================
--  TEJIDOS CASTAÑEDA · Tabla para ocultar / mostrar productos y fotos
--  Pégalo completo en Supabase → SQL Editor → Run.
--  ANTES de ejecutarlo: cambia  tu-correo@ejemplo.com  (aparece 2 veces)
--  por el MISMO correo con el que crearás tu usuario administrador.
-- =====================================================================

create table if not exists public.ocultos (
  clave  text primary key check (char_length(clave) between 3 and 120),
  creado timestamptz not null default now()
);

alter table public.ocultos enable row level security;

-- Permisos de la API (explícitos, por si el proyecto no los da por defecto)
revoke all on public.ocultos from anon, authenticated;
grant select on public.ocultos to anon, authenticated;       -- cualquiera puede LEER qué está oculto
grant insert, delete on public.ocultos to authenticated;     -- escribir exige haber iniciado sesión

-- Reglas de seguridad (RLS)
drop policy if exists "leer ocultos"        on public.ocultos;
drop policy if exists "admin oculta"        on public.ocultos;
drop policy if exists "admin muestra"       on public.ocultos;

create policy "leer ocultos" on public.ocultos
  for select to anon, authenticated using (true);

-- SOLO tu correo puede ocultar o mostrar (aunque alguien más lograra crear un usuario)
create policy "admin oculta" on public.ocultos
  for insert to authenticated
  with check (lower(auth.jwt() ->> 'email') = lower('tu-correo@ejemplo.com'));

create policy "admin muestra" on public.ocultos
  for delete to authenticated
  using (lower(auth.jwt() ->> 'email') = lower('tu-correo@ejemplo.com'));
