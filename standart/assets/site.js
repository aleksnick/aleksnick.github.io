const mobileMenu = document.querySelector(".mobile-nav");

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && mobileMenu.open) {
    mobileMenu.open = false;
    mobileMenu.querySelector("summary").focus();
  }
});

document.addEventListener("click", (event) => {
  if (mobileMenu.open && !mobileMenu.contains(event.target)) mobileMenu.open = false;
});

const showroom = document.querySelector("[data-showroom]");

if (showroom) {
  const controls = showroom.querySelector(".showroom-controls");
  const buttons = Array.from(controls.querySelectorAll("button"));
  const panels = buttons.map((button) => document.getElementById(button.getAttribute("aria-controls")));

  buttons.forEach((button, index) => {
    button.addEventListener("click", () => {
      buttons.forEach((control, current) => {
        control.setAttribute("aria-pressed", String(current === index));
        panels[current].hidden = current !== index;
      });
    });
  });
  controls.hidden = false;
}

const directory = document.querySelector("[data-directory]");

if (directory) {
  const input = directory.querySelector("input");
  const filters = Array.from(directory.querySelectorAll("[data-filter]"));
  const entries = Array.from(directory.querySelectorAll("[data-entry]"));
  const empty = directory.querySelector(".empty");
  const more = directory.querySelector(".more");
  const status = directory.querySelector(".search-status");
  const chunk = Number(directory.dataset.chunk);
  const requestedSector = new URLSearchParams(location.search).get("sector");
  let filter = filters.some((button) => button.dataset.filter === requestedSector) ? requestedSector : "all";
  let limit = chunk || entries.length;

  const normalize = (text) => text.toLocaleLowerCase("ru").replaceAll("ё", "е");
  const directoryIndex = entries.map((entry) => normalize(entry.textContent));

  function updateDirectory() {
    const words = input ? normalize(input.value.trim()).split(/\s+/).filter(Boolean) : [];
    let matched = 0;
    entries.forEach((entry, index) => {
      const matches = (filter === "all" || entry.dataset.sector === filter) &&
        words.every((word) => directoryIndex[index].includes(word));
      if (matches) matched += 1;
      entry.hidden = !matches || matched > limit;
    });
    filters.forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.filter === filter));
    });
    if (status) status.textContent = matched ? `Показано ${Math.min(limit, matched)} из ${matched}` : "";
    if (empty) empty.hidden = matched > 0;
    if (more) more.hidden = matched <= limit;
  }

  function resetDirectory() {
    limit = chunk || entries.length;
    updateDirectory();
  }

  input?.addEventListener("input", resetDirectory);
  filters.forEach((button) => {
    button.addEventListener("click", () => {
      filter = button.dataset.filter;
      resetDirectory();
    });
  });
  more?.addEventListener("click", () => {
    const previous = entries.filter((entry) => !entry.hidden).length;
    limit += chunk;
    updateDirectory();
    const next = entries.filter((entry) => !entry.hidden)[previous];
    if (next) next.focus({ preventScroll: true });
  });
  directory.querySelectorAll(".searchbox, .directory-filters").forEach((control) => {
    control.hidden = false;
  });
  updateDirectory();
}

document.querySelectorAll("[data-demo-form]").forEach((form) => {
  const result = form.parentElement.querySelector("[data-demo-result]");
  const restart = result.querySelector("[data-demo-restart]");
  const phone = form.elements.namedItem("phone");
  const message = form.elements.namedItem("message");
  const logo = form.elements.namedItem("logo");

  form.addEventListener("input", (event) => {
    event.target.setCustomValidity?.("");
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const name = form.elements.namedItem("name");
    if (!name.value.trim()) {
      name.setCustomValidity("Введите ваше имя.");
      name.reportValidity();
      return;
    }
    if (phone && phone.value.replace(/\D/g, "").length < 7) {
      phone.setCustomValidity("Введите номер телефона с кодом города или оператора.");
      phone.reportValidity();
      return;
    }
    if (form.dataset.feedbackKind === "review" && message.value.trim().length < 10) {
      message.setCustomValidity("Расскажите о вашем опыте, используя не менее 10 символов.");
      message.reportValidity();
      return;
    }
    if (logo?.files[0]?.size > 5 * 1024 * 1024) {
      logo.setCustomValidity("Выберите изображение размером до 5 МБ.");
      logo.reportValidity();
      return;
    }
    form.reset();
    form.hidden = true;
    result.hidden = false;
    result.focus();
  });

  restart.addEventListener("click", () => {
    result.hidden = true;
    form.hidden = false;
    form.elements.namedItem("name").focus();
  });
  form.hidden = false;
});

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
if ("IntersectionObserver" in window && !reducedMotion.matches) {
  const entrances = new IntersectionObserver((records, observer) => {
    records.forEach(({ target, isIntersecting }) => {
      if (!isIntersecting) return;
      observer.unobserve(target);
      if (reducedMotion.matches || target.contains(document.activeElement)) return;
      target.animate(
        [{ opacity: .55, transform: "translateY(15px)" }, { opacity: 1, transform: "none" }],
        { duration: 580, easing: "cubic-bezier(.2,.7,.2,1)" },
      );
    });
  }, { threshold: .17 });

  document.querySelectorAll(".section-head, .launch-layout > *, .program-group, .inquiry").forEach((item) => entrances.observe(item));
}
