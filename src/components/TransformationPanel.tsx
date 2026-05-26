import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { useLang } from "@/lib/i18n";
import { ConfirmModal } from "@/components/ConfirmModal";
import { EmptyState } from "@/components/EmptyState";
import { storageKeys, uid, useLocalList, type TransformRecord, type TransformKind } from "@/lib/storage";

type Vertex = { x: number; y: number };

const DEFAULT_VERTICES: Vertex[] = [
  { x: 1, y: 1 }, { x: 4, y: 1 }, { x: 4, y: 4 }, { x: 1, y: 4 },
];

export function TransformationPanel() {
  const { t } = useLang();
  const [history, setHistory] = useLocalList<TransformRecord>(storageKeys.transforms);
  const [kind, setKind] = useState<TransformKind>("translation");
  const [vertices, setVertices] = useState<Vertex[]>(DEFAULT_VERTICES);
  const [a, setA] = useState("2");
  const [b, setB] = useState("3");
  const [axis, setAxis] = useState<"x" | "y" | "yx">("x");
  const [angle, setAngle] = useState<90 | 180 | 270>(90);
  const [direction, setDirection] = useState<"cw" | "ccw">("ccw");
  const [scale, setScale] = useState("2");
  const [cx, setCx] = useState("0");
  const [cy, setCy] = useState("0");
  const [editId, setEditId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const result = useMemo<Vertex[]>(() => {
    switch (kind) {
      case "translation":
        return vertices.map((v) => ({ x: v.x + Number(a || 0), y: v.y + Number(b || 0) }));
      case "reflection":
        return vertices.map((v) => {
          if (axis === "x") return { x: v.x, y: -v.y };
          if (axis === "y") return { x: -v.x, y: v.y };
          return { x: v.y, y: v.x };
        });
      case "rotation": {
        const sign = direction === "cw" ? -1 : 1;
        const rad = (sign * angle * Math.PI) / 180;
        const cos = Math.cos(rad), sin = Math.sin(rad);
        return vertices.map((v) => ({
          x: Math.round((v.x * cos - v.y * sin) * 100) / 100,
          y: Math.round((v.x * sin + v.y * cos) * 100) / 100,
        }));
      }
      case "dilation": {
        const k = Number(scale || 1);
        const px = Number(cx || 0), py = Number(cy || 0);
        return vertices.map((v) => ({ x: px + k * (v.x - px), y: py + k * (v.y - py) }));
      }
    }
  }, [kind, vertices, a, b, axis, angle, direction, scale, cx, cy]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const W = canvas.width, H = canvas.height;
    const cX = W / 2, cY = H / 2;
    const unit = 22;
    ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = "#E5E7EB";
    for (let i = -15; i <= 15; i++) {
      ctx.beginPath(); ctx.moveTo(cX + i * unit, 0); ctx.lineTo(cX + i * unit, H); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, cY + i * unit); ctx.lineTo(W, cY + i * unit); ctx.stroke();
    }
    ctx.strokeStyle = "#1f2937"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, cY); ctx.lineTo(W, cY); ctx.moveTo(cX, 0); ctx.lineTo(cX, H); ctx.stroke();

    const drawPoly = (pts: Vertex[], color: string) => {
      if (pts.length === 0) return;
      ctx.beginPath();
      pts.forEach((p, i) => {
        const px = cX + p.x * unit, py = cY - p.y * unit;
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      });
      ctx.closePath();
      ctx.fillStyle = color + "33"; ctx.fill();
      ctx.strokeStyle = color; ctx.lineWidth = 2.5; ctx.stroke();
      pts.forEach((p) => {
        const px = cX + p.x * unit, py = cY - p.y * unit;
        ctx.fillStyle = color; ctx.beginPath(); ctx.arc(px, py, 4, 0, Math.PI * 2); ctx.fill();
      });
    };
    drawPoly(vertices, "#3B82F6");
    drawPoly(result, "#F97316");
  }, [vertices, result]);

  const addVertex = () => setVertices([...vertices, { x: 0, y: 0 }]);
  const updateVertex = (i: number, key: "x" | "y", value: string) => {
    const next = [...vertices];
    next[i] = { ...next[i], [key]: Number(value) };
    setVertices(next);
  };
  const removeVertex = (i: number) => setVertices(vertices.filter((_, idx) => idx !== i));

  const save = () => {
    const params: Record<string, number | string> = {};
    if (kind === "translation") { params.a = Number(a); params.b = Number(b); }
    if (kind === "reflection") { params.axis = axis; }
    if (kind === "rotation") { params.angle = angle; params.direction = direction; }
    if (kind === "dilation") { params.k = Number(scale); params.cx = Number(cx); params.cy = Number(cy); }
    if (editId) {
      setHistory(history.map((h) => h.id === editId ? { ...h, kind, vertices, params, result } : h));
      toast.success(t.common.updated); setEditId(null);
    } else {
      setHistory([{ id: uid(), kind, vertices, params, result, createdAt: Date.now() }, ...history]);
      toast.success(t.common.saved);
    }
  };

  const loadEntry = (r: TransformRecord) => {
    setEditId(r.id); setKind(r.kind); setVertices(r.vertices);
    if (r.kind === "translation") { setA(String(r.params.a)); setB(String(r.params.b)); }
    if (r.kind === "reflection") setAxis(r.params.axis as "x" | "y" | "yx");
    if (r.kind === "rotation") { setAngle(Number(r.params.angle) as 90 | 180 | 270); setDirection(r.params.direction as "cw" | "ccw"); }
    if (r.kind === "dilation") { setScale(String(r.params.k)); setCx(String(r.params.cx)); setCy(String(r.params.cy)); }
  };

  const doDelete = () => {
    if (!pendingDelete) return;
    setHistory(history.filter((h) => h.id !== pendingDelete));
    setPendingDelete(null);
    toast.success(t.common.deleted);
  };

  const stepText = useMemo(() => {
    switch (kind) {
      case "translation": return `T(a,b) = T(${a},${b}) → (x', y') = (x + ${a}, y + ${b})`;
      case "reflection": return axis === "x" ? "Refleksi sumbu X: (x, y) → (x, -y)" : axis === "y" ? "Refleksi sumbu Y: (x, y) → (-x, y)" : "Refleksi y=x: (x, y) → (y, x)";
      case "rotation": return `Rotasi ${angle}° (${direction === "cw" ? t.trans.cw : t.trans.ccw}) terhadap (0,0)`;
      case "dilation": return `Dilatasi pusat (${cx},${cy}) dengan faktor k=${scale} → (x', y') = (cx + k(x − cx), cy + k(y − cy))`;
    }
  }, [kind, a, b, axis, angle, direction, scale, cx, cy, t]);

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <div className="rounded-3xl bg-card border border-border p-5 shadow-sm space-y-4">
        {/* Transformation type tabs */}
        <div className="flex flex-wrap gap-2">
          {(["translation", "reflection", "rotation", "dilation"] as TransformKind[]).map((k) => (
            <button key={k} onClick={() => setKind(k)} className={`rounded-full px-4 py-2 text-sm font-bold transition ${kind === k ? "bg-primary text-primary-foreground shadow" : "bg-secondary"}`}>
              {t.trans.type[k]}
            </button>
          ))}
        </div>

        {/* Vertices */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase text-muted-foreground">{t.trans.vertices}</span>
            <button onClick={addVertex} className="rounded-full bg-grass px-3 py-1 text-xs font-bold">{t.trans.addVertex}</button>
          </div>
          <div className="space-y-2 max-h-44 overflow-auto pr-1">
            {vertices.map((v, i) => (
              <div key={i} className="flex gap-2 items-center">
                <span className="w-6 font-bold text-muted-foreground">{String.fromCharCode(65 + i)}</span>
                <input value={v.x} onChange={(e) => updateVertex(i, "x", e.target.value)} className="input" />
                <input value={v.y} onChange={(e) => updateVertex(i, "y", e.target.value)} className="input" />
                <button onClick={() => removeVertex(i)} className="rounded-full bg-destructive text-destructive-foreground w-8 h-8 font-bold">×</button>
              </div>
            ))}
          </div>
        </div>

        {/* Params */}
        {kind === "translation" && (
          <div className="grid grid-cols-2 gap-3">
            <LabeledInput label={t.trans.shiftX} value={a} onChange={setA} />
            <LabeledInput label={t.trans.shiftY} value={b} onChange={setB} />
          </div>
        )}
        {kind === "reflection" && (
          <div className="flex flex-wrap gap-2">
            {(["x", "y", "yx"] as const).map((ax) => (
              <button key={ax} onClick={() => setAxis(ax)} className={`rounded-full px-4 py-2 text-sm font-bold ${axis === ax ? "bg-primary text-primary-foreground" : "bg-secondary"}`}>
                {ax === "x" ? "Sumbu X" : ax === "y" ? "Sumbu Y" : "y = x"}
              </button>
            ))}
          </div>
        )}
        {kind === "rotation" && (
          <div className="space-y-3">
            <div className="flex gap-2">
              {[90, 180, 270].map((a2) => (
                <button key={a2} onClick={() => setAngle(a2 as 90)} className={`rounded-full px-4 py-2 text-sm font-bold ${angle === a2 ? "bg-primary text-primary-foreground" : "bg-secondary"}`}>{a2}°</button>
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={() => setDirection("ccw")} className={`rounded-full px-4 py-2 text-sm font-bold ${direction === "ccw" ? "bg-primary text-primary-foreground" : "bg-secondary"}`}>↺ {t.trans.ccw}</button>
              <button onClick={() => setDirection("cw")} className={`rounded-full px-4 py-2 text-sm font-bold ${direction === "cw" ? "bg-primary text-primary-foreground" : "bg-secondary"}`}>↻ {t.trans.cw}</button>
            </div>
          </div>
        )}
        {kind === "dilation" && (
          <div className="grid grid-cols-3 gap-3">
            <LabeledInput label={t.trans.scale} value={scale} onChange={setScale} />
            <LabeledInput label={t.trans.centerX} value={cx} onChange={setCx} />
            <LabeledInput label={t.trans.centerY} value={cy} onChange={setCy} />
          </div>
        )}

        <button onClick={save} className="btn-primary w-full">{editId ? t.common.update : t.common.save}</button>
      </div>

      <div className="space-y-6">
        <div className="rounded-3xl bg-card border border-border p-5 shadow-sm">
          <canvas ref={canvasRef} width={500} height={380} className="w-full rounded-2xl bg-white border border-border" />
          <div className="flex gap-4 mt-3 text-sm font-bold">
            <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-primary" /> {t.trans.before}</span>
            <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-tangerine" /> {t.trans.after}</span>
          </div>
          <div className="mt-3 rounded-2xl bg-sunny/40 px-4 py-3 text-sm font-bold">
            🧠 {t.trans.steps}: {stepText}
          </div>
        </div>

        <div className="rounded-3xl bg-card border border-border p-5 shadow-sm">
          <h3 className="font-extrabold mb-3">📚 History</h3>
          {history.length === 0 ? <EmptyState message={t.common.empty} /> : (
            <div className="space-y-2 max-h-72 overflow-auto pr-1">
              {history.map((h) => (
                <div key={h.id} className="flex items-center justify-between gap-3 rounded-2xl bg-secondary px-4 py-3">
                  <div className="text-sm">
                    <div className="font-bold">{t.trans.type[h.kind]}</div>
                    <div className="text-xs text-muted-foreground">{h.vertices.length} titik</div>
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

function LabeledInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="block text-xs font-bold uppercase text-muted-foreground mb-1">{label}</span>
      <input value={value} onChange={(e) => onChange(e.target.value)} className="input" />
    </label>
  );
}
