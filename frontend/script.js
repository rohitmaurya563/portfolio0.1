// hide the loading screen once everything's actually loaded, with a small
// delay so it doesn't just flash and disappear
window.addEventListener('load', () =>
  setTimeout(() => document.getElementById('loader').classList.add('hide'), 1000),
);

// Auto-detects how this page is being served:
// - If the backend itself is serving this file (http://localhost:5000/...), calls stay on the same origin.
// - If you're using VS Code Live Server (a different port, e.g. 127.0.0.1:5500), it points at the backend on :5000.
const isLocal = ['localhost', '127.0.0.1'].includes(location.hostname);
const API_BASE = isLocal && location.port !== '5000' ? 'http://localhost:5000' : '';
// gold progress bar at the very top that fills up as you scroll down the page
const progress = document.getElementById('progress');
window.addEventListener('scroll', () => {
  const max = document.documentElement.scrollHeight - innerHeight;
  progress.style.width = (scrollY / max) * 100 + '%';
});
// fade/slide-up animation for anything with class="reveal" — triggers once
// it scrolls into view, then stops watching it (no point re-checking forever)
const reveal = new IntersectionObserver(
  (es) =>
    es.forEach((e) => {
      if (e.isIntersecting) e.target.classList.add('show');
    }),
  { threshold: 0.1 },
);
document.querySelectorAll('.reveal').forEach((e) => reveal.observe(e));

// hero subtitle typing effect — cycles through these phrases,
// typing them out and deleting them one character at a time
const words = [
  'beautiful web applications.',
  'scalable backend systems.',
  'modern user experiences.',
  'clean, maintainable code.',
];
let wi = 0,
  ci = 0,
  del = false;
function type() {
  let el = document.getElementById('typing');
  let w = words[wi];
  el.textContent = w.slice(0, ci);
  if (!del && ci < w.length) {
    ci++;
    setTimeout(type, 62);
  } else if (!del) {
    del = true;
    setTimeout(type, 1200);
  } else if (ci) {
    ci--;
    setTimeout(type, 30);
  } else {
    del = false;
    wi = (wi + 1) % words.length;
    setTimeout(type, 220);
  }
}
type();

// custom cursor glow that follows the mouse around
const cur = document.getElementById('cursor');
addEventListener('pointermove', (e) => {
  cur.style.left = e.clientX + 'px';
  cur.style.top = e.clientY + 'px';
});
// profile photo tilts slightly toward the cursor — only on devices with a
// real mouse/trackpad, no point doing this on touchscreens
const tilt = document.getElementById('tilt');
if (matchMedia('(pointer:fine)').matches) {
  tilt.addEventListener('pointermove', (e) => {
    let r = tilt.getBoundingClientRect(),
      x = (e.clientX - r.left) / r.width - 0.5,
      y = (e.clientY - r.top) / r.height - 0.5;
    tilt.style.transform = `perspective(900px) rotateX(${-y * 7}deg) rotateY(${x * 7}deg)`;
  });
  tilt.addEventListener('pointerleave', () => (tilt.style.transform = ''));
}
// "magnetic" buttons — nudge slightly toward the cursor when hovered
document.querySelectorAll('.magnetic').forEach((b) => {
  b.addEventListener('pointermove', (e) => {
    let r = b.getBoundingClientRect();
    b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.1}px,${(e.clientY - r.top - r.height / 2) * 0.1}px)`;
  });
  b.addEventListener('pointerleave', () => (b.style.transform = ''));
});

// background particle network — plain canvas, no library. Fewer particles
// on small screens since it's mostly decorative and not worth the perf cost.
const canvas = document.getElementById('particles'),
  ctx = canvas.getContext('2d');
let W,
  H,
  P = [];
function resize() {
  W = canvas.width = innerWidth;
  H = canvas.height = innerHeight;
  P = Array.from({ length: innerWidth < 700 ? 28 : 65 }, () => ({
    x: Math.random() * W,
    y: Math.random() * H,
    vx: (Math.random() - 0.5) * 0.25,
    vy: (Math.random() - 0.5) * 0.25,
    r: 0.5 + Math.random() * 1.3,
  }));
}
resize();
addEventListener('resize', resize);
function particleLoop() {
  ctx.clearRect(0, 0, W, H);
  P.forEach((p, i) => {
    p.x += p.vx;
    p.y += p.vy;
    if (p.x < 0 || p.x > W) p.vx *= -1;
    if (p.y < 0 || p.y > H) p.vy *= -1;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(215,180,107,.5)';
    ctx.fill();
    for (let j = i + 1; j < P.length; j++) {
      let q = P[j],
        d = Math.hypot(p.x - q.x, p.y - q.y);
      if (d < 110) {
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(q.x, q.y);
        ctx.strokeStyle = `rgba(215,180,107,${0.08 * (1 - d / 110)})`;
        ctx.stroke();
      }
    }
  });
  requestAnimationFrame(particleLoop);
}
particleLoop();

// GitHub-style contribution heatmap — just a visual placeholder for now,
// GitHub doesn't expose the real contribution calendar through the public API
const heat = document.getElementById('heatmap');
for (let i = 0; i < 180; i++) {
  let c = document.createElement('i');
  c.className = 'cell';
  c.style.opacity = 0.3 + Math.random() * 0.7;
  heat.appendChild(c);
}

// keeps the footer's copyright year correct without editing it by hand every January
document.getElementById('yr').textContent = new Date().getFullYear();

/* Toast (replaces alert) */
const toastEl = document.getElementById('toast');
function toast(msg) {
  toastEl.textContent = msg;
  toastEl.style.opacity = 1;
  toastEl.style.transform = 'translate(-50%,0)';
  toastEl.style.pointerEvents = 'auto';
  clearTimeout(toastEl._t);
  toastEl._t = setTimeout(() => {
    toastEl.style.opacity = 0;
    toastEl.style.transform = 'translate(-50%,20px)';
    toastEl.style.pointerEvents = 'none';
  }, 3200);
}

/* Back to top + scroll progress + active nav link, unified in one scroll listener */
const toTopBtn = document.getElementById('toTop');
const navAnchors = document.querySelectorAll('.links a[href^="#"]');
const navSections = [...navAnchors]
  .map((a) => document.querySelector(a.getAttribute('href')))
  .filter(Boolean);
window.addEventListener('scroll', () => {
  toTopBtn.classList.toggle('show', scrollY > 600);
  let current = '';
  navSections.forEach((sec) => {
    if (scrollY >= sec.offsetTop - 180) current = sec.id;
  });
  navAnchors.forEach((a) =>
    a.classList.toggle('nav-link-active', a.getAttribute('href') === '#' + current),
  );
});

/* Close mobile menu after choosing a link */
document
  .querySelectorAll('.links a')
  .forEach((a) =>
    a.addEventListener('click', () => document.querySelector('.links').classList.remove('mobile')),
  );

/* Animated stat counters */
const counterIO = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target,
        target = +el.dataset.count,
        suffix = el.dataset.suffix || '',
        numEl = el.querySelector('strong');
      let cur = 0;
      const step = Math.max(1, Math.round(target / 40));
      (function tick() {
        cur += step;
        if (cur >= target) {
          numEl.textContent = target + suffix;
          return;
        }
        numEl.textContent = cur + suffix;
        requestAnimationFrame(tick);
      })();
      counterIO.unobserve(el);
    });
  },
  { threshold: 0.4 },
);
document.querySelectorAll('.stat[data-count]').forEach((el) => counterIO.observe(el));

/* Live GitHub data — replace with your username; falls back gracefully if the API rate-limits */
const GH_USER = 'rohitmaurya563';
(async function loadGithub() {
  try {
    const res = await fetch(`https://api.github.com/users/${GH_USER}`);
    if (!res.ok) throw new Error('rate limited');
    const user = await res.json();
    const stats = document.querySelectorAll('.github-stats .gstat b');
    if (stats[0]) stats[0].textContent = user.public_repos ?? '—';
    if (stats[1]) stats[1].textContent = user.followers ?? '—';
  } catch (err) {
    /* keep static placeholders on failure */
  }
})();

async function sendMessage(e) {
  e.preventDefault();
  const form = e.target;
  const btn = form.querySelector('button[type="submit"]');
  const [nameEl, emailEl, subjectEl, messageEl] = form.querySelectorAll('input,textarea');
  const payload = {
    name: nameEl.value,
    email: emailEl.value,
    subject: subjectEl.value,
    message: messageEl.value,
  };

  const originalText = btn.textContent;
  btn.disabled = true;
  btn.textContent = 'Sending…';

  try {
    const res = await fetch(API_BASE + '/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (res.ok && data.success) {
      toast(data.note || 'Message sent — I\u2019ll get back to you soon.');
      form.reset();
    } else {
      toast(data.error || 'Something went wrong. Please try again.');
    }
  } catch (err) {
    toast('Could not reach the server. Is the backend running on port 5000?');
  } finally {
    btn.disabled = false;
    btn.textContent = originalText;
  }
}
