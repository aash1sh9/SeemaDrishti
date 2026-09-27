# SeemaDrishti

SSB document-screening prototype for Root X, team 129323, Rungta International Skills University. SIH 2026 theme supplied by the team: Blockchain & Cybersecurity. Problem statement identifier supplied by the team: SIH26188.

## Run locally

Requires Node.js 22 or later. Run npm ci, npm run db:generate only when changing the schema, npm run build, npx wrangler d1 migrations apply DB --local, then npm run dev. For isolated local officer testing, put LOCAL_DEVELOPMENT=true in an ignored .dev.vars file. Run npm test after building, then node tests/integration.mjs while the local server is running.

## Implemented

- Public prototype entry and /judge without credentials. Demo records and uploads stay in memory in the current tab and reset on reload.
- Separate /officer route uses authorized hosting identity, an officer allowlist and an eight-hour HttpOnly session. Officer cases and files persist in D1 and R2. This is not an official SSB identity-provider integration.
- Document upload, camera capture and scanner-file import. Camera selection, denied-permission guidance and a device camera/file-picker fallback. Browser and operating-system camera permission are still required. Direct scanner hardware control is not implemented.
- Automatic browser OCR on image uploads/captures and PDF pages. Tesseract.js 7.0.0 English model; PDF.js 6.3.289 rasterizes up to three PDF pages. Image preprocessing trims surrounding margins and retries the lower document area. Visible English labels populate passport/visa name, date of birth, number, expiry and supported optional fields. Original text, confidence, capture ID and correction provenance are retained. Missing values remain editable.
- Separate civilian statements or document transcriptions, always unverified.
- Date and cross-document consistency checks; officer notes, recapture and supervisor referrals. A photograph does not establish face match or liveness.

## Data flow

Public entry or authorized officer login → overview → new case → upload/capture → browser OCR → unverified extracted fields → face photograph → field checks → officer review → case history. Manual civilian entry is available when documents are missing or damaged.

OCR runs locally in the browser. Initial engine and English model downloads require network access to jsDelivr and the Tesseract language-data service. Document pixels are not sent to an external OCR API. In officer mode, images and extracted text are saved to the application's own R2/D1 storage. In public demo mode they stay in the tab.

## Kaggle sample

Source: https://www.kaggle.com/datasets/unidpro/synthetic-passports-dataset by UniData / unidpro. Public preview version 1 contains 15 synthetic passport images and a CSV with name, path and background. The name column is a sample identifier. There are no visa documents, genuine/forged labels, field ground truth or tampering annotations. Several CSV paths use .jng while the actual files use .jpg. One image exceeds the application's 12 MB limit.

The app includes the original, unmodified files/6.jpg as a noncommercial educational OCR example with attribution. License: CC BY-NC-ND 4.0, https://creativecommons.org/licenses/by-nc-nd/4.0/. The sample button reads the actual image; extracted answers are not hardcoded. This dataset is not a live validity/blacklist API and has not been used to train a forgery detector. See dataset.json for machine-readable inspection details.

## Actual stack

Vanilla JavaScript, HTML and CSS; Cloudflare Worker JavaScript API; D1 SQLite for officers, sessions, cases, captures, fields, runs, decisions, events and civilians; R2 object storage; Drizzle schema/migrations; Wrangler development tooling; Tesseract.js and PDF.js; Sites public hosting. React, FastAPI, PostgreSQL, ArcFace, blockchain and a tampering model are not implemented.

## Limits to present honestly

OCR reads text, not faces or authenticity. English label-based extraction is a prototype and can misread multilingual or damaged documents. Numeric dates use day/month/year and must be reviewed. Confidence is OCR engine confidence, not authenticity probability. No MRZ checksum validator, forgery classifier, face matching, liveness, issuer/blacklist integration or validated risk score is connected. Cases cannot pass while required checks remain incomplete.

The public demo is for synthetic documents. A reload resets the demonstration. Deploy with Sites using the existing project ID in .openai/hosting.json; do not expose local .dev.vars, .wrangler state or credentials.
