import React, { useEffect, useState } from "react";

const getPlatform = () => {
  const ua = window.navigator.userAgent;
  // Check for iOS
  const isIOS =
    /iPad|iPhone|iPod/.test(ua) &&
    typeof window !== "undefined" &&
    "MSStream" in window === false;
  if (/android/i.test(ua)) return "android";
  if (isIOS) return "ios";
  // Desktop detection
  if (/Macintosh|Windows|Linux/.test(ua)) return "desktop";
  return "other";
};

const isInStandaloneMode = () =>
  window.matchMedia("(display-mode: standalone)").matches ||
  // @ts-expect-error - navigator.standalone is not defined in all browsers
  window.navigator.standalone === true;

const LOCALSTORAGE_KEY = "hidePWAOnboarding";

const PWAOnboarding: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [platform, setPlatform] = useState<
    "ios" | "android" | "desktop" | "other"
  >("other");

  useEffect(() => {
    const hide = localStorage.getItem(LOCALSTORAGE_KEY);
    if (!hide && !isInStandaloneMode()) {
      setPlatform(getPlatform() as "ios" | "android" | "desktop" | "other");
      setOpen(true);
    }
  }, []);

  const handleClose = () => setOpen(false);
  const handleNeverShow = () => {
    localStorage.setItem(LOCALSTORAGE_KEY, "1");
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg max-w-md w-full p-6 relative">
        <button
          className="absolute top-2 right-2 text-zinc-400 hover:text-zinc-600"
          onClick={handleClose}
          aria-label="Fechar"
        >
          ×
        </button>
        <h2 className="text-xl font-bold mb-4 text-center">
          Adicione o app à tela inicial
        </h2>
        {platform === "ios" && (
          <div className="space-y-2">
            <p>
              Para uma experiência completa, adicione este app à tela inicial do
              seu iPhone:
            </p>
            <ol className="list-decimal ml-5 space-y-1">
              <li>
                Toque no{" "}
                <span className="font-semibold">botão de compartilhamento</span>{" "}
                <span role="img" aria-label="Compartilhar">
                  ⬆️
                </span>{" "}
                no Safari ou no Chrome.
              </li>
              <li>
                Selecione{" "}
                <span className="font-semibold">
                  "Adicionar à Tela de Início"
                </span>
                .
              </li>
              <li>
                Confirme o nome e toque em{" "}
                <span className="font-semibold">"Adicionar"</span>.
              </li>
            </ol>
          </div>
        )}
        {platform === "android" && (
          <div className="space-y-2">
            <p>
              Para uma experiência completa, adicione este app à tela inicial do
              seu Android:
            </p>
            <ol className="list-decimal ml-5 space-y-1">
              <li>
                Toque no <span className="font-semibold">menu</span>{" "}
                <span role="img" aria-label="Menu">
                  ⋮
                </span>{" "}
                no Chrome.
              </li>
              <li>
                Selecione{" "}
                <span className="font-semibold">
                  "Adicionar à tela inicial"
                </span>
                .
              </li>
              <li>
                Confirme e toque em{" "}
                <span className="font-semibold">"Adicionar"</span>.
              </li>
            </ol>
          </div>
        )}
        {platform === "desktop" && (
          <div className="space-y-2">
            <p>
              Para instalar este app no seu computador e acessar rapidamente
              pela área de trabalho ou dock:
            </p>
            <ol className="list-decimal ml-5 space-y-1">
              <li>
                <span className="font-semibold">No Chrome ou Edge:</span> Clique
                no ícone de instalação{" "}
                <span role="img" aria-label="Instalar">
                  📥
                </span>{" "}
                na barra de endereços (ou procure por "Instalar SleepCycle" no
                menu do navegador).
              </li>
              <li>
                <span className="font-semibold">No Safari (Mac):</span> Vá em{" "}
                <span className="font-semibold">
                  Arquivo {">"} Adicionar à Tela de Início
                </span>
                .
              </li>
            </ol>
            <p className="text-xs text-muted-foreground mt-2">
              O ícone de instalação geralmente aparece à direita da barra de
              endereços.
            </p>
          </div>
        )}
        {platform === "other" && (
          <div className="space-y-2">
            <p>
              Você pode adicionar este app à tela inicial do seu dispositivo
              para uma experiência melhor.
            </p>
            <p>
              Procure a opção "Adicionar à tela inicial" no menu do navegador.
            </p>
          </div>
        )}
        <div className="flex gap-2 mt-6 justify-end">
          <button
            className="px-4 py-2 rounded bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-100 hover:bg-zinc-300 dark:hover:bg-zinc-600"
            onClick={handleNeverShow}
          >
            Não mostrar novamente
          </button>
          <button
            className="px-4 py-2 rounded bg-primary text-white hover:bg-primary/90"
            onClick={handleClose}
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

export default PWAOnboarding;
