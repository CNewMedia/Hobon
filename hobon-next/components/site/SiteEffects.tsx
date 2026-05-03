"use client";

import { useEffect } from "react";

export function SiteEffects() {
  useEffect(() => {
    const cur = document.getElementById("cur");
    const dot = document.getElementById("cur-dot");
    let mx = 0;
    let my = 0;
    let cx = 0;
    let cy = 0;
    let raf = 0;

    function onMove(e: Event) {
      const ev = e as MouseEvent;
      mx = ev.clientX;
      my = ev.clientY;
      if (dot) {
        dot.style.left = `${mx}px`;
        dot.style.top = `${my}px`;
      }
    }

    function loop() {
      cx += (mx - cx) * 0.1;
      cy += (my - cy) * 0.1;
      if (cur) {
        cur.style.left = `${cx}px`;
        cur.style.top = `${cy}px`;
      }
      raf = requestAnimationFrame(loop);
    }

    if (cur && dot) {
      document.addEventListener("mousemove", onMove);
      raf = requestAnimationFrame(loop);
      const hoverEls = document.querySelectorAll(
        "a, button, .sc, .step, .pc, .ps, .num, .sol, .case, .os-item",
      );
      hoverEls.forEach((el) => {
        el.addEventListener("mouseenter", () => cur.classList.add("hover"));
        el.addEventListener("mouseleave", () => cur.classList.remove("hover"));
      });
    }

    const hero = document.querySelector(".hero");
    const glow = document.getElementById("heroGlow");
    function onHeroMove(e: Event) {
      if (!hero || !glow) return;
      const ev = e as MouseEvent;
      const r = hero.getBoundingClientRect();
      glow.style.left = `${ev.clientX - r.left}px`;
      glow.style.top = `${ev.clientY - r.top}px`;
    }
    if (hero && glow) hero.addEventListener("mousemove", onHeroMove);

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -40px 0px" },
    );
    document.querySelectorAll(".rv, .rvl, .rvr, .rvd").forEach((el) => io.observe(el));

    const tape = document.querySelector(".tape-track");
    if (tape) tape.innerHTML += tape.innerHTML;

    const numIO = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const el = e.target as HTMLElement;
          const end = parseFloat(el.dataset.target ?? "0");
          const dec = String(el.dataset.target ?? "").includes(".") ? 1 : 0;
          const dur = 1600;
          const start = performance.now();
          function tick(now: number) {
            const t = Math.min((now - start) / dur, 1);
            const ease = 1 - (1 - t) ** 3;
            el.textContent = (end * ease).toFixed(dec);
            if (t < 1) requestAnimationFrame(tick);
            else el.textContent = end.toFixed(dec);
          }
          requestAnimationFrame(tick);
          numIO.unobserve(el);
        });
      },
      { threshold: 0.5 },
    );
    document.querySelectorAll(".count[data-target]").forEach((el) => numIO.observe(el));

    const rail = document.querySelector(".s-rail");
    let down = false;
    let sx = 0;
    let sl = 0;
    function onRailDown(e: Event) {
      if (!rail) return;
      const ev = e as MouseEvent;
      down = true;
      sx = ev.pageX - (rail as HTMLElement).offsetLeft;
      sl = (rail as HTMLElement).scrollLeft;
      rail.classList.add("grab");
    }
    function onRailUp() {
      down = false;
      rail?.classList.remove("grab");
    }
    function onRailMove(e: Event) {
      if (!down || !rail) return;
      const ev = e as MouseEvent;
      rail.scrollLeft = sl - (ev.pageX - (rail as HTMLElement).offsetLeft - sx);
    }
    if (rail) {
      rail.addEventListener("mousedown", onRailDown);
      rail.addEventListener("mouseleave", onRailUp);
      rail.addEventListener("mouseup", onRailUp);
      rail.addEventListener("mousemove", onRailMove);
      rail.addEventListener(
        "touchstart",
        (e) => {
          const te = e as TouchEvent;
          sx = te.touches[0].pageX - (rail as HTMLElement).offsetLeft;
          sl = (rail as HTMLElement).scrollLeft;
        },
        { passive: true },
      );
      rail.addEventListener(
        "touchmove",
        (e) => {
          if (!rail) return;
          const te = e as TouchEvent;
          rail.scrollLeft = sl - (te.touches[0].pageX - (rail as HTMLElement).offsetLeft - sx);
        },
        { passive: true },
      );
    }

    const secs = document.querySelectorAll("section[id]");
    const links = document.querySelectorAll(".hdr-nav a");
    const navIO = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting && e.intersectionRatio > 0.5) {
            links.forEach((l) => {
              const h = l.getAttribute("href") || "";
              const hash = h.includes("#") ? h.substring(h.indexOf("#")) : "";
              l.classList.toggle("active", hash === `#${e.target.id}`);
            });
          }
        });
      },
      { threshold: 0.5 },
    );
    secs.forEach((s) => navIO.observe(s));

    const hambtn = document.getElementById("hambtn");
    const mobnav = document.getElementById("mobnav");
    function toggleMenu() {
      if (!hambtn || !mobnav) return;
      const isOpen = mobnav.classList.toggle("open");
      hambtn.classList.toggle("open", isOpen);
      hambtn.setAttribute("aria-expanded", String(isOpen));
      mobnav.setAttribute("aria-hidden", String(!isOpen));
      document.body.style.overflow = isOpen ? "hidden" : "";
    }
    if (hambtn && mobnav) {
      hambtn.addEventListener("click", toggleMenu);
      mobnav.querySelectorAll("a").forEach((a) => {
        a.addEventListener("click", () => {
          mobnav.classList.remove("open");
          hambtn.classList.remove("open");
          hambtn.setAttribute("aria-expanded", "false");
          mobnav.setAttribute("aria-hidden", "true");
          document.body.style.overflow = "";
        });
      });
    }

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("mousemove", onMove);
      if (hero && glow) hero.removeEventListener("mousemove", onHeroMove);
      if (rail) {
        rail.removeEventListener("mousedown", onRailDown);
        rail.removeEventListener("mouseup", onRailUp);
        rail.removeEventListener("mouseleave", onRailUp);
        rail.removeEventListener("mousemove", onRailMove);
      }
      numIO.disconnect();
      io.disconnect();
      navIO.disconnect();
      if (hambtn && mobnav) {
        hambtn.removeEventListener("click", toggleMenu);
      }
    };
  }, []);

  return (
    <>
      <div id="cur" />
      <div id="cur-dot" />
    </>
  );
}
