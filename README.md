# 1 MODE

`1 MODE` es una web app móvil-first en español para construir hábitos de fitness, IA y superación personal con una interfaz minimalista japonesa basada en Kanso.

Subtítulo: `El Método del 1%`.

## Funciones

- Checklist diario dividido en mañana, trabajo y noche.
- Actividades personalizadas: crear, editar y borrar rituales.
- Plantilla científica de cronobiología: luz solar, hidratación, movilidad, proteína, NSDR, luz cálida y rutina nocturna.
- Modo `Día pesado` para días con exceso de trabajo.
- Dashboards de cuerpo, mente, IA y progreso.
- Sistema inteligente de reglas con recomendaciones según sueño, ansiedad, energía y cumplimiento.
- Modo rescate: `No sé por dónde empezar`.
- Persistencia local con `localStorage` + historial en `IndexedDB`.
- Solicitud de almacenamiento persistente con `navigator.storage.persist()` cuando el navegador lo permite.
- Biblioteca web gratis para IA usando GitHub API, Hacker News y arXiv.
- Conversión de recursos web en actividades.
- Preparada como PWA instalable en celular.
- Esquema Supabase incluido en `supabase-schema.sql` para base de datos futura sin login obligatorio.

## Diseño

Design system: `Kanso - Japanese Minimalism`.

- Fondo papel washi: `#F4F1EA`.
- Texto carbón: `#2C2A29`.
- Acento terracota: `#A0522D`.
- Éxito verde musgo: `#7A8B7A`.
- Tipografía editorial con `Noto Serif JP`, `Inter` e `IBM Plex Mono`.

## Comandos

```bash
npm install
npm run dev
npm run build
npm run preview
```

## Instalar En Celular

1. Publica la app en Vercel, Netlify o GitHub Pages.
2. Abre el link desde el navegador del celular.
3. Usa `Agregar a pantalla de inicio`.
4. La app queda instalada como PWA.

## Base De Datos

La app funciona localmente desde el inicio. Hoy los datos se guardan en el dispositivo:

- Estado actual: `localStorage`.
- Historial diario: `IndexedDB`.
- Archivos de app offline: Service Worker cache.

Para activar Supabase:

1. Crea un proyecto en Supabase.
2. Ejecuta el contenido de `supabase-schema.sql` en el SQL editor.
3. Agrega variables de entorno en una futura integración:

```bash
VITE_SUPABASE_URL=tu_url
VITE_SUPABASE_ANON_KEY=tu_anon_key
```

El modelo está pensado para usar `device_id` anónimo sin login obligatorio.

## Filosofía

La app no busca motivación perfecta. Busca sistemas pequeños que hagan inevitable el siguiente paso.
