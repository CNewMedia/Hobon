(function(){
"use strict";

// Custom cursor
var cur = document.getElementById("cur");
var dot = document.getElementById("cur-dot");
if (cur && dot) {
  var mx = 0, my = 0, cx = 0, cy = 0;
  document.addEventListener("mousemove", function(e) {
    mx = e.clientX;
    my = e.clientY;
    dot.style.left = mx + "px";
    dot.style.top  = my + "px";
  });
  (function loop() {
    cx += (mx - cx) * 0.1;
    cy += (my - cy) * 0.1;
    cur.style.left = cx + "px";
    cur.style.top  = cy + "px";
    requestAnimationFrame(loop);
  })();
  document.querySelectorAll("a, button, .sc, .step, .pc, .ps, .num, .sol, .case, .os-item").forEach(function(el) {
    el.addEventListener("mouseenter", function() { cur.classList.add("hover"); });
    el.addEventListener("mouseleave", function() { cur.classList.remove("hover"); });
  });
}

// Hero glow follows mouse
var hero = document.querySelector(".hero");
var glow = document.getElementById("heroGlow");
if (hero && glow) {
  hero.addEventListener("mousemove", function(e) {
    var r = hero.getBoundingClientRect();
    glow.style.left = (e.clientX - r.left) + "px";
    glow.style.top  = (e.clientY - r.top)  + "px";
  });
}

// Scroll reveal
var io = new IntersectionObserver(function(entries) {
  entries.forEach(function(e) {
    if (e.isIntersecting) {
      e.target.classList.add("in");
      io.unobserve(e.target);
    }
  });
}, { threshold: 0.08, rootMargin: "0px 0px -40px 0px" });
document.querySelectorAll(".rv, .rvl, .rvr, .rvd").forEach(function(el) { io.observe(el); });

// Tape track duplicate (sector pages)
var tape = document.querySelector(".tape-track");
if (tape) tape.innerHTML += tape.innerHTML;

// Sector deep-dive accordion (.di-hd)
document.querySelectorAll(".di-hd").forEach(function(btn) {
  btn.addEventListener("click", function() {
    var item = btn.closest(".di");
    var isOpen = item.classList.contains("open");
    document.querySelectorAll(".di.open").forEach(function(d) { d.classList.remove("open"); });
    if (!isOpen) item.classList.add("open");
  });
});

// Sector CTA form (#cta-form)
var ctaForm = document.getElementById("cta-form");
var ctaSuccess = document.getElementById("cta-success");
if (ctaForm) {
  ctaForm.addEventListener("submit", function(e) {
    e.preventDefault();
    ctaForm.style.opacity = "0";
    ctaForm.style.transition = "opacity .4s";
    setTimeout(function() {
      ctaForm.style.display = "none";
      if (ctaSuccess) {
        ctaSuccess.style.display = "flex";
        ctaSuccess.style.opacity = "0";
        ctaSuccess.style.transition = "opacity .5s";
        setTimeout(function() { ctaSuccess.style.opacity = "1"; }, 50);
      }
    }, 400);
  });
}

// Step animations in hero
var stepIO = new IntersectionObserver(function(entries) {
  entries.forEach(function(e) {
    if (e.isIntersecting) {
      var steps = e.target.querySelectorAll(".step");
      steps.forEach(function(s, i) {
        setTimeout(function() {
          s.style.opacity = "1";
          s.style.transform = "translateX(0)";
        }, 900 + i * 120);
      });
      stepIO.unobserve(e.target);
    }
  });
}, { threshold: 0.1 });
var heroR = document.querySelector(".hero-r-inner");
if (heroR) stepIO.observe(heroR);

// Count-up numbers (.count[data-target] in HTML)
var numIO = new IntersectionObserver(function(entries) {
  entries.forEach(function(e) {
    if (!e.isIntersecting) return;
    var el   = e.target;
    var end  = parseFloat(el.dataset.target);
    var dec  = (String(el.dataset.target || "").indexOf(".") >= 0) ? 1 : 0;
    var dur  = 1600;
    var start = performance.now();
    (function tick(now) {
      var t = Math.min((now - start) / dur, 1);
      var ease = 1 - Math.pow(1 - t, 3);
      el.textContent = (end * ease).toFixed(dec);
      if (t < 1) requestAnimationFrame(tick);
      else el.textContent = end.toFixed(dec);
    })(start);
    numIO.unobserve(el);
  });
}, { threshold: 0.5 });
document.querySelectorAll(".count[data-target]").forEach(function(el) { numIO.observe(el); });

// Sector rail drag scroll
var rail = document.querySelector(".s-rail");
if (rail) {
  var down = false, sx = 0, sl = 0;
  rail.addEventListener("mousedown",  function(e) { down = true; sx = e.pageX - rail.offsetLeft; sl = rail.scrollLeft; rail.style.cursor = "grabbing"; });
  rail.addEventListener("mouseleave", function()  { down = false; rail.style.cursor = "grab"; });
  rail.addEventListener("mouseup",    function()  { down = false; rail.style.cursor = "grab"; });
  rail.addEventListener("mousemove",  function(e) { if (!down) return; rail.scrollLeft = sl - (e.pageX - rail.offsetLeft - sx); });
  rail.addEventListener("touchstart", function(e) { sx = e.touches[0].pageX - rail.offsetLeft; sl = rail.scrollLeft; }, { passive: true });
  rail.addEventListener("touchmove",  function(e) { rail.scrollLeft = sl - (e.touches[0].pageX - rail.offsetLeft - sx); }, { passive: true });
}

// Nav active state on scroll
var secs  = document.querySelectorAll("section[id]");
var links = document.querySelectorAll(".hdr-nav a");
if (secs.length && links.length) {
  var navIO = new IntersectionObserver(function(entries) {
    entries.forEach(function(e) {
      if (e.isIntersecting && e.intersectionRatio > 0.5) {
        links.forEach(function(l) {
          var h = (l.getAttribute("href") || "");
          var hash = h.indexOf("#") >= 0 ? h.substring(h.indexOf("#")) : "";
          l.classList.toggle("active", hash === "#" + e.target.id);
        });
      }
    });
  }, { threshold: 0.5 });
  secs.forEach(function(s) { navIO.observe(s); });
}

// Hamburger menu
var hambtn = document.getElementById("hambtn");
var mobnav = document.getElementById("mobnav");
if (hambtn && mobnav) {
  hambtn.addEventListener("click", function() {
    var isOpen = mobnav.classList.toggle("open");
    hambtn.classList.toggle("open", isOpen);
    hambtn.setAttribute("aria-expanded", isOpen);
    mobnav.setAttribute("aria-hidden", !isOpen);
    document.body.style.overflow = isOpen ? "hidden" : "";
  });
  mobnav.querySelectorAll("a").forEach(function(a) {
    a.addEventListener("click", function() {
      mobnav.classList.remove("open");
      hambtn.classList.remove("open");
      hambtn.setAttribute("aria-expanded", "false");
      mobnav.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
    });
  });
}

})();
