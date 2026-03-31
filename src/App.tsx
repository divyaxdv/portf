import type { CSSProperties } from "react";
import { useState } from "react";
import { ContactMeWindow } from "./components/ContactMeWindow";
import { FinderPortfolioWindow } from "./components/FinderPortfolioWindow";
import Grainient from "./pages/home";
import "./App.css";
import TextType from "./pages/text";

type DockIcon = {
  src: string;
  /** Shown on hover (macOS-style label) */
  tooltip: string;
  app: "finder" | "projectStore" | "contacts";
  active?: boolean;
  /** Crop tighter than default when the asset has extra margin (1 = no extra zoom) */
  innerZoom?: number;
};

const dockIcons: DockIcon[] = [
  { src: "/finder.jpg", tooltip: "Finder", app: "finder", innerZoom: 1.32 },
  {
    src: "/appstore.webp",
    tooltip: "Project Store",
    app: "projectStore",
    innerZoom: 1.52,
  },
  { src: "/contacts.png", tooltip: "Contacts", app: "contacts" },
];

function App() {
  const [finderOpen, setFinderOpen] = useState(false);
  const [finderMinimized, setFinderMinimized] = useState(false);
  const [contactsOpen, setContactsOpen] = useState(false);
  const [contactsMinimized, setContactsMinimized] = useState(false);

  return (
    <div className="screen">
      <div className="gradient-layer">
        <Grainient
          color1="#FF9FFC"
          color2="#5227FF"
          color3="#B19EEF"
          timeSpeed={0.25}
          colorBalance={0}
          warpStrength={1}
          warpFrequency={5}
          warpSpeed={2}
          warpAmplitude={50}
          blendAngle={0}
          blendSoftness={0.05}
          rotationAmount={500}
          noiseScale={2}
          grainAmount={0.1}
          grainScale={2}
          grainAnimated={false}
          contrast={1.5}
          gamma={1}
          saturation={1}
          centerX={0}
          centerY={0}
          zoom={0.9}
        />
      </div>
      <div className="home-hero-text">
        <TextType
          text={["Hy! This is Divya.", "Welcome to my portfolio!"]}
          typingSpeed={75}
          pauseDuration={1500}
          showCursor
          cursorCharacter="_"
          deletingSpeed={50}
          cursorBlinkDuration={0.5}
          loop
          className="home-hero-text__type"
        />
      </div>
      <FinderPortfolioWindow
        open={finderOpen}
        minimized={finderMinimized}
        onClose={() => {
          setFinderOpen(false);
          setFinderMinimized(false);
        }}
        onMinimizedChange={setFinderMinimized}
      />
      <ContactMeWindow
        open={contactsOpen}
        minimized={contactsMinimized}
        onClose={() => {
          setContactsOpen(false);
          setContactsMinimized(false);
        }}
        onMinimizedChange={setContactsMinimized}
      />
      <nav className="dock-glass" aria-label="Application dock">
        <ul className="dock-items">
          {dockIcons.map(({ src, tooltip, app, active, innerZoom }) => (
            <li key={src} className="dock-item">
              <button
                type="button"
                className="dock-icon-btn"
                data-tooltip={tooltip}
                title={tooltip}
                onClick={() => {
                  if (app === "finder") {
                    if (finderOpen && finderMinimized)
                      setFinderMinimized(false);
                    else if (!finderOpen) {
                      setFinderOpen(true);
                      setFinderMinimized(false);
                    }
                  }
                  if (app === "contacts") {
                    if (contactsOpen && contactsMinimized)
                      setContactsMinimized(false);
                    else if (!contactsOpen) {
                      setContactsOpen(true);
                      setContactsMinimized(false);
                    }
                  }
                }}
              >
                <span
                  className="dock-icon-clip"
                  style={
                    innerZoom != null
                      ? ({
                          "--dock-icon-inner-zoom": String(innerZoom),
                        } as CSSProperties)
                      : undefined
                  }
                >
                  <img
                    className="dock-icon"
                    src={src}
                    alt=""
                    width={56}
                    height={56}
                    draggable={false}
                  />
                </span>
              </button>
              {active ||
              (app === "finder" && finderOpen) ||
              (app === "contacts" && contactsOpen) ? (
                <span className="dock-dot" aria-hidden />
              ) : null}
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}

export default App;
