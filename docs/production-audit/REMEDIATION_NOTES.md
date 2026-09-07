# File-Level Remediation Notes

## P0

- `apps/api/src/routes/ai.ts`: removed deterministic disease, OCR, voice, translation and analytics mocks. Endpoints now call Gemini/RAG services and persist real results where applicable.
- `apps/api/src/services/gemini.service.ts`: added centralized multimodal audio transcription, document extraction and translation helpers; standardized AI model configuration.
- Payments: current repository inspection did not locate a `razorpay.service.ts` or payment implementation. Do not represent Razorpay as production-ready until a real order/signature/webhook implementation is added and tested.

## P1

- `apps/api/src/services/rag.service.ts`: documents remain `processing` until every embedding/chunk succeeds; failed indexing is cleaned up and marked `failed`; vector-search failures now fail closed; embedding dimension is checked against the current `vector(768)` schema.
- `apps/api/src/services/sms.ts`: removed unconditional SMS simulator logging and fail closed unless the explicit development-only simulator flag is enabled.
- `apps/api/src/routes/upload.ts`: removed random fake malware detection; retained a deterministic upload size/type gate. A real malware scanner should be deployed if required by the threat model.
- `apps/api/src/routes/wallet.ts`: removed fabricated wallet balances/transactions and replaced them with persistent wallet/transaction/withdrawal storage.
- `apps/api/src/app.ts`: removed legacy `/v1` and `/api` router aliases; canonical API prefix is `/api/v1`.

## P2

- `apps/api/src/routes/verification.ts`: uses centralized `authorizeRole('ADMIN', 'SUPER_ADMIN')` instead of a route-local admin check.
- `apps/api/src/middleware/authenticate.ts`: validates JWT shape and explicitly restricts verification to HS256.

## Validation still required

1. `npm run type-check`
2. `npm test`
3. frontend type-check/build
4. Supabase migration dry run and integration test
5. Gemini multimodal integration test with representative image/document/audio samples
6. Twilio Verify integration test
7. Razorpay implementation + webhook/signature tests
8. Browser E2E authentication test using cookies and `/api/v1`
