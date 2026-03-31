import { useCallback, useEffect, useRef, useState } from "react";
import type { FocusOrder } from "../utils/windowStack";
import { windowStackZIndex } from "../utils/windowStack";
import "./FinderPortfolioWindow.css";
import "./TerminalThanksWindow.css";

type TerminalThanksWindowProps = {
  open: boolean;
  minimized: boolean;
  onClose: () => void;
  onMinimizedChange: (minimized: boolean) => void;
  focusOrder: FocusOrder;
  onFocusWindow: () => void;
};

type LineKind = "normal" | "dim" | "art";

type QueuedLine = {
  text: string;
  kind?: LineKind;
};

const BAYER4 = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];

function bayerOffset(x: number, y: number): number {
  return (BAYER4[y & 3][x & 3] + 0.5) / 16 - 0.5;
}

function fbm2(x: number, y: number): number {
  let v = 0;
  let a = 0.45;
  let xf = x;
  let yf = y;
  for (let i = 0; i < 4; i++) {
    v += a * Math.sin(xf * 1.7 + yf * 0.9);
    v += a * 0.55 * Math.cos(xf * 0.85 - yf * 1.35);
    xf *= 2.05;
    yf *= 2.02;
    a *= 0.5;
  }
  return v;
}

/** Light → heavy (inspo: left shadow = 888/MN; right limb = [[/;::-. ) */
const DENSITY_RAMP =
  " .'`^,:;-_][[/;::..`'*+oO0@Pdwmo*MN8MN8UUdMMMWWMN%&#@$88MNNdopYMA";
const RING_RAMP =
  " .'`^,:;-_][[/;::o0@Pd*MN8MMMW%#&@$^odpMMAYUPOMPdMMM'888NN";

/**
 * Dense Saturn: diagonal rings, globe with inverted glyph ramp (shadow = blocky),
 * Cassini gap, diagonal streaks on rings (hand-ASCII inspo).
 */
function generateDenseSaturn(): string[] {
  const rows = 52;
  const cols = 80;
  const cx = cols * 0.5;
  const cy = rows * 0.48;
  const Rp = Math.min(rows, cols) * 0.145;
  const ringRx = Rp * 3.05;
  const ringRy = Rp * 0.34;
  const tilt = 0.31;
  const ct = Math.cos(tilt);
  const st = Math.sin(tilt);

  const lx = 0.55;
  const ly = -0.36;
  const lz = 0.76;
  const invL = 1 / Math.hypot(lx, ly, lz);
  const lxN = lx * invL;
  const lyN = ly * invL;
  const lzN = lz * invL;

  const out: string[] = [];
  for (let y = 0; y < rows; y++) {
    let line = "";
    for (let x = 0; x < cols; x++) {
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.hypot(dx, dy);
      const rdx = dx * ct + dy * st;
      const rdy = -dx * st + dy * ct;
      const ex = rdx / ringRx;
      const ey = rdy / ringRy;
      const esq = ex * ex + ey * ey;

      const inPlanet = dist < Rp * 1.015;

      if (inPlanet) {
        const nx = dx / Rp;
        const ny = dy / Rp;
        const nsq = nx * nx + ny * ny;
        if (nsq > 1.001) {
          line += " ";
          continue;
        }
        const nz = Math.sqrt(Math.max(0, 1 - nsq));
        let lum = Math.max(0, nx * lxN + ny * lyN + nz * lzN);
        lum += 0.095 * fbm2(x * 0.09, y * 0.09);
        lum +=
          0.065 * Math.sin(x * 0.45 + y * 0.33) +
          0.05 * Math.sin(x * 0.17 + y * 0.14);
        const limb = Math.sqrt(Math.max(0, 1 - nsq));
        lum *= 0.52 + 0.48 * limb;
        lum = Math.pow(Math.max(0, Math.min(1, lum)), 0.88);
        // Invert: night side (low lum) → heavy glyphs (M/N/8); day → light punctuation
        let g = 1 - lum;
        g *= 0.78 + 0.28 * (1 - (nx + 1) * 0.5);
        g = Math.max(0, Math.min(1, g));
        const rampLen = DENSITY_RAMP.length;
        const jitter = bayerOffset(x, y) * 1.15;
        const t = g * (rampLen - 1) + jitter;
        const idx = Math.max(0, Math.min(rampLen - 1, Math.floor(t)));
        line += DENSITY_RAMP[idx];
        continue;
      }

      if (esq >= 0.5 && esq <= 1.24) {
        let s =
          0.46 +
          0.2 * Math.sin(rdx * 0.12 + rdy * 0.62) +
          0.14 * Math.sin(x * 0.35 + y * 0.22) +
          0.11 * fbm2(x * 0.08, y * 0.08);
        s += 0.09 * Math.sin(x * 0.7) * Math.cos(y * 0.3);
        if (esq >= 0.87 && esq <= 0.94) s *= 0.18;
        if (esq >= 0.5 && esq <= 0.57) s *= 0.52;
        s = Math.max(0, Math.min(1, s));
        const rLen = RING_RAMP.length;
        const ji = bayerOffset(x, y + 2) * 0.98;
        const idx = Math.max(
          0,
          Math.min(rLen - 1, Math.floor(s * (rLen - 1) + ji)),
        );
        line += RING_RAMP[idx];
        continue;
      }

      const h = (x * 61 + y * 29 + x * y) % 215;
      line += h < 3 ? "*" : " ";
    }
    out.push(line);
  }
  return out;
}

const ASCII_SATURN = generateDenseSaturn();

/** Block letters (Unicode box) — reads as “THANK” */
const BLOCK_THANK: string[] = [
  "████████╗██╗  ██╗ █████╗ ███╗   ██╗██╗  ██╗",
  "╚══██╔══╝██║  ██║██╔══██╗████╗  ██║██║ ██╔╝",
  "   ██║   ███████║███████║██╔██╗ ██║█████╔╝ ",
  "   ██║   ██╔══██║██╔══██║██║╚██╗██║██╔═██╗ ",
  "   ██║   ██║  ██║██║  ██║██║ ╚████║██║  ██╗",
  "   ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═══╝╚═╝  ╚═╝",
];

/** Block letters — “YOU” */
const BLOCK_YOU: string[] = [
  "██╗   ██╗ ██████╗ ██╗   ██╗",
  "██║   ██║██╔═══██╗██║   ██║",
  "██║   ██║██║   ██║██║   ██║",
  "╚██╗ ██╔╝██║   ██║██║   ██║",
  " ╚████╔╝ ╚██████╔╝╚██████╔╝",
  "  ╚═══╝   ╚═════╝  ╚═════╝ ",
];

function pushLines(
  rows: { delay: number; line: QueuedLine }[],
  lines: string[],
  firstDelay: number,
  perLine: number,
  kind: LineKind,
) {
  lines.forEach((text, i) => {
    rows.push({
      delay: i === 0 ? firstDelay : perLine,
      line: { text, kind },
    });
  });
}

function buildScript(): { delay: number; line: QueuedLine }[] {
  const rows: { delay: number; line: QueuedLine }[] = [
    {
      delay: 0,
      line: { text: "> portfolio-os · boot sequence …", kind: "dim" },
    },
    { delay: 90, line: { text: "> raster engine ready · [ok]", kind: "dim" } },
    { delay: 70, line: { text: "", kind: "normal" } },
    {
      delay: 60,
      line: { text: "divyaxdv:~$ ./render-gratitude --ascii", kind: "dim" },
    },
    { delay: 180, line: { text: "rendering…", kind: "dim" } },
    { delay: 120, line: { text: "", kind: "normal" } },
    {
      delay: 40,
      line: {
        text: "     ( spiraling in Saturn's magnetosphere )",
        kind: "dim",
      },
    },
  ];

  pushLines(rows, ASCII_SATURN, 80, 7, "art");
  rows.push({ delay: 220, line: { text: "", kind: "normal" } });
  pushLines(rows, BLOCK_THANK, 90, 42, "art");
  rows.push({ delay: 160, line: { text: "", kind: "normal" } });
  pushLines(rows, BLOCK_YOU, 80, 48, "art");
  rows.push(
    { delay: 200, line: { text: "", kind: "normal" } },
    {
      delay: 80,
      line: {
        text: "     ~ thanks for visiting · — Divya ~",
        kind: "normal",
      },
    },
    { delay: 260, line: { text: "", kind: "normal" } },
    {
      delay: 100,
      line: {
        text: "> render complete · ephemeris saved to /dev/saturn_rings ✓",
        kind: "dim",
      },
    },
  );
  return rows;
}

export function TerminalThanksWindow({
  open,
  minimized,
  onClose,
  onMinimizedChange,
  focusOrder,
  onFocusWindow,
}: TerminalThanksWindowProps) {
  const dragRef = useRef<{
    startX: number;
    startY: number;
    origX: number;
    origY: number;
  } | null>(null);
  const [offset, setOffset] = useState({ x: 56, y: 48 });
  const [fullscreen, setFullscreen] = useState(false);
  const [lines, setLines] = useState<{ text: string; kind: LineKind }[]>([]);
  const [sequenceDone, setSequenceDone] = useState(false);
  const paneRef = useRef<HTMLPreElement>(null);
  const runIdRef = useRef(0);

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
      setOffset({ x: 56, y: 48 });
      setFullscreen(false);
      setLines([]);
      setSequenceDone(false);
      runIdRef.current += 1;
    }
  }, [open]);

  useEffect(() => {
    if (!open || minimized) return;

    const script = buildScript();
    const myRun = ++runIdRef.current;
    setLines([]);
    setSequenceDone(false);

    let accumulated = 0;
    const timers: number[] = [];

    script.forEach(({ delay, line }) => {
      accumulated += delay;
      const t = window.setTimeout(() => {
        if (runIdRef.current !== myRun) return;
        setLines((prev) => [
          ...prev,
          { text: line.text, kind: line.kind ?? "normal" },
        ]);
      }, accumulated);
      timers.push(t);
    });

    const doneAt = accumulated + 80;
    const doneTimer = window.setTimeout(() => {
      if (runIdRef.current !== myRun) return;
      setSequenceDone(true);
    }, doneAt);
    timers.push(doneTimer);

    return () => {
      runIdRef.current += 1;
      timers.forEach((id) => clearTimeout(id));
    };
  }, [open, minimized]);

  useEffect(() => {
    const el = paneRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [lines]);

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
    "finder-window-root terminal-thanks-root" +
    (fullscreen ? " finder-window-root--fullscreen" : "");

  const windowClass = [
    "finder-window",
    "terminal-thanks-window",
    fullscreen ? "finder-window--fullscreen" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const stackZ = windowStackZIndex("terminal", focusOrder, fullscreen);

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
          aria-labelledby="terminal-thanks-title"
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
            <div className="finder-window__title" id="terminal-thanks-title">
              Terminal
            </div>
            <div className="finder-window__titlebar-spacer" />
          </header>

          <div className="finder-window__body terminal-thanks-body">
            <pre className="terminal-thanks-pane neon-green" ref={paneRef}>
              {lines.map((row, i) => (
                <div
                  key={i}
                  className={
                    row.kind === "dim"
                      ? "terminal-thanks-line terminal-thanks-line--dim"
                      : row.kind === "art"
                        ? "terminal-thanks-line terminal-thanks-line--art"
                        : "terminal-thanks-line"
                  }
                >
                  {row.text}
                </div>
              ))}
              {sequenceDone && (
                <div className="terminal-thanks-footer">
                  <div className="terminal-thanks-prompt">
                    <span>divyaxdv:~$</span>
                    <span className="terminal-thanks-cursor" aria-hidden>
                      ▋
                    </span>
                  </div>
                </div>
              )}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
