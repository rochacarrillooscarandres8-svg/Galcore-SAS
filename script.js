/* ==================================================================
   FERREMAX · JavaScript puro (vanilla JS)
   - Navbar sticky con cambio al hacer scroll
   - Menú móvil (hamburguesa)
   - Enlace activo según sección visible
   - Animaciones de aparición al hacer scroll (reveal)
   - Contadores animados
   - Carrusel de galería: infinito, autoplay, botones, puntos y pausa
   - Año dinámico del footer
   ================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  "use strict";

  /* --------------------------------------------------------------
     1. NAVBAR: cambia de estilo al hacer scroll
     -------------------------------------------------------------- */
  const nav = document.getElementById("nav");

  const onScrollNav = () => {
    if (window.scrollY > 40) {
      nav.classList.add("is-scrolled");
    } else {
      nav.classList.remove("is-scrolled");
    }
  };
  onScrollNav();
  window.addEventListener("scroll", onScrollNav, { passive: true });

  /* --------------------------------------------------------------
     2. MENÚ MÓVIL (hamburguesa)
     -------------------------------------------------------------- */
  const toggle = document.getElementById("navToggle");
  const menu = document.getElementById("navMenu");

  const closeMenu = () => {
    menu.classList.remove("is-open");
    toggle.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Abrir menú");
  };

  toggle.addEventListener("click", () => {
    const open = menu.classList.toggle("is-open");
    toggle.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
  });

  // Cierra el menú al pulsar un enlace (en móvil)
  menu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  // Cierra el menú al pulsar fuera de él
  document.addEventListener("click", (e) => {
    if (
      menu.classList.contains("is-open") &&
      !menu.contains(e.target) &&
      !toggle.contains(e.target)
    ) {
      closeMenu();
    }
  });

  /* --------------------------------------------------------------
     3. ENLACE ACTIVO según la sección visible (scrollspy)
     -------------------------------------------------------------- */
  const links = Array.from(menu.querySelectorAll(".nav__link"));
  const sections = links
    .map((l) => document.querySelector(l.getAttribute("href")))
    .filter(Boolean);

  if ("IntersectionObserver" in window && sections.length) {
    const spy = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = "#" + entry.target.id;
            links.forEach((l) =>
              l.classList.toggle("is-active", l.getAttribute("href") === id)
            );
          }
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );
    sections.forEach((s) => spy.observe(s));
  }

  /* --------------------------------------------------------------
     4. REVEAL: animación de aparición al hacer scroll
     -------------------------------------------------------------- */
  const reveals = document.querySelectorAll(".reveal");

  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
          setTimeout(() => entry.target.classList.add("is-visible"), 80);
            obs.unobserve(entry.target); // se anima solo una vez
          }
        });
      },
      { rootMargin: "0px 0px -80px 0px", threshold: 0 }
    );
    reveals.forEach((el) => revealObserver.observe(el));
  } else {
    // Fallback: si no hay soporte, mostrar todo
    reveals.forEach((el) => el.classList.add("is-visible"));
  }

  /* --------------------------------------------------------------
     5. CONTADORES animados (se disparan al entrar en pantalla)
     -------------------------------------------------------------- */
  const counters = document.querySelectorAll(".stat__num");

  const runCounter = (el) => {
    const target = parseInt(el.dataset.target, 10) || 0;
    const prefix = el.dataset.prefix || "";
    const suffix = el.dataset.suffix || "";
    const duration = 1800; // ms
    const start = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      // easeOutCubic para un final suave
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.round(target * eased);
      el.textContent = prefix + value.toLocaleString("es-CO") + suffix;
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  if ("IntersectionObserver" in window && counters.length) {
    const counterObserver = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            runCounter(entry.target);
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );
    counters.forEach((c) => counterObserver.observe(c));
  } else {
    counters.forEach((c) => {
      c.textContent =
        (c.dataset.prefix || "") +
        (parseInt(c.dataset.target, 10) || 0) +
        (c.dataset.suffix || "");
    });
  }

  /* --------------------------------------------------------------
     6. CARRUSEL de la galería
        - autoplay infinito
        - botones izquierda / derecha
        - puntos de navegación
        - pausa al pasar el mouse
        - responsive (3 / 2 / 1 elementos visibles)
     -------------------------------------------------------------- */
  const carousel = document.getElementById("carousel");
  const track = document.getElementById("carTrack");
  const prevBtn = document.getElementById("carPrev");
  const nextBtn = document.getElementById("carNext");
  const dotsWrap = document.getElementById("carDots");

  if (carousel && track) {
    const items = Array.from(track.children);
    let index = 0;
    let visible = getVisible();
    let maxIndex = Math.max(items.length - visible, 0);
    let timer = null;
    const DELAY = 3200; // ms entre transiciones

    // Determina cuántos elementos se ven según el ancho
    function getVisible() {
      const w = window.innerWidth;
      if (w <= 600) return 1;
      if (w <= 980) return 2;
      return 3;
    }

    // Mueve el track a la posición actual
    function update() {
      const step = 100 / visible;
      track.style.transform = `translateX(-${index * step}%)`;
      buildOrSyncDots();
    }

    // Avanza (con bucle infinito)
    function next() {
      index = index >= maxIndex ? 0 : index + 1;
      update();
    }

    // Retrocede (con bucle infinito)
    function prev() {
      index = index <= 0 ? maxIndex : index - 1;
      update();
    }

    // Genera o sincroniza los puntos de navegación
    function buildOrSyncDots() {
      const needed = maxIndex + 1;
      if (dotsWrap.children.length !== needed) {
        dotsWrap.innerHTML = "";
        for (let i = 0; i < needed; i++) {
          const dot = document.createElement("button");
          dot.setAttribute("aria-label", `Ir al grupo ${i + 1}`);
          dot.addEventListener("click", () => {
            index = i;
            update();
            restart();
          });
          dotsWrap.appendChild(dot);
        }
      }
      Array.from(dotsWrap.children).forEach((d, i) =>
        d.classList.toggle("is-active", i === index)
      );
    }

    // Autoplay
    function play() {
      stop();
      timer = setInterval(next, DELAY);
    }
    function stop() {
      if (timer) clearInterval(timer);
      timer = null;
    }
    function restart() {
      play();
    }

    // Botones
    nextBtn.addEventListener("click", () => {
      next();
      restart();
    });
    prevBtn.addEventListener("click", () => {
      prev();
      restart();
    });

    // Pausa al pasar el mouse / al enfocar
    carousel.addEventListener("mouseenter", stop);
    carousel.addEventListener("mouseleave", play);
    carousel.addEventListener("focusin", stop);
    carousel.addEventListener("focusout", play);

    // Soporte táctil: deslizar para cambiar
    let touchX = null;
    track.addEventListener(
      "touchstart",
      (e) => {
        touchX = e.touches[0].clientX;
        stop();
      },
      { passive: true }
    );
    track.addEventListener(
      "touchend",
      (e) => {
        if (touchX === null) return;
        const diff = e.changedTouches[0].clientX - touchX;
        if (Math.abs(diff) > 45) (diff < 0 ? next : prev)();
        touchX = null;
        play();
      },
      { passive: true }
    );

    // Recalcula al cambiar el tamaño de la ventana
    let resizeId;
    window.addEventListener("resize", () => {
      clearTimeout(resizeId);
      resizeId = setTimeout(() => {
        const v = getVisible();
        if (v !== visible) {
          visible = v;
          maxIndex = Math.max(items.length - visible, 0);
          if (index > maxIndex) index = maxIndex;
        }
        update();
      }, 150);
    });

    // Inicialización
    update();
    play();
  }

  /* --------------------------------------------------------------
     7. AÑO dinámico en el footer
     -------------------------------------------------------------- */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
});

