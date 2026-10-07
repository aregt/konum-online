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

    // Hizli bot gonderimlerini istemcide ele (sunucusuz sitelerde ilk savunma).
    const startedAt = parseInt(tsField && tsField.value, 10);
    const nowSec = Math.floor(Date.now() / 1000);
    if (startedAt && nowSec - startedAt < 3) {
      showFormStatus(statusEl, false, "Form cok hizli gonderildi. Lutfen birkac saniye bekleyip tekrar deneyin.");
      return;
    }

    const endpoint = form.dataset.formEndpoint || form.action;

    // Henuz FormSubmit e-postasi baglanmamissa: WhatsApp'a yonlendir, mesaj kaybolmasin.
    if (!endpoint || endpoint.indexOf("FORM-EPOSTASI-BURAYA") !== -1) {
      const waNumber = form.dataset.whatsapp || "908508850043";
      const text = buildWhatsAppText(form);
      window.open("https://wa.me/" + waNumber + "?text=" + encodeURIComponent(text), "_blank", "noopener");
      showFormStatus(
        statusEl,
        true,
        "E-posta baglantisi henuz tamamlanmadi, mesajiniz WhatsApp uzerinden iletilmeye hazirlandi. Lutfen acilan pencereden gonderin."
      );
      return;
    }

    const formData = new FormData(form);

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json",
          "X-Requested-With": "fetch",
        },
      });

      const data = await response.json().catch(() => ({}));

      // FormSubmit ajax basarida { success: true } doner; hata mesajlari data.message icinde gelir.
      const ok = response.ok && (data.success === true || data.success === "true" || data.ok === true);
      if (!ok && response.ok && !("success" in data) && !("ok" in data)) {
        // Bazi ucretsiz uclar 200 + bos govde donebilir; bunu basari sayma, acikca soyle.
        throw new Error("empty-response");
      }

      showFormStatus(statusEl, ok, ok ? "Mesajiniz alindi. En kisa surede size donus yapacagiz." : (data.message || "Mesaj gonderilemedi. Lutfen tekrar deneyin veya WhatsApp uzerinden yazin."));

      if (window.KonumAnalytics && typeof window.KonumAnalytics.track === "function") {
        window.KonumAnalytics.track(ok ? "form_submit" : "form_error", {
          form_name: "contact",
        });
      }

      if (ok) {
        form.reset();
        if (tsField) {
          tsField.value = String(Math.floor(Date.now() / 1000));
        }
      }
    } catch (error) {
      if (window.KonumAnalytics && typeof window.KonumAnalytics.track === "function") {
        window.KonumAnalytics.track("form_error", { form_name: "contact", error_type: "network" });
      }
      showFormStatus(statusEl, false, "Baglanti hatasi. Lutfen tekrar deneyin veya WhatsApp uzerinden yazin.");
    }
  });
}

function buildWhatsAppText(form) {
  const get = (name) => {
    const el = form.elements.namedItem(name);
    return el ? String(el.value || "").trim() : "";
  };
  const lines = [
    "Merhaba, on degerlendirme almak istiyorum.",
    "Ad Soyad: " + get("name"),
    "Isletme: " + get("business"),
    "Sektor: " + get("sector"),
    "Ilce: " + get("district"),
    "Telefon: " + get("phone"),
    "",
    "Mesaj:",
    get("message"),
  ];
  return lines.join("\n");
}

function showFormStatus(el, ok, message) {
  el.hidden = false;
  el.className = ok ? "form-status is-success" : "form-status is-error";
  el.textContent = message;
  el.setAttribute("role", ok ? "status" : "alert");
  el.focus({ preventScroll: true });
}

document.addEventListener("DOMContentLoaded", initContactForm);
