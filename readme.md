# ERP Odoo - Toko Utama Sentosa

## Deskripsi Project

Project ini merupakan implementasi sistem ERP berbasis Odoo yang dikembangkan untuk memenuhi kebutuhan pengelolaan transaksi penjualan dan manajemen stok barang pada perusahaan retail alat rumah tangga bernama **Toko Utama Sentosa**.

Toko Utama Sentosa bergerak di bidang penjualan alat-alat rumah tangga dan perlengkapan kebutuhan rumah, dengan konsep bisnis yang serupa seperti toko retail modern seperti AZKO atau ACE Hardware.

Sistem ERP ini dibuat menggunakan Odoo dan dijalankan menggunakan Docker untuk mempermudah proses deployment dan kolaborasi tim pengembang.

---

## Fokus Sistem

Aplikasi ERP ini berfokus pada:

- Manajemen transaksi penjualan
- Pengelolaan stok barang
- Monitoring inventory
- Pengelolaan produk
- Pencatatan pembelian barang
- Integrasi modul ERP Odoo

---

## Teknologi yang Digunakan

- Odoo
- Docker
- Docker Compose
- PostgreSQL
- Python

---

## Struktur Project

```bash
project-root/
│
├── docker-compose.yml
├── config/
│   └── odoo.conf
│
├── custom_addons/
│
└── README.md
```

---

## Cara Menjalankan Project

### 1. Clone Repository

```bash
git clone <repository-url>
```

### 2. Masuk ke Folder Project

```bash
cd <nama-folder-project>
```

### 3. Jalankan Docker Compose

```bash
docker compose up -d
```

### 4. Akses Odoo

Buka browser dan akses:

```txt
http://localhost:8070
```

---

## Tim Pengembang

### Kelompok 7

| Nama  | NIM |
| ----- | --- |
| Ridho | 241511059 |
| Rifky | 241511060 |
| Salma | 241511062 |
| Faiz  | 241511051 |

---

## Nama Perusahaan

**Toko Utama Sentosa**

Bidang usaha:
Retail alat rumah tangga dan perlengkapan kebutuhan rumah.

---

## Tujuan Project

Tujuan dari project ini adalah membangun sistem ERP yang mampu membantu proses bisnis perusahaan dalam mengelola transaksi penjualan dan stok barang secara lebih efektif, terintegrasi, dan terkomputerisasi.

---

## Catatan

Project ini masih dalam tahap pengembangan dan dapat dikembangkan lebih lanjut dengan penambahan modul seperti:

- Point of Sale (POS)
- Payment Gateway
- Barcode Scanner

---
