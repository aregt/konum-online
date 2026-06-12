(function () {
  const PLACEHOLDER_ID = "G-PLACEHOLDER";

  function track(eventName, params) {
    if (typeof window.gtag === "function") {
      window.gtag("event", eventName, params || {});
    }
  }

  window.KonumAnalytics = { track };

  function injectGtag(measurementId) {
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    function gtag() {
      window.dataLayer.push(arguments);
    }
    window.gtag = gtag;
    gtag("js", new Date());
    gtag("config", measurementId);
  }

  async function loadMeasurementId() {
    try {
      const response = await fetch("/content/content.json", { cache: "no-store" });
      if (!response.ok) return null;
      const data = await response.json();
      return data?.site?.analytics?.ga4Id || null;
    } catch {
      return null;
    }
  }

  function isValidGa4Id(id) {
    return typeof id === "string" && id !== PLACEHOLDER_ID && /^G-[A-Z0-9]+$/.test(id);
  }

  function initClickTracking() {
    document.addEventListener("click", (event) => {
      const cta = event.target.closest("[data-cta]");
      if (cta) {
        track("cta_click", { cta_location: cta.getAttribute("data-cta") });
        return;
      }

      const whatsapp = event.target.closest('a[href*="wa.me"]');
      if (whatsapp) {
        track("whatsapp_click", { link_url: whatsapp.href });
        return;
      }

      const article = event.target.closest("[data-article]");
      if (article && article.getAttribute("aria-hidden") !== "true") {
        track("article_click", { article_slug: article.getAttribute("data-article") });
      }
    });
  }

  document.addEventListener("DOMContentLoaded", async () => {
    initClickTracking();

    const measurementId = await loadMeasurementId();
    if (!isValidGa4Id(measurementId)) return;

    injectGtag(measurementId);
  });
})();
