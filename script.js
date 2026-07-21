(() => {
  const root = document.documentElement;
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  root.classList.add("reveal-enabled");

  document.getElementById("year").textContent = new Date().getFullYear();

  const updateScrollProgress = () => {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
    root.style.setProperty("--scroll-progress", `${Math.min(progress, 100)}%`);
  };

  updateScrollProgress();
  window.addEventListener("scroll", updateScrollProgress, { passive: true });

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
    const revealGroupIndexes = new Map();

    revealElements.forEach((element) => {
      const group = element.closest(
        ".hero-copy, .project-list, .pipeline-stages, .talk-list, .contact, section, main",
      );
      const index = revealGroupIndexes.get(group) || 0;
      const delay = element.dataset.revealDelay || `${Math.min(index, 4) * 90}ms`;

      element.style.setProperty("--reveal-delay", delay);
      revealGroupIndexes.set(group, index + 1);
    });

    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -7%" },
    );

    revealElements.forEach((element) => revealObserver.observe(element));
  } else {
    revealElements.forEach((element) => element.classList.add("is-visible"));
  }

  if (!prefersReducedMotion && window.matchMedia("(pointer: fine)").matches) {
    document.querySelectorAll(".project-card").forEach((card) => {
      card.addEventListener("pointermove", (event) => {
        const rect = card.getBoundingClientRect();
        const relativeX = (event.clientX - rect.left) / rect.width - 0.5;
        const relativeY = (event.clientY - rect.top) / rect.height - 0.5;
        card.style.setProperty("--tilt-x", `${relativeX * 3.5}deg`);
        card.style.setProperty("--tilt-y", `${relativeY * -3.5}deg`);
      });

      card.addEventListener("pointerleave", () => {
        card.style.setProperty("--tilt-x", "0deg");
        card.style.setProperty("--tilt-y", "0deg");
      });
    });
  }

  const canvas = document.getElementById("signal-canvas");
  const context = canvas?.getContext("2d");

  if (!canvas || !context || prefersReducedMotion) return;

  let width = 0;
  let height = 0;
  let animationFrame = 0;
  let points = [];
  const pointer = { x: -1000, y: -1000 };

  const resizeCanvas = () => {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);

    const count = Math.max(22, Math.min(52, Math.floor(width / 32)));
    points = Array.from({ length: count }, (_, index) => ({
      x: (index * 127.31) % width,
      y: (index * 73.17) % height,
      vx: ((index % 5) - 2) * 0.045,
      vy: (((index * 3) % 5) - 2) * 0.038,
      r: index % 7 === 0 ? 1.8 : 1,
    }));
  };

  const draw = () => {
    context.clearRect(0, 0, width, height);

    points.forEach((point) => {
      point.x += point.vx;
      point.y += point.vy;
      if (point.x < -10) point.x = width + 10;
      if (point.x > width + 10) point.x = -10;
      if (point.y < -10) point.y = height + 10;
      if (point.y > height + 10) point.y = -10;
    });

    for (let index = 0; index < points.length; index += 1) {
      const point = points[index];
      for (let targetIndex = index + 1; targetIndex < points.length; targetIndex += 1) {
        const target = points[targetIndex];
        const distance = Math.hypot(point.x - target.x, point.y - target.y);
        if (distance > 145) continue;
        context.beginPath();
        context.moveTo(point.x, point.y);
        context.lineTo(target.x, target.y);
        context.strokeStyle = `rgba(200, 255, 61, ${(1 - distance / 145) * 0.11})`;
        context.lineWidth = 0.6;
        context.stroke();
      }

      const pointerDistance = Math.hypot(point.x - pointer.x, point.y - pointer.y);
      if (pointerDistance < 210) {
        context.beginPath();
        context.moveTo(point.x, point.y);
        context.lineTo(pointer.x, pointer.y);
        context.strokeStyle = `rgba(200, 255, 61, ${(1 - pointerDistance / 210) * 0.16})`;
        context.lineWidth = 0.7;
        context.stroke();
      }

      context.beginPath();
      context.arc(point.x, point.y, point.r, 0, Math.PI * 2);
      context.fillStyle = point.r > 1 ? "rgba(200, 255, 61, .42)" : "rgba(255, 255, 255, .19)";
      context.fill();
    }

    animationFrame = requestAnimationFrame(draw);
  };

  window.addEventListener(
    "pointermove",
    (event) => {
      pointer.x = event.clientX;
      pointer.y = event.clientY;
    },
    { passive: true },
  );
  window.addEventListener("resize", resizeCanvas, { passive: true });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      cancelAnimationFrame(animationFrame);
    } else {
      animationFrame = requestAnimationFrame(draw);
    }
  });

  resizeCanvas();
  draw();
})();
