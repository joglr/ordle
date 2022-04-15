import { useEffect } from "react";

export function useUpdateAvailable(handler: () => void) {
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-ignore
      window.workbox !== undefined
    )
      return;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    const wb = window.workbox;

    wb.addEventListener("waiting", handler);
  });
}
