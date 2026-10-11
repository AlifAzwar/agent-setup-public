# Git & Branching Workflow Guidelines

Standar alur kerja pengembangan (*development workflow*) berbasis Git untuk proyek **CLAVIS Front-End**.

---

## 1. Branching Strategy

| Branch | Fungsi | Proteksi & Aturan |
| :--- | :--- | :--- |
| **`main`** | **Production Environment** | Stabil, terhubung ke *production deployment* Vercel. Dilarang melakukan *direct push*. Hanya menerima merge dari `dev` setelah lolos review dan testing. |
| **`dev`** | **Integration / Staging** | Branch utama tempat semua fitur baru bermuara sebelum naik ke production. **Setiap fitur baru WAJIB bercabang dari `dev`**. |
| **`feat/*`** | **New Feature Development** | Branch kerja untuk fitur baru (contoh: `feat/catalog-filter`, `feat/auth-modal`). |
| **`fix/*`** | **Bug Fixes** | Branch kerja untuk perbaikan bug (contoh: `fix/checkout-calculation`, `fix/navbar-mobile`). |
| **`chore/*`** | **Maintenance / Refactor** | Branch kerja untuk pembersihan, refactor, atau update aturan (contoh: `chore/deps-update`). |

---

## 2. Alur Pengerjaan Fitur (Step-by-Step)

### Langkah 1: Sinkronkan Branch `dev` & Buat Branch Baru
Sebelum mulai coding fitur atau perbaikan:
```bash
git checkout dev
git pull origin dev
git checkout -b feat/nama-fitur
```

### Langkah 2: Koding Sesuai Panduan Proyek
* Terapkan aturan performa: `vercel-react-best-practices`.
* Terapkan arsitektur komponen: `vercel-composition-patterns`.
* Pastikan copy & code style bersih dari AI slop: `no-ai-slop`.

### Langkah 3: Verifikasi Mandiri Sebelum Push (Wajib Lolos 100%)
Sebelum melakukan commit atau push, jalankan:
```bash
npm run check
```
> Pastikan status verifikasi: **0 errors** pada linting dan Turbopack production build berhasil.

### Langkah 4: Commit & Push ke Remote
Gunakan pesan commit deskriptif (*Conventional Commits*):
```bash
git add .
git commit -m "feat: deskripsi perubahan singkat dan jelas"
git push origin feat/nama-fitur
```

### Langkah 5: Buat Pull Request (PR) ke Branch `dev`
* **Target PR:** Selalu arahkan PR menuju branch **`dev`** (`base: dev` <- `compare: feat/nama-fitur`).
* CI GitHub Actions akan otomatis menguji `npm run check` pada PR tersebut.
* Setelah diverifikasi di Vercel Preview dan disetujui, branch dapat di-merge ke `dev`.
