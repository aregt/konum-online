document.documentElement.classList.add("js");

function initMobileNav() {
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.getElementById("site-nav");
  if (!toggle || !nav) return;

  const closeNav = () => {
    toggle.setAttribute("aria-expanded", "false");
    nav.classList.remove("is-open");
    document.body.classList.remove("nav-open");
  };

  toggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(isOpen));
    document.body.classList.toggle("nav-open", isOpen);
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeNav);
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 1180) closeNav();
  });
}

function revealElement(el) {
  el.classList.add("active");
}

function initReveal() {
  const revealElements = document.querySelectorAll(".reveal");
  if (!revealElements.length) return;

  const checkVisible = (el) => {
    const rect = el.getBoundingClientRect();
    return rect.top < window.innerHeight * 0.92 && rect.bottom > 0;
  };

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          revealElement(entry.target);
          obs.unobserve(entry.target);
        }
      });
    },
    {
      root: null,
      threshold: 0.05,
      rootMargin: "0px 0px -5% 0px",
    }
  );

  revealElements.forEach((el) => {
    if (checkVisible(el)) {
      revealElement(el);
    } else {
      observer.observe(el);
    }
  });

  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      revealElements.forEach((el) => {
        if (!el.classList.contains("active") && checkVisible(el)) {
          revealElement(el);
        }
      });
    }, 150);
  });
}

function rankToColor(rank) {
  if (rank <= 3) return "#22c55e";
  if (rank <= 7) return "#84cc16";
  if (rank <= 12) return "#eab308";
  if (rank <= 18) return "#f97316";
  return "#ef4444";
}

function renderVisibilityGridMount(mount, data, options) {
  if (!mount || !data) return;

  const opts = options || {};
  const size = data.gridSize;
  mount.style.setProperty("--grid-size", String(size));
  mount.classList.toggle("visibility-map--mini", Boolean(opts.mini));
  mount.setAttribute(
    "aria-label",
    `${data.business || "İşletme"} için örnek görünürlük haritası`
  );

  mount.innerHTML = data.cells
    .map((cell) => {
      const classes = ["grid-cell"];
      if (cell.isBusiness) classes.push("is-business");
      return `<span class="${classes.join(" ")}" style="--rank-color:${rankToColor(cell.rank)}" title="Sıra: ${cell.rank}" aria-label="Sıra ${cell.rank}"></span>`;
    })
    .join("");
}

function renderVisibilityGrid() {
  const mount = document.getElementById("visibility-grid-mount");
  const metaMount = document.getElementById("visibility-grid-meta");
  const insightsMount = document.getElementById("visibility-insights-mount");
  const data = window.KonumDemoData && window.KonumDemoData.visibilityGrid;
  if (!mount || !data) return;

  if (metaMount) {
    metaMount.innerHTML = `
      <span class="xray-badge" aria-hidden="true">Görünürlük Röntgeni · Demo</span>
      <strong>${data.business}</strong>
      <span>${data.area}</span>
      <span class="visibility-query">"${data.query}" araması</span>
    `;
  }

  renderVisibilityGridMount(mount, data);

  if (insightsMount && data.insights) {
    insightsMount.innerHTML = `
      <div class="insight-block">
        <h3>Röntgen ne gösteriyor</h3>
        <p>${data.insights.observation}</p>
      </div>
      <div class="insight-block">
        <h3>Ne yapılmalı</h3>
        <p>${data.insights.action}</p>
      </div>
    `;
  }
}

function renderScenarioGrids() {
  // exported for JSON-driven scenario pages
  const slug = document.body.dataset.scenario;
  if (!slug) return;

  const scenario = window.KonumDemoData && window.KonumDemoData.scenarios[slug];
  if (!scenario) return;

  const beforeMount = document.getElementById("scenario-grid-before");
  const afterMount = document.getElementById("scenario-grid-after");
  renderVisibilityGridMount(beforeMount, scenario.before, { mini: true });
  renderVisibilityGridMount(afterMount, scenario.after, { mini: true });
}

window.renderScenarioGrids = renderScenarioGrids;

document.addEventListener("DOMContentLoaded", () => {
  initMobileNav();
  initReveal();
  renderVisibilityGrid();
  renderScenarioGrids();
});
