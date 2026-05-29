# Actualizar documentación (mogverso)

Comando para **sincronizar documentación del proyecto** con el estado real del código. No hay pares bilingües EN/ES como en monorepos grandes; el foco es `README.md` y notas técnicas que el usuario indique.

## Cuándo ejecutar

- El usuario invoca **`/update-docs`** o pide actualizar README / docs del proyecto.
- Tras cambios grandes (Firebase, nuevas rutas, scripts npm).
- **No** editar docs si el usuario no lo pidió.

## Alcance actual

| Archivo               | Contenido esperado                                                                  |
| :-------------------- | :---------------------------------------------------------------------------------- |
| `README.md`           | Qué es mogverso, stack, cómo arrancar (`npm run dev`), variables de entorno, deploy |
| `AGENTS.md`           | Reglas Next.js 16 (mantener; no duplicar en README)                                 |
| Comentarios en código | Solo si el usuario pide documentar un módulo concreto                               |

## Proceso

1. Leer `package.json`, `src/app/`, configs y código Firebase si existe.
2. Contrastar README con la realidad (scripts, rutas, deps).
3. Actualizar README: setup, `.env.local` necesarios (nombres de vars, sin valores), estructura `src/`.
4. Tono: claro, orientado a quien clona el repo; español o inglés según el idioma del README actual.
5. **No inventar** features no implementadas; marcar como «planned» si aplica.

## Variables de entorno (plantilla README)

Documentar solo nombres, nunca valores:

```env
# Firebase (ejemplo — ajustar a la config real)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
```

## Commits

Si el usuario pide commit, leer `.cursor/commands/auto-commit.md`:

```text
docs(readme): document Firebase env vars and src layout
```

## Resumen para el agente

- Mogverso = app Next.js en migración; README debe reflejar `src/app/` y Firebase, no plantillas genéricas de create-next-app.
- No crear árbol `docs/en/` / `docs/es/` salvo petición explícita.
