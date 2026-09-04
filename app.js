// nav burger
const burger = document.getElementById('burger');
const mobile = document.getElementById('mobileNav');
if (burger && mobile) {
  burger.addEventListener('click', () => mobile.classList.toggle('is-open'));
  mobile.querySelectorAll('a').forEach(a => a.addEventListener('click', () => mobile.classList.remove('is-open')));
}

// tilt for project cards
const cards = document.querySelectorAll('[data-tilt]');
const maxTilt = 4; // degrees
cards.forEach(card => {
  let rect = null;
  let raf = 0;
  let tx = 0, ty = 0;

  function onMove(e) {
    rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width; // 0..1
    const y = (e.clientY - rect.top) / rect.height;
    tx = (x - 0.5) * maxTilt * 2;
    ty = (0.5 - y) * maxTilt * 2;
    if (!raf) raf = requestAnimationFrame(update);
  }
  function update() {
    raf = 0;
    card.style.transform = `perspective(900px) rotateY(${tx}deg) rotateX(${ty}deg)`;
    card.style.setProperty('--mx', `${(tx/maxTilt+0.5)*100}%`);
  }
  function onLeave() {
    card.style.transform = 'perspective(900px) rotateY(0) rotateX(0)';
  }
  // only enable on pointer-fine
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    card.addEventListener('mousemove', onMove);
    card.addEventListener('mouseleave', onLeave);
  }
});

// reveal on scroll
const revealEls = document.querySelectorAll('.approach__card, .project, .stack__group, .social, .more__card');
revealEls.forEach(el => el.classList.add('reveal'));
const io2 = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) e.target.classList.add('is-in');
  });
}, { threshold: 0.12 });
revealEls.forEach(el => io2.observe(el));

// smooth anchor offset is handled by css scroll-padding-top
// toTop
const toTop = document.getElementById('toTop');
if (toTop) toTop.addEventListener('click', (e) => {
  e.preventDefault();
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// nav active on scroll (simple)
const sections = ['work','approach','stack','connect'].map(id => document.getElementById(id)).filter(Boolean);
const navLinks = document.querySelectorAll('.nav__links a[href^="#"]');
function setActive() {
  let current = '';
  const y = window.scrollY + 120;
  sections.forEach(s => {
    if (s.offsetTop <= y) current = s.id;
  });
  navLinks.forEach(a => {
    a.style.color = a.getAttribute('href') === '#' + current ? 'var(--text)' : '';
    a.style.opacity = a.getAttribute('href') === '#' + current ? '1' : '';
  });
}
window.addEventListener('scroll', setActive, { passive: true });
setActive();

// live commit counts — updates from GitHub
const commitEls = document.querySelectorAll('[data-commits]');
if (commitEls.length) {
  async function getCommitCount(repo) {
    const url = `https://api.github.com/repos/${repo}/commits?per_page=1`;
    const res = await fetch(url, { headers: { Accept: 'application/vnd.github.v3+json' } });
    if (!res.ok) throw new Error(`GitHub ${res.status}`);
    const link = res.headers.get('Link');
    if (link) {
      const m = link.match(/&page=(\d+)>; rel="last"/);
      if (m) return parseInt(m[1], 10);
    }
    const data = await res.json();
    // no pagination -> single page count
    return Array.isArray(data) ? data.length : 0;
  }

  async function refreshCounts() {
    for (const el of commitEls) {
      const repo = el.getAttribute('data-commits');
      try {
        const c = await getCommitCount(repo);
        const prev = parseInt(el.textContent, 10);
        if (!Number.isNaN(c) && c !== prev) {
          el.textContent = c;
          el.style.transition = 'color .25s';
          el.style.color = 'var(--accent)';
          setTimeout(() => el.style.color = '', 900);
        }
        el.title = `Live from GitHub — updated ${new Date().toLocaleTimeString()}`;
      } catch (e) {
        // keep fallback number, silent fail (rate limit, offline)
        // console.debug('commit fetch failed', repo, e);
      }
      // small delay to avoid burst (stagger)
      await new Promise(r => setTimeout(r, 280));
    }
  }

  // initial load
  refreshCounts();
  // poll every 5 min (12 req/h per repo, stays under 60/h unauth limit)
  const POLL_MS = 5 * 60 * 1000;
  let pollId = setInterval(refreshCounts, POLL_MS);
  // also refresh when tab becomes visible — catches a push immediately on return
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) refreshCounts();
  });
  // pause polling when hidden to save rate limit
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) clearInterval(pollId);
    else pollId = setInterval(refreshCounts, POLL_MS);
  });
}

// glowing cursor — only on fine-pointer, hover-capable devices
(() => {
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const cursor = document.getElementById('cursor');
  const dot = document.getElementById('cursorDot');
  if (!cursor || !dot) return;

  let mx = window.innerWidth / 2, my = window.innerHeight / 2;
  let cx = mx, cy = my;
  let raf = 0;
  let visible = false;

  function onMove(e) {
    mx = e.clientX;
    my = e.clientY;
    if (!visible) {
      visible = true;
      cursor.classList.add('is-visible');
      dot.classList.add('is-visible');
    }
    // dot follows instantly
    dot.style.left = mx + 'px';
    dot.style.top = my + 'px';
    if (!raf) raf = requestAnimationFrame(tick);
  }

  function tick() {
    raf = 0;
    // lerp outer glow 12% per frame
    cx += (mx - cx) * 0.14;
    cy += (my - cy) * 0.14;
    cursor.style.left = cx + 'px';
    cursor.style.top = cy + 'px';
    // continue if still moving
    if (Math.abs(mx - cx) > 0.1 || Math.abs(my - cy) > 0.1) {
      raf = requestAnimationFrame(tick);
    }
  }

  window.addEventListener('mousemove', onMove, { passive: true });
  window.addEventListener('mouseenter', () => { cursor.classList.add('is-visible'); dot.classList.add('is-visible'); });
  window.addEventListener('mouseleave', () => { cursor.classList.remove('is-visible'); dot.classList.remove('is-visible'); visible = false; });

  // hover enlarge on interactive elements
  const hoverSel = 'a, button, .btn, .social, .project, .chip, .nav__cta';
  document.querySelectorAll(hoverSel).forEach(el => {
    el.addEventListener('mouseenter', () => { cursor.classList.add('is-hover'); dot.classList.add('is-hover'); });
    el.addEventListener('mouseleave', () => { cursor.classList.remove('is-hover'); dot.classList.remove('is-hover'); });
  });

  // hide dot while typing
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') { cursor.style.opacity = '0'; dot.style.opacity = '0'; }
  });
  window.addEventListener('mousedown', () => { cursor.classList.add('is-active'); dot.classList.add('is-active'); });
  window.addEventListener('mouseup', () => { cursor.classList.remove('is-active'); dot.classList.remove('is-active'); });
})();

// liquid glass — highlight + tilt + live total (fallback when liquidGL not loaded)
(() => {
  const wrap = document.getElementById('glassWrap');
  const card = document.getElementById('glassCard');
  if (!wrap || !card) return;
  // only run custom highlight/tilt if liquidGL is not handling it (avoid double glare)
  const useCustom = !window.liquidGL;
  let raf = 0;
  let tx = 0, ty = 0;
  if (useCustom) {
    wrap.addEventListener('mousemove', (e) => {
      const r = wrap.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width) * 100;
      const y = ((e.clientY - r.top) / r.height) * 100;
      tx = x; ty = y;
      if (!raf) raf = requestAnimationFrame(() => {
        raf = 0;
        card.style.setProperty('--mx', tx + '%');
        card.style.setProperty('--my', ty + '%');
      });
      if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
        const rx = (e.clientY - r.top - r.height / 2) / r.height * -3;
        const ry = (e.clientX - r.left - r.width / 2) / r.width * 5;
        card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg)`;
      }
    });
    wrap.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(900px) rotateX(0) rotateY(0)';
    });
  }
  // real-time liquid refraction — subtle turbulence wobble
  const turb = document.querySelector('#liquid feTurbulence');
  if (turb && !window.matchMedia('(prefers-reduced-motion: reduce)').matches && useCustom) {
    let tt = 0;
    setInterval(() => {
      tt += 0.016;
      const f1 = (0.010 + Math.sin(tt) * 0.0018).toFixed(4);
      const f2 = (0.016 + Math.cos(tt * 0.73) * 0.0022).toFixed(4);
      turb.setAttribute('baseFrequency', `${f1} ${f2}`);
    }, 52);
  }
  // live total commits in glass footer
  const glassTotal = document.getElementById('glassCommits');
  const commitNodes = document.querySelectorAll('[data-commits]');
  function updateGlassTotal() {
    if (!glassTotal) return;
    let sum = 0, any = false;
    commitNodes.forEach(n => { const v = parseInt(n.textContent, 10); if (!isNaN(v)) { sum += v; any = true; } });
    if (any) glassTotal.textContent = String(sum).padStart(2, '0');
  }
  const mo = new MutationObserver(updateGlassTotal);
  commitNodes.forEach(n => mo.observe(n, { childList: true, characterData: true, subtree: true }));
  setTimeout(updateGlassTotal, 800);
  setInterval(updateGlassTotal, 3000);
})();

// liquidGL — real WebGL liquid glass from naughtyduk.com
(() => {
  function initLiquidGL() {
    if (typeof liquidGL === 'undefined') return false;
    if (window.__liquidGLInit) return true;
    window.__liquidGLInit = true;
    try {
      window.__liquidGL = liquidGL({
        target: '.glass.liquidGL',
        snapshot: 'body',
        resolution: 2,
        refraction: 0.014,
        aberration: 0.015,
        bevelDepth: 0.07,
        bevelWidth: 0.13,
        frost: 0.6,
        shadow: true,
        specular: true,
        tilt: true,
        tiltFactor: 6,
        tiltEase: 420,
        magnify: 1,
        reveal: 'fade'
      });
      document.querySelectorAll('.glass.liquidGL .glass__header, .glass.liquidGL .glass__code, .glass.liquidGL .glass__footer').forEach(el => {
        el.style.position = 'relative';
        el.style.zIndex = '3';
      });
      return true;
    } catch (e) {
      console.warn('liquidGL init failed', e);
      return false;
    }
  }
  document.addEventListener('DOMContentLoaded', () => {
    if (!initLiquidGL()) {
      let tries = 0;
      const id = setInterval(() => {
        if (initLiquidGL() || tries++ > 20) clearInterval(id);
      }, 250);
    }
  });
  window.addEventListener('load', initLiquidGL);
})();

