// Zvýrazní najbližšiu schôdzku na úvodnej stránke.
(function () {
  if (!window.PLAN) return;
  var today = new Date(); today.setHours(0, 0, 0, 0);
  var iso = function (d) { return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); };
  var t = iso(today);
  var next = window.PLAN.find(function (p) { return p.d >= t; });
  document.querySelectorAll(".card[data-date]").forEach(function (c) {
    if (c.dataset.date < t) c.classList.add("past");
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
