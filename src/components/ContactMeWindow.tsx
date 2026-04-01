import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ComponentType,
} from "react";
import { Copy } from "lucide-react";
import type { FocusOrder } from "../utils/windowStack";
import { windowStackZIndex } from "../utils/windowStack";
import "./FinderPortfolioWindow.css";
import "./ContactMeWindow.css";

type ContactMeWindowProps = {
  open: boolean;
  minimized: boolean;
  onClose: () => void;
  onMinimizedChange: (minimized: boolean) => void;
  focusOrder: FocusOrder;
  onFocusWindow: () => void;
};

/** Replace with your email */
const EMAIL = "divyaxdv@gmail.com";

const SOCIALS: {
  label: string;
  href: string;
  Icon: ComponentType<{ className?: string }>;
}[] = [
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/divya-rajput-b46663228/",
    Icon: IconLinkedIn,
  },
  { label: "Twitter", href: "https://x.com/Divyaxdv", Icon: IconX },
];

export function ContactMeWindow({
  open,
  minimized,
  onClose,
  onMinimizedChange,
  focusOrder,
  onFocusWindow,
}: ContactMeWindowProps) {
  const dragRef = useRef<{
    startX: number;
    startY: number;
    origX: number;
    origY: number;
  } | null>(null);
  const [offset, setOffset] = useState({ x: 48, y: 36 });
  const [copied, setCopied] = useState(false);
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
      setOffset({ x: 48, y: 36 });
      setCopied(false);
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

  const copyEmail = useCallback(() => {
    void navigator.clipboard.writeText(EMAIL).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    });
  }, []);

  if (!open) return null;
  if (minimized) return null;

  const rootClass =
    "finder-window-root contact-me-window-root" +
    (fullscreen ? " finder-window-root--fullscreen" : "");

  const windowClass = [
    "finder-window",
    "contact-me-window",
    fullscreen ? "finder-window--fullscreen" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const stackZ = windowStackZIndex("contacts", focusOrder, fullscreen);

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
          aria-labelledby="contact-window-title"
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
            <div
              className="finder-window__title contact-me-window__title"
              id="contact-window-title"
            >
              Contact Me
            </div>
            <div className="finder-window__titlebar-spacer" />
          </header>

          <div className="finder-window__body contact-me-window__body">
            <div className="contact-me-top">
              <div className="contact-me-photo-wrap">
                <img
                  className="contact-me-photo"
                  src="/images.png"
                  alt="Profile"
                  width={120}
                  height={120}
                  onError={(e) => {
                    e.currentTarget.remove();
                    e.currentTarget.parentElement?.classList.add(
                      "contact-me-photo-wrap--fallback",
                    );
                  }}
                />
              </div>
              <div className="contact-me-copy">
                <h2 className="contact-me-headline">
                  Full Stack Developer • Always learning
                </h2>
                <p className="contact-me-sub">
                  Available for full-time work, freelance gigs &amp; chess
                  match!
                </p>
                <div className="contact-me-actions">
                  <button
                    type="button"
                    className={`contact-me-pill${copied ? " contact-me-pill--copied" : ""}`}
                    onClick={copyEmail}
                  >
                    <Copy size={16} strokeWidth={2} aria-hidden />
                    {copied ? "Copied!" : "divyaxdv@gmail.com"}
                  </button>
                  {SOCIALS.map(({ label, href, Icon }) => (
                    <a
                      key={label}
                      className="contact-me-social-tile"
                      href={href}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={label}
                      title={label}
                    >
                      <Icon className="contact-me-social-icon" />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function IconLinkedIn({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <path
        fill="currentColor"
        d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"
      />
    </svg>
  );
}

function IconX({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <path
        fill="currentColor"
        d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
      />
    </svg>
  );
}
