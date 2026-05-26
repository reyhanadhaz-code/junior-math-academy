import { createFileRoute, Link } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { Mascot } from "@/components/Mascot";
import { useLang } from "@/lib/i18n";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  const { t } = useLang();
  const cards = [
    { to: "/cartesian", icon: "📍", bg: "bg-primary/15", badge: "bg-primary", title: t.cards.cartesian.title, desc: t.cards.cartesian.desc, highlight: true },
    { to: "/shapes", icon: "📐", bg: "bg-sunny/25", badge: "bg-sunny", title: t.cards.shapes.title, desc: t.cards.shapes.desc },
    { to: "/shapes", search: { tab: "transform" }, icon: "🔄", bg: "bg-grass/25", badge: "bg-grass", title: t.cards.transform.title, desc: t.cards.transform.desc },
    { to: "/history", icon: "📚", bg: "bg-tangerine/25", badge: "bg-tangerine", title: t.cards.history.title, desc: t.cards.history.desc },
    { to: "/favorites", icon: "⭐", bg: "bg-bubble/25", badge: "bg-bubble", title: t.cards.favorites.title, desc: t.cards.favorites.desc },
    { to: "/help", icon: "ℹ️", bg: "bg-grape/20", badge: "bg-grape", title: t.cards.help.title, desc: t.cards.help.desc },
  ] as const;

  return (
    <Layout>
      <Mascot />
      <h2 className="mt-10 mb-4 text-2xl md:text-3xl font-extrabold text-foreground">
        {t.home.title}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {cards.map((c, i) => (
          <Link
            key={i}
            to={c.to}
            className={`group relative rounded-3xl border border-border bg-card ${c.highlight ? c.bg : ""} p-5 shadow-sm hover:shadow-xl hover:scale-105 transition-all flex flex-col gap-3 min-h-[180px]`}
          >
            <div className={`w-14 h-14 grid place-items-center rounded-2xl ${c.badge} text-3xl shadow-md`}>
              {c.icon}
            </div>
            <h3 className="text-lg font-extrabold text-foreground leading-tight">{c.title}</h3>
            <p className="text-sm text-muted-foreground font-semibold flex-1">{c.desc}</p>
            <div className="absolute bottom-4 right-4 w-10 h-10 grid place-items-center rounded-full bg-primary text-primary-foreground text-xl shadow-md group-hover:translate-x-1 transition-transform">
              →
            </div>
          </Link>
        ))}
      </div>
    </Layout>
  );
}
