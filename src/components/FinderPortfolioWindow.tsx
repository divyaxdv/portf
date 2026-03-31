import { useCallback, useEffect, useRef, useState } from "react";
import "./FinderPortfolioWindow.css";

type FinderPortfolioWindowProps = {
  open: boolean;
  onClose: () => void;
};

const TECH = [
  { name: "TypeScript", color: "#3178c6" },
  { name: "React", color: "#61dafb" },
  { name: "Next.js", color: "#ffffff" },
  { name: "Tailwind CSS", color: "#38bdf8" },
  { name: "AWS", color: "#ff9900" },
  { name: "Docker", color: "#2496ed" },
  { name: "Kubernetes", color: "#326ce5" },
] as const;

export function FinderPortfolioWindow({
  open,
  onClose,
}: FinderPortfolioWindowProps) {
  const dragRef = useRef<{
    startX: number;
    startY: number;
    origX: number;
    origY: number;
  } | null>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) setOffset({ x: 0, y: 0 });
  }, [open]);

  const onTitleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if ((e.target as HTMLElement).closest(".finder-window__traffic")) return;
      e.preventDefault();
      dragRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        origX: offset.x,
        origY: offset.y,
      };
      const onMove = (ev: MouseEvent) => {
        if (!dragRef.current) return;
        const dx = ev.clientX - dragRef.current.startX;
        const dy = ev.clientY - dragRef.current.startY;
        setOffset({
          x: dragRef.current.origX + dx,
          y: dragRef.current.origY + dy,
        });
      };
      const onUp = () => {
        dragRef.current = null;
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseup", onUp);
      };
      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onUp);
    },
    [offset.x, offset.y],
  );

  if (!open) return null;

  return (
    <div
      className="finder-window-root"
      role="presentation"
      aria-hidden={!open}
    >
      <div
        className="finder-window__drift"
        style={{ transform: `translate(${offset.x}px, ${offset.y}px)` }}
      >
        <div
          className="finder-window"
          role="dialog"
          aria-modal="true"
          aria-labelledby="finder-window-title"
        >
        <header
          className="finder-window__titlebar"
          onMouseDown={onTitleMouseDown}
        >
          <div className="finder-window__traffic" aria-hidden>
            <button
              type="button"
              className="finder-window__dot finder-window__dot--close"
              onClick={onClose}
              aria-label="Close window"
            />
            <span
              className="finder-window__dot finder-window__dot--min"
              aria-hidden
            />
            <span
              className="finder-window__dot finder-window__dot--zoom"
              aria-hidden
            />
          </div>
          <div className="finder-window__title" id="finder-window-title">
            <span className="finder-window__title-icon" aria-hidden>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z" />
              </svg>
            </span>
            Portfolio
          </div>
          <div className="finder-window__titlebar-spacer" />
        </header>

        <div className="finder-window__body">
          <div className="finder-portfolio">
            <div className="finder-portfolio__avatar" aria-hidden />
            <div className="finder-portfolio__main">
              <p className="finder-portfolio__hey">Ciao! I&apos;m</p>
              <h1 className="finder-portfolio__name">Your Name</h1>
              <p className="finder-portfolio__role">
                FULL-STACK WEB DEVELOPER AND DEVOPS ENGINEER
              </p>
              <div className="finder-portfolio__underline" aria-hidden />

              <div className="finder-portfolio__meta">
                <span className="finder-portfolio__meta-item">
                  <span className="finder-portfolio__dot finder-portfolio__dot--blue" />
                  Pune, India
                </span>
                <span className="finder-portfolio__badge">
                  <span className="finder-portfolio__dot finder-portfolio__dot--green" />
                  Available for Work
                </span>
              </div>

              <p className="finder-portfolio__bio">
                I build scalable web applications using{" "}
                {TECH.map((t, i) => (
                  <span key={t.name}>
                    <span
                      className="finder-portfolio__tech"
                      style={{ color: t.color }}
                    >
                      {t.name}
                    </span>
                    {i < TECH.length - 1
                      ? i === TECH.length - 2
                        ? ", and "
                        : ", "
                      : ""}
                  </span>
                ))}
                .
              </p>

              <ul className="finder-portfolio__pills" aria-label="Tech stack">
                {TECH.map((t) => (
                  <li key={t.name} className="finder-portfolio__pill">
                    <span style={{ color: t.color }}>{t.name}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
