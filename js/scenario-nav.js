(function () {
  const ICONS = {
    dental:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2C9.2 2 7 4.1 7 6.8c0 2.1.9 3.9 1.6 5.5.5 1.2 1 2.3 1.2 3.2.3 1.2.5 2.5.7 3.5.2 1.1.9 1.9 1.9 1.9h.1c1 0 1.7-.8 1.9-1.9.2-1 .4-2.3.7-3.5.2-.9.7-2 1.2-3.2.7-1.6 1.6-3.4 1.6-5.5C17 4.1 14.8 2 12 2Z"/></svg>',
    restaurant:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M8.1 13.34 4 22h2l1.02-2.18h5.96L14 22h2l-4.1-8.66H8.1ZM6.5 6 4 3v5h2V6Zm4.5 0L8 3v5h3V6Zm4.5 0L12.5 3v5H16V6Z"/></svg>',
    aesthetic:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2 9.2 8.2 3 9.3l5 4.4-1.5 6.3L12 16.8l5.5 3.2-1.5-6.3 5-4.4-6.2-1.1L12 2Z"/></svg>',
    plumbing:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M14.7 3.3a4 4 0 0 0-5.4 0L3 9.6V11h2v8a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-8h2V9.6l-6.3-6.3ZM7 19v-7h2v7H7Zm4 0v-7h2v7h-2Zm4 0v-7h2v7h-2Z"/></svg>',
  };

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function buildStrip(title, items) {
    const cards = items
      .map((item) => {
        const icon = ICONS[item.icon] || ICONS.plumbing;
        return `<a class="scenario-nav-card" href="${escapeHtml(item.href)}" data-cta="scenario-nav">
          <span class="scenario-nav-icon">${icon}</span>
          <span class="scenario-nav-text">
            <strong>${escapeHtml(item.name)}</strong>
            <span>${escapeHtml(item.navSubtitle)}</span>
          </span>
        </a>`;
      })
      .join("");

    return `<div class="scenario-nav-inner">
      <p class="scenario-nav-title">${escapeHtml(title)}</p>
      <div class="scenario-nav-track" role="list">${cards}</div>
    </div>`;
  }

  async function initScenarioNav() {
    const slug = document.body.dataset.scenario;
    const mounts = document.querySelectorAll("[data-scenario-nav-mount]");
    if (!slug || !mounts.length) return;

    try {
      const res = await fetch("/content/content.json");
      if (!res.ok) return;
      const data = await res.json();
      const title = (data.scenarioNav && data.scenarioNav.title) || "Diğer örnek senaryolar";
      const items = (data.scenarios || []).filter((s) => s.slug !== slug);
      if (!items.length) return;

      const html = buildStrip(title, items);
      mounts.forEach((mount) => {
        mount.innerHTML = html;
        mount.classList.add("is-loaded");
      });
    } catch (_err) {
      /* fetch failed — noscript fallback remains visible */
    }
  }

  window.KonumScenarioNavInit = initScenarioNav;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initScenarioNav);
  } else {
    initScenarioNav();
  }
})();
