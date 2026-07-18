export const PageLoader = () => (
  <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-6">
    <div className="relative w-12 h-12">
      <div className="w-full h-full border-4 border-gray-200 border-t-primary rounded-full animate-spin" />
    </div>

    <div className="flex flex-col items-center gap-2">
      <span className="text-[10px] tracking-[0.3em] text-primary/70 uppercase animate-pulse">
        Synchronizing Data...
      </span>
    </div>
  </div>
);