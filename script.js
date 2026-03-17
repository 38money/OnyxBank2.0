/* =========================================
   RATOBANK — JAVASCRIPT
   ========================================= */

'use strict';

// ===== NAVBAR =====
const navbar = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('nav-links');

window.addEventListener('scroll', () => {
  if (window.scrollY > 50) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
});

hamburger.addEventListener('click', () => {
  navLinks.classList.toggle('open');
  hamburger.classList.toggle('active');
});

navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    hamburger.classList.remove('active');
  });
});

// ===== SMOOTH SCROLL =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const href = this.getAttribute('href');
    if (href === '#') return;
    const target = document.querySelector(href);
    if (target) {
      e.preventDefault();
      const offset = 80;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});

// ===== SCROLL ANIMATIONS (IntersectionObserver) =====
const animateElements = document.querySelectorAll('.fade-in, .fade-in-delay, .fade-up');

const observerOptions = {
  threshold: 0.08,
  rootMargin: '0px 0px -40px 0px',
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, observerOptions);

animateElements.forEach(el => observer.observe(el));

// ===== PARTICLES CANVAS =====
const canvas = document.getElementById('particles-canvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

const particles = [];
const PARTICLE_COUNT = 55;

class Particle {
  constructor() {
    this.reset();
  }

  reset() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.size = Math.random() * 1.5 + 0.5;
    this.speedX = (Math.random() - 0.5) * 0.4;
    this.speedY = (Math.random() - 0.5) * 0.4;
    this.opacity = Math.random() * 0.3 + 0.05;
    this.color = Math.random() > 0.5 ? '201, 168, 76' : '255, 255, 255';
    this.pulse = Math.random() * Math.PI * 2;
    this.pulseSpeed = Math.random() * 0.015 + 0.005;
  }

  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    this.pulse += this.pulseSpeed;

    if (this.x < 0 || this.x > canvas.width ||
        this.y < 0 || this.y > canvas.height) {
      this.reset();
    }
  }

  draw() {
    const pulsedOpacity = this.opacity * (0.7 + 0.3 * Math.sin(this.pulse));
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${this.color}, ${pulsedOpacity})`;
    ctx.fill();
  }
}

for (let i = 0; i < PARTICLE_COUNT; i++) {
  particles.push(new Particle());
}

// Draw connections between nearby particles
function drawConnections() {
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 120) {
        const alpha = (1 - dist / 120) * 0.04;
        ctx.beginPath();
        ctx.strokeStyle = `rgba(201, 168, 76, ${alpha})`;
        ctx.lineWidth = 0.5;
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.stroke();
      }
    }
  }
}

function animateParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawConnections();
  particles.forEach(p => {
    p.update();
    p.draw();
  });
  requestAnimationFrame(animateParticles);
}

animateParticles();

// ===== 3D CARD TILT EFFECT =====
function initCardTilt(cardEl) {
  if (!cardEl) return;

  cardEl.addEventListener('mousemove', (e) => {
    const rect = cardEl.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -12;
    const rotateY = ((x - centerX) / centerX) * 12;

    cardEl.style.transform = `
      perspective(800px)
      rotateX(${rotateX}deg)
      rotateY(${rotateY}deg)
      scale3d(1.05, 1.05, 1.05)
    `;
    cardEl.style.transition = 'transform 0.1s ease';
  });

  cardEl.addEventListener('mouseleave', () => {
    cardEl.style.transform = '';
    cardEl.style.transition = 'transform 0.5s ease';
  });
}

initCardTilt(document.getElementById('showcase-card'));

// ===== TESTIMONIALS CAROUSEL =====
const track = document.getElementById('testimonials-track');
const cards = track ? track.querySelectorAll('.testimonial-card') : [];
const dotsContainer = document.getElementById('carousel-dots');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');

if (cards.length > 0) {
  let current = 0;
  let autoTimeout;
  let startX = 0;
  let isDragging = false;

  function getVisibleCount() {
    return window.innerWidth <= 768 ? 1 : window.innerWidth <= 1024 ? 2 : 3;
  }

  function getMaxIndex() {
    return Math.max(0, cards.length - getVisibleCount());
  }

  // Build dots
  function buildDots() {
    dotsContainer.innerHTML = '';
    const total = getMaxIndex() + 1;
    for (let i = 0; i < total; i++) {
      const dot = document.createElement('div');
      dot.className = 'carousel-dot' + (i === current ? ' active' : '');
      dot.addEventListener('click', () => goTo(i));
      dotsContainer.appendChild(dot);
    }
  }

  function goTo(index) {
    current = Math.max(0, Math.min(index, getMaxIndex()));
    const offset = current * (100 / getVisibleCount());
    track.style.transform = `translateX(-${offset}%)`;

    dotsContainer.querySelectorAll('.carousel-dot').forEach((d, i) => {
      d.classList.toggle('active', i === current);
    });

    resetAuto();
  }

  function goNext() { goTo(current >= getMaxIndex() ? 0 : current + 1); }
  function goPrev() { goTo(current <= 0 ? getMaxIndex() : current - 1); }

  function resetAuto() {
    clearTimeout(autoTimeout);
    autoTimeout = setTimeout(goNext, 5000);
  }

  prevBtn.addEventListener('click', goPrev);
  nextBtn.addEventListener('click', goNext);

  // Touch/drag support
  const carousel = document.getElementById('testimonials-container');
  carousel.addEventListener('mousedown', e => { startX = e.clientX; isDragging = true; });
  carousel.addEventListener('mousemove', e => { if (isDragging) e.preventDefault(); });
  carousel.addEventListener('mouseup', e => {
    if (!isDragging) return;
    isDragging = false;
    const diff = startX - e.clientX;
    if (Math.abs(diff) > 50) diff > 0 ? goNext() : goPrev();
  });
  carousel.addEventListener('mouseleave', () => { isDragging = false; });

  carousel.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
  carousel.addEventListener('touchend', e => {
    const diff = startX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) diff > 0 ? goNext() : goPrev();
  });

  window.addEventListener('resize', () => {
    buildDots();
    goTo(Math.min(current, getMaxIndex()));
  });

  buildDots();
  resetAuto();
}

// ===== FAQ ACCORDION =====
const faqItems = document.querySelectorAll('.faq-item');

faqItems.forEach(item => {
  const btn = item.querySelector('.faq-question');
  btn.addEventListener('click', () => {
    const isOpen = item.classList.contains('open');

    // Close all
    faqItems.forEach(other => {
      other.classList.remove('open');
      other.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
    });

    // Open clicked if it was closed
    if (!isOpen) {
      item.classList.add('open');
      btn.setAttribute('aria-expanded', 'true');
    }
  });
});

// ===== HERO CARD PARALLAX =====
const heroCard = document.getElementById('hero-card');

document.addEventListener('mousemove', (e) => {
  if (!heroCard) return;
  const xRatio = (e.clientX / window.innerWidth - 0.5) * 10;
  const yRatio = (e.clientY / window.innerHeight - 0.5) * 10;
  heroCard.style.transform = `translate(-50%, -55%) rotate(${-5 + xRatio * 0.3}deg) rotateX(${yRatio * 0.5}deg) rotateY(${xRatio * 0.5}deg)`;
});

// ===== NUMBER COUNTER ANIMATION =====
function animateCounter(el, target, suffix = '') {
  const duration = 2000;
  const start = performance.now();
  const isFloat = target % 1 !== 0;

  function update(now) {
    const elapsed = Math.min((now - start) / duration, 1);
    const ease = 1 - Math.pow(1 - elapsed, 3);
    const val = target * ease;
    el.textContent = (isFloat ? val.toFixed(1) : Math.floor(val).toLocaleString('pt-BR')) + suffix;
    if (elapsed < 1) requestAnimationFrame(update);
    else el.textContent = (isFloat ? target.toFixed(1) : target.toLocaleString('pt-BR')) + suffix;
  }

  requestAnimationFrame(update);
}

// Observe stats section for counter trigger
const statsSection = document.querySelector('.hero-stats');
if (statsSection) {
  const statsObs = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) {
      const stats = statsSection.querySelectorAll('strong');
      // They're already text, so just add a glow effect
      stats.forEach(s => {
        s.style.transition = 'color 0.5s ease';
        s.style.color = 'var(--neon-green)';
        setTimeout(() => { s.style.color = ''; }, 1500);
      });
      statsObs.disconnect();
    }
  }, { threshold: 0.5 });
  statsObs.observe(statsSection);
}

// ===== GRADIENT MESH MOUSE TRACKING =====
const gradientMesh = document.querySelector('.gradient-mesh');
document.addEventListener('mousemove', (e) => {
  if (!gradientMesh) return;
  const xPct = (e.clientX / window.innerWidth) * 100;
  const yPct = (e.clientY / window.innerHeight) * 100;
  gradientMesh.style.background = `
    radial-gradient(ellipse at ${xPct}% ${yPct}%, rgba(201, 168, 76, 0.06) 0%, transparent 60%),
    radial-gradient(ellipse at ${100 - xPct}% ${100 - yPct}%, rgba(255, 255, 255, 0.02) 0%, transparent 55%),
    radial-gradient(ellipse at 60% 80%, rgba(201, 168, 76, 0.03) 0%, transparent 50%)
  `;
});

// ===== PLAN CARD HOVER GLOW =====
document.querySelectorAll('.plan-card').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    card.style.setProperty('--mouse-x', `${x}px`);
    card.style.setProperty('--mouse-y', `${y}px`);
  });
});

// ===== BUTTON RIPPLE EFFECT =====
document.querySelectorAll('.btn').forEach(btn => {
  btn.addEventListener('click', function (e) {
    const rect = this.getBoundingClientRect();
    const ripple = document.createElement('span');
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;

    ripple.style.cssText = `
      position: absolute;
      width: ${size}px;
      height: ${size}px;
      left: ${x}px;
      top: ${y}px;
      background: rgba(255,255,255,0.25);
      border-radius: 50%;
      transform: scale(0);
      animation: rippleOut 0.5s ease-out forwards;
      pointer-events: none;
    `;

    this.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  });
});

// Ripple keyframes
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes rippleOut {
    to { transform: scale(2.5); opacity: 0; }
  }
`;
document.head.appendChild(styleSheet);

// ===== STAGGER ANIMATION FOR FEATURE CARDS =====
const featureCards = document.querySelectorAll('.feature-card');
const featureObs = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => {
        entry.target.classList.add('visible');
      }, i * 100);
    }
  });
}, { threshold: 0.1 });

featureCards.forEach(card => featureObs.observe(card));

// ===== ACTIVE NAV LINK ON SCROLL =====
const sections = document.querySelectorAll('section[id]');
const navLinksAll = document.querySelectorAll('.nav-links a');

const sectionObs = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinksAll.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === '#' + entry.target.id) {
          link.classList.add('active');
        }
      });
    }
  });
}, { threshold: 0.4 });

sections.forEach(s => sectionObs.observe(s));

// Add active nav styling
const navStyle = document.createElement('style');
navStyle.textContent = `.nav-links a.active { color: var(--gold-light) !important; }`;
document.head.appendChild(navStyle);

console.log('%c◆ ONYX BANK', 'color: #C9A84C; font-size: 20px; font-weight: 600; letter-spacing: 4px;');
console.log('%cSeu patrimônio, nossa prioridade.', 'color: #9A9A9A; font-size: 13px;');
