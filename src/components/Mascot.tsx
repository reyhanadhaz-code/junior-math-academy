import { useLang } from "@/lib/i18n";

export function Mascot() {
  const { t } = useLang();
  return (
    <div className="flex flex-col md:flex-row items-center gap-6 rounded-3xl bg-gradient-to-br from-primary/15 via-bubble/15 to-sunny/20 p-6 md:p-8 shadow-sm border border-border">
      <div className="animate-float">
        <svg viewBox="0 0 120 120" className="w-28 h-28 md:w-36 md:h-36 drop-shadow-lg">
          <defs>
            <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FACC15" />
              <stop offset="100%" stopColor="#F97316" />
            </linearGradient>
          </defs>
          <polygon
            points="60,8 73,46 113,46 81,70 93,108 60,84 27,108 39,70 7,46 47,46"
            fill="url(#g)"
            stroke="#fff"
            strokeWidth="3"
          />
          <circle cx="50" cy="55" r="4" fill="#1f2937" />
          <circle cx="70" cy="55" r="4" fill="#1f2937" />
          <path d="M48 68 Q60 78 72 68" stroke="#1f2937" strokeWidth="3" fill="none" strokeLinecap="round" />
        </svg>
      </div>
      <div className="text-center md:text-left">
        <h1 className="text-2xl md:text-4xl font-extrabold text-foreground">
          {t.welcome}
        </h1>
        <p className="mt-2 text-muted-foreground font-semibold">{t.home.subtitle}</p>
      </div>
    </div>
  );
}
