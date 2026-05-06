# Al Fakhir Observation Dashboard

**Sistem Dashboard Observasi Penerimaan Siswa Baru**  
SD/SMP Islam Modern Al Fakhir

---

## Gambaran Umum

Aplikasi web berbasis Next.js untuk mengelola proses wawancara dan observasi penerimaan siswa baru. Fitur utama:

- 🔐 **Autentikasi** — Google OAuth dengan kontrol akses berbasis peran (Admin/Pewawancara)
- 📊 **Dashboard Pewawancara** — Lihat kandidat yang ditugaskan, formulir masuk, dan kirim catatan
- 🤖 **Ringkasan AI** — Analisis jawaban formulir otomatis menggunakan Gemini AI (Bahasa Indonesia)
- 👨‍💼 **Dashboard Admin** — Monitoring real-time seluruh pewawancara, grafik progres, ekspor data
- 📋 **Integrasi Google Sheets** — Sinkronisasi langsung dengan data formulir Google Forms
- 🔒 **Catatan Terkunci** — Catatan pewawancara tidak dapat diubah setelah dikirim

---

## Prasyarat

- Node.js 20+
- Akun Google Cloud
- Google Sheets dengan tab yang sudah disiapkan
- API Key Gemini

---

## Langkah Setup

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd observasi
npm install
cp .env.example .env.local
# Isi semua nilai di .env.local
```

### 2. Setup Google Cloud

1. Buka [console.cloud.google.com](https://console.cloud.google.com)
2. Buat project baru: `alfakhir-dashboard`
3. Aktifkan API:
   - Google Sheets API
   - Google Drive API
   - Google Identity API (untuk OAuth)
   - Generative Language API (Gemini)
4. Buat **OAuth 2.0 Credentials** → Web Application
   - Tambahkan redirect URI: `http://localhost:3000/api/auth/callback/google`
   - Salin Client ID dan Client Secret ke `.env.local`
5. Buat **Service Account** → Download JSON key
   - Salin `client_email` → `GOOGLE_SERVICE_ACCOUNT_EMAIL`
   - Salin `private_key` → `GOOGLE_SERVICE_ACCOUNT_KEY`

### 3. Setup Google Sheets

Buat Google Spreadsheet baru dengan tab berikut:

| Tab | Keterangan |
|-----|-----------|
| `Assignments` | Data penugasan pewawancara ke kandidat |
| `Responses_SD` | Terhubung ke Google Form SD (orang tua) |
| `Responses_SMP` | Terhubung ke Google Form SMP (siswa) |
| `Notes` | Dibuat otomatis oleh aplikasi |
| `AI_Summaries` | Dibuat otomatis oleh aplikasi |

**Kolom `Assignments`:**
```
NamaKandidat | NamaPewawancara | EmailPewawancara | Jenjang | Status
```

**Penting:** Bagikan spreadsheet ini ke Service Account email dengan akses **Editor**.

Salin Spreadsheet ID dari URL ke `GOOGLE_SHEET_ID`:
```
https://docs.google.com/spreadsheets/d/THIS_IS_THE_ID/edit
```

### 4. Setup Gemini API

1. Buka [makersuite.google.com](https://makersuite.google.com/app/apikey)
2. Buat API Key baru
3. Salin ke `GEMINI_API_KEY`

### 5. Setup Apps Script (Webhook)

1. Buka Google Forms → **Extensions** → **Apps Script**
2. Salin isi file `apps-script/Code.gs`
3. Update konstanta di bagian atas:
   ```javascript
   const NEXTJS_WEBHOOK_URL = "https://your-domain.com/api/webhook/form-submission"
   const WEBHOOK_SECRET = "nilai-sama-dengan-WEBHOOK_SECRET-di-env"
   const SPREADSHEET_ID = "nilai-sama-dengan-GOOGLE_SHEET_ID-di-env"
   ```
4. Tambahkan trigger: **onFormSubmit** → From form → On form submit
5. Jalankan `setupSheets()` sekali untuk membuat header otomatis

### 6. Isi `.env.local`

```bash
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<openssl rand -base64 32>

GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxx

GOOGLE_SERVICE_ACCOUNT_EMAIL=xxx@xxx.iam.gserviceaccount.com
GOOGLE_SERVICE_ACCOUNT_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

GOOGLE_SHEET_ID=your-sheet-id

GEMINI_API_KEY=your-gemini-api-key

WEBHOOK_SECRET=your-random-secret

# Format: email1@domain.com,email2@domain.com
ADMIN_EMAILS=admin@alfakhir.sch.id

# Format: email:NamaLengkap (gunakan koma sebagai pemisah)
INTERVIEWER_EMAILS=pewawancara1@gmail.com,pewawancara2@gmail.com
INTERVIEWER_MAPPING=pewawancara1@gmail.com:Ahmad Fauzi,pewawancara2@gmail.com:Siti Rahayu

NEXT_PUBLIC_APP_NAME=Al Fakhir Observation Dashboard
NEXT_PUBLIC_SCHOOL_NAME=SD/SMP Islam Modern Al Fakhir
```

### 7. Jalankan Lokal

```bash
npm run dev
# Buka http://localhost:3000
```

---

## Deployment (Vercel)

```bash
vercel --prod
```

Tambahkan semua environment variables di Vercel Dashboard.

Update di Google Cloud OAuth:
- Tambahkan redirect URI produksi: `https://your-domain.vercel.app/api/auth/callback/google`

Update di Apps Script:
- Ubah `NEXTJS_WEBHOOK_URL` ke URL produksi

---

## Struktur Folder

```
src/
├── app/
│   ├── (auth)/login/          # Halaman login
│   ├── (dashboard)/
│   │   ├── interviewer/       # Dashboard pewawancara
│   │   └── admin/             # Dashboard admin
│   └── api/                   # API Routes
├── components/
│   ├── ui/                    # Komponen primitif
│   └── layout/                # Sidebar + Header
├── lib/
│   ├── auth.ts                # NextAuth config
│   ├── google-sheets.ts       # Google Sheets service
│   └── gemini.ts              # Gemini AI service
└── types/index.ts             # TypeScript types

apps-script/
└── Code.gs                    # Google Apps Script webhook
```

---

## Peran Pengguna

| Peran | Akses |
|-------|-------|
| `admin` | Semua halaman, semua data kandidat, ekspor |
| `interviewer` | Hanya kandidat yang ditugaskan, catatan sendiri |
| `unauthorized` | Dialihkan ke halaman login |

Peran ditentukan dari email via environment variables:
- `ADMIN_EMAILS` — daftar email admin
- `INTERVIEWER_EMAILS` — daftar email pewawancara

---

## Teknologi

- **Framework**: Next.js 16 (App Router)
- **Auth**: NextAuth.js v5 beta
- **Database**: Google Sheets (via Sheets API)
- **AI**: Google Gemini 1.5 Pro
- **Styling**: Tailwind CSS v4
- **Charts**: Recharts
- **Deployment**: Vercel (recommended)
