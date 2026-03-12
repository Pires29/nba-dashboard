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

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

Listagem de jogadores / partidas

Dados de API pública ou dataset local

Estatísticas básicas: nome, time, posição, gols, assistências, idade

Filtros: posição, time, idade, status ativo

Detalhes individuais

Página de jogador ou partida

Estatísticas detalhadas e gráficos simples

Favoritos / seleção

Usuário pode marcar favoritos

Filtrar apenas favoritos

Persistência (localStorage ou backend)

Dashboard resumido

Estatísticas agregadas (média de gols, partidas jogadas)

Visualizações básicas (bar chart, line chart, radar chart)

Paginação / Infinite Scroll

Para listas grandes de jogadores ou partidas

Autenticação

Login com email/senha ou NextAuth.js

Rotas protegidas (dashboard, favoritos)

Estado do usuário acessível em toda a app

Loading e error states

Componentes mostrando carregamento ou erro de fetch

---

Projeto: NBA Rosters Dashboard – Lista de Requisitos Avançados
1️⃣ Estrutura e Navegação

Criar um layout principal com Navbar (Home, Stats, Standings, Rosters)

Navbar responsiva, que funciona em mobile e desktop

Cada página deve ter rota própria (App Router do Next.js)

2️⃣ Roster Page – Jogadores por Equipa

Agrupar automaticamente jogadores por equipa (como já fizeste)

Cada equipa deve ser colapsável (accordion), mostrando/escondendo a lista de jogadores

Cada jogador deve ter um cartão com:

Nome

Posição

Número

Estatísticas básicas (PTS, REB, AST, etc)

Adicionar foto do jogador se tiver disponível no JSON

3️⃣ Interatividade

Filtro por nome: input para procurar jogador em qualquer equipa

Filtro por posição: PG, SG, SF, PF, C

Ordenação dinâmica:

Por nome

Por estatísticas (pontos, assistências, etc)

Busca e filtros combinados: nome + posição + estatística

4️⃣ UI/UX Avançado

Use Tailwind para layout limpo e moderno (cards, sombras, cores por equipa)

Paginação ou lazy-loading se a lista for muito grande

Tooltip ou modal ao clicar no jogador mostrando estatísticas detalhadas

Responsividade total (mobile, tablet, desktop)

Destaque visual para jogadores “estrelas” (PTS > 20, por exemplo)

5️⃣ Estatísticas Visuais

Gráficos por equipa (recharts ou chart.js):

Pontos médios por jogador

Assistências, rebotes

Filtro por estatística → gráfico atualizado dinamicamente

6️⃣ Boas práticas de React/Next.js

Criar componentes reutilizáveis:

Accordion por equipa

Card de jogador

Filtro/Busca

Evitar duplicação de código

Gerir estado global se necessário (ex: React Context ou Zustand)

Paginação ou lazy-loading com estado local

7️⃣ Extra – desafio total

Integração com API real de stats da NBA (opcional)

Implementar SSR/SSG no Next.js para carregar dados

Salvar preferências do usuário (ex: filtros ou equipes favoritas) no localStorage

NEXT STEPS:

- Dados Dinâmicos
  - Scripts Python a gerar json e sobreescrever ficheiros
    - configurar cron job no servidor, github actions ou outro
    - garantir que o Next.js le esses arquivos
- Jogos que vao acontecer
  - Meter Fotos das Equipas
  - Classificao
- Página de grafico
  - Colocar option de escolher o jogo mesmo dentro desta página ✅
  - Colocar info do jogo na página ✅
  - Mudar o nome das tabs para o nome das equipas ✅
  - Colocar Injuries ✅
  - Colocar estatísticas de equipas (Ranking de estatisticas defensivas, pace, points allowed to centers, etc)
  - Desativar graficos de players que estão lesionados para aquele jogo em especifico (ideia)
  - Percentagens de hit rate em cada stat (ex: outlier)

- Filtros nos stats dos jogadores (Por posição e assim)
- Autenticação
  Next.js

→ Frontend e backend no mesmo projeto
→ Páginas, API, Server Actions, redirects
→ É a base da app

NextAuth (Auth.js)

→ Login (Google, etc.)
→ Sessões seguras
→ Não geres passwords
→ Cria utilizadores automaticamente

Supabase

→ Base de dados (PostgreSQL)
→ Guarda utilizadores, favoritos, dados
→ Persistente (“para sempre”)
→ Dashboard fácil

Prisma

→ Liga o código à base de dados
→ Evita SQL direto
→ Tipos automáticos
→ Menos bugs

- Favoritos
- Página Jogador (Repensar a necessidade desta página)
- Noticias (?)
- PWA ( ver opções )


