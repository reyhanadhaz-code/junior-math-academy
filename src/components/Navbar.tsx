import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { useLang } from "@/lib/i18n";

export function Navbar() {
  const { lang, setLang, t } = useLang();
  const [open, setOpen] = useState(false);

  const links = [
    { to: "/", label: t.nav.home },
    { to: "/cartesian", label: t.nav.cartesian },
    { to: "/shapes", label: t.nav.shapes },
    { to: "/history", label: t.nav.history },
  ] as const;

  return (
    <header className="sticky top-0 z-40 bg-card/80 backdrop-blur border-b border-border">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2 group">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-primary to-grape text-2xl shadow-md group-hover:scale-110 transition">
            🌟
          </span>
          <span className="text-xl font-extrabold tracking-tight text-foreground">
            MathKids
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              activeOptions={{ exact: l.to === "/" }}
              activeProps={{ className: "bg-primary text-primary-foreground" }}
              className="rounded-full px-4 py-2 text-sm font-bold text-foreground hover:bg-secondary transition"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setLang(lang === "id" ? "en" : "id")}
            className="rounded-full bg-sunny px-3 py-2 text-sm font-bold shadow hover:scale-105 transition flex items-center gap-1"
            aria-label="Toggle language"
          >
            {lang === "id" ? "🇮🇩 ID" : "🇬🇧 EN"}
          </button>
          <button
            className="md:hidden rounded-full bg-secondary px-3 py-2 text-lg"
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
          >
            ☰
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-border bg-card animate-pop">
          <div className="mx-auto max-w-6xl flex flex-col p-3 gap-1">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                activeOptions={{ exact: l.to === "/" }}
                activeProps={{ className: "bg-primary text-primary-foreground" }}
                className="rounded-full px-4 py-2 text-sm font-bold text-foreground hover:bg-secondary transition"
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
