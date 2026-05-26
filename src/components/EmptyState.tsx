export function EmptyState({ message }: { message: string }) {
  return (
    <div className="text-center py-12 px-4">
      <div className="text-6xl mb-3 animate-float">🌱</div>
      <p className="text-muted-foreground font-semibold">{message}</p>
    </div>
  );
}
