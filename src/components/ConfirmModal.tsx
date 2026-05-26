import { useLang } from "@/lib/i18n";

export function ConfirmModal({
  open,
  title,
  message,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title?: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const { t } = useLang();
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/30 backdrop-blur-sm p-4">
      <div className="bg-card rounded-3xl shadow-2xl max-w-sm w-full p-6 animate-pop">
        <div className="text-5xl text-center mb-3">🤔</div>
        {title && <h3 className="text-xl font-extrabold text-center mb-1">{title}</h3>}
        <p className="text-center text-muted-foreground mb-5">{message}</p>
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 rounded-full bg-secondary px-4 py-2 font-bold hover:scale-105 transition"
          >
            {t.common.no}
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 rounded-full bg-destructive text-destructive-foreground px-4 py-2 font-bold hover:scale-105 transition shadow-md"
          >
            {t.common.confirm}
          </button>
        </div>
      </div>
    </div>
  );
}
