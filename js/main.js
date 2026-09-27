/* Century Global Organisation — site scripts */
(function () {
  "use strict";

  /* ---------- Mobile menu ---------- */
  const toggle = document.querySelector(".menu-toggle");
  const links = document.querySelector(".nav-links");
  if (toggle && links) {
    toggle.addEventListener("click", () => {
      const open = links.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open);
    });
    links.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", () => links.classList.remove("open"))
    );
  }

  /* ---------- Active nav link ---------- */
  const page = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-links a").forEach((a) => {
    if (a.getAttribute("href") === page) a.classList.add("active");
  });

  /* ---------- Footer year ---------- */
  document.querySelectorAll("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));

  /* ---------- Reveal on scroll ---------- */
  const revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        }),
      { threshold: 0.12 }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("in"));
  }

  /* ---------- Animated counters ---------- */
  const counters = document.querySelectorAll("[data-count]");
  if (counters.length && "IntersectionObserver" in window) {
    const co = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const el = e.target;
        const end = +el.dataset.count;
        const suffix = el.dataset.suffix || "";
        const start = performance.now();
        const dur = 1600;
        const tick = (t) => {
          const p = Math.min((t - start) / dur, 1);
          el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))) + suffix;
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        co.unobserve(el);
      });
    }, { threshold: 0.5 });
    counters.forEach((c) => co.observe(c));
  }

  /* ---------- Slider ---------- */
  const slider = document.querySelector(".slider");
  if (slider) {
    const slides = slider.querySelectorAll(".slide");
    const dotsWrap = slider.querySelector(".slider-dots");
    let index = 0;
    let timer;
    slides.forEach((_, i) => {
      const b = document.createElement("button");
      b.setAttribute("aria-label", "Go to slide " + (i + 1));
      b.addEventListener("click", () => go(i, true));
      dotsWrap.appendChild(b);
    });
    const dots = dotsWrap.querySelectorAll("button");
    function go(i, user) {
      index = (i + slides.length) % slides.length;
      slides.forEach((s, k) => s.classList.toggle("active", k === index));
      dots.forEach((d, k) => d.classList.toggle("active", k === index));
      if (user) restart();
    }
    function restart() {
      clearInterval(timer);
      timer = setInterval(() => go(index + 1), 5000);
    }
    slider.querySelector(".prev").addEventListener("click", () => go(index - 1, true));
    slider.querySelector(".next").addEventListener("click", () => go(index + 1, true));
    go(0);
    restart();
  }

  /* ---------- Hero: brand / audience / growth canvas ---------- */
  const canvas = document.getElementById("orbitCanvas");
  if (canvas) {
    const ctx = canvas.getContext("2d");
    const reach = document.getElementById("reach");
    const growth = document.getElementById("growth");
    const reachOut = document.getElementById("reachOut");
    const growthOut = document.getElementById("growthOut");
    const pauseBtn = document.getElementById("pauseBtn");
    const swatches = document.querySelectorAll(".swatch");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let accent = [201, 150, 47];
    let paused = reduce;
    let t = 0;
    let W = 0, H = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const dots = Array.from({ length: 60 }, (_, i) => ({
      ring: i % 3,
      angle: Math.random() * Math.PI * 2,
      speed: 0.002 + Math.random() * 0.004,
      size: 1.5 + Math.random() * 2.5,
      hue: Math.random(),
    }));

    function resize() {
      const r = canvas.getBoundingClientRect();
      W = r.width; H = r.height;
      canvas.width = W * dpr; canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    window.addEventListener("resize", resize);
    resize();

    function updateSlider(input, out) {
      const pct = ((input.value - input.min) / (input.max - input.min)) * 100;
      input.style.setProperty("--val", pct + "%");
      out.textContent = (+input.value).toFixed(1) + "x";
    }
    [[reach, reachOut], [growth, growthOut]].forEach(([i, o]) => {
      updateSlider(i, o);
      i.addEventListener("input", () => updateSlider(i, o));
    });

    swatches.forEach((s) =>
      s.addEventListener("click", () => {
        swatches.forEach((x) => x.classList.remove("active"));
        s.classList.add("active");
        accent = s.dataset.rgb.split(",").map(Number);
        if (paused) draw();
      })
    );

    pauseBtn.addEventListener("click", () => {
      paused = !paused;
      pauseBtn.querySelector("span").textContent = paused ? "Play" : "Pause";
      if (!paused) loop();
    });
    if (paused) pauseBtn.querySelector("span").textContent = "Play";

    const rgba = (a) => `rgba(${accent[0]},${accent[1]},${accent[2]},${a})`;

    function draw() {
      const r = +reach.value;
      const g = +growth.value;
      ctx.clearRect(0, 0, W, H);

      // soft glow behind the brand
      const glow = ctx.createRadialGradient(W * 0.55, H * 0.6, 0, W * 0.55, H * 0.6, Math.max(W, H) * 0.6);
      glow.addColorStop(0, rgba(0.16));
      glow.addColorStop(1, rgba(0));
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, W, H);

      const cx = W * 0.48;
      const cy = H * 0.5;
      const base = Math.min(W, H) * 0.12;

      // orbit rings
      for (let k = 0; k < 3; k++) {
        const rad = base * (1.4 + k * 0.85) * (0.75 + r * 0.12);
        ctx.beginPath();
        ctx.ellipse(cx, cy, rad, rad * 0.95, 0, 0, Math.PI * 2);
        ctx.strokeStyle = rgba(0.12 + (2 - k) * 0.05);
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // audience dots
      const visible = Math.round(20 + r * 12);
      dots.slice(0, visible).forEach((d) => {
        if (!paused) d.angle += d.speed * (0.6 + r * 0.3);
        const rad = base * (1.4 + d.ring * 0.85) * (0.75 + r * 0.12);
        const x = cx + Math.cos(d.angle) * rad;
        const y = cy + Math.sin(d.angle) * rad * 0.95;
        ctx.beginPath();
        ctx.arc(x, y, d.size, 0, Math.PI * 2);
        ctx.fillStyle = d.hue > 0.7 ? "rgba(56,163,214,.85)" : rgba(0.85);
        ctx.shadowColor = ctx.fillStyle;
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // brand at the centre
      const pulse = 1 + Math.sin(t * 0.04) * 0.05;
      ctx.beginPath();
      ctx.arc(cx, cy, base * 0.8 * pulse, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(12,22,48,.9)";
      ctx.fill();
      ctx.strokeStyle = rgba(0.35);
      ctx.stroke();
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(Math.PI / 4);
      const s = base * 0.42;
      const dg = ctx.createLinearGradient(-s, -s, s, s);
      dg.addColorStop(0, `rgb(${Math.min(accent[0] + 40, 255)},${Math.min(accent[1] + 60, 255)},${accent[2]})`);
      dg.addColorStop(1, rgba(1));
      ctx.fillStyle = dg;
      ctx.shadowColor = rgba(0.8);
      ctx.shadowBlur = 30;
      ctx.fillRect(-s / 2, -s / 2, s, s);
      ctx.restore();

      // growth bars
      const bx = W * 0.76;
      const by = H * 0.86;
      const bw = Math.max(8, W * 0.018);
      for (let i = 0; i < 5; i++) {
        const wave = paused ? 1 : 0.85 + Math.sin(t * 0.03 + i * 0.6) * 0.15;
        const h = (20 + i * 16) * (0.6 + g * 0.35) * wave;
        ctx.fillStyle = rgba(0.35 + i * 0.1);
        ctx.fillRect(bx + i * (bw + 6), by - h, bw, h);
      }
    }

    function loop() {
      if (paused) return;
      t++;
      draw();
      requestAnimationFrame(loop);
    }
    draw();
    loop();
  }

  /* ---------- Gallery filter + lightbox ---------- */
  const filters = document.querySelectorAll(".filters button");
  filters.forEach((btn) =>
    btn.addEventListener("click", () => {
      filters.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      const f = btn.dataset.filter;
      document.querySelectorAll(".g-item").forEach((it) => {
        it.classList.toggle("hide", f !== "all" && it.dataset.cat !== f);
      });
    })
  );
  document.querySelectorAll(".g-item img").forEach((img) =>
    img.addEventListener("click", () => {
      const box = document.createElement("div");
      box.className = "lightbox";
      box.innerHTML = '<button aria-label="Close">&times;</button>';
      const big = document.createElement("img");
      big.src = img.src;
      big.alt = img.alt;
      box.appendChild(big);
      box.addEventListener("click", () => box.remove());
      document.body.appendChild(box);
    })
  );

  /* ---------- Forms (works with Netlify Forms when deployed) ---------- */
  document.querySelectorAll("form[data-netlify]").forEach((form) => {
    const fileInput = form.querySelector('input[type="file"]');
    const fileLabel = form.querySelector(".file-name");
    if (fileInput && fileLabel) {
      fileInput.addEventListener("change", () => {
        const f = fileInput.files[0];
        if (f && f.size > 5 * 1024 * 1024) {
          alert("Please choose a file smaller than 5 MB.");
          fileInput.value = "";
          fileLabel.textContent = "Choose a file…";
          return;
        }
        fileLabel.textContent = f ? f.name : "Choose a file…";
      });
    }

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const status = form.querySelector(".form-status");
      const btn = form.querySelector('button[type="submit"]');
      btn.disabled = true;
      status.className = "form-status";
      status.textContent = "Sending…";
      try {
        const res = await fetch("/", { method: "POST", body: new FormData(form) });
        if (!res.ok) throw new Error(res.status);
        const card = form.closest(".form-card");
        card.innerHTML =
          '<div class="thanks"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="m8 12 3 3 5-6"/></svg>' +
          "<h2>Thank you.</h2><p>Your details have been sent to the CGO team. We will get back to you shortly.</p></div>";
      } catch (err) {
        status.className = "form-status err";
        status.textContent =
          "Sorry, the form could not be sent right now. Please email info@centuryglobalorganisation.com or call +91 99594 50304.";
        btn.disabled = false;
      }
    });
  });
})();
