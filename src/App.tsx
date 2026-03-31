import type { CSSProperties } from "react";
import { useState } from "react";
import { ContactMeWindow } from "./components/ContactMeWindow";
import { FinderPortfolioWindow } from "./components/FinderPortfolioWindow";
import Grainient from "./pages/home";
import "./App.css";

type DockIcon = {
  src: string;
  label: string;
  active?: boolean;
  /** Crop tighter than default when the asset has extra margin (1 = no extra zoom) */
  innerZoom?: number;
};

const dockIcons: DockIcon[] = [
  { src: "/finder.jpg", label: "Finder", innerZoom: 1.32 },
  
  {
    src: "/appstore.webp",
    label: "App Store",
    innerZoom: 1.52,
  },
  { src: "/contacts.png", label: "Contacts" },
];

function App() {
  const [finderOpen, setFinderOpen] = useState(false);
  const [contactsOpen, setContactsOpen] = useState(false);

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
      <FinderPortfolioWindow
        open={finderOpen}
        onClose={() => setFinderOpen(false)}
      />
      <ContactMeWindow
        open={contactsOpen}
        onClose={() => setContactsOpen(false)}
      />
      <nav className="dock-glass" aria-label="Application dock">
        <ul className="dock-items">
          {dockIcons.map(({ src, label, active, innerZoom }) => (
            <li key={src} className="dock-item">
              <button
                type="button"
                className="dock-icon-btn"
                title={label}
                onClick={() => {
                  if (label === "Finder") setFinderOpen(true);
                  if (label === "Contacts") setContactsOpen(true);
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
              (label === "Finder" && finderOpen) ||
              (label === "Contacts" && contactsOpen) ? (
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
