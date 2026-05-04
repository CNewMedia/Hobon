"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

export function SiteEffects() {
  const pathname = usePathname();

  useEffect(() => {
    document.body.classList.add("js-ready");

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

    let hoverEls: NodeListOf<HTMLElement> | null = null;
    function onCursorHoverEnter() {
      cur?.classList.add("hover");
    }
    function onCursorHoverLeave() {
      cur?.classList.remove("hover");
    }

    if (cur && dot) {
      document.addEventListener("mousemove", onMove);
      raf = requestAnimationFrame(loop);
      hoverEls = document.querySelectorAll<HTMLElement>(
        "a, button, .sc, .step, .pc, .ps, .num, .sol, .case, .os-item",
      );
      hoverEls.forEach((el) => {
        el.addEventListener("mouseenter", onCursorHoverEnter);
        el.addEventListener("mouseleave", onCursorHoverLeave);
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

    const rail = document.querySelector<HTMLElement>(".s-rail");
    let down = false;
    let sx = 0;
    let sl = 0;
    function onRailDown(e: Event) {
      if (!rail) return;
      const ev = e as MouseEvent;
      down = true;
      sx = ev.pageX - rail.offsetLeft;
      sl = rail.scrollLeft;
      rail.classList.add("grab");
    }
    function onRailUp() {
      down = false;
      rail?.classList.remove("grab");
    }
    function onRailMove(e: Event) {
      if (!down || !rail) return;
      const ev = e as MouseEvent;
      rail.scrollLeft = sl - (ev.pageX - rail.offsetLeft - sx);
    }
    function onRailTouchStart(e: Event) {
      if (!rail) return;
      const te = e as TouchEvent;
      sx = te.touches[0].pageX - rail.offsetLeft;
      sl = rail.scrollLeft;
    }
    function onRailTouchMove(e: Event) {
      if (!rail) return;
      const te = e as TouchEvent;
      rail.scrollLeft = sl - (te.touches[0].pageX - rail.offsetLeft - sx);
    }
    const railTouchOpts: AddEventListenerOptions = { passive: true };
    if (rail) {
      rail.addEventListener("mousedown", onRailDown);
      rail.addEventListener("mouseleave", onRailUp);
      rail.addEventListener("mouseup", onRailUp);
      rail.addEventListener("mousemove", onRailMove);
      rail.addEventListener("touchstart", onRailTouchStart, railTouchOpts);
      rail.addEventListener("touchmove", onRailTouchMove, railTouchOpts);
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
    function closeMobNav() {
      if (!hambtn || !mobnav) return;
      mobnav.classList.remove("open");
      hambtn.classList.remove("open");
      hambtn.setAttribute("aria-expanded", "false");
      mobnav.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
    }

    let mobNavLinks: NodeListOf<HTMLAnchorElement> | null = null;
    if (hambtn && mobnav) {
      hambtn.addEventListener("click", toggleMenu);
      mobNavLinks = mobnav.querySelectorAll("a");
      mobNavLinks.forEach((a) => {
        a.addEventListener("click", closeMobNav);
      });
    }

    return () => {
      document.body.classList.remove("js-ready");
      cancelAnimationFrame(raf);
      document.removeEventListener("mousemove", onMove);
      if (hero && glow) hero.removeEventListener("mousemove", onHeroMove);
      if (hoverEls) {
        hoverEls.forEach((el) => {
          el.removeEventListener("mouseenter", onCursorHoverEnter);
          el.removeEventListener("mouseleave", onCursorHoverLeave);
        });
      }
      if (rail) {
        rail.removeEventListener("mousedown", onRailDown);
        rail.removeEventListener("mouseup", onRailUp);
        rail.removeEventListener("mouseleave", onRailUp);
        rail.removeEventListener("mousemove", onRailMove);
        rail.removeEventListener("touchstart", onRailTouchStart, railTouchOpts);
        rail.removeEventListener("touchmove", onRailTouchMove, railTouchOpts);
      }
      numIO.disconnect();
      io.disconnect();
      navIO.disconnect();
      if (hambtn) {
        hambtn.removeEventListener("click", toggleMenu);
      }
      if (mobNavLinks) {
        mobNavLinks.forEach((a) => {
          a.removeEventListener("click", closeMobNav);
        });
      }
    };
  }, [pathname]);

  return (
    <>
      <div id="cur" />
      <div id="cur-dot" />
    </>
  );
}
