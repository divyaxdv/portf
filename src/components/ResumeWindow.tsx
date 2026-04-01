import { useCallback, useEffect, useRef, useState } from "react";
import type { FocusOrder } from "../utils/windowStack";
import { windowStackZIndex } from "../utils/windowStack";
import "./FinderPortfolioWindow.css";
import "./ResumeWindow.css";

type ResumeWindowProps = {
  open: boolean;
  minimized: boolean;
  onClose: () => void;
  onMinimizedChange: (minimized: boolean) => void;
  focusOrder: FocusOrder;
  onFocusWindow: () => void;
};

export function ResumeWindow({
  open,
  minimized,
  onClose,
  onMinimizedChange,
  focusOrder,
  onFocusWindow,
}: ResumeWindowProps) {
  const dragRef = useRef<{
    startX: number;
    startY: number;
    origX: number;
    origY: number;
  } | null>(null);
  const [offset, setOffset] = useState({ x: 24, y: 18 });
  const [fullscreen, setFullscreen] = useState(false);

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
      setOffset({ x: 24, y: 18 });
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

  if (!open || minimized) return null;

  const rootClass =
    "finder-window-root resume-window-root" +
    (fullscreen ? " finder-window-root--fullscreen" : "");

  const windowClass = [
    "finder-window",
    "resume-window",
    fullscreen ? "finder-window--fullscreen" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const stackZ = windowStackZIndex("resume", focusOrder, fullscreen);

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
          aria-labelledby="resume-window-title"
        >
          <header className="finder-window__titlebar" onMouseDown={onTitleMouseDown}>
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
                aria-label={fullscreen ? "Exit full screen" : "Enter full screen"}
              />
            </div>
            <div className="finder-window__title" id="resume-window-title">
              Resume
            </div>
            <div className="finder-window__titlebar-spacer" />
          </header>

          <div className="finder-window__body resume-window__body">
            <iframe
              className="resume-window__frame"
              src="/Divya.pdf"
              title="Divya Resume"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
