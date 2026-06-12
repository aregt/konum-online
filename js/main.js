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

function initCounters() {
  const counters = document.querySelectorAll(".counter");
  if (!counters.length) return;

  let hasCounted = false;
  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting || hasCounted) return;
        hasCounted = true;

        counters.forEach((counter) => {
          const target = parseFloat(counter.getAttribute("data-target"));
          const isDecimal = counter.getAttribute("data-decimals") === "1";

          const updateCount = () => {
            const count = parseFloat(counter.innerText);
            const inc = target / 40;

            if (count < target) {
              const nextVal = count + inc;
              counter.innerText = isDecimal ? nextVal.toFixed(1) : String(Math.ceil(nextVal));
              setTimeout(updateCount, 30);
            } else {
              counter.innerText = isDecimal ? target.toFixed(1) : String(target);
            }
          };

          updateCount();
        });
      });
    },
    { threshold: 0.5 }
  );

  const statsStrip = document.querySelector(".stats-strip");
  if (statsStrip) counterObserver.observe(statsStrip);
}

document.addEventListener("DOMContentLoaded", () => {
  initMobileNav();
  initReveal();
  initCounters();
});
