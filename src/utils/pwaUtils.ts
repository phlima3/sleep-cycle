
export const registerPWA = (): void => {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          console.log('ServiceWorker registration successful with scope: ', registration.scope);
        })
        .catch(error => {
          console.log('ServiceWorker registration failed: ', error);
        });
    });
  }
};

// Check if the app is running in standalone mode (installed as PWA)
export const isRunningAsPWA = (): boolean => {
  return window.matchMedia('(display-mode: standalone)').matches ||
         (window.navigator as any).standalone === true;
};

// Show an install prompt
export const showInstallPrompt = (
  deferredPrompt: BeforeInstallPromptEvent,
  onInstalled: () => void
): void => {
  // Show the installation prompt
  deferredPrompt.prompt();
  
  // Wait for the user to respond to the prompt
  deferredPrompt.userChoice.then(choiceResult => {
    if (choiceResult.outcome === 'accepted') {
      console.log('User accepted the install prompt');
      onInstalled();
    } else {
      console.log('User dismissed the install prompt');
    }
  });
};

// BeforeInstallPromptEvent interface
export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}
