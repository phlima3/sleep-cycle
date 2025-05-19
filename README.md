# SleepCycle

**SleepCycle** é um aplicativo moderno para calcular ciclos de sono ideais, visualizar padrões de sono, receber dicas práticas e otimizar sua rotina de descanso. Com suporte a PWA, internacionalização e uma interface intuitiva, você pode usar o SleepCycle em qualquer dispositivo — inclusive adicionando à tela inicial do seu smartphone ou desktop!

---

## ✨ Funcionalidades

- **Calculadora de Ciclos de Sono:** Informe seu horário de dormir e acordar para descobrir os melhores horários e ciclos completos.
- **Histórico de Sono:** Visualize padrões, gráficos e tabelas com seus registros anteriores.
- **Dicas de Sono:** Receba recomendações práticas para melhorar sua qualidade de sono.
- **Sobre o Sono:** Entenda a ciência dos ciclos de sono, estágios e pesquisas relevantes.
- **Configurações Avançadas:** Personalize duração do ciclo, latência, idioma, tema (dark/light) e notificações.
- **PWA (Progressive Web App):** Instale o app na tela inicial do seu celular ou desktop para uma experiência nativa.
- **Internacionalização:** Pronto para múltiplos idiomas (basta adicionar arquivos de tradução em `src/i18n/locales/`).

---

## 🚀 Tecnologias

- **React** + **TypeScript**
- **Vite** (build ultra-rápido)
- **Tailwind CSS** + **shadcn-ui** (UI moderna e responsiva)
- **PWA** (manifest, service worker, instalação em qualquer dispositivo)
- **react-i18next** (i18n)
- **Context API** (gerenciamento de estado)
- **Custom Hooks** (ex: notificações, toasts)

---

## 📱 Instale como App (PWA)

Você pode instalar o SleepCycle como um app nativo no seu dispositivo:

- **iOS (Safari):** Toque no botão de compartilhamento e selecione “Adicionar à Tela de Início”.
- **Android (Chrome):** Toque no menu (⋮) e selecione “Adicionar à tela inicial”.
- **Desktop (Chrome/Edge):** Clique no ícone de instalação na barra de endereços ou procure por “Instalar SleepCycle” no menu do navegador.
- **Desktop (Safari):** Vá em Arquivo > Adicionar à Tela de Início.

---

## 🛠️ Como rodar localmente

```sh
# Clone o repositório
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>

# Instale as dependências
npm install

# Rode o servidor de desenvolvimento
npm run dev
```

Acesse [http://localhost:5173](http://localhost:5173) no navegador.

---

## 🌍 Internacionalização

- Todas as strings estão em `src/i18n/locales/en.json`.
- Para adicionar um novo idioma, crie um arquivo como `pt-BR.json` e siga a mesma estrutura.
- O idioma pode ser trocado nas configurações do app.

---

## 🖼️ PWA e Ícones

- O app já está pronto para ser instalado como PWA.
- Ícones em múltiplos tamanhos estão configurados no `public/manifest.json` e referenciados no `index.html`.
- Service Worker (`public/sw.js`) já incluso.

---

## 🧑‍💻 Estrutura do Projeto

```
src/
  components/      # Componentes reutilizáveis (inclui o onboarding PWA)
  pages/           # Páginas principais (Home, History, About, Tips, Results, Settings, NotFound)
  i18n/            # Arquivos de internacionalização
  utils/           # Funções utilitárias (ex: notificações)
  contexts/        # Contextos globais (ex: Settings)
  hooks/           # Custom hooks
public/
  icons, manifest, sw.js, etc.
```

---

## 💡 Dicas

- **Onboarding PWA:** O app mostra um modal ensinando como instalar na tela inicial, adaptado para cada plataforma.
- **Notificações:** Ative nas configurações para receber lembretes do horário ideal de dormir.
- **Histórico:** Limpe ou exporte seus dados facilmente.
- **Acessibilidade:** Interface responsiva, dark mode e textos prontos para tradução.

---

## 📢 Contribua!

Pull requests são bem-vindos! Sinta-se à vontade para abrir issues com sugestões ou bugs.

---

## 📄 Licença

MIT
