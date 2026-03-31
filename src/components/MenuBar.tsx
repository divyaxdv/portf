import { useEffect, useState } from "react";

type MenuBarProps = {
  onPortfolioClick?: () => void;
  onProjectClick?: () => void;
  onContactClick?: () => void;
  onResumeClick?: () => void;
};

function formatMenuBarTime(d: Date): string {
  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const day = weekdays[d.getDay()];
  const date = d.getDate();
  const month = months[d.getMonth()];
  const time = d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  return `${day} ${date} ${month} ${time}`;
}

function AppleIcon() {
  return (
    <svg
      className="menu-bar__apple"
      viewBox="0 0 24 24"
      width="18"
      height="18"
      aria-hidden
      focusable="false"
    >
      <path
        fill="currentColor"
        d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"
      />
    </svg>
  );
}

export function MenuBar({
  onPortfolioClick,
  onProjectClick,
  onContactClick,
  onResumeClick,
}: MenuBarProps) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <header className="menu-bar" role="banner">
      <div className="menu-bar__inner">
        <div className="menu-bar__left">
          <button
            type="button"
            className="menu-bar__apple-btn"
            aria-label="Apple menu"
          >
            <AppleIcon />
          </button>
          <nav className="menu-bar__nav" aria-label="Main">
            <button
              type="button"
              className="menu-bar__link menu-bar__link--brand"
              onClick={onPortfolioClick}
            >
              DV&apos;s portfolio
            </button>
            <button
              type="button"
              className="menu-bar__link"
              onClick={onProjectClick}
            >
              project
            </button>
            <button
              type="button"
              className="menu-bar__link"
              onClick={onContactClick}
            >
              contact
            </button>
            <button
              type="button"
              className="menu-bar__link"
              onClick={onResumeClick}
            >
              resume
            </button>
          </nav>
        </div>
        <time className="menu-bar__clock" dateTime={now.toISOString()}>
          {formatMenuBarTime(now)}
        </time>
      </div>
    </header>
  );
}
