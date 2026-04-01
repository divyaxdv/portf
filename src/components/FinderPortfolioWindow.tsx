import { useCallback, useEffect, useId, useRef, useState } from "react";
import type { FocusOrder } from "../utils/windowStack";
import { windowStackZIndex } from "../utils/windowStack";
import "./FinderPortfolioWindow.css";
import { FinderPortfolioStack } from "./FinderPortfolioStack";

type FinderPortfolioWindowProps = {
  open: boolean;
  /** Hidden (yellow) — window unmounts; dock dot stays while `open` is true */
  minimized: boolean;
  onClose: () => void;
  onMinimizedChange: (minimized: boolean) => void;
  focusOrder: FocusOrder;
  onFocusWindow: () => void;
};

/** One shared path so every layer ends at the same x — no stray “peep” on the right */
const ROLE_UNDERLINE_PATH =
  "M3 13.5c38-4.8 74 6.2 112 .5c32-3.8 62-1 94 2.4c24 2.6 48-2 72 1c16 1.6 34-3 50-.5c8 1 18-1.2 26-.8";

export function FinderPortfolioWindow({
  open,
  minimized,
  onClose,
  onMinimizedChange,
  focusOrder,
  onFocusWindow,
}: FinderPortfolioWindowProps) {
  const dragRef = useRef<{
    startX: number;
    startY: number;
    origX: number;
    origY: number;
  } | null>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [fullscreen, setFullscreen] = useState(false);
  const roleUnderlineGradId = useId().replace(/:/g, "");

  useEffect(() => {
    if (!open || minimized) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (fullscreen) {
        setFullscreen(false);
        return;
      }
      onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, minimized, onClose, fullscreen]);

  useEffect(() => {
    if (!open) {
      setOffset({ x: 0, y: 0 });
      setFullscreen(false);
    }
  }, [open]);

  const toggleFullscreen = useCallback(() => {
    setFullscreen((f) => {
      const next = !f;
      if (next) onMinimizedChange(false);
      return next;
    });
  }, [onMinimizedChange]);

  const onTitleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (fullscreen) return;
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
    [offset.x, offset.y, fullscreen],
  );

  if (!open) return null;
  if (minimized) return null;

  const rootClass =
    "finder-window-root" +
    (fullscreen ? " finder-window-root--fullscreen" : "");

  const windowClass = [
    "finder-window",
    fullscreen ? "finder-window--fullscreen" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const stackZ = windowStackZIndex("finder", focusOrder, fullscreen);

  return (
    <div
      className={rootClass}
      role="presentation"
      aria-hidden={!open}
      style={{ zIndex: stackZ }}
    >
      <div
        className="finder-window__drift"
        onPointerDownCapture={onFocusWindow}
        style={
          fullscreen
            ? { transform: "none", width: "100%", height: "100%" }
            : { transform: `translate(${offset.x}px, ${offset.y}px)` }
        }
      >
        <div
          className={windowClass}
          role="dialog"
          aria-modal="true"
          aria-labelledby="finder-window-title"
        >
          <header
            className="finder-window__titlebar"
            onMouseDown={onTitleMouseDown}
          >
            <div className="finder-window__traffic">
              <button
                type="button"
                className="finder-window__dot finder-window__dot--close"
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                }}
                aria-label="Close window"
              />
              <button
                type="button"
                className="finder-window__dot finder-window__dot--min"
                onClick={(e) => {
                  e.stopPropagation();
                  setFullscreen(false);
                  onMinimizedChange(true);
                }}
                aria-label="Minimize window"
              />
              <button
                type="button"
                className="finder-window__dot finder-window__dot--zoom"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFullscreen();
                }}
                aria-label={
                  fullscreen ? "Exit full screen" : "Enter full screen"
                }
              />
            </div>
            <div className="finder-window__title" id="finder-window-title">
              <span className="finder-window__title-icon" aria-hidden>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z" />
                </svg>
              </span>
              ~whoami
            </div>
            <div className="finder-window__titlebar-spacer" />
          </header>

          <div className="finder-window__body">
            <div className="finder-portfolio">
              <img
                className="finder-portfolio__avatar"
                src="/tis100-sad.gif"
                alt="Animated profile"
                loading="eager"
                decoding="async"
              />
              <div className="finder-portfolio__main">
                <p className="finder-portfolio__hey">Hey — I&apos;m</p>
                <h1 className="finder-portfolio__name">Divya</h1>
                <p className="finder-portfolio__role">FULL-STACK DEVELOPER</p>
                <svg
                  className="finder-portfolio__underline"
                  viewBox="-6 -3 338 28"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden
                >
                  <defs>
                    <linearGradient
                      id={roleUnderlineGradId}
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="0%"
                    >
                      <stop offset="0%" stopColor="#005c00" />
                      <stop offset="48%" stopColor="#00b800" />
                      <stop offset="100%" stopColor="#006b00" />
                    </linearGradient>
                  </defs>
                  {/* Same geometry + vertical nudge — identical right edge, no extra tail */}
                  <path
                    className="finder-portfolio__underline-pass finder-portfolio__underline-pass--back"
                    d={ROLE_UNDERLINE_PATH}
                    transform="translate(0, 2.1)"
                    stroke={`url(#${roleUnderlineGradId})`}
                    strokeWidth={5.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity={0.38}
                  />
                  <path
                    className="finder-portfolio__underline-pass finder-portfolio__underline-pass--mid"
                    d={ROLE_UNDERLINE_PATH}
                    stroke={`url(#${roleUnderlineGradId})`}
                    strokeWidth={3.2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity={0.55}
                  />
                  <path
                    className="finder-portfolio__underline-pass finder-portfolio__underline-pass--front"
                    d={ROLE_UNDERLINE_PATH}
                    transform="translate(0, -1.5)"
                    stroke={`url(#${roleUnderlineGradId})`}
                    strokeWidth={2.4}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity={0.92}
                  />
                  {/* Left smudge */}
                  <path
                    d="M2 11.5q-4 1.5-5.5 4.2"
                    stroke={`url(#${roleUnderlineGradId})`}
                    strokeWidth={2}
                    strokeLinecap="round"
                    opacity={0.45}
                  />
                  <path
                    d="M4 14.8q-3.8 1.4-7 2.2"
                    stroke={`url(#${roleUnderlineGradId})`}
                    strokeWidth={1.4}
                    strokeLinecap="round"
                    opacity={0.38}
                  />
                </svg>

                <div className="finder-portfolio__meta">
                  <span className="finder-portfolio__meta-item">
                    <span className="finder-portfolio__dot finder-portfolio__dot--blue" />
                    Pune, India
                  </span>
                  {/* <span className="finder-portfolio__badge">
                    <span className="finder-portfolio__dot finder-portfolio__dot--green" />
                    Available for Work
                  </span> */}
                </div>

                <p className="finder-portfolio__bio">
                  Turns vague ideas into fast, reliable systems—from refined
                  interfaces to APIs, cloud, and containers.
                </p>

                <FinderPortfolioStack />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
