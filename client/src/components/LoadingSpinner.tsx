export default function LoadingSpinner({ fullPage = false }: { fullPage?: boolean }) {
  if (fullPage) {
    return (
      <div className="flex h-full min-h-[300px] items-center justify-center">
        <div className="spinner" />
      </div>
    );
  }
  return (
    <div className="flex items-center justify-center p-8">
      <div className="spinner" />
    </div>
  );
}
