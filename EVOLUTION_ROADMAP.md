# Sleep Cycle App - Evolution Roadmap

## O Que Foi Implementado

### Design System: Neobrutalism

Implementamos o **Brutal Sleep** (Opção B do prompt original), adaptado com uma paleta de cores mais suave e adequada para um app de sono.

#### Arquivos Modificados

| Arquivo | Mudanças |
|---------|----------|
| `tailwind.config.ts` | Tokens de design brutal (shadows, borders, translates) |
| `src/index.css` | CSS variables para light/dark mode com paleta sleep-friendly |
| `src/components/ui/*.tsx` | 10 componentes Shadcn adaptados para neobrutalism |
| `src/components/layout/Navbar.tsx` | Navegação com estilo brutal |
| `src/pages/*.tsx` | Todas as 6 páginas redesenhadas |

#### Sistema de Design Implementado

```css
/* Core Variables */
--main: #a78bfa;           /* Lavanda (accent principal) */
--bg: #0c0a14;             /* Background profundo */
--blank: #1c1827;          /* Cards */
--bw: #c4b5fd;             /* Bordas suaves */
--shadow: 4px 4px 0 0 var(--bw);

/* Efeitos */
- Bordas: 2px sólidas
- Border-radius: 5px
- Sombras: 4px offset
- Hover: translate + shadow removal
- Tipografia: Space Grotesk, uppercase headings
```

#### Componentes Atualizados

- **Button**: Sombras brutais, efeito hover com translate
- **Card**: Bordas definidas, sombras offset
- **Input**: Estilo brutal com bordas grossas
- **Tabs**: Triggers com estilo de botões brutais
- **Badge**: Versões solid com bordas
- **Accordion**: Headers com peso visual
- **Switch**: Toggle com estilo geométrico
- **Slider**: Track e thumb com bordas
- **Select**: Dropdown brutal
- **Progress**: Barra com bordas definidas

---

## Próximos Passos

### Sprint 1-2: Foundation & Quick Wins (2-4 semanas)

#### P0 - Crítico

- [x] **Testes Unitários** ✅
  - Vitest + Testing Library configurados
  - 55 testes passando
  - 100% coverage em `sleepCycleUtils.ts`
  - 100% coverage em contextos (Settings, SleepHistory)
  - Schemas Zod com 94% coverage

- [x] **Type Safety** ✅
  - Zod schemas em `src/lib/schemas.ts`
  - TypeScript strict mode habilitado
  - `noImplicitAny`, `strictNullChecks`, `noUncheckedIndexedAccess`

- [ ] **Performance**
  - Lazy load das páginas (React.lazy)
  - Code splitting por rota
  - Otimizar re-renders com memo/useMemo

#### P1 - Importante

- [ ] **Acessibilidade**
  - Audit com axe-core
  - Navegação completa por teclado
  - ARIA labels em todos componentes interativos
  - Contraste WCAG AA em ambos os temas

- [x] **PWA Improvements** ✅
  - Estratégia stale-while-revalidate implementada
  - Background sync helper criado
  - App shortcuts (Calcular, Histórico, Dicas)
  - Ícones atualizados para nova logo
  - Cores atualizadas para neobrutalism

---

### Sprint 3-4: Core Features (4-6 semanas)

#### Feature 1: Sleep Sounds Generator

**Valor**: Ajudar usuários a adormecer com sons ambiente

```typescript
// Estrutura proposta
src/
  features/
    sleep-sounds/
      components/
        SoundMixer.tsx      // UI principal
        SoundCard.tsx       // Card de cada som
        VolumeSlider.tsx    // Controle de volume
      hooks/
        useAudioContext.ts  // Web Audio API
        useSoundLibrary.ts  // Gerenciamento de sons
      data/
        sounds.ts           // Metadata dos sons
```

**Sons sugeridos**:
- Chuva, Trovão, Oceano, Floresta
- White/Pink/Brown noise
- Lo-fi beats, Piano suave
- Fogueira, Vento

**Stack**: Web Audio API + Howler.js

---

#### Feature 2: Advanced Sleep Analytics

**Valor**: Insights profundos sobre padrões de sono

```typescript
// Novos gráficos para History page
- Heatmap mensal (dias x horas)
- Tendência de ciclos (7/30/90 dias)
- Correlação sono vs dia da semana
- Distribuição de qualidade
```

**Métricas**:
- Consistência (desvio padrão de horários)
- Débito de sono acumulado
- Melhor/pior dia da semana
- Streak de noites com 5+ ciclos

---

#### Feature 3: Smart Reminders

**Valor**: Lembretes inteligentes para horário de dormir

```typescript
// Fluxo
1. Usuário define hora de acordar (ex: 7:00)
2. App calcula melhor horário para dormir
3. Notificação 30min antes: "Hora de começar a relaxar"
4. Notificação no horário: "Hora de dormir para acordar descansado"
```

**Personalização**:
- Wind-down time (15/30/45/60 min)
- Dias da semana específicos
- Som da notificação
- Modo não perturbe

---

### Sprint 5-6: Innovation Layer (6-8 semanas)

#### Feature 4: AI Sleep Coach

**Valor**: Recomendações personalizadas baseadas em ML

```typescript
// TensorFlow.js local
- Modelo treinado em padrões de sono
- Predição de qualidade baseada em histórico
- Detecção de anomalias (insônia, jet lag)
- Sugestões contextuais
```

**Recomendações**:
- "Você dormiu tarde nos últimos 3 dias. Tente dormir 30min mais cedo hoje."
- "Seus melhores ciclos são quando você dorme antes das 23h."
- "Padrão detectado: sono irregular nos fins de semana."

---

#### Feature 5: Sleep Challenges & Gamification

**Valor**: Engagement através de conquistas

```typescript
// Sistema de conquistas
interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  requirement: {
    type: 'streak' | 'total' | 'quality' | 'consistency';
    value: number;
  };
  reward: 'badge' | 'theme' | 'sound';
}

// Exemplos
- "Early Bird": Acordar antes das 7h por 7 dias
- "Consistent Sleeper": Dormir no mesmo horário por 14 dias
- "Sleep Master": 30 noites com 5+ ciclos
- "Night Owl Reformed": Melhorar horário em 1h por 7 dias
```

**Elementos**:
- Streaks diários
- Badges colecionáveis
- Níveis (Beginner → Expert)
- Desafios semanais

---

#### Feature 6: Wearable Integration

**Valor**: Dados reais de sono de dispositivos

```typescript
// Integrações prioritárias
1. Apple HealthKit (via PWA limited)
2. Google Fit API
3. Fitbit Web API
4. Garmin Connect API

// Dados importados
- Tempo real de sono
- Fases do sono (light/deep/REM)
- Frequência cardíaca noturna
- Movimento durante sono
```

---

#### Feature 7: Collaborative Sleep

**Valor**: Sincronizar horários com parceiros/família

```typescript
// Features
- Compartilhar perfil de sono (link)
- Horários sincronizados para casais
- Notificações coordenadas
- Estatísticas comparativas (opt-in)
```

---

### Sprint 7+: Polish & Scale

- [ ] **Storybook** para documentação de componentes
- [ ] **E2E Tests** com Playwright
- [ ] **Visual Regression** testing
- [ ] **CI/CD** com GitHub Actions
- [ ] **Monitoring** com Sentry + Plausible
- [ ] **Multi-device sync** com WebSocket + IndexedDB
- [ ] **Export** relatórios PDF/CSV
- [ ] **Widget** para tela inicial (mobile)

---

## Arquitetura Proposta para Features

```
src/
├── components/
│   ├── ui/              # Shadcn components (brutal)
│   └── layout/          # Navbar, Footer
├── features/            # Feature modules (novo)
│   ├── calculator/      # Core sleep calculator
│   ├── history/         # Sleep history & analytics
│   ├── sounds/          # Sleep sounds generator
│   ├── reminders/       # Smart notifications
│   ├── achievements/    # Gamification
│   └── ai-coach/        # ML recommendations
├── contexts/            # Global state
├── hooks/               # Shared hooks
├── utils/               # Utilities
├── lib/                 # External integrations
└── pages/               # Route components
```

---

## Métricas de Sucesso

| Métrica | Atual | Meta |
|---------|-------|------|
| Lighthouse Performance | ~75 | 95+ |
| TTI (Time to Interactive) | ~2.5s | <1.5s |
| Bundle Size | ~250kb | <150kb |
| Test Coverage | **100% utils/contexts** | 80%+ |
| Accessibility Score | ~70 | 100 |
| Daily Active Users | - | Track com Plausible |
| Retention (7 dias) | - | >40% |

---

## Referências de Design

- [Neobrutalism.dev](https://neobrutalism.dev) - Sistema de design usado
- [Shadcn/UI](https://ui.shadcn.com) - Base dos componentes
- [Sleep Cycle App](https://sleepcycle.com) - Referência de features
- [Calm](https://calm.com) - Referência de sounds/meditation
- [Headspace](https://headspace.com) - Referência de gamification

---

## Stack Técnico Atual

```json
{
  "framework": "React 18 + TypeScript (strict mode)",
  "build": "Vite",
  "styling": "TailwindCSS + Shadcn/UI (Neobrutalism)",
  "state": "Context API",
  "routing": "React Router v6",
  "i18n": "react-i18next (5 idiomas)",
  "charts": "Recharts",
  "pwa": "Custom Service Worker (SWR strategy)",
  "validation": "Zod",
  "testing": "Vitest + Testing Library"
}
```

## Stack Recomendado para Evolução

```json
{
  "state": "Zustand (migrar de Context)",
  "testing": "Playwright (E2E)",
  "audio": "Howler.js + Web Audio API",
  "ml": "TensorFlow.js / ONNX Runtime",
  "analytics": "Plausible",
  "monitoring": "Sentry",
  "api": "tRPC (se adicionar backend)"
}
```

---

*Última atualização: Dezembro 2024*
*Design: Neobrutalism Sleep-friendly*
