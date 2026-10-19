// E-Retrofit Garage – zdarzenia GA4, test A/B przycisku CTA i analiza formularza
function track(name, params) {
  if (typeof gtag === 'function') gtag('event', name, params || {});
}
function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }

// ---------- Test A/B: wariant przypisany losowo 50/50 i zapamiętany ----------
var AB = (function () {
  var forced = new URLSearchParams(location.search).get('ab');
  var v = (forced === 'A' || forced === 'B') ? forced : store('ab_variant');
  if (v !== 'A' && v !== 'B') v = Math.random() < 0.5 ? 'A' : 'B';
  store('ab_variant', v);
  if (typeof gtag === 'function') gtag('set', 'user_properties', { ab_variant: v });
  window._uxa = window._uxa || [];
  window._uxa.push(['setCustomVariable', 1, 'AB_CTA', v, 3]);
  return v;
})();

document.addEventListener('DOMContentLoaded', function () {
  // Wariant B: inny tekst i wygląd przycisku na stronie głównej
  var cta = document.getElementById('ab-cta');
  if (cta) {
    if (AB === 'B') { cta.textContent = 'Sprawdź cenę w 24 h →'; cta.className = 'btn ab-b'; }
    track('ab_ekspozycja_' + AB, { ab_variant: AB });
  }

  // Kliknięcia przycisków „Poproś o wycenę”
  document.querySelectorAll('[data-cta]').forEach(function (el) {
    el.addEventListener('click', function () {
      track('cta_wycena', { cta_miejsce: el.getAttribute('data-cta'), ab_variant: AB });
      if (el.id === 'ab-cta') track('ab_klik_' + AB, { ab_variant: AB });
    });
  });

  // Wyszukiwarka (GA4 sam wykrywa ?q= jako view_search_results)
  var out = document.getElementById('search-results');
  if (out) {
    var q = new URLSearchParams(location.search).get('q') || '';
    var pages = [
      { t: 'Oferta – retrofit i elektronika', u: 'oferta.html', k: 'oferta retrofit nawigacja android carplay audio elektronika cennik' },
      { t: 'Blog – jak wybrać radio Android do BMW', u: 'blog.html', k: 'blog radio android carplay bmw e53 poradnik' },
      { t: 'Kontakt i wycena', u: 'kontakt.html', k: 'kontakt wycena formularz telefon adres' },
      { t: 'O nas', u: 'o-nas.html', k: 'o nas warsztat zespół historia' }
    ];
    var hits = pages.filter(function (p) { return q && p.k.indexOf(q.toLowerCase()) !== -1; });
    document.getElementById('search-q').textContent = q || '(puste)';
    out.innerHTML = hits.length
      ? hits.map(function (h) { return '<li><a href="' + h.u + '">' + h.t + '</a></li>'; }).join('')
      : '<li>Brak wyników. Spróbuj: „carplay”, „cennik”, „wycena”.</li>';
  }

  // ---------- Analiza formularza ----------
  var form = document.getElementById('lead-form');
  if (form) {
    var started = false, sent = false, last = '', seen = {};
    form.querySelectorAll('input, select, textarea').forEach(function (f) {
      f.addEventListener('focus', function () {
        started = true; last = f.name;
        if (!seen[f.name]) { seen[f.name] = 1; track('pole_' + f.name, { pole: f.name, ab_variant: AB }); }
      });
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault(); sent = true;
      track('generate_lead', { usluga: form.querySelector('[name=usluga]').value, ab_variant: AB });
      track('ab_lead_' + AB, { ab_variant: AB });
      setTimeout(function () { location.href = 'dziekujemy.html'; }, 400);
    });
    window.addEventListener('pagehide', function () {
      if (started && !sent) track('formularz_porzucony', { ostatnie_pole: last, ab_variant: AB, transport_type: 'beacon' });
    });
  }
});
