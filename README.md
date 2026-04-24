# logos

Pequeña app del laboratorio para no volver a perder media hora buscando el logo
de `uvlhub` (o cualquier otro). Subes una vez todas las variantes, y cualquier
persona del equipo las encuentra y descarga al instante.

## Qué hace

- **Ver, buscar y descargar es público.** No hace falta cuenta para entrar,
  buscar o bajarse un logo. Cero fricción para el día a día del lab.
- **Subir sí requiere cuenta.** Sólo el admin crea cuentas; cualquier persona
  con cuenta (admin o no) puede subir y editar logos.
- **Sólo el admin gestiona usuarios** (alta, baja, reset de contraseña,
  promocionar a admin).
- Cada logo agrupa **múltiples variantes** (fondo claro, oscuro, color,
  transparente) en **múltiples formatos** (SVG, PNG, JPG, PDF, EPS…).
- **Auto-clasificación**: al subir, el sistema detecta el formato por la
  extensión y el fondo por el nombre del fichero (`dark`, `black`, `white`,
  `blanco`, `color`, `transparent`, etc.). Puedes corregirlo antes de crear.
- **Búsqueda con Elasticsearch** (con fallback a búsqueda en Postgres si ES
  no está disponible).
- **Descarga individual** de cualquier variante, o `.zip` con todas.
- **Diseño minimalista**: un buscador, un grid, un clic para descargar.

## Stack

- Next.js 15 (App Router, Server Actions) + React 19 + TypeScript
- PostgreSQL (metadatos) vía Prisma
- Elasticsearch 8 (búsqueda)
- Almacenamiento en volumen Docker
- Tailwind CSS
- Auth propia con JWT en cookie HttpOnly (`jose` + `bcryptjs`)

## Arrancar

```bash
# Opcional: personaliza admin y secreto (si no, usa los defaults)
cp .env.example .env
# Edita .env al menos AUTH_SECRET (una cadena larga y aleatoria)

docker compose up --build
```

La primera vez tarda un poco (descarga imágenes, construye, inicializa ES y
Postgres, aplica migraciones y crea el usuario admin).

Cuando termine:

- App: http://localhost:3000
- Admin por defecto: `admin@lab.local` / `changeme` (cámbialo ya con las
  variables `ADMIN_EMAIL` / `ADMIN_PASSWORD` o desde la UI)

## Flujo típico

**Persona del lab que necesita un logo (sin cuenta):**

1. Abre la home, escribe "uvlhub", ve el grid.
2. Pincha en `SVG` / `PNG` / `zip` y listo.

**Admin o uploader subiendo un logo:**

1. Entra en `/login`.
2. **Subir** → nombre del logo (ej. `UVLHub`) + arrastra TODAS las variantes
   (svg claro, svg oscuro, png claro, png oscuro, pdf, etc.).
3. El sistema detecta formato y fondo para cada archivo. Si falla algo,
   lo corriges en la tabla antes de darle a "Crear logo".
4. Se crea el logo, se guardan los ficheros, se indexa en ES.

## Convenciones de nombre recomendadas para auto-clasificación

Para que la detección de fondo acierte, incluye una de estas palabras en el
nombre del fichero:

- Claro: `light`, `white`, `claro`, `blanco`, `default`, `normal`
- Oscuro: `dark`, `black`, `negro`, `oscuro`, `invert`, `reverse`
- Color: `color`, `multicolor`, `full-color`
- Transparente: `transparent`, `transparente`, `alpha`

Ej: `uvlhub-dark.svg`, `uvlhub-light.png`, `uvlhub-color.svg`.

Si no aparece nada, se asume `light`. Lo puedes cambiar antes de guardar.

## Comandos útiles

```bash
docker compose logs -f app          # logs de la app
docker compose logs -f elasticsearch
docker compose down                 # parar
docker compose down -v              # parar y BORRAR datos (¡cuidado!)
```

## Variables de entorno

- `AUTH_SECRET` — secreto para firmar sesiones JWT. **Obligatorio** y largo.
- `ADMIN_EMAIL` / `ADMIN_PASSWORD` — admin creado en el primer arranque.
- `DATABASE_URL` — cadena de conexión a Postgres.
- `ELASTICSEARCH_URL` — URL del clúster ES.
- `STORAGE_DIR` — ruta dentro del contenedor donde se guardan los ficheros
  (mapeada al volumen `uploads`).

## Estructura

```
src/
  app/
    page.tsx              home: buscar/descargar
    login/                login + server action
    admin/
      page.tsx            listado para editar/borrar
      upload/             subida con auto-clasificación
      users/              alta/baja/reset de usuarios
      logos/[id]/         edición de un logo y variantes
    api/
      files/[...path]/    sirve los ficheros (con auth)
      download/[slug]/    zip con todas las variantes
      search/             búsqueda ES (también la usa la home al tipear)
  lib/
    session.ts            JWT en cookie
    db.ts                 prisma client
    elastic.ts            cliente ES + mapping + búsqueda
    storage.ts            lectura/escritura en el volumen
    classify.ts           detección de formato y fondo
    logos.ts              búsqueda unificada (ES + fallback DB)
prisma/
  schema.prisma
  migrations/
  seed.ts
```
