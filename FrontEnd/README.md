# Lucky Spin — FrontEnd

FrontEnd em **React 18 + Vite + TypeScript + Tailwind** que consome a API .NET do
`BackEnd/SlotMachine.Api`. Foco em gameficação: reels animados, sons, confetes,
sistema de XP/níveis, conquistas, missões diárias, streak e estatísticas.

## Stack

| Camada                | Biblioteca                                        |
| --------------------- | ------------------------------------------------- |
| Build                 | Vite 5                                            |
| UI                    | React 18 + Tailwind CSS                           |
| Animação              | Framer Motion                                     |
| Som                   | Howler.js (sintetizado via WAV em Data URI)       |
| Confete / celebrações | canvas-confetti, react-rewards                    |
| Animações premium     | lottie-react (pronto para drop-in de JSONs)       |
| Estado global         | Zustand (com persist em localStorage)             |
| HTTP                  | axios                                             |
| Rotas                 | react-router-dom                                  |
| Gráficos              | recharts                                          |
| Toasts                | sonner                                            |

## Instalação

> ⚠️ Antes do primeiro `npm install`, **apague a pasta `node_modules`** se ela
> existir (foi deixada parcialmente preenchida na criação do projeto).

```bash
cd FrontEnd
# (Windows) PowerShell: Remove-Item -Recurse -Force node_modules -ErrorAction Ignore
npm install
```

## Rodando em desenvolvimento

1. Suba a API .NET (porta padrão `http://localhost:5232`):

   ```bash
   cd ../BackEnd/SlotMachine/SlotMachine.Api
   dotnet run
   ```

2. Em outro terminal, rode o front:

   ```bash
   npm run dev
   ```

   Abre em `http://localhost:5173`. O Vite faz proxy de `/api/*` para
   `http://localhost:5232/api/*` (config em `vite.config.ts`), então **não precisa
   configurar CORS** na API durante o desenvolvimento.

### Apontando para outra URL de API

Em produção (ou se quiser bater direto no IIS/Kestrel sem o proxy do Vite), copie
`.env.example` para `.env.local` e defina:

```
VITE_API_BASE_URL=https://localhost:7155/api
```

Nesse caso a API precisa habilitar CORS. No `Program.cs` adicione:

```csharp
builder.Services.AddCors(o => o.AddDefaultPolicy(p =>
    p.WithOrigins("http://localhost:5173").AllowAnyHeader().AllowAnyMethod()));
// ...
app.UseCors();
```

## Estrutura

```
FrontEnd/
├── src/
│   ├── api/                 # cliente axios + endpoints (createPlayer, spin, audit)
│   ├── components/
│   │   ├── Layout/          # header com saldo, XP, nav
│   │   ├── SlotMachine/     # Reel, SlotGrid, SpinButton
│   │   ├── HUD/             # BalancePanel
│   │   └── Rewards/         # WinOverlay (Big Win / Jackpot)
│   ├── hooks/               # useSpin, useSounds, useCelebration
│   ├── store/               # playerStore, gameStore, achievementsStore (Zustand)
│   ├── pages/               # HomePage, GamePage, HistoryPage, AchievementsPage
│   ├── types/               # api.ts (DTOs espelhados do backend)
│   ├── utils/               # format.ts, symbols.ts
│   ├── assets/              # sounds/, lottie/  (vazio — sons são gerados em runtime)
│   ├── App.tsx              # router
│   ├── main.tsx
│   └── index.css            # Tailwind + tema cassino
├── tailwind.config.js
├── vite.config.ts
└── package.json
```

## Features de gameficação

| Sistema           | Onde                                  |
| ----------------- | ------------------------------------- |
| XP / Níveis       | `store/achievementsStore.ts` — ganha XP a cada giro proporcional ao prêmio. Subida de nível dispara toast e som dedicado. |
| Conquistas        | 10 troféus pré-definidos (primeiro giro, primeira vitória, linha de diamante, jackpot, 10/50/100 giros, streak 3/7 dias…). |
| Missões diárias   | 3 missões geradas por dia, salvas em localStorage. Resetam automaticamente quando muda o dia. |
| Streak            | Conta dias consecutivos de login. Reinicia se pular um dia. |
| Histórico         | Últimos 200 giros + gráfico de evolução do saldo (recharts) + RTP empírico. |
| Som               | Spin / stop / win / Big Win / Jackpot / Level up / click — sintetizados em runtime via Howler. Botão de mute persistente. |
| Confete           | `canvas-confetti` em 3 intensidades (win / bigWin / jackpot — este último em cascata). |
| Overlay Big Win   | Overlay full-screen com Framer Motion. Pronto para receber animações Lottie em `src/assets/lottie/`. |

## Build de produção

```bash
npm run build
npm run preview     # serve o dist/ para conferir
```

Saída em `dist/`. Para hospedar atrás do mesmo domínio da API, ajuste o `base` no
`vite.config.ts` e o `baseURL` em `src/api/client.ts`.

## Portando para Android (Capacitor)

Quando estiver pronto para empacotar como app Android, sem reescrever nada:

```bash
npm install -D @capacitor/cli
npm install @capacitor/core @capacitor/android @capacitor/haptics
npx cap init "Lucky Spin" "br.com.luckyspin" --web-dir=dist
npm run build
npx cap add android
npx cap copy android
npx cap open android   # abre no Android Studio
```

No app, troque `VITE_API_BASE_URL` para a URL pública/intranet da sua API .NET
(no `.env.production` antes do `npm run build`).

Para vibração nas vitórias adicione em `useSpin.ts`:

```ts
import { Haptics, ImpactStyle } from "@capacitor/haptics";
// dentro do callback de vitória:
Haptics.impact({ style: ImpactStyle.Heavy });
```

## Notas técnicas

- O backend usa `decimal` em C#. O JSON Serializer do ASP.NET serializa como
  `number` (não string), por isso `PlayerDto.balance: number` no TS. Se decidir
  serializar como string no futuro, ajuste `src/types/api.ts`.
- O `SpinResponseDto.rows` é uma matriz 3×3 (3 linhas, 3 colunas). A UI mostra
  as 3 linhas separadamente e destaca cada linha vencedora.
- Aposta fixa é `R$ 3,00` (constante `FixedBetAmount` no backend, espelhada em
  `BET_AMOUNT_BRL`).
