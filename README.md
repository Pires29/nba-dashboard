# NBA Dashboard

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page automatically updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a font family created for Vercel.

## Learn More

To learn more about Next.js, see these resources:

- [Next.js Documentation](https://nextjs.org/docs) — learn about Next.js features and its API.
- [Learn Next.js](https://nextjs.org/learn) — an interactive Next.js tutorial.
- [Next.js GitHub repository](https://github.com/vercel/next.js) — feedback and contributions are welcome.

## Deploy on Vercel

The easiest way to deploy the app is through the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme), from the creators of Next.js.

See the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Core Requirements

- Player and game listings backed by a public API or a local dataset.
- Basic statistics: name, team, position, goals, assists, and age.
- Filters for position, team, age, and active status.
- Individual player or game pages with detailed statistics and simple charts.
- Favorites that users can add, filter, and persist in local storage or the backend.
- A summary dashboard with aggregate statistics and bar, line, or radar charts.
- Pagination or infinite scrolling for large player and game lists.
- Email/password or NextAuth.js authentication, protected routes, and app-wide user state.
- Loading and error states for data-fetching components.

## Advanced Requirements

### 1. Structure and Navigation

- Create a main layout with a navbar for Home, Stats, Standings, and Rosters.
- Make the navbar responsive on mobile and desktop.
- Give each page its own Next.js App Router route.

### 2. Roster Page — Players by Team

- Automatically group players by team.
- Make each team collapsible, showing or hiding its player list.
- Give each player a card containing their name, position, number, basic statistics (PTS, REB, AST, and so on), and a photo when one is available in the JSON.

### 3. Interactivity

- Filter by player name across all teams.
- Filter by position: PG, SG, SF, PF, or C.
- Sort dynamically by name or statistics such as points and assists.
- Combine name, position, and statistic filters.

### 4. Advanced UI/UX

- Use Tailwind for a clean, modern layout with cards, shadows, and team colors.
- Use pagination or lazy loading for very large lists.
- Show detailed statistics in a tooltip or modal when a player is selected.
- Support mobile, tablet, and desktop layouts.
- Visually highlight star players, such as those averaging more than 20 PTS.

### 5. Visual Statistics

- Add team charts with Recharts or Chart.js.
- Show average points per player, assists, and rebounds.
- Update charts dynamically when the selected statistic changes.

### 6. React and Next.js Best Practices

- Create reusable team accordion, player card, and search/filter components.
- Avoid code duplication.
- Manage global state with React Context or Zustand when needed.
- Manage pagination or lazy loading with local state.

### 7. Optional Challenge

- Integrate a real NBA statistics API.
- Use Next.js SSR or SSG to load data.
- Save user preferences, such as filters or favorite teams, in local storage.

## Next Steps

- Dynamic data
  - Use Python scripts to generate JSON and overwrite data files.
  - Configure a cron job, GitHub Actions, or another scheduler.
  - Ensure Next.js reads the generated files.
- Upcoming games
  - Add team photos.
  - Add standings.
- Chart page
  - Allow users to choose the game from the page. ✅
  - Show game information. ✅
  - Rename tabs after the teams. ✅
  - Show injuries. ✅
  - Add team statistics, including defensive rankings, pace, and points allowed by position.
  - Consider disabling charts for players injured for the selected game.
  - Show hit-rate percentages for every statistic, including outliers.
- Add filters to player statistics, including position.
- Authentication stack
  - Next.js provides the frontend and backend, pages, APIs, Server Actions, and redirects.
  - NextAuth/Auth.js provides Google sign-in and secure sessions, avoids direct password management, and creates users automatically.
  - Supabase provides a persistent PostgreSQL database for users, favorites, and application data, plus a convenient dashboard.
  - Prisma connects the code to the database, avoids direct SQL, generates types, and reduces bugs.
- Favorites.
- Reconsider whether a dedicated player page is needed.
- News.
- Review PWA options.

## To Do

- Improve the design, including referrals, Stripe Checkout, and overall sizing.
- Test performance.
- Fix misaligned injury columns on desktop.
- Add a support email address.
- Replace Stripe webhooks after deploying to production.
- Add privacy terms and policies to Stripe Checkout.
- Investigate intermittent authentication errors.
- Show points allowed by position, such as PF.
- Investigate why some players have no logs.
- Consider advertising later.
- Add betting lines to `PlayerGraph`.
- Replace URL parameters with dynamic routes if worthwhile.
- Make the page statically generated.
- Add loading indicators when navigating to a player.
- Add breadcrumbs to the player statistics page.
- Review the schedule and only show it in `GameSelector`, grouped by day.

## Error Handling

The main risk is that local JSON files are imported directly. A malformed or empty file can crash a component without warning. The project still needs:

- Error boundaries that catch React errors and show a message instead of crashing the entire page. Next.js supports this natively with an `error.tsx` file in each route folder.
- Data validation to confirm that JSON has the expected structure before it is used.
- Clear empty states when a player has no logs instead of empty output or silent errors.

## Payment and User Security

Security depends heavily on how payments are managed and how the user's plan is stored. A simple database field may be manipulated, so plan status should be verified against the payment provider, such as Stripe or LemonSqueezy.

## Scalability

NBA snapshots and per-player histories are published by `update_data.py` to the
private `nba-data` Supabase Storage bucket. The server resolves the active
version through `current.json`, checks player entitlements before reading a
history object, and keeps the small local JSON files only as a temporary
fallback. Large game-log JSON files must not be committed to the repository.


A estrela nao fica ativa quando eu seleciono o favorito vou para a pagina de favorito e ele esta la e volto para a pagina das props
Carregar sempre uma pagian quando troco a estatistica

Fase 3 — Base técnica e testes
Corrigir as migrations Prisma.
Garantir prisma generate durante o build.
Criar testes para autenticação, Stripe, referrals e permissões.
Configurar CI para executar lint, testes, audit e build.
Investigar por que o build demora ou bloqueia.
Objetivo: cada alteração futura pode ser publicada com segurança.
Fase 4 — Performance
Retirar os JSON de game logs do bundle/build.
Evitar duplicar os dados dos gráficos.
Adicionar caching.
Remover dados, código e dependências antigas.
Medir payloads, build time e Web Vitals.
Objetivo: melhorar carregamento, custos e capacidade para muitos utilizadores.
Fase 5 — UX e produto
Só depois:
Melhorar Props e Favorites no mobile.
Dividir PropsTable e PricingPage.
Melhorar loading, erros e acessibilidade.
Implementar analytics.
Criar offseason mode e alertas de favoritos.

Acrescentar secalhar tipo minutos e jogos com e sem um jogador por exemplo