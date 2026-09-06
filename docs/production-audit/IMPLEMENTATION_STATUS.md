# AgriAssist Production Remediation

Branch: `fix/production-audit-orderwise`

## Ordered remediation

| Order | Area | Status | Main files |
|---|---|---|---|
| 1 | Auth/JWT | Fixed | `apps/api/src/middleware/authenticate.ts` |
| 2 | OTP fallback | Fixed | `apps/api/src/services/sms.ts` |
| 3 | Upload safety | Fixed | `apps/api/src/routes/upload.ts` |
| 4 | RAG integrity | Fixed | `apps/api/src/services/rag.service.ts` |
| 5 | Real disease AI | Fixed/wired | `apps/api/src/routes/ai.ts`, `apps/api/src/services/gemini.service.ts` |
| 6 | Real OCR | Fixed/wired | `apps/api/src/routes/ai.ts`, `apps/api/src/services/gemini.service.ts` |
| 7 | Voice STT + grounded response | Fixed/wired | `apps/api/src/routes/ai.ts`, `apps/api/src/services/gemini.service.ts` |
| 8 | Translation | Fixed/wired | `apps/api/src/routes/ai.ts`, `apps/api/src/services/gemini.service.ts` |
| 9 | AI analytics | Fixed to database aggregation | `apps/api/src/routes/ai.ts` |
| 10 | Wallet | Fixed from mock data to persistent schema | `apps/api/src/routes/wallet.ts`, `supabase/migrations/20260906000000_wallets_and_transactions.sql` |
| 11 | API routing | Fixed to canonical `/api/v1` | `apps/api/src/app.ts` |
| 12 | Verification RBAC | Fixed | `apps/api/src/routes/verification.ts` |
| 13 | Razorpay | **Not implemented/verified yet** | Requires dedicated payment integration work |
| 14 | Frontend auth migration | **Pending** | Existing frontend auth state may still expose legacy token fields |

## Important

This branch removes fabricated AI, wallet, analytics, and malware-scan behavior. It does not claim that external services are configured or that production integration tests have passed.

Before merging to `main`, run backend type-check, tests, frontend type-check/build, and real Supabase/Gemini/Twilio integration tests in a non-production environment.
