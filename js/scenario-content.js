(function () {
  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function renderParagraphs(paragraphs) {
    return (paragraphs || []).map((p) => `<p>${escapeHtml(p)}</p>`).join("");
  }

  function renderTimeline(timeline, heading) {
    if (!timeline || !timeline.length) return "";
    const items = timeline
      .map(
        (step) => `<li>
          <h3>${escapeHtml(step.month)}. ay — ${escapeHtml(step.title)}</h3>
          <p>${escapeHtml(step.body)}</p>
        </li>`
      )
      .join("");
    return `<h2>${escapeHtml(heading || "5 — Üç aylık süreç")}</h2><ol class="scenario-timeline">${items}</ol>`;
  }

  function renderResults(stats, story) {
    const blocks = (stats || [])
      .map(
        (s) => `<div><span>${escapeHtml(s.label)}</span><strong>${escapeHtml(s.value)}</strong></div>`
      )
      .join("");
    return `<h2>${escapeHtml(story.resultsHeading || "6 — Temsili sonuçlar")}</h2>
      <p>${escapeHtml(story.resultsIntro)}</p>
      <div class="scenario-results">${blocks}</div>
      <p>${escapeHtml(story.resultsNote)}</p>`;
  }

  function renderStory(scenario, ui) {
    const story = scenario.story;
    if (!story) return "";

    const sections = (story.sections || [])
      .map(
        (sec) =>
          `<h2>${escapeHtml(sec.heading)}</h2>${renderParagraphs(sec.paragraphs)}`
      )
      .join("");

    const grid = story.grid || {};
    const disclaimerLead = scenario.disclaimerLead || "Bu bir örnek senaryodur.";
    const disclaimerBody =
      scenario.disclaimerBody ||
      "Kurgusal bir işletme üzerinden çalışma modelimizi anlatır; rakamlar temsilidir.";

    return `
      <p><a href="/#cases">${escapeHtml(ui.backLink)}</a></p>
      <div class="scenario-disclaimer" role="note">
        <strong>${escapeHtml(disclaimerLead)}</strong> ${escapeHtml(disclaimerBody)}
      </div>
      <div class="scenario-nav" data-scenario-nav-mount aria-label="Diğer örnek senaryolar"></div>
      <noscript>
        <p class="scenario-nav-noscript"><a href="${escapeHtml(ui.fallbackHref || "/#cases")}">${escapeHtml(ui.fallbackText || "Tüm örnek senaryolar ana sayfada listelenir.")}</a></p>
      </noscript>
      ${sections}
      <h2>${escapeHtml(grid.heading || "3 — Görünürlük röntgeni")}</h2>
      <p>${escapeHtml(grid.intro)}</p>
      <div class="scenario-grids">
        <div class="scenario-grid-panel">
          <h3>${escapeHtml(grid.beforeLabel || "Röntgen: Önce")}</h3>
          <div class="visibility-map-wrap">
            <div class="visibility-map visibility-map--mini" id="scenario-grid-before" aria-live="polite"></div>
          </div>
        </div>
        <div class="scenario-grid-panel">
          <h3>${escapeHtml(grid.afterLabel || "3. ay sonu")}</h3>
          <div class="visibility-map-wrap">
            <div class="visibility-map visibility-map--mini" id="scenario-grid-after" aria-live="polite"></div>
          </div>
        </div>
      </div>
      <p class="demo-disclaimer">${escapeHtml(grid.disclaimer)}</p>
      ${renderTimeline(scenario.timeline, story.timelineHeading)}
      ${renderResults(scenario.stats, story)}
      <h2>${escapeHtml(story.conclusions.heading)}</h2>
      ${renderParagraphs(story.conclusions.paragraphs)}
      <div class="scenario-disclaimer" role="note">
        <strong>${escapeHtml(disclaimerLead)}</strong> ${escapeHtml(disclaimerBody)}
      </div>
      <div class="scenario-footer-action">
        <a class="btn btn-primary" href="/iletisim/" data-cta="scenario">${escapeHtml(ui.cta)}</a>
        <div class="scenario-nav scenario-nav--compact" data-scenario-nav-mount data-nav-placement="bottom" aria-label="Diğer örnek senaryolar"></div>
      </div>`;
  }

  async function initScenarioContent() {
    const root = document.getElementById("scenario-story-root");
    const slug = document.body.dataset.scenario;
    if (!root || !slug) return;

    try {
      let data;
      const res = await fetch("/content/content.json", { credentials: "same-origin" });
      if (res.ok) {
        data = await res.json();
      } else {
        const fallback = await fetch("../../content/content.json", { credentials: "same-origin" });
        if (!fallback.ok) throw new Error("content.json unavailable");
        data = await fallback.json();
      }
      const scenario = (data.scenarios || []).find((s) => s.slug === slug);
      if (!scenario || !scenario.story) {
        root.innerHTML = `<p><a href="/#cases">Örnek senaryolara dön</a></p><p>Senaryo içeriği bulunamadı.</p>`;
        return;
      }

      root.innerHTML = renderStory(scenario, data.scenarioNav || {});
      if (typeof window.renderScenarioGrids === "function") {
        window.renderScenarioGrids();
      }
      if (typeof window.KonumScenarioNavInit === "function") {
        window.KonumScenarioNavInit();
      }
    } catch (_err) {
      root.innerHTML = `<p><a href="/#cases">Örnek senaryolara dön</a></p><p>İçerik yüklenemedi. <a href="/#cases">Tüm örnek senaryolar</a> ana sayfada.</p>`;
    }
  }

  window.KonumScenarioContentInit = initScenarioContent;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initScenarioContent);
  } else {
    initScenarioContent();
  }
})();
