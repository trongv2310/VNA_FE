# TTS VNA Nhom01 Frontend

Frontend Next.js App Router cho module phong ban.

## Cau truc

- `app/`: routes, layouts va render app.
- `components/`: component dung truc tiep o nhieu man hinh.
- `libs/core/`: UI component dung chung.
- `libs/shared/`: model, type va interface dung chung.
- `libs/tts/`: source rieng cua project TTS.
- `public/`: static assets.
- `src/`: vung mo rong cho hooks, utils, styles hoac types khi can.

## Cai dat

```bash
cp .env.example .env.local
npm install
npm run dev
```

Truy cap `http://localhost:5555`.

Mac dinh FE goi BE qua:

```env
NEXT_PUBLIC_API_URL=http://localhost:3010/api/v1
```
