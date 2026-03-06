/* ===========================
   HINOSHI GROUP — script.js
   =========================== */

/* ── Year ───────────────────────────────────────── */
document.getElementById('year').textContent = new Date().getFullYear();

/* ── Navbar scroll ──────────────────────────────── */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

/* ── Mobile menu ────────────────────────────────── */
const burger = document.getElementById('nav-burger');
const mobileNav = document.getElementById('nav-mobile');

burger.addEventListener('click', () => {
  const isOpen = mobileNav.classList.toggle('open');
  burger.classList.toggle('open', isOpen);
});
mobileNav.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    mobileNav.classList.remove('open');
    burger.classList.remove('open');
  });
});

/* ── Theme toggle ───────────────────────────────── */
const themeToggle = document.getElementById('theme-toggle');
const root = document.documentElement;

// Default to dark; only override if user has previously chosen light
const savedTheme = localStorage.getItem('hg-theme');
root.setAttribute('data-theme', savedTheme === 'light' ? 'light' : 'dark');

themeToggle.addEventListener('click', () => {
  const current = root.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  root.setAttribute('data-theme', next);
  localStorage.setItem('hg-theme', next);
});

/* ── Reveal on scroll ───────────────────────────── */
const revealEls = document.querySelectorAll('[data-reveal]');

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      // stagger sibling cards
      const siblings = Array.from(entry.target.parentElement.children)
        .filter(el => el.hasAttribute('data-reveal'));
      const idx = siblings.indexOf(entry.target);
      const delay = idx * 120;
      setTimeout(() => {
        entry.target.classList.add('revealed');
      }, delay);
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

revealEls.forEach(el => revealObserver.observe(el));

/* ── Animated counters ──────────────────────────── */
function easeOutExpo(t) {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

function animateCounter(el) {
  const target = parseFloat(el.dataset.target);
  const isDecimal = el.dataset.decimal === '1';
  const suffix = el.dataset.suffix || '';
  const duration = 2000;
  const start = performance.now();

  function tick(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = easeOutExpo(progress);
    const value = target * eased;

    if (isDecimal) {
      el.textContent = value.toFixed(1);
    } else {
      el.textContent = Math.round(value).toLocaleString() + (progress === 1 ? suffix : '');
    }

    if (progress < 1) {
      requestAnimationFrame(tick);
    } else {
      if (isDecimal) {
        el.textContent = target.toFixed(1);
      } else {
        el.textContent = Math.round(target).toLocaleString() + suffix;
      }
    }
  }

  requestAnimationFrame(tick);
}

const counterEls = document.querySelectorAll('.counter');
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCounter(entry.target);
      counterObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.4 });

counterEls.forEach(el => counterObserver.observe(el));

/* ── Hero Canvas ────────────────────────────────── */
(function() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H, animFrame;

  // Grid lines
  const gridSpacing = 60;
  // Chart lines
  const lines = [];
  const NUM_LINES = 5;

  // Data points
  const particles = [];
  const NUM_PARTICLES = 28;

  function resize() {
    W = canvas.width = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
    initLines();
    initParticles();
  }

  function randBetween(a, b) { return a + Math.random() * (b - a); }

  function initLines() {
    lines.length = 0;
    for (let i = 0; i < NUM_LINES; i++) {
      const pts = [];
      const numPts = 8;
      const segW = W / (numPts - 1);
      let y = randBetween(H * 0.25, H * 0.75);
      for (let j = 0; j < numPts; j++) {
        y += randBetween(-H * 0.08, H * 0.08);
        y = Math.max(H * 0.1, Math.min(H * 0.9, y));
        pts.push({ x: j * segW, y });
      }
      lines.push({
        pts,
        offset: randBetween(0, Math.PI * 2),
        speed: randBetween(0.0003, 0.0007),
        alpha: randBetween(0.06, 0.14),
      });
    }
  }

  function initParticles() {
    particles.length = 0;
    for (let i = 0; i < NUM_PARTICLES; i++) {
      particles.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: randBetween(1, 2.2),
        vx: randBetween(-0.12, 0.12),
        vy: randBetween(-0.08, 0.08),
        alpha: randBetween(0.15, 0.45),
        pulse: randBetween(0, Math.PI * 2),
        pulseSpeed: randBetween(0.008, 0.018),
        gold: Math.random() < 0.22, // ~22% gold dots
      });
    }
  }

  function catmullRom(ctx, pts) {
    if (pts.length < 2) return;
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length - 1; i++) {
      const p0 = pts[i - 1];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const cpx1 = p0.x + (p2.x - p0.x) / 6;
      const cpy1 = p0.y + (p2.y - p0.y) / 6;
      const cpx2 = p1.x - (p2.x - p0.x) / 6;
      const cpy2 = p1.y - (p2.y - p0.y) / 6;
      ctx.bezierCurveTo(cpx1, cpy1, cpx2, cpy2, p1.x, p1.y);
    }
    ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
  }

  let t = 0;
  function draw() {
    ctx.clearRect(0, 0, W, H);

    // Grid
    ctx.strokeStyle = 'rgba(176,137,61,0.06)';
    ctx.lineWidth = 1;
    for (let x = 0; x < W; x += gridSpacing) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }
    for (let y = 0; y < H; y += gridSpacing) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }

    // Chart lines
    lines.forEach(line => {
      const wave = Math.sin(t * line.speed * 1000 + line.offset) * 14;
      const pts = line.pts.map(p => ({ x: p.x, y: p.y + wave }));

      ctx.beginPath();
      catmullRom(ctx, pts);
      ctx.strokeStyle = `rgba(176,137,61,${line.alpha})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    });

    // Particles
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.pulse += p.pulseSpeed;
      if (p.x < 0) p.x = W;
      if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H;
      if (p.y > H) p.y = 0;

      const pAlpha = p.alpha * (0.6 + 0.4 * Math.sin(p.pulse));
      const color = p.gold
        ? `rgba(176,137,61,${pAlpha})`
        : `rgba(200,198,190,${pAlpha * 0.5})`;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
    });

    t++;
    animFrame = requestAnimationFrame(draw);
  }

  const ro = new ResizeObserver(resize);
  ro.observe(canvas.parentElement);
  resize();
  draw();
})();

/* ── Smooth scroll offset for fixed nav ─────────── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const href = a.getAttribute('href');
    if (href === '#') return;
    const target = document.querySelector(href);
    if (!target) return;
    e.preventDefault();
    const top = target.getBoundingClientRect().top + window.scrollY - 70;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});
