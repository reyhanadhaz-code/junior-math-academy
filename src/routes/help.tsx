import { createFileRoute } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { useLang } from "@/lib/i18n";

export const Route = createFileRoute("/help")({
  component: HelpPage,
});

function HelpPage() {
  const { t } = useLang();
  return (
    <Layout>
      <div className="flex items-center gap-3 mb-5">
        <span className="text-3xl">ℹ️</span>
        <h1 className="text-2xl md:text-3xl font-extrabold">{t.help.title}</h1>
      </div>
      <div className="space-y-3">
        {t.help.items.map((item, i) => (
          <details key={i} className="rounded-2xl bg-card border border-border p-4 shadow-sm group">
            <summary className="cursor-pointer font-extrabold flex items-center gap-2">
              <span className="w-7 h-7 grid place-items-center rounded-full bg-primary text-primary-foreground text-sm">{i + 1}</span>
              {item.q}
            </summary>
            <p className="mt-3 text-muted-foreground font-semibold">{item.a}</p>
          </details>
        ))}
      </div>
    </Layout>
  );
}
