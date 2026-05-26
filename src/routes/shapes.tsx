import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Layout } from "@/components/Layout";
import { ConfirmModal } from "@/components/ConfirmModal";
import { EmptyState } from "@/components/EmptyState";
import { useLang } from "@/lib/i18n";
import { storageKeys, uid, useLocalList, type ShapeCalc, type ShapeKind } from "@/lib/storage";
import { TransformationPanel } from "@/components/TransformationPanel";

export const Route = createFileRoute("/shapes")({
  component: ShapesPage,
});

const SHAPES: ShapeKind[] = ["square", "rectangle", "triangle", "circle", "trapezoid", "parallelogram"];

function ShapesPage() {
  const { t } = useLang();
  const [tab, setTab] = useState<"calc" | "trans">("calc");
  return (
    <Layout>
      <div className="flex items-center gap-3 mb-4">
        <span className="text-3xl">📐</span>
        <h1 className="text-2xl md:text-3xl font-extrabold">{t.shapes.title}</h1>
      </div>
      <div className="inline-flex rounded-full bg-secondary p-1 mb-6">
        <button onClick={() => setTab("calc")} className={`rounded-full px-5 py-2 text-sm font-bold transition ${tab === "calc" ? "bg-primary text-primary-foreground shadow" : ""}`}>
          🧮 {t.shapes.tabCalc}
        </button>
        <button onClick={() => setTab("trans")} className={`rounded-full px-5 py-2 text-sm font-bold transition ${tab === "trans" ? "bg-primary text-primary-foreground shadow" : ""}`}>
          🔄 {t.shapes.tabTrans}
        </button>
      </div>
      {tab === "calc" ? <Calculator /> : <TransformationPanel />}
    </Layout>
  );
}

function Calculator() {
  const { t } = useLang();
  const [shape, setShape] = useState<ShapeKind>("square");
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [history, setHistory] = useLocalList<ShapeCalc>(storageKeys.shapes);
  const [editId, setEditId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  const fields = useMemo(() => fieldsFor(shape, t), [shape, t]);

  const result = useMemo(() => computeShape(shape, inputs), [shape, inputs]);

  const setField = (k: string, v: string) => setInputs({ ...inputs, [k]: v });

  const save = () => {
    if (!result) return toast.error("⚠️ " + t.cartesian.errNum);
    const numericInputs: Record<string, number> = {};
    Object.entries(inputs).forEach(([k, v]) => { numericInputs[k] = Number(v); });
    if (editId) {
      setHistory(history.map((h) => h.id === editId
        ? { ...h, shape, inputs: numericInputs, perimeter: result.perimeter, area: result.area }
        : h));
      toast.success(t.common.updated);
      setEditId(null);
    } else {
      setHistory([{ id: uid(), shape, inputs: numericInputs, perimeter: result.perimeter, area: result.area, createdAt: Date.now() }, ...history]);
      toast.success(t.common.saved);
    }
  };

  const loadEntry = (h: ShapeCalc) => {
    setEditId(h.id);
    setShape(h.shape);
    const inp: Record<string, string> = {};
    Object.entries(h.inputs).forEach(([k, v]) => { inp[k] = String(v); });
    setInputs(inp);
  };

  const doDelete = () => {
    if (!pendingDelete) return;
    setHistory(history.filter((h) => h.id !== pendingDelete));
    setPendingDelete(null);
    toast.success(t.common.deleted);
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <div className="rounded-3xl bg-card border border-border p-5 shadow-sm space-y-4">
        <label className="block">
          <span className="block text-xs font-bold uppercase text-muted-foreground mb-1">{t.shapes.select}</span>
          <select value={shape} onChange={(e) => { setShape(e.target.value as ShapeKind); setInputs({}); }} className="input">
            {SHAPES.map((s) => <option key={s} value={s}>{t.shapes.list[s]}</option>)}
          </select>
        </label>
        {fields.map((f) => (
          <label key={f.key} className="block">
            <span className="block text-xs font-bold uppercase text-muted-foreground mb-1">{f.label}</span>
            <input value={inputs[f.key] ?? ""} onChange={(e) => setField(f.key, e.target.value)} className="input" placeholder="0" />
          </label>
        ))}

        {result && (
          <div className="space-y-3 pt-2">
            <ResultRow label={t.shapes.perimeter} value={result.perimeter.toFixed(2)} formula={result.perimeterFormula} color="bg-sunny" />
            <ResultRow label={t.shapes.area} value={result.area.toFixed(2)} formula={result.areaFormula} color="bg-grass" />
          </div>
        )}
        <div className="flex gap-2 pt-2">
          <button onClick={save} className="btn-primary flex-1">{editId ? t.common.update : t.common.save}</button>
          {editId && <button onClick={() => { setEditId(null); setInputs({}); }} className="btn-secondary">{t.common.cancel}</button>}
        </div>
      </div>

      {/* SVG preview + history */}
      <div className="space-y-6">
        <div className="rounded-3xl bg-card border border-border p-5 shadow-sm grid place-items-center min-h-[260px]">
          <ShapeSVG shape={shape} inputs={inputs} />
        </div>
        <div className="rounded-3xl bg-card border border-border p-5 shadow-sm">
          <h3 className="font-extrabold mb-3">📚 History</h3>
          {history.length === 0 ? (
            <EmptyState message={t.common.empty} />
          ) : (
            <div className="space-y-2 max-h-72 overflow-auto pr-1">
              {history.map((h) => (
                <div key={h.id} className="flex items-center justify-between gap-3 rounded-2xl bg-secondary px-4 py-3">
                  <div className="text-sm">
                    <div className="font-bold">{t.shapes.list[h.shape]}</div>
                    <div className="text-muted-foreground text-xs">K={h.perimeter.toFixed(2)} • L={h.area.toFixed(2)}</div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => loadEntry(h)} className="rounded-full bg-sunny px-3 py-1 text-sm font-bold">✏️</button>
                    <button onClick={() => setPendingDelete(h.id)} className="rounded-full bg-destructive text-destructive-foreground px-3 py-1 text-sm font-bold">🗑️</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <ConfirmModal open={!!pendingDelete} message={t.common.confirmDelete} onConfirm={doDelete} onCancel={() => setPendingDelete(null)} />
    </div>
  );
}

function ResultRow({ label, value, formula, color }: { label: string; value: string; formula: string; color: string }) {
  return (
    <div className="rounded-2xl bg-secondary p-3">
      <div className="flex items-center justify-between">
        <span className="font-bold">{label}</span>
        <span className="text-xl font-extrabold text-primary">{value}</span>
      </div>
      <div className={`mt-2 inline-block ${color} rounded-full px-3 py-1 text-xs font-bold text-foreground`}>
        {formula}
      </div>
    </div>
  );
}

// --- Computation logic ---
type ShapeFieldDef = { key: string; label: string };

import type { Dict } from "@/lib/i18n";
function fieldsFor(shape: ShapeKind, t: Dict): ShapeFieldDef[] {
  const L = t.shapes.labels;
  switch (shape) {
    case "square": return [{ key: "s", label: L.side }];
    case "rectangle": return [{ key: "p", label: L.length }, { key: "l", label: L.width }];
    case "triangle": return [{ key: "a", label: L.base }, { key: "tinggi", label: L.height }, { key: "s1", label: L.legSide }, { key: "s2", label: L.legSide + " 2" }];
    case "circle": return [{ key: "r", label: L.radius }];
    case "trapezoid": return [{ key: "top", label: L.topSide }, { key: "bot", label: L.bottomSide }, { key: "tinggi", label: L.height }, { key: "s1", label: L.legSide + " 1" }, { key: "s2", label: L.legSide + " 2" }];
    case "parallelogram": return [{ key: "a", label: L.base }, { key: "tinggi", label: L.height }, { key: "s", label: L.legSide }];
  }
}

function computeShape(shape: ShapeKind, raw: Record<string, string>) {
  const n = (k: string) => Number(raw[k]);
  const has = (k: string) => raw[k] !== undefined && raw[k] !== "" && !Number.isNaN(n(k));
  switch (shape) {
    case "square":
      if (!has("s")) return null;
      return { perimeter: 4 * n("s"), area: n("s") ** 2, perimeterFormula: "K = 4 × s", areaFormula: "L = s × s" };
    case "rectangle":
      if (!has("p") || !has("l")) return null;
      return { perimeter: 2 * (n("p") + n("l")), area: n("p") * n("l"), perimeterFormula: "K = 2 × (p + l)", areaFormula: "L = p × l" };
    case "triangle":
      if (!has("a") || !has("tinggi")) return null;
      return {
        perimeter: (has("s1") && has("s2") ? n("a") + n("s1") + n("s2") : NaN),
        area: 0.5 * n("a") * n("tinggi"),
        perimeterFormula: "K = a + b + c",
        areaFormula: "L = ½ × a × t",
      };
    case "circle":
      if (!has("r")) return null;
      return { perimeter: 2 * Math.PI * n("r"), area: Math.PI * n("r") ** 2, perimeterFormula: "K = 2 × π × r", areaFormula: "L = π × r²" };
    case "trapezoid":
      if (!has("top") || !has("bot") || !has("tinggi")) return null;
      return {
        perimeter: (has("s1") && has("s2") ? n("top") + n("bot") + n("s1") + n("s2") : NaN),
        area: 0.5 * (n("top") + n("bot")) * n("tinggi"),
        perimeterFormula: "K = jumlah semua sisi",
        areaFormula: "L = ½ × (a + b) × t",
      };
    case "parallelogram":
      if (!has("a") || !has("tinggi")) return null;
      return {
        perimeter: (has("s") ? 2 * (n("a") + n("s")) : NaN),
        area: n("a") * n("tinggi"),
        perimeterFormula: "K = 2 × (a + s)",
        areaFormula: "L = a × t",
      };
  }
}

function ShapeSVG({ shape, inputs }: { shape: ShapeKind; inputs: Record<string, string> }) {
  const num = (k: string, fallback: number) => {
    const v = Number(inputs[k]);
    return Number.isFinite(v) && v > 0 ? v : fallback;
  };
  const scale = (v: number, max: number) => Math.min(180, Math.max(40, (v / max) * 180));
  const stroke = "#3B82F6"; const fill = "rgba(59,130,246,0.18)";
  switch (shape) {
    case "square": {
      const s = scale(num("s", 5), 20);
      return <svg viewBox="0 0 220 220" className="w-full max-w-xs"><rect x={(220 - s) / 2} y={(220 - s) / 2} width={s} height={s} fill={fill} stroke={stroke} strokeWidth={3} rx={8} /></svg>;
    }
    case "rectangle": {
      const w = scale(num("p", 10), 20);
      const h = scale(num("l", 6), 20);
      return <svg viewBox="0 0 220 220" className="w-full max-w-xs"><rect x={(220 - w) / 2} y={(220 - h) / 2} width={w} height={h} fill={fill} stroke={stroke} strokeWidth={3} rx={8} /></svg>;
    }
    case "triangle": {
      const a = scale(num("a", 8), 20);
      const h = scale(num("tinggi", 6), 20);
      const cx = 110, baseY = 200;
      return <svg viewBox="0 0 220 220" className="w-full max-w-xs"><polygon points={`${cx - a / 2},${baseY} ${cx + a / 2},${baseY} ${cx},${baseY - h}`} fill={fill} stroke={stroke} strokeWidth={3} /></svg>;
    }
    case "circle": {
      const r = scale(num("r", 5), 15) / 2;
      return <svg viewBox="0 0 220 220" className="w-full max-w-xs"><circle cx={110} cy={110} r={r} fill={fill} stroke={stroke} strokeWidth={3} /></svg>;
    }
    case "trapezoid": {
      const top = scale(num("top", 6), 20);
      const bot = scale(num("bot", 10), 20);
      const h = scale(num("tinggi", 6), 20);
      const cx = 110, baseY = 200;
      return <svg viewBox="0 0 220 220" className="w-full max-w-xs"><polygon points={`${cx - top / 2},${baseY - h} ${cx + top / 2},${baseY - h} ${cx + bot / 2},${baseY} ${cx - bot / 2},${baseY}`} fill={fill} stroke={stroke} strokeWidth={3} /></svg>;
    }
    case "parallelogram": {
      const a = scale(num("a", 10), 20);
      const h = scale(num("tinggi", 6), 20);
      const skew = 25;
      const cx = 110, baseY = 200;
      return <svg viewBox="0 0 220 220" className="w-full max-w-xs"><polygon points={`${cx - a / 2 + skew},${baseY - h} ${cx + a / 2 + skew},${baseY - h} ${cx + a / 2},${baseY} ${cx - a / 2},${baseY}`} fill={fill} stroke={stroke} strokeWidth={3} /></svg>;
    }
  }
}
