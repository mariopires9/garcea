// Browser-side state for the "Instalar app" button.
//
// Chrome/Edge/Samsung Internet fire `beforeinstallprompt` when the site can be
// installed; keeping that event lets our own button open the install dialog.
// It can fire before React hydrates, so an inline script in the root layout
// (INSTALL_PROMPT_CAPTURE_SCRIPT) stores it on `window` until we pick it up.
// iPhone/iPad have no such API: there we can only explain the steps.

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

declare global {
  interface Window {
    __garceaInstallPrompt?: BeforeInstallPromptEvent | null;
  }
}

/** "prompt": we can open the install dialog; "ios": show the steps; "hidden": nothing to offer. */
export type InstallMode = "prompt" | "ios" | "hidden";

export const INSTALL_PROMPT_EVENT = "garcea-install-prompt";

export const INSTALL_PROMPT_CAPTURE_SCRIPT = `
window.addEventListener("beforeinstallprompt", function (e) {
  e.preventDefault();
  window.__garceaInstallPrompt = e;
  window.dispatchEvent(new Event("${INSTALL_PROMPT_EVENT}"));
});
window.addEventListener("appinstalled", function () {
  window.__garceaInstallPrompt = null;
  window.dispatchEvent(new Event("${INSTALL_PROMPT_EVENT}"));
});`;

function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function isIos() {
  const ua = navigator.userAgent;
  // iPadOS reports itself as a Mac; touch support gives it away.
  return /iPad|iPhone|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
}

export function getInstallMode(): InstallMode {
  if (isStandalone()) return "hidden";
  if (window.__garceaInstallPrompt) return "prompt";
  if (isIos()) return "ios";
  return "hidden";
}

export function subscribeInstallMode(onChange: () => void) {
  const standalone = window.matchMedia("(display-mode: standalone)");
  window.addEventListener(INSTALL_PROMPT_EVENT, onChange);
  standalone.addEventListener("change", onChange);
  return () => {
    window.removeEventListener(INSTALL_PROMPT_EVENT, onChange);
    standalone.removeEventListener("change", onChange);
  };
}

/** Opens the browser's install dialog. Resolves true if the user accepted. */
export async function promptInstall(): Promise<boolean> {
  const event = window.__garceaInstallPrompt;
  if (!event) return false;
  await event.prompt();
  const { outcome } = await event.userChoice;
  // The event can only be used once.
  window.__garceaInstallPrompt = null;
  window.dispatchEvent(new Event(INSTALL_PROMPT_EVENT));
  return outcome === "accepted";
}
