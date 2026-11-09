// Zvýrazní najbližšiu schôdzku na úvodnej stránke.
(function () {
  if (!window.PLAN) return;
  var today = new Date(); today.setHours(0, 0, 0, 0);
  var iso = function (d) { return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); };
  var t = iso(today);
  var next = window.PLAN.find(function (p) { return p.d >= t; });
  document.querySelectorAll(".card[data-date]").forEach(function (c) {
    if (c.dataset.date && c.dataset.date < t) c.classList.add("past");
    if (next && c.getAttribute("href") === next.u) c.classList.add("is-next");
  });
  if (!next) return;
  var days = Math.round((new Date(next.d) - new Date(t)) / 864e5);
  var when = days === 0 ? "dnes" : days === 1 ? "zajtra" : "o " + days + (days < 5 ? " dni" : " dní");
  var box = document.getElementById("next");
  var esc = function (s) { var e = document.createElement("span"); e.textContent = s; return e.innerHTML; };
  box.innerHTML = '<div class="lbl">Najbližšie · ' + esc(next.k) + " · " + when + "</div>" +
    '<h2><a href="' + next.u + '">' + esc(next.t) + " →</a></h2>" +
    '<span class="et et' + next.e + '">Etapa ' + next.e + "</span> " +
    next.p.map(function (x) { return '<span class="chip">' + esc(x) + "</span>"; }).join(" ");
  box.hidden = false;
})();

// Loď družiny: súčet pečatí zo záložky „Loď“ posúva loď z Londýna na Brownsea.
(function () {
  var cfg = window.LOD, box = document.getElementById("lod");
  if (!cfg || !box) return;
  var demo = /[?&]demo/.test(location.search);
  if (!cfg.csv && !demo) return;
  var PORTS = [["Londýn", 0], ["Greenwich", .12], ["Ústie Temže", .3], ["Dover", .5], ["Portsmouth", .75], ["Brownsea", 1]];
  function draw(total, last) {
    var p = Math.max(0, Math.min(1, total / cfg.ciel));
    var W = 600, H = 120, x0 = 30, x1 = W - 30;
    var y = function (t) { return 70 - Math.sin(t * Math.PI * 2.2) * 22; };
    var pts = []; for (var i = 0; i <= 60; i++) { var t = i / 60; pts.push((x0 + (x1 - x0) * t).toFixed(1) + "," + y(t).toFixed(1)); }
    var done = pts.slice(0, Math.round(p * 60) + 1);
    var ports = PORTS.map(function (q) {
      var cx = x0 + (x1 - x0) * q[1], cy = y(q[1]), reached = p >= q[1];
      return '<circle cx="' + cx + '" cy="' + cy + '" r="5" class="' + (reached ? "pr" : "pn") + '"/>' +
        '<text x="' + cx + '" y="' + (cy + (q[1] * 10 % 2 < 1 ? 22 : -12)) + '" text-anchor="middle">' + q[0] + "</text>";
    }).join("");
    var sx = x0 + (x1 - x0) * p, sy = y(p);
    var next = PORTS.filter(function (q) { return q[1] > p; })[0];
    var left = next ? Math.ceil(next[1] * cfg.ciel - total) : 0;
    box.innerHTML = '<div class="lbl">Loď družiny · ' + total + " pečatí z " + cfg.ciel + "</div>" +
      '<svg viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="Loď je na ' + Math.round(p * 100) + ' % cesty">' +
      '<polyline points="' + pts.join(" ") + '" class="rt"/><polyline points="' + done.join(" ") + '" class="rd"/>' + ports +
      '<text x="' + sx + '" y="' + (sy + 8) + '" text-anchor="middle" class="ship">⛵</text></svg>' +
      '<p class="lodtxt">' + (next ? "Do prístavu <b>" + next[0] + "</b> chýba ešte <b>" + left + "</b> pečatí." : "Doplávali sme na Brownsea!") +
      (last ? " Naposledy pribudlo " + last + "." : "") + "</p>";
    box.hidden = false;
  }
  if (demo) return draw(137, 9);
  fetch(cfg.csv).then(function (r) { return r.text(); }).then(function (t) {
    var rows = t.trim().split(/\r?\n/).slice(1).map(function (l) { return parseInt(l.split(",")[1], 10) || 0; });
    draw(rows.reduce(function (a, b) { return a + b; }, 0), rows.filter(Boolean).pop());
  }).catch(function () {});
})();

// Pri „Správa rodičom“ tlačidlo, ktoré skopíruje text na WhatsApp.
document.querySelectorAll(".doc h2").forEach(function (h) {
  if (!/^Správa rodičom/.test(h.textContent)) return;
  var parts = [], n = h.nextElementSibling;
  while (n && n.tagName !== "H2") { parts.push(n); n = n.nextElementSibling; }
  var text = parts.map(function (e) { return e.innerText.trim(); }).join("\n\n");
  if (!text) return;
  var b = document.createElement("button");
  b.className = "print copy"; b.type = "button"; b.textContent = "📋 Kopírovať pre WhatsApp";
  b.onclick = function () {
    navigator.clipboard.writeText(text).then(function () { b.textContent = "✓ Skopírované"; setTimeout(function () { b.textContent = "📋 Kopírovať pre WhatsApp"; }, 2000); });
  };
  h.appendChild(b);
});
