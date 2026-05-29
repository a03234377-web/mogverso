# Autocommit (Conventional Commits — mogverso)

Usar cuando el usuario pida **hacer commit**. Ver también `.cursor/rules/git-commits.mdc`.

## Cuándo ejecutar

- El usuario invoca este comando o pide explícitamente **commit** / **autocommit**.
- **No** crear commits si el usuario no lo pidió.

## Antes de commitear

En paralelo:

1. `git status` — incluye archivos sin seguimiento (`??`).
2. `git diff` y, si aplica, `git diff --staged`.
3. `git log -15 --oneline` — tono reciente.

**No** incluir secretos (`.env`, `.env.local`, credenciales Firebase, claves reCAPTCHA).

## Mensajes

**Simples, descriptivos y en inglés** (imperativo: `add`, `fix`, `update`).

### Formato lista — varias áreas en un commit

```text
feat(ranking): add RankRow component from looksmax styles

fix(firebase): guard init when env vars missing
chore(cursor): align rules with mogverso repo
```

### Formato clásico — commit atómico

```text
feat(torneo): wire tournament phase timer to Realtime Database

Optional body explaining why, in English.
```

## Tipos y scopes habituales

| Tipo       | Uso                                     |
| :--------- | :-------------------------------------- |
| `feat`     | Nueva funcionalidad o pantalla migrada  |
| `fix`      | Bug o regresión                         |
| `refactor` | Sin cambio de comportamiento observable |
| `style`    | Solo CSS/markup, sin lógica             |
| `docs`     | README, comentarios de arquitectura     |
| `chore`    | Tooling, `.cursor/`, deps menores       |
| `build`    | Next config, PostCSS, ESLint            |

| Scope        | Cuándo                                    |
| :----------- | :---------------------------------------- |
| `app`        | Rutas en `src/app/`                       |
| `components` | `src/components/`                         |
| `firebase`   | Cliente y reglas de datos                 |
| `styles`     | `globals.css`, `looksmax.css`             |
| `cursor`     | `.cursor/`                                |
| `config`     | `next.config.ts`, `tsconfig.json`, ESLint |

## Crear el commit

```bash
git commit -m "$(cat <<'EOF'
feat(ranking): migrate rank list to React components

EOF
)"
```

- Si un hook rechaza: corregir y **nuevo** commit; no `--no-verify` salvo petición explícita.
- Sin `Co-authored-by:` de IA (ver `.cursor/rules/git-commits.mdc`); si Cursor lo inyecta, reescribir con `git commit-tree`.

## Verificación sugerida

```bash
npm run lint
npm run build
```

## Resumen para el agente

- Diff + log antes de redactar.
- Mensaje en **inglés**; respuesta al usuario en **español**.
- Sin trailers de coautoría de IA.
