function initContactForm() {
  const form = document.getElementById("contact-form");
  const statusEl = document.getElementById("form-status");
  const tsField = document.getElementById("form_ts");
  if (!form || !statusEl) return;

  if (tsField) {
    tsField.value = String(Math.floor(Date.now() / 1000));
  }

  const params = new URLSearchParams(window.location.search);
  const status = params.get("status");
  const msg = params.get("msg");
  if (status && msg) {
    showFormStatus(statusEl, status === "success", decodeURIComponent(msg.replace(/\+/g, " ")));
  }

  form.addEventListener("submit", async (event) => {
    if (!window.fetch) return;

    event.preventDefault();
    statusEl.hidden = true;
    statusEl.className = "form-status";

    const formData = new FormData(form);

    try {
      const response = await fetch(form.action, {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json",
          "X-Requested-With": "fetch",
        },
      });

      const data = await response.json();
      showFormStatus(statusEl, Boolean(data.ok), data.message || "Beklenmeyen bir yanıt alındı.");

      if (window.KonumAnalytics && typeof window.KonumAnalytics.track === "function") {
        window.KonumAnalytics.track(data.ok ? "form_submit" : "form_error", {
          form_name: "contact",
        });
      }

      if (data.ok) {
        form.reset();
        if (tsField) {
          tsField.value = String(Math.floor(Date.now() / 1000));
        }
      }
    } catch (error) {
      if (window.KonumAnalytics && typeof window.KonumAnalytics.track === "function") {
        window.KonumAnalytics.track("form_error", { form_name: "contact", error_type: "network" });
      }
      showFormStatus(statusEl, false, "Bağlantı hatası. Lütfen tekrar deneyin veya WhatsApp üzerinden yazın.");
    }
  });
}

function showFormStatus(el, ok, message) {
  el.hidden = false;
  el.className = ok ? "form-status is-success" : "form-status is-error";
  el.textContent = message;
  el.setAttribute("role", ok ? "status" : "alert");
  el.focus({ preventScroll: true });
}

document.addEventListener("DOMContentLoaded", initContactForm);
