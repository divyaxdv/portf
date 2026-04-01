import { Globe } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { IconType } from "react-icons";
import { FaAws } from "react-icons/fa6";
import {
  SiExpress,
  SiGithub,
  SiJavascript,
  SiMongodb,
  SiNodedotjs,
  SiPostgresql,
  SiPrisma,
  SiReact,
  SiSocketdotio,
  SiTensorflow,
  SiTypescript,
} from "react-icons/si";
import type { FocusOrder } from "../utils/windowStack";
import { windowStackZIndex } from "../utils/windowStack";
import "./FinderPortfolioWindow.css";
import "./ProjectStoreWindow.css";

type ProjectStoreWindowProps = {
  open: boolean;
  minimized: boolean;
  onClose: () => void;
  onMinimizedChange: (minimized: boolean) => void;
  focusOrder: FocusOrder;
  onFocusWindow: () => void;
};

type ProjectLink = {
  kind: "github" | "demo";
  href?: string;
};

type ProjectTech = {
  label: string;
  Icon: IconType;
};

const PROJECTS: {
  name: string;
  summary: string;
  previewSrc: string;
  previewAlt: string;
  links: ProjectLink[];
  tech: ProjectTech[];
}[] = [
  {
    name: "My Cloud",
    summary:
      "Built as a smart cloud vault, My Cloud handles secure file uploads/downloads with S3 signed URLs + JWT auth, then pushes files through an async TensorFlow.js worker pipeline (SQS) to auto-classify content into folders and tags while MongoDB keeps metadata retrieval fast and user-aware.",
    previewSrc: "/Mycloud Search files.png",
    previewAlt: "My Cloud project preview",
    links: [
      { kind: "github", href: "https://github.com/divyaxdv/mycloud" },
      { kind: "demo" },
    ],
    tech: [
      { label: "React", Icon: SiReact },
      { label: "Node.js", Icon: SiNodedotjs },
      { label: "TensorFlow", Icon: SiTensorflow },
      { label: "MongoDB", Icon: SiMongodb },
      { label: "AWS", Icon: FaAws },
    ],
  },
  {
    name: "RFP-AI",
    summary:
      "RFP-AI converts messy requirement threads into structured procurement workflows, automates IMAP/SMTP proposal intake with lifecycle tracking and audit logs, and runs an LLM-first evaluation flow (Groq with Ollama fallback) to produce clear comparison insights and decision-ready scoring.",
    previewSrc: "/Create RFP.png",
    previewAlt: "RFP-AI project preview",
    links: [
      { kind: "github", href: "https://github.com/divyaxdv/RFP-AI" },
      { kind: "demo" },
    ],
    tech: [
      { label: "React", Icon: SiReact },
      { label: "TypeScript", Icon: SiTypescript },
      { label: "Node.js", Icon: SiNodedotjs },
      { label: "Express", Icon: SiExpress },
      { label: "Prisma", Icon: SiPrisma },
      { label: "PostgreSQL", Icon: SiPostgresql },
    ],
  },
  {
    name: "Docs",
    summary:
      "Docs is a collaborative editor inspired by modern writing tools: rich blocks via React-Quill, UUID-based document sessions, and socket-powered real-time co-editing, finished with one-click PDF export using jsPDF and deployed end-to-end for everyday team usage.",
    previewSrc: "/DOCS EXPORT AS.png",
    previewAlt: "Docs project preview",
    links: [
      { kind: "github", href: "https://github.com/divyaxdv/docs.client" },
      { kind: "demo" },
    ],
    tech: [
      { label: "React", Icon: SiReact },
      { label: "Node.js", Icon: SiNodedotjs },
      { label: "TypeScript", Icon: SiTypescript },
      { label: "Socket.io", Icon: SiSocketdotio },
      { label: "JavaScript", Icon: SiJavascript },
    ],
  },
];

export function ProjectStoreWindow({
  open,
  minimized,
  onClose,
  onMinimizedChange,
  focusOrder,
  onFocusWindow,
}: ProjectStoreWindowProps) {
  const dragRef = useRef<{
    startX: number;
    startY: number;
    origX: number;
    origY: number;
  } | null>(null);
  const [offset, setOffset] = useState({ x: 12, y: 10 });
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
      setOffset({ x: 12, y: 10 });
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
    "finder-window-root project-store-window-root" +
    (fullscreen ? " finder-window-root--fullscreen" : "");

  const windowClass = [
    "finder-window",
    "project-store-window",
    fullscreen ? "finder-window--fullscreen" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const stackZ = windowStackZIndex("projectStore", focusOrder, fullscreen);

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
          aria-labelledby="project-store-title"
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
            <div className="finder-window__title" id="project-store-title">
              Project Store
            </div>
            <div className="finder-window__titlebar-spacer" />
          </header>

          <div className="finder-window__body project-store-window__body">
            <div className="project-store-grid">
              {PROJECTS.map((project) => (
                <article
                  key={project.name}
                  className={
                    "project-card" +
                    (project.name === "RFP-AI" ? " project-card--rfp" : "") +
                    (project.name === "Docs" ? " project-card--docs" : "")
                  }
                >
                  <div className="project-card__preview-wrap">
                    <img
                      className="project-card__preview"
                      src={project.previewSrc}
                      alt={project.previewAlt}
                      loading="lazy"
                    />
                  </div>
                  <div className="project-card__content">
                    <header className="project-card__head">
                      <h3>{project.name}</h3>
                      <div className="project-card__actions">
                        {project.links.map((link) => {
                          const Icon = link.kind === "github" ? SiGithub : Globe;
                          const label = link.kind === "github" ? "GitHub" : "Demo";
                          const disabled = !link.href;
                          const className =
                            "project-card__action" +
                            (disabled ? " project-card__action--disabled" : "");
                          return (
                            <a
                              key={`${project.name}-${label}`}
                              className={className}
                              href={link.href ?? "#"}
                              target="_blank"
                              rel="noreferrer"
                              aria-label={label}
                              title={disabled ? `${label} link coming soon` : label}
                              onClick={(e) => {
                                if (disabled) e.preventDefault();
                              }}
                            >
                              <Icon size={18} aria-hidden />
                            </a>
                          );
                        })}
                      </div>
                    </header>
                    <p className="project-card__summary">{project.summary}</p>
                    <ul className="project-card__tech" aria-label={`${project.name} tech`}>
                      {project.tech.map(({ label, Icon }) => (
                        <li key={`${project.name}-${label}`} title={label} aria-label={label}>
                          <span className="project-card__tech-pill">
                            <Icon size={24} aria-hidden />
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
