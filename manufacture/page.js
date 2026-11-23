const industryButtons = document.querySelectorAll(".industry-button");
const industryExamples = document.querySelectorAll(".tech-card");

function showIndustry(selected) {
  industryButtons.forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.industry === selected));
  });
  industryExamples.forEach((example) => {
    example.hidden = example.id !== selected;
  });
}

industryButtons.forEach((button) => {
  button.addEventListener("click", () => showIndustry(button.dataset.industry));
});
showIndustry("furniture");

const form = document.querySelector("#brief-form");
const product = document.querySelector("#product");
const process = document.querySelector("#process");
const result = document.querySelector("#brief-result");
const brief = document.querySelector("#brief-text");
const status = document.querySelector("#form-status");

form.hidden = false;
form.addEventListener("input", (event) => {
  if (event.target === product || event.target === process) {
    event.target.setCustomValidity("");
    result.hidden = true;
    status.textContent = "";
  }
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  for (const field of [product, process]) {
    if (!field.value.trim()) {
      field.setCustomValidity("Заполните поле.");
      field.reportValidity();
      return;
    }
  }
  brief.value = [
    "Бриф для Стандарт‑Н",
    "",
    "Продукция",
    product.value.trim(),
    "",
    "Что хотим автоматизировать",
    process.value.trim(),
  ].join("\n");
  result.hidden = false;
  brief.focus();
});

document.querySelector("#copy-brief").addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(brief.value);
    status.textContent = "Бриф скопирован.";
  } catch {
    brief.focus();
    brief.select();
    status.textContent = "Текст выделен. Скопируйте его или скачайте файл.";
  }
});

document.querySelector("#download-brief").addEventListener("click", () => {
  const url = URL.createObjectURL(new Blob([brief.value], { type: "text/plain;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = "standard-n-brief.txt";
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  status.textContent = "Бриф подготовлен к скачиванию.";
});

const menu = document.querySelector("#menu-panel");
const menuTrigger = document.querySelector("#menu-open");
const mobileLayout = window.matchMedia("(max-width: 780px)");

if (typeof menu.showModal === "function") {
  document.querySelector(".header").classList.add("menu-ready");
  menuTrigger.hidden = false;
  menuTrigger.addEventListener("click", () => {
    menu.showModal();
    menuTrigger.setAttribute("aria-expanded", "true");
  });
  document.querySelector("#menu-close").addEventListener("click", () => menu.close());
  menu.addEventListener("close", () => menuTrigger.setAttribute("aria-expanded", "false"));
  menu.addEventListener("click", (event) => {
    if (event.target === menu) {
      const { left, right, top, bottom } = menu.getBoundingClientRect();
      if (event.clientX < left || event.clientX > right || event.clientY < top || event.clientY > bottom) {
        menu.close();
      }
    }
    const link = event.target.closest("a");
    if (link) {
      menu.close();
      const destination = document.querySelector(link.hash);
      destination.setAttribute("tabindex", "-1");
      destination.focus({ preventScroll: true });
    }
  });
  mobileLayout.addEventListener("change", (event) => {
    if (!event.matches && menu.open) menu.close();
  });
}

const routeSteps = Array.from(document.querySelectorAll(".route-list details"));
const routeProgress = document.querySelector(".route-progress");
const routeState = document.querySelector("#route-state");

function updateRouteProgress() {
  const current = routeSteps.findIndex((step) => step.open) + 1;
  const stepNumber = String(current).padStart(2, "0");
  routeProgress.style.setProperty("--route-progress", current / routeSteps.length);
  routeState.textContent = current ? `Этап ${stepNumber} / 0${routeSteps.length}` : `Этапов: ${routeSteps.length}`;
}

routeSteps.forEach((step) => step.addEventListener("toggle", updateRouteProgress));
updateRouteProgress();
routeProgress.hidden = false;

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

if ("IntersectionObserver" in window && !reducedMotion.matches) {
  const groups = document.querySelectorAll(".process-list, .industry-controls, .steps, .contact");
  const entrances = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      observer.unobserve(entry.target);
      if (reducedMotion.matches || entry.target.contains(document.activeElement)) return;
      const siblings = Array.from(entry.target.parentElement.children);
      const delay = Math.min(siblings.indexOf(entry.target), 3) * 55;
      entry.target.animate(
        [{ transform: "translateY(22px)", opacity: 0.52 }, { transform: "none", opacity: 1 }],
        { duration: 620, delay, easing: "cubic-bezier(.2,.66,.25,1)", fill: "backwards" },
      );
    });
  }, { threshold: 0.2 });

  document.querySelectorAll(".section-head, .industry-intro, .route-photo, .process-photo, .implementation-intro").forEach((item) => entrances.observe(item));
  groups.forEach((group) => Array.from(group.children).forEach((item) => entrances.observe(item)));
}
