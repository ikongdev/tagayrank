import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  UserCheck,
  History as HistoryIcon,
  Settings,
  Gamepad2,
  Moon,
  Sun,
} from "lucide-react";
import { useState } from "react";

const links = [
  { name: "Dashboard", path: "/", icon: LayoutDashboard },
  { name: "Participants", path: "/participants", icon: Users },
  { name: "Attendance", path: "/attendance", icon: UserCheck },
  { name: "Games", path: "/games", icon: Gamepad2 },
  { name: "History", path: "/history", icon: HistoryIcon },
  { name: "Settings", path: "/settings", icon: Settings },
];

export default function Sidebar() {
  const [theme, setTheme] = useState(() =>
    document.documentElement.classList.contains("dark") ? "dark" : "light"
  );

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";

    document.documentElement.classList.toggle("dark", nextTheme === "dark");
    document.documentElement.style.colorScheme = nextTheme;
    localStorage.setItem("tagayrank-theme", nextTheme);
    setTheme(nextTheme);
  };

  const ThemeIcon = theme === "dark" ? Sun : Moon;
  const themeLabel = theme === "dark" ? "Switch to light theme" : "Switch to dark theme";

  return (
    <>
      <aside className="hidden lg:block w-24 shrink-0">
        <div className="fixed left-4 top-4 z-50 w-16 rounded-3xl px-2 py-4 flex flex-col items-center bg-white border border-orange-100 shadow-xl">
          <div className="mb-7">
            <img
              src="/logo.png"
              alt="TagayRank logo"
              className="w-12 h-12 object-contain"
            />
          </div>

          <nav className="flex flex-col gap-3 w-full">
            {links.map((link) => {
              const Icon = link.icon;

              return (
                <NavLink
                  key={link.path}
                  to={link.path}
                  title={link.name}
                  className={({ isActive }) =>
                    `
                    relative
                    w-full
                    h-12
                    rounded-2xl
                    flex
                    items-center
                    justify-center
                    transition-all
                    duration-200
                    ${
                      isActive
                        ? "bg-orange-50 text-orange-600 shadow-md -translate-y-0.5 scale-105"
                        : "text-slate-700 hover:bg-orange-50 hover:text-orange-600 hover:-translate-y-0.5"
                    }
                    `
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon
                        size={22}
                        strokeWidth={isActive ? 3 : 2.2}
                        className="transition-all duration-200"
                      />

                      {isActive && (
                        <span className="absolute -right-1 top-1/2 h-6 w-1 -translate-y-1/2 rounded-full bg-orange-500 shadow-sm" />
                      )}

                      <span className="sr-only">{link.name}</span>
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>

          <div className="mt-5 pt-4 border-t border-orange-100 w-full">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={themeLabel}
              aria-pressed={theme === "dark"}
              title={themeLabel}
              className="theme-toggle w-full h-12 rounded-2xl flex items-center justify-center text-slate-700 hover:bg-orange-50 hover:text-orange-600 transition-all duration-200"
            >
              <ThemeIcon size={21} strokeWidth={2.3} />
              <span className="sr-only">{themeLabel}</span>
            </button>
          </div>
        </div>
      </aside>

      <nav className="lg:hidden fixed bottom-4 left-3 right-3 z-50">
        <div className="rounded-3xl p-2 grid grid-cols-7 gap-1 bg-white border border-orange-100 shadow-xl">
          {links.map((link) => {
            const Icon = link.icon;

            return (
              <NavLink
                key={link.path}
                to={link.path}
                aria-label={link.name}
                title={link.name}
                className={({ isActive }) =>
                  `
                  relative
                  h-12
                  rounded-2xl
                  flex
                  items-center
                  justify-center
                  transition-all
                  duration-200
                  ${
                    isActive
                      ? "bg-orange-50 text-orange-600 shadow-md -translate-y-1 scale-105"
                      : "text-slate-700 hover:bg-orange-50 hover:text-orange-600"
                  }
                  `
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      size={22}
                      strokeWidth={isActive ? 3 : 2.2}
                      className="transition-all duration-200"
                    />

                    {isActive && (
                      <span className="absolute -bottom-1 h-1 w-6 rounded-full bg-orange-500 shadow-sm" />
                    )}

                    <span className="sr-only">{link.name}</span>
                  </>
                )}
              </NavLink>
            );
          })}

          <button
            type="button"
            onClick={toggleTheme}
            aria-label={themeLabel}
            aria-pressed={theme === "dark"}
            title={themeLabel}
            className="theme-toggle h-12 rounded-2xl flex items-center justify-center text-slate-700 hover:bg-orange-50 hover:text-orange-600 transition-all duration-200"
          >
            <ThemeIcon size={21} strokeWidth={2.3} />
            <span className="sr-only">{themeLabel}</span>
          </button>
        </div>
      </nav>
    </>
  );
}
