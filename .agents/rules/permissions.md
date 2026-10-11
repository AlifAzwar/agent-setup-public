# Project Execution & Permission Guidelines

## 1. Scope & Otorisasi Internal (Allowed)
- **CRUD & Update Kode**: Agen diizinkan secara bebas membaca, membuat, mengedit, dan menghapus file kode di dalam direktori project ini (workspace root).
- **Git & GitHub**: Agen diizinkan menjalankan perintah `git` (seperti status, add, commit, branch, diff, pull, push ke repository GitHub).
- **Database**: Operasi database lokal / development (seperti migration, query dev, schema updates) diperbolehkan.
- **Package Manager**: Menjalankan `npm run dev`, `npm run build`, `npm run lint`, dan script project lainnya diperbolehkan.

## 2. Batasan & Syarat Izin Pengguna (Strict Review Required)
- **Akses Di Luar Direktori Project**: Dilarang membaca atau menulis file di luar root direktori project tanpa izin tertulis dari pengguna.
- **Pencarian Luar & Akses Eksternal**: Dilarang mengakses Google Search, browsing web publik, atau fetch API ke pihak ketiga yang tidak relevan dengan konteks project tanpa persetujuan eksplisit.
- **Destructive Database Commands**: Dilarang mengeksekusi perintah database destruktif skala penuh (seperti `DROP DATABASE`, `TRUNCATE`, atau penghapusan data massal di production) tanpa konfirmasi ulang.
- **Kredensial & Secrets**: Jangan pernah mengekspos isi file `.env` atau credential rahasia ke file publik atau commit Git.
