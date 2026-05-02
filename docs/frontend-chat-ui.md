# Frontend Chat UI Behavior

## Component

Primary chat component: `frontend/src/chat-home.js`.

## Storage behavior

The chat supports two persistence modes:
- `sessionStorage` (tab-scoped)
- `localStorage` (cross-tab/browser persistence)

Key points:
- History key: `finapp.chat.history.v1`
- Selected mode persisted at: `finapp.chat.storage.mode`
- Switching mode migrates current conversation and clears stale storage copy.

## Message rendering

- Messages include role (`user` / `assistant`) and timestamp.
- Assistant content supports a limited safe markdown rendering path:
  - bold, italic, inline code,
  - unordered and ordered lists,
  - paragraph blocks.

## Request behavior

On send:
1. User message appended locally.
2. POST to `/api/chat` (or `VITE_API_BASE_URL + /api/chat`).
3. Sends query plus basic user context.
4. On success, assistant reply is appended.
5. On failure, error message is shown + fallback assistant text.

## UX mechanics

- History auto-scrolls to latest message.
- Typing indicator shown while request is in-flight.
- Composer remains sticky at bottom (chat app style).
