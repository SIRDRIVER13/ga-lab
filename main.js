// Własne zdarzenia GA4 + obsługa wyszukiwarki i formularza
function track(name, params) {
  if (typeof gtag === 'function') gtag('event', name, params || {});
}

document.addEventListener('DOMContentLoaded', function () {
  // Przyciski "Poproś o wycenę" -> zdarzenie cta_wycena
  document.querySelectorAll('[data-cta]').forEach(function (el) {
    el.addEventListener('click', function () {
      track('cta_wycena', { cta_miejsce: el.getAttribute('data-cta') });
    });
  });

  // Strona wyników wyszukiwania (GA4 sam wykrywa parametr ?q= jako view_search_results)
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

  // Formularz kontaktowy -> zdarzenie generate_lead, potem strona podziękowania
  var form = document.getElementById('lead-form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var usluga = form.querySelector('[name=usluga]').value;
      track('generate_lead', { usluga: usluga });
      setTimeout(function () { location.href = 'dziekujemy.html'; }, 400);
    });
  }
});
