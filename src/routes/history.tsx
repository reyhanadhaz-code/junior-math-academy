import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Layout } from "@/components/Layout";
import { ConfirmModal } from "@/components/ConfirmModal";
import { EmptyState } from "@/components/EmptyState";
import { useLang } from "@/lib/i18n";
import {
  storageKeys, useLocalList, isFavorite, toggleFavorite,
  type CartesianPoint, type ShapeCalc, type TransformRecord, type FavoriteRef,
} from "@/lib/storage";

export const Route = createFileRoute("/history")({
  component: HistoryPage,
});

type Filter = "all" | "cartesian" | "shape" | "transform";

type Entry = {
  id: string;
  kind: "cartesian" | "shape" | "transform";
  icon: string;
  title: string;
  summary: string;
  createdAt: number;
};

function HistoryPage() {
  const { t } = useLang();
  const [points, setPoints] = useLocalList<CartesianPoint>(storageKeys.points);
  const [shapes, setShapes] = useLocalList<ShapeCalc>(storageKeys.shapes);
  const [transforms, setTransforms] = useLocalList<TransformRecord>(storageKeys.transforms);
  const [favs, setFavs] = useLocalList<FavoriteRef>(storageKeys.favorites);
  const [filter, setFilter] = useState<Filter>("all");
  const [pendingDelete, setPendingDelete] = useState<FavoriteRef | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);

  const entries = useMemo<Entry[]>(() => {
    const list: Entry[] = [];
    points.forEach((p) => list.push({
      id: p.id, kind: "cartesian", icon: "📍",
      title: `Titik ${p.name}`, summary: `(${p.x}, ${p.y})`, createdAt: 0,
    }));
    shapes.forEach((s) => list.push({
      id: s.id, kind: "shape", icon: "📐",
      title: t.shapes.list[s.shape], summary: `K=${s.perimeter.toFixed(2)} L=${s.area.toFixed(2)}`, createdAt: s.createdAt,
    }));
    transforms.forEach((tr) => list.push({
      id: tr.id, kind: "transform", icon: "🔄",
      title: t.trans.type[tr.kind], summary: `${tr.vertices.length} titik`, createdAt: tr.createdAt,
    }));
    return list.sort((a, b) => b.createdAt - a.createdAt);
  }, [points, shapes, transforms, t]);

  const filtered = filter === "all" ? entries : entries.filter((e) => e.kind === filter);

  const deleteEntry = (e: Entry) => {
    if (e.kind === "cartesian") setPoints(points.filter((p) => p.id !== e.id));
    if (e.kind === "shape") setShapes(shapes.filter((s) => s.id !== e.id));
    if (e.kind === "transform") setTransforms(transforms.filter((tr) => tr.id !== e.id));
    setFavs(favs.filter((f) => f.id !== e.id));
    setPendingDelete(null);
    toast.success(t.common.deleted);
  };

  const clearAll = () => {
    setPoints([]); setShapes([]); setTransforms([]); setFavs([]);
    setConfirmClear(false); toast.success(t.common.deleted);
  };

  const filters: { v: Filter; label: string }[] = [
    { v: "all", label: t.history.filterAll },
    { v: "cartesian", label: t.history.filterCart },
    { v: "shape", label: t.history.filterShape },
    { v: "transform", label: t.history.filterTrans },
  ];

  return (
    <Layout>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-3">
          <span className="text-3xl">📚</span>
          <h1 className="text-2xl md:text-3xl font-extrabold">{t.history.title}</h1>
        </div>
        {entries.length > 0 && (
          <button onClick={() => setConfirmClear(true)} className="btn-destructive text-sm">🗑️ {t.common.clearAll}</button>
        )}
      </div>

      <div className="inline-flex flex-wrap gap-2 mb-5">
        {filters.map((f) => (
          <button key={f.v} onClick={() => setFilter(f.v)} className={`rounded-full px-4 py-2 text-sm font-bold transition ${filter === f.v ? "bg-primary text-primary-foreground shadow" : "bg-secondary"}`}>
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState message={t.common.empty} />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((e) => {
            const fav = isFavorite(favs, { kind: e.kind, id: e.id });
            return (
              <div key={e.kind + e.id} className="rounded-3xl bg-card border border-border p-5 shadow-sm hover:shadow-lg transition">
                <div className="text-3xl mb-2">{e.icon}</div>
                <h3 className="font-extrabold">{e.title}</h3>
                <p className="text-sm text-muted-foreground">{e.summary}</p>
                {e.createdAt > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">{new Date(e.createdAt).toLocaleString()}</p>
                )}
                <div className="flex justify-end gap-2 mt-3">
                  <button
                    onClick={() => setFavs(toggleFavorite(favs, { kind: e.kind, id: e.id }))}
                    className={`rounded-full px-3 py-1 text-sm font-bold ${fav ? "bg-sunny" : "bg-secondary"}`}
                    aria-label={fav ? t.common.removeFav : t.common.addFav}
                  >
                    {fav ? "⭐" : "☆"}
                  </button>
                  <button onClick={() => setPendingDelete({ kind: e.kind, id: e.id })} className="rounded-full bg-destructive text-destructive-foreground px-3 py-1 text-sm font-bold">🗑️</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ConfirmModal
        open={!!pendingDelete}
        message={t.common.confirmDelete}
        onConfirm={() => {
          const e = filtered.find((x) => x.kind === pendingDelete!.kind && x.id === pendingDelete!.id);
          if (e) deleteEntry(e);
        }}
        onCancel={() => setPendingDelete(null)}
      />
      <ConfirmModal open={confirmClear} message={t.common.confirmClear} onConfirm={clearAll} onCancel={() => setConfirmClear(false)} />
    </Layout>
  );
}
