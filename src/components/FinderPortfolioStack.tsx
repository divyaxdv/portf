import type { IconType } from "react-icons";
import { FaAws, FaJava } from "react-icons/fa6";
import {
  SiBootstrap,
  SiCplusplus,
  SiDocker,
  SiExpress,
  SiFirebase,
  SiJavascript,
  SiMongodb,
  SiMongoose,
  SiMysql,
  SiNextdotjs,
  SiNodedotjs,
  SiPostgresql,
  SiPrisma,
  SiPython,
  SiReact,
  SiRedux,
  SiSass,
  SiTailwindcss,
  SiTypescript,
} from "react-icons/si";

type StackSection = {
  title: string;
  items: { label: string; Icon: IconType }[];
};

const STACK_SECTIONS: StackSection[] = [
  {
    title: "Languages",
    items: [
      { label: "C++", Icon: SiCplusplus },
      { label: "Java", Icon: FaJava },
      { label: "Python", Icon: SiPython },
      { label: "TypeScript", Icon: SiTypescript },
      { label: "JavaScript", Icon: SiJavascript },
      { label: "MySQL", Icon: SiMysql },
    ],
  },
  // {
  //   title: "Tools",
  //   items: [
  //     { label: "Git", Icon: SiGit },
  //     { label: "Unix", Icon: SiLinux },
  //   ],
  // },
  {
    title: "Frameworks & more",
    items: [
      { label: "React", Icon: SiReact },
      { label: "Node.js", Icon: SiNodedotjs },
      { label: "Express.js", Icon: SiExpress },
      { label: "Prisma", Icon: SiPrisma },
      { label: "PostgreSQL", Icon: SiPostgresql },
      { label: "Redux", Icon: SiRedux },
      { label: "MongoDB", Icon: SiMongodb },
      { label: "Mongoose", Icon: SiMongoose },
      { label: "Firebase", Icon: SiFirebase },
      { label: "SCSS", Icon: SiSass },
      { label: "Next.js", Icon: SiNextdotjs },
      { label: "Bootstrap", Icon: SiBootstrap },
      { label: "AWS", Icon: FaAws },
      { label: "Tailwind CSS", Icon: SiTailwindcss },
      { label: "Docker", Icon: SiDocker },
    ],
  },
];

export function FinderPortfolioStack() {
  return (
    <div className="finder-portfolio__stack">
      {STACK_SECTIONS.map((section) => (
        <div key={section.title} className="finder-portfolio__stack-section">
          <p className="finder-portfolio__stack-label">{section.title}</p>
          <ul
            className="finder-portfolio__icon-pills"
            aria-label={`${section.title} stack`}
          >
            {section.items.map(({ label, Icon }) => (
              <li key={`${section.title}-${label}`}>
                <button
                  type="button"
                  className="finder-portfolio__icon-pill"
                  aria-label={label}
                  data-tooltip={label}
                >
                  <Icon
                    className="finder-portfolio__icon-pill-svg"
                    aria-hidden
                  />
                </button>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
