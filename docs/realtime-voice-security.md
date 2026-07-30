# Realtime voice security

`POST /api/voice/session` requires an active authenticated account, CSRF validation, database-backed active configuration, usage/concurrency checks, and `VOICE_ENABLED=true`. It is disabled by default. When enabled, the browser submits a WebRTC SDP offer to the backend; the backend calls the documented OpenAI `POST /v1/realtime/calls` endpoint with the permanent server-side key and returns only the SDP answer, internal session ID, and expiry. No OpenAI credential is returned to browsers or persisted.

The browser must request microphone access only after an explicit user gesture. Audio/transcripts are not retained by this site by default. Tool policy is deny-all for this stage. Provider failures mark pending sessions rejected; session end is server-side and auditable. The current official reference is https://platform.openai.com/docs/api-reference/realtime.
