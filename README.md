# State AI

Marketing website for [State AI](https://stateai.in) — an AI development company offering machine learning, NLP, computer vision, and generative AI solutions.

## Stack

- Next.js 16 (App Router)
- React 19
- Tailwind CSS 4
- TypeScript

## Getting started

```bash
cd state-ai-app
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Assets

Image files belong in `public/assets/`. If they are missing after cloning, restore them from your backup or run:

```bash
node scripts/download-assets.mjs
```

Required files: `logo.png`, hero backgrounds, team photos, service images, and `footer-bg.jpeg`.

## Scripts

| Command        | Description              |
| -------------- | ------------------------ |
| `npm run dev`  | Start development server |
| `npm run build`| Production build         |
| `npm run start`| Serve production build   |
| `npm run lint` | Run ESLint               |

## Project structure

```
src/
  app/           # Layout, page, global styles
  components/    # Landing page sections
public/
  assets/        # Images and media
```
