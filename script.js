(() => {
  const root = document.documentElement;
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const header = document.querySelector(".site-header");
  const year = document.getElementById("year");

  root.classList.add("reveal-enabled");

  if (year) year.textContent = new Date().getFullYear();

  const updatePageState = () => {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;

    root.style.setProperty("--scroll-progress", `${Math.min(progress, 100)}%`);
    header?.classList.toggle("is-scrolled", window.scrollY > 48);
  };

  updatePageState();
  window.addEventListener("scroll", updatePageState, { passive: true });

  if (!prefersReducedMotion) {
    window.addEventListener(
      "pointermove",
      (event) => {
        root.style.setProperty("--pointer-x", `${event.clientX}px`);
        root.style.setProperty("--pointer-y", `${event.clientY}px`);
      },
      { passive: true },
    );
  }

  const revealElements = [...document.querySelectorAll(".reveal")];

  if ("IntersectionObserver" in window && !prefersReducedMotion) {
    const groupIndexes = new Map();

    revealElements.forEach((element) => {
      const group = element.closest(
        ".hero-layout, .manifesto, .project-grid, .approach-content, .talk-list, .contact-copy, section",
      );
      const index = groupIndexes.get(group) || 0;
      const delay = element.dataset.revealDelay || `${Math.min(index, 5) * 85}ms`;

      element.style.setProperty("--reveal-delay", delay);
      groupIndexes.set(group, index + 1);
    });

    const observer = new IntersectionObserver(
      (entries, revealObserver) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        });
      },
      { threshold: 0.01, rootMargin: "0px" },
    );

    revealElements.forEach((element) => observer.observe(element));

    requestAnimationFrame(() => {
      revealElements.forEach((element) => {
        const rect = element.getBoundingClientRect();
        const isOnScreen = rect.bottom > 0 && rect.top < window.innerHeight;

        if (!isOnScreen) return;
        element.classList.add("is-visible");
        observer.unobserve(element);
      });
    });
  } else {
    revealElements.forEach((element) => element.classList.add("is-visible"));
  }

  document.querySelectorAll(".video-trigger").forEach((trigger) => {
    trigger.addEventListener("click", (event) => {
      const videoId = trigger.dataset.videoId;
      const media = trigger.closest(".talk-media");

      if (!videoId || !media || !/^[\w-]{11}$/.test(videoId)) return;

      event.preventDefault();

      const player = document.createElement("iframe");
      const parameters = new URLSearchParams({ autoplay: "1", playsinline: "1", hl: "ru" });

      player.className = "talk-player";
      player.src = `https://www.youtube-nocookie.com/embed/${videoId}?${parameters}`;
      player.title = trigger.dataset.videoTitle || "YouTube video player";
      player.allow =
        "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
      player.referrerPolicy = "strict-origin-when-cross-origin";
      player.allowFullscreen = true;
      player.tabIndex = 0;
      player.addEventListener("load", () => player.focus(), { once: true });

      media.classList.add("is-playing");
      trigger.closest(".talk-card")?.classList.add("is-playing");
      media.replaceChildren(player);
    });
  });
})();
