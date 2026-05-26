import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Layout } from "@/components/Layout";
import { ConfirmModal } from "@/components/ConfirmModal";
import { EmptyState } from "@/components/EmptyState";
import { useLang } from "@/lib/i18n";
import { storageKeys, uid, useLocalList, type CartesianPoint } from "@/lib/storage";

export const Route = createFileRoute("/cartesian")({
  component: CartesianPage,
});

function CartesianPage() {
  const { t } = useLang();
  const [points, setPoints] = useLocalList<CartesianPoint>(storageKeys.points);
  const [name, setName] = useState("");
  const [x, setX] = useState("");
  const [y, setY] = useState("");
  const [color, setColor] = useState("#3B82F6");
  const [editId, setEditId] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ name?: string; num?: string }>({});
  const [connect, setConnect] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Draw canvas whenever points change
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const W = canvas.width;
    const H = canvas.height;
    const cx = W / 2;
    const cy = H / 2;
    const unit = 25; // px per unit

    ctx.clearRect(0, 0, W, H);
    // Background
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, W, H);
    // Grid
    ctx.strokeStyle = "#E5E7EB";
    ctx.lineWidth = 1;
    for (let i = -Math.floor(cx / unit); i <= Math.floor(cx / unit); i++) {
      ctx.beginPath();
      ctx.moveTo(cx + i * unit, 0);
      ctx.lineTo(cx + i * unit, H);
      ctx.stroke();
    }
    for (let j = -Math.floor(cy / unit); j <= Math.floor(cy / unit); j++) {
      ctx.beginPath();
      ctx.moveTo(0, cy + j * unit);
      ctx.lineTo(W, cy + j * unit);
      ctx.stroke();
    }
    // Axes
    ctx.strokeStyle = "#1f2937";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, cy); ctx.lineTo(W, cy);
    ctx.moveTo(cx, 0); ctx.lineTo(cx, H);
    ctx.stroke();
    // Axis labels
    ctx.fillStyle = "#1f2937";
    ctx.font = "bold 12px Nunito, sans-serif";
    for (let i = -Math.floor(cx / unit); i <= Math.floor(cx / unit); i++) {
      if (i === 0) continue;
      ctx.fillText(String(i), cx + i * unit - 6, cy + 14);
    }
    for (let j = -Math.floor(cy / unit); j <= Math.floor(cy / unit); j++) {
      if (j === 0) continue;
      ctx.fillText(String(-j), cx + 6, cy + j * unit + 4);
    }
    ctx.fillText("X", W - 12, cy - 6);
    ctx.fillText("Y", cx + 6, 12);

    // Connect lines
    if (connect && points.length > 1) {
      ctx.strokeStyle = "#3B82F6";
      ctx.lineWidth = 2;
      ctx.beginPath();
      points.forEach((p, i) => {
        const px = cx + p.x * unit;
        const py = cy - p.y * unit;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      });
      if (points.length > 2) ctx.closePath();
      ctx.stroke();
    }

    // Points
    points.forEach((p) => {
      const px = cx + p.x * unit;
      const py = cy - p.y * unit;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(px, py, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = "#111827";
      ctx.font = "bold 13px Nunito, sans-serif";
      ctx.fillText(`${p.name}(${p.x},${p.y})`, px + 10, py - 8);
    });
  }, [points, connect]);

  const resetForm = () => {
    setName(""); setX(""); setY(""); setColor("#3B82F6"); setEditId(null); setErrors({});
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: typeof errors = {};
    if (!name.trim()) errs.name = t.cartesian.errName;
    const xn = Number(x);
    const yn = Number(y);
    if (x === "" || y === "" || Number.isNaN(xn) || Number.isNaN(yn)) errs.num = t.cartesian.errNum;
    setErrors(errs);
    if (Object.keys(errs).length) return;

    if (editId) {
      setPoints(points.map((p) => (p.id === editId ? { ...p, name: name.trim(), x: xn, y: yn, color } : p)));
      toast.success(t.common.updated);
    } else {
      setPoints([...points, { id: uid(), name: name.trim(), x: xn, y: yn, color }]);
      toast.success(t.common.saved);
    }
    resetForm();
  };

  const startEdit = (p: CartesianPoint) => {
    setEditId(p.id); setName(p.name); setX(String(p.x)); setY(String(p.y)); setColor(p.color);
  };

  const doDelete = () => {
    if (!pendingDelete) return;
    setPoints(points.filter((p) => p.id !== pendingDelete));
    setPendingDelete(null);
    toast.success(t.common.deleted);
  };

  const downloadPNG = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = "cartesian.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <Layout>
      <div className="flex items-center gap-3 mb-2">
        <span className="text-3xl">📍</span>
        <h1 className="text-2xl md:text-3xl font-extrabold">{t.cartesian.title}</h1>
      </div>
      <p className="rounded-2xl bg-primary/10 border border-primary/20 p-4 text-sm font-semibold text-foreground mb-6">
        💡 {t.cartesian.info}
      </p>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Form */}
        <form onSubmit={submit} className="rounded-3xl bg-card border border-border p-5 shadow-sm space-y-3">
          <Field label={t.cartesian.pointName}>
            <input value={name} onChange={(e) => setName(e.target.value)} className="input" placeholder="A" />
          </Field>
          {errors.name && <p className="text-destructive text-sm font-bold">{errors.name}</p>}
          <div className="grid grid-cols-2 gap-3">
            <Field label={t.cartesian.x}>
              <input value={x} onChange={(e) => setX(e.target.value)} className="input" placeholder="0" />
            </Field>
            <Field label={t.cartesian.y}>
              <input value={y} onChange={(e) => setY(e.target.value)} className="input" placeholder="0" />
            </Field>
          </div>
          {errors.num && <p className="text-destructive text-sm font-bold">{errors.num}</p>}
          <Field label={t.common.color}>
            <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="h-10 w-20 rounded-lg cursor-pointer border border-border" />
          </Field>
          <div className="flex gap-2 pt-2">
            <button type="submit" className="btn-primary flex-1">{editId ? t.common.update : t.common.add}</button>
            {editId && <button type="button" onClick={resetForm} className="btn-secondary">{t.common.cancel}</button>}
          </div>
        </form>

        {/* Canvas */}
        <div className="rounded-3xl bg-card border border-border p-5 shadow-sm">
          <canvas ref={canvasRef} width={500} height={400} className="w-full rounded-2xl border border-border bg-white" />
          <div className="flex flex-wrap items-center gap-3 mt-3">
            <label className="flex items-center gap-2 text-sm font-bold cursor-pointer">
              <input type="checkbox" checked={connect} onChange={(e) => setConnect(e.target.checked)} className="w-4 h-4" />
              {t.cartesian.connect}
            </label>
            <button onClick={downloadPNG} className="btn-secondary text-sm">⬇️ {t.common.download}</button>
            <button onClick={() => setConfirmReset(true)} className="btn-destructive text-sm">🔄 {t.cartesian.resetAll}</button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="mt-6 rounded-3xl bg-card border border-border p-5 shadow-sm overflow-x-auto">
        {points.length === 0 ? (
          <EmptyState message={t.common.empty} />
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="text-xs uppercase text-muted-foreground">
                <th className="p-2">{t.common.name}</th>
                <th className="p-2">X</th>
                <th className="p-2">Y</th>
                <th className="p-2">{t.common.color}</th>
                <th className="p-2 text-right">{t.common.actions}</th>
              </tr>
            </thead>
            <tbody>
              {points.map((p) => (
                <tr key={p.id} className="border-t border-border">
                  <td className="p-2 font-bold">{p.name}</td>
                  <td className="p-2">{p.x}</td>
                  <td className="p-2">{p.y}</td>
                  <td className="p-2"><span className="inline-block w-6 h-6 rounded-full border" style={{ backgroundColor: p.color }} /></td>
                  <td className="p-2 text-right space-x-2">
                    <button onClick={() => startEdit(p)} className="rounded-full bg-sunny px-3 py-1 text-sm font-bold hover:scale-105 transition">✏️</button>
                    <button onClick={() => setPendingDelete(p.id)} className="rounded-full bg-destructive text-destructive-foreground px-3 py-1 text-sm font-bold hover:scale-105 transition">🗑️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <ConfirmModal
        open={!!pendingDelete}
        message={t.common.confirmDelete}
        onConfirm={doDelete}
        onCancel={() => setPendingDelete(null)}
      />
      <ConfirmModal
        open={confirmReset}
        message={t.common.confirmDelete}
        onConfirm={() => { setPoints([]); setConfirmReset(false); toast.success(t.common.deleted); }}
        onCancel={() => setConfirmReset(false)}
      />
    </Layout>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs font-bold text-muted-foreground uppercase mb-1">{label}</span>
      {children}
    </label>
  );
}
