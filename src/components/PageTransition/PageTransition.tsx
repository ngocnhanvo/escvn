import { useEffect, useRef } from "react";

export const PageTransition = () => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let startTime = 0;
    const MIN_DURATION = 250;

    const start = () => {
      startTime = Date.now();

      const el = ref.current;
      if (!el) return;

      el.style.display = "block";
      el.style.opacity = "1";
      el.style.transition = "none";
      el.style.width = "0%";

      requestAnimationFrame(() => {
        el.style.transition =
          "width 8s cubic-bezier(.1,.8,.25,1)";
        el.style.width = "95%";
      });
    };

    const stop = () => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, MIN_DURATION - elapsed);

      setTimeout(() => {
        const el = ref.current;
        if (!el) return;

        el.style.transition =
          "width .25s ease-out, opacity .2s linear .15s";
        el.style.width = "100%";
        el.style.opacity = "0";

        const hide = () => {
          el.style.display = "none";
          el.style.width = "0%";
          el.removeEventListener("transitionend", hide);
        };

        el.addEventListener("transitionend", hide);
      }, remaining);
    };

    window.addEventListener("app:nav-start", start);
    window.addEventListener("app:nav-end", stop);

    return () => {
      window.removeEventListener("app:nav-start", start);
      window.removeEventListener("app:nav-end", stop);
    };
  }, []);

  return (
    <div
      ref={ref}
      style={{
        display: "none",
        position: "fixed",
        top: 0,
        left: 0,
        width: 0,
        height: 3,
        zIndex: 99999,
        opacity: 0,
        transformOrigin: "left",
        background: "linear-gradient(to right,#fbbf24,#fde047)",
        boxShadow: "0 0 10px #fbbf24,0 0 5px #f59e0b",
      }}
    />
  );
};