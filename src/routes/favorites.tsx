import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { toast } from "sonner";
import { Layout } from "@/components/Layout";
import { EmptyState } from "@/components/EmptyState";
import { useLang } from "@/lib/i18n";
import {
  storageKeys, useLocalList, toggleFavorite,
  type CartesianPoint, type ShapeCalc, type TransformRecord, type FavoriteRef,
} from "@/lib/storage";

export const Route = createFileRoute("/favorites")({
  component: FavoritesPage,
});

function FavoritesPage() {
  const { t } = useLang();
  const [points] = useLocalList<CartesianPoint>(storageKeys.points);
  const [shapes] = useLocalList<ShapeCalc>(storageKeys.shapes);
  const [transforms] = useLocalList<TransformRecord>(storageKeys.transforms);
  const [favs, setFavs] = useLocalList<FavoriteRef>(storageKeys.favorites);

  const items = useMemo(() => {
    return favs.map((f) => {
      if (f.kind === "cartesian") {
        const p = points.find((x) => x.id === f.id);
        return p ? { ref: f, icon: "📍", title: `Titik ${p.name}`, summary: `(${p.x}, ${p.y})` } : null;
      }
      if (f.kind === "shape") {
        const s = shapes.find((x) => x.id === f.id);
        return s ? { ref: f, icon: "📐", title: t.shapes.list[s.shape], summary: `K=${s.perimeter.toFixed(2)} L=${s.area.toFixed(2)}` } : null;
      }
      const tr = transforms.find((x) => x.id === f.id);
      return tr ? { ref: f, icon: "🔄", title: t.trans.type[tr.kind], summary: `${tr.vertices.length} titik` } : null;
    }).filter(Boolean) as { ref: FavoriteRef; icon: string; title: string; summary: string }[];
  }, [favs, points, shapes, transforms, t]);

  return (
    <Layout>
      <div className="flex items-center gap-3 mb-5">
        <span className="text-3xl">⭐</span>
        <h1 className="text-2xl md:text-3xl font-extrabold">{t.favorites.title}</h1>
      </div>
      {items.length === 0 ? (
        <EmptyState message={t.common.noFav} />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((it) => (
            <div key={it.ref.kind + it.ref.id} className="rounded-3xl bg-card border border-border p-5 shadow-sm hover:shadow-lg transition">
              <div className="text-3xl mb-2">{it.icon}</div>
              <h3 className="font-extrabold">{it.title}</h3>
              <p className="text-sm text-muted-foreground">{it.summary}</p>
              <div className="flex justify-end mt-3">
                <button
                  onClick={() => { setFavs(toggleFavorite(favs, it.ref)); toast.success(t.common.deleted); }}
                  className="rounded-full bg-sunny px-3 py-1 text-sm font-bold"
                >
                  ⭐ {t.common.removeFav}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}
