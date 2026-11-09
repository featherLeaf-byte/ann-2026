'use strict';

const EVENT = {
  title: "Lusama & Andiswa's First Anniversary Dinner",
  start: new Date('2026-11-09T19:00:00+02:00'),
  hours: 3,
  venue: "Simon's Restaurant, Groot Constantia Wine Estate",
  address: 'Groot Constantia Rd, Constantia, Cape Town, 7806',
  details: "First anniversary dinner at Simon's Restaurant. Phone: 021 794 1143. https://simons.co.za/",
};
EVENT.end = new Date(EVENT.start.getTime() + EVENT.hours * 3600 * 1000);
EVENT.location = `${EVENT.venue}, ${EVENT.address}`;

const $ = (id) => document.getElementById(id);
const clamp = (v, min = 0, max = 1) => Math.min(max, Math.max(min, v));
const rand = (min, max) => min + Math.random() * (max - min);
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- Intro seal ---------- */

const seal = $('seal');
const main = $('main');

if (seal) {
  main.inert = true;
  document.body.classList.add('is-sealed');

  $('sealButton').addEventListener('click', () => {
    seal.classList.add('is-open');
    document.body.classList.add('hero-ready');
    main.inert = false;
    document.body.classList.remove('is-sealed');
    setTimeout(() => seal.remove(), reduceMotion ? 0 : 950);
    requestScrollUpdate();
  });
} else {
  document.body.classList.add('hero-ready');
}

/* ---------- Countdown ---------- */

const cdGrid = $('countdownGrid');
const cdNote = $('countdownNote');
const pad = (n) => String(n).padStart(2, '0');
let countdownTimer;

function setNum(id, value) {
  const el = $(id);
  if (el.textContent === value) return;
  el.textContent = value;
  el.classList.remove('tick');
  void el.offsetWidth;
  el.classList.add('tick');
}

function tickCountdown() {
  const now = Date.now();
  const ms = EVENT.start - now;

  if (ms > 0) {
    const s = Math.floor(ms / 1000);
    setNum('cdDays', pad(Math.floor(s / 86400)));
    setNum('cdHours', pad(Math.floor((s % 86400) / 3600)));
    setNum('cdMinutes', pad(Math.floor((s % 3600) / 60)));
    setNum('cdSeconds', pad(s % 60));
    cdGrid.hidden = false;
    cdNote.textContent = 'until we raise a glass';
    return;
  }

  cdGrid.hidden = true;
  cdNote.textContent = now < EVENT.end
    ? "Tonight is the night. See you at Simon's."
    : 'Happy first anniversary, my love.';
  if (now >= EVENT.end) clearInterval(countdownTimer);
}

countdownTimer = setInterval(tickCountdown, 1000);
tickCountdown();

/* ---------- Venue links and calendar ---------- */

const query = encodeURIComponent(EVENT.location);
$('directions').href = `https://www.google.com/maps/dir/?api=1&destination=${query}`;
$('mapFrame').src = `https://maps.google.com/maps?q=${query}&output=embed`;

const icsStamp = (d) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
const icsEscape = (s) => s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');

$('googleCalendar').href = 'https://calendar.google.com/calendar/render?' + new URLSearchParams({
  action: 'TEMPLATE',
  text: EVENT.title,
  dates: `${icsStamp(EVENT.start)}/${icsStamp(EVENT.end)}`,
  details: EVENT.details,
  location: EVENT.location,
});

$('addToCalendar').addEventListener('click', () => {
  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Lusama and Andiswa//Anniversary 2026//EN',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    'UID:anniversary-2026-11-09@lusama-andiswa',
    `DTSTAMP:${icsStamp(new Date())}`,
    `DTSTART:${icsStamp(EVENT.start)}`,
    `DTEND:${icsStamp(EVENT.end)}`,
    `SUMMARY:${icsEscape(EVENT.title)}`,
    `LOCATION:${icsEscape(EVENT.location)}`,
    `DESCRIPTION:${icsEscape(EVENT.details)}`,
    'BEGIN:VALARM',
    'TRIGGER:-PT2H',
    'ACTION:DISPLAY',
    `DESCRIPTION:${icsEscape(EVENT.title)}`,
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar;charset=utf-8' }));
  const a = Object.assign(document.createElement('a'), { href: url, download: 'anniversary-dinner.ics' });
  document.body.append(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
});

/* ---------- Reveal on scroll ---------- */

document.querySelectorAll('[data-stagger]').forEach((group) => {
  [...group.children].forEach((el, i) => {
    el.classList.add('reveal');
    el.style.setProperty('--delay', `${i * 0.12}s`);
  });
});

const revealEls = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    }
  }, { threshold: 0.15, rootMargin: '0px 0px -6% 0px' });
  revealEls.forEach((el) => io.observe(el));
} else {
  revealEls.forEach((el) => el.classList.add('is-visible'));
}

/* ---------- Hero sparkles and floating hearts ---------- */

if (!reduceMotion) {
  const sparkles = $('sparkles');
  for (let i = 0; i < 26; i++) {
    const s = document.createElement('span');
    s.className = 'sparkle';
    s.style.left = `${rand(2, 98)}%`;
    s.style.top = `${rand(5, 95)}%`;
    s.style.setProperty('--s', `${rand(2, 5).toFixed(1)}px`);
    s.style.setProperty('--d', `${rand(5, 10).toFixed(1)}s`);
    s.style.setProperty('--dl', `${rand(0, 8).toFixed(1)}s`);
    sparkles.append(s);
  }
}

const floatHearts = [];
if (!reduceMotion) {
  for (let i = 0; i < 9; i++) {
    const el = document.createElement('span');
    el.className = 'float-heart';
    el.style.left = `${rand(3, 94)}%`;
    el.style.top = `${rand(4, 88)}%`;
    el.style.setProperty('--size', `${rand(24, 72).toFixed(0)}px`);
    $('rsvpFloat').append(el);
    floatHearts.push({ el, speed: rand(0.08, 0.32) * (i % 2 ? 1 : -1) });
  }
}

/* ---------- Pinned quote: split into words ---------- */

const quoteText = $('quoteText');
const quoteWords = quoteText.textContent.trim().split(/\s+/).map((word, i, all) => {
  const span = document.createElement('span');
  span.className = 'word';
  span.textContent = word;
  quoteText.append(span, i < all.length - 1 ? ' ' : '');
  return span;
});
quoteText.firstChild.remove();
let litCount = -1;

/* ---------- Scroll engine ---------- */

const hero = $('hero');
const quote = $('quote');
const timeline = $('timeline');
const timelineLine = timeline.querySelector('.timeline__line');
const moments = [...timeline.querySelectorAll('.moment')];
const rsvp = $('rsvp');
const pill = $('replyPill');
let replied = false;
let ticking = false;

function update() {
  ticking = false;
  const vh = window.innerHeight;
  const y = window.scrollY;
  const max = document.documentElement.scrollHeight - vh;

  $('progress').style.transform = `scaleX(${max > 0 ? clamp(y / max).toFixed(4) : 0})`;

  if (!reduceMotion) hero.style.setProperty('--hero-p', clamp(y / hero.offsetHeight).toFixed(3));

  const qr = quote.getBoundingClientRect();
  const span = qr.height - vh;
  if (span > 0) {
    const p = clamp((vh * 0.25 - qr.top) / (span + vh * 0.25));
    quote.style.setProperty('--quote-p', p.toFixed(3));
    const lit = Math.round(clamp((p - 0.05) / 0.8) * quoteWords.length);
    if (lit !== litCount) {
      litCount = lit;
      quoteWords.forEach((w, i) => w.classList.toggle('is-lit', i < lit));
    }
  }

  const ref = vh * 0.6;
  const lr = timelineLine.getBoundingClientRect();
  timeline.style.setProperty('--tl-p', clamp((ref - lr.top) / lr.height).toFixed(3));
  moments.forEach((m) => {
    const d = m.querySelector('.moment__dot').getBoundingClientRect();
    m.classList.toggle('is-active', d.top + d.height / 2 < ref);
  });

  const rr = rsvp.getBoundingClientRect();
  pill.classList.toggle('is-shown', !replied && y > hero.offsetHeight * 0.6 && rr.top > vh * 0.85);

  if (rr.top < vh && rr.bottom > 0) {
    floatHearts.forEach(({ el, speed }) => {
      el.style.transform = `translateY(${((rr.top - vh / 2) * speed).toFixed(1)}px)`;
    });
  }
}

function requestScrollUpdate() {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(update);
}

window.addEventListener('scroll', requestScrollUpdate, { passive: true });
window.addEventListener('resize', requestScrollUpdate);
update();

/* ---------- Lightbox ---------- */

const lightbox = $('lightbox');
const photos = [...document.querySelectorAll('[data-lightbox]')];
let photoIndex = 0;

function showPhoto(i) {
  photoIndex = (i + photos.length) % photos.length;
  const btn = photos[photoIndex];
  $('lightboxImg').src = btn.dataset.full;
  $('lightboxImg').alt = btn.querySelector('img').alt;
  $('lightboxCaption').textContent = btn.dataset.caption;
}

photos.forEach((btn, i) => {
  btn.addEventListener('click', () => {
    showPhoto(i);
    lightbox.showModal();
  });
});

$('lbPrev').addEventListener('click', () => showPhoto(photoIndex - 1));
$('lbNext').addEventListener('click', () => showPhoto(photoIndex + 1));
lightbox.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft') showPhoto(photoIndex - 1);
  if (e.key === 'ArrowRight') showPhoto(photoIndex + 1);
});
lightbox.addEventListener('click', (e) => {
  if (e.target === lightbox) lightbox.close();
});

/* ---------- RSVP ---------- */

function burstHearts() {
  if (reduceMotion) return;
  const layer = $('hearts');
  for (let i = 0; i < 28; i++) {
    const h = document.createElement('span');
    h.className = 'heart';
    h.style.left = `${Math.random() * 100}%`;
    h.style.setProperty('--size', `${16 + Math.random() * 26}px`);
    h.style.setProperty('--dur', `${2.4 + Math.random() * 2.2}s`);
    h.style.setProperty('--drift', `${(Math.random() - 0.5) * 120}px`);
    h.style.setProperty('--spin', `${(Math.random() - 0.5) * 80}deg`);
    h.style.animationDelay = `${Math.random() * 0.6}s`;
    h.addEventListener('animationend', () => h.remove());
    layer.append(h);
  }
}

$('rsvpYes').addEventListener('click', () => {
  $('rsvpAsk').hidden = true;
  $('rsvpDone').hidden = false;
  replied = true;
  burstHearts();
  requestScrollUpdate();
});

$('rsvpUndo').addEventListener('click', () => {
  $('rsvpDone').hidden = true;
  $('rsvpAsk').hidden = false;
  replied = false;
  $('rsvpYes').focus();
  requestScrollUpdate();
});
