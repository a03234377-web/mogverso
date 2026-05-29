# Firebase Realtime Database

## Rules

Copy `database.rules.example.json` to your Firebase project (Console → Realtime Database → Rules) and adjust before production.

The example:

- Allows public **read** (ranking, torneo, announcements).
- Denies root **write**; opens vote counters and one-time vote receipts (`rankvoteVotes`, `entryVotes`, `torneoVotes`).
- Does **not** allow clients to change `rankOverrides`, `rankvote/current` resolution, or `torneo/state` phase — use the Firebase console or Admin SDK for admin operations until server-side Route Handlers exist.

## Deploy (CLI)

```bash
firebase deploy --only database
```

Requires the Firebase CLI and `database.rules.json` in your project root (copy from the example and rename).
