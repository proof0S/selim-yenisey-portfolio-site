const isTouch = window.matchMedia('(hover: none)').matches;
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let particlesStarted = false;

const loader = document.getElementById('loader');
window.addEventListener('load', () => {
  if (!loader) {
    document.body.classList.add('ready');
    if (!particlesStarted) {
      initParticles();
      particlesStarted = true;
    }
    return;
  }

  loader.classList.add('phase-1');

  setTimeout(() => {
    loader.classList.add('blast');
  }, 760);

  setTimeout(() => {
    loader.classList.add('done');
    document.body.classList.add('ready');
    if (!particlesStarted) {
      initParticles();
      particlesStarted = true;
    }
  }, 1120);
});

window.addEventListener('DOMContentLoaded', () => {
  requestAnimationFrame(() => {
    document.body.classList.add('page-entered');
  });

  const links = document.querySelectorAll('a[href]');
  links.forEach((link) => {
    link.addEventListener('click', (event) => {
      const href = link.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return;
      if (link.target === '_blank' || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const destination = new URL(link.href, window.location.href);
      const current = new URL(window.location.href);
      const isInternal = destination.origin === current.origin;
      const isHtmlPage = destination.pathname.endsWith('.html') || destination.pathname === '/';
      if (!isInternal || !isHtmlPage || destination.href === current.href) return;

      event.preventDefault();
      document.body.classList.remove('page-entered');
      document.body.classList.add('page-leaving');
      setTimeout(() => {
        window.location.href = destination.href;
      }, 320);
    });
  });
});

const progressBar = document.getElementById('progress-bar');
function updateProgress() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const progress = max > 0 ? (window.scrollY / max) * 100 : 0;
  progressBar.style.width = `${progress}%`;
}
window.addEventListener('scroll', updateProgress, { passive: true });
updateProgress();

const root = document.documentElement;
const spotlight = document.getElementById('spotlight');

let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;

window.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;

  const x = (e.clientX / window.innerWidth) * 100;
  const y = (e.clientY / window.innerHeight) * 100;
  root.style.setProperty('--x', `${x}%`);
  root.style.setProperty('--y', `${y}%`);

  if (spotlight) {
    spotlight.style.setProperty('--mx', `${x}%`);
    spotlight.style.setProperty('--my', `${y}%`);
  }

});

function splitHeadingWords() {
  const lines = document.querySelectorAll('.split-line');
  if (!lines.length) return false;
  lines.forEach((line) => {
    const text = line.textContent;
    line.textContent = '';
    text.split(' ').forEach((word, idx, arr) => {
      const span = document.createElement('span');
      span.className = 'word';
      span.textContent = idx < arr.length - 1 ? `${word}\u00a0` : word;
      span.style.setProperty('--word-index', idx);
      line.appendChild(span);
    });
  });
  return true;
}
const hasHeroWords = splitHeadingWords();
if (hasHeroWords) {
  initLetterThrow();
}

const revealItems = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('show');
      }
    });
  },
  { threshold: 0.16 }
);
revealItems.forEach((item) => observer.observe(item));

if (!isTouch && !reduceMotion) {
  const tiltCards = document.querySelectorAll('.tilt-card');
  tiltCards.forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const rotateX = ((y / rect.height) - 0.5) * -8;
      const rotateY = ((x / rect.width) - 0.5) * 8;
      card.style.transform = `perspective(650px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(650px) rotateX(0deg) rotateY(0deg)';
    });
  });

  const magneticItems = document.querySelectorAll('.magnetic');
  magneticItems.forEach((item) => {
    item.addEventListener('mousemove', (e) => {
      const rect = item.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      item.style.transform = `translate(${x * 0.1}px, ${y * 0.1}px)`;
    });

    item.addEventListener('mouseleave', () => {
      item.style.transform = 'translate(0, 0)';
    });
  });
}

function initLetterThrow() {
  if (isTouch) return;

  const words = Array.from(document.querySelectorAll('#hero-title .word'));
  if (!words.length) return;

  let rafId = 0;

  const states = words.map((el) => ({
    el,
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    dragging: false,
    px: 0,
    py: 0,
    pt: 0,
  }));

  const animate = () => {
    let running = false;

    states.forEach((s) => {
      if (!s.dragging) {
        s.x += s.vx;
        s.y += s.vy;

        s.vx *= 0.93;
        s.vy *= 0.93;

        // Spring back toward original position after throw.
        s.vx += -s.x * 0.022;
        s.vy += -s.y * 0.022;

        if (
          Math.abs(s.x) < 0.08 &&
          Math.abs(s.y) < 0.08 &&
          Math.abs(s.vx) < 0.08 &&
          Math.abs(s.vy) < 0.08
        ) {
          s.x = 0;
          s.y = 0;
          s.vx = 0;
          s.vy = 0;
        } else {
          running = true;
        }
      } else {
        running = true;
      }

      s.el.style.translate = `${s.x}px ${s.y}px`;
      s.el.style.rotate = `${s.x * 0.1}deg`;
    });

    if (running) {
      rafId = requestAnimationFrame(animate);
    } else {
      rafId = 0;
    }
  };

  const ensureAnim = () => {
    if (!rafId) rafId = requestAnimationFrame(animate);
  };

  states.forEach((s) => {
    const onMove = (e) => {
      if (!s.dragging) return;

      const now = performance.now();
      const dx = e.clientX - s.px;
      const dy = e.clientY - s.py;
      const dt = Math.max(8, now - s.pt);

      s.x += dx;
      s.y += dy;
      s.vx = dx / dt * 16;
      s.vy = dy / dt * 16;

      s.px = e.clientX;
      s.py = e.clientY;
      s.pt = now;
    };

    const endDrag = () => {
      if (!s.dragging) return;
      s.dragging = false;
      s.el.classList.remove('dragging');
      ensureAnim();
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', endDrag);
      window.removeEventListener('pointercancel', endDrag);
    };

    s.el.addEventListener('pointerdown', (e) => {
      s.dragging = true;
      s.el.classList.add('dragging');
      s.px = e.clientX;
      s.py = e.clientY;
      s.pt = performance.now();
      s.el.setPointerCapture(e.pointerId);
      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', endDrag);
      window.addEventListener('pointercancel', endDrag);
      ensureAnim();
    });
  });
}

function initParticles() {
  if (reduceMotion) return;

  const canvas = document.getElementById('particles');
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  let particles = [];
  let width = 0;
  let height = 0;
  const particleCount = isTouch ? 30 : 70;

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.55,
      vy: (Math.random() - 0.5) * 0.55,
      r: Math.random() * 1.8 + 0.6,
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < particles.length; i += 1) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0 || p.x > width) p.vx *= -1;
      if (p.y < 0 || p.y > height) p.vy *= -1;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      ctx.fill();

      for (let j = i + 1; j < particles.length; j += 1) {
        const q = particles[j];
        const dx = p.x - q.x;
        const dy = p.y - q.y;
        const dist = Math.hypot(dx, dy);

        if (dist < 120) {
          const alpha = 1 - dist / 120;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.strokeStyle = `rgba(0, 212, 255, ${alpha * 0.18})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(draw);
  }

  resize();
  draw();
  window.addEventListener('resize', resize);
}

if (reduceMotion) {
  particlesStarted = true;
}
