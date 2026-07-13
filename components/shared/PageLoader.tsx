export default function PageLoader() {
  return (
    <div
      className="flex items-center justify-center"
      style={{ minHeight: "calc(100vh - 4rem)" }}
    >
      <div className="flex flex-col items-center gap-5">
        <div className="w-14 h-14 border-[3px] border-blue-100 border-t-blue-600 rounded-full animate-spin" />
        <span className="text-sm text-gray-400 tracking-widest uppercase font-medium">
          Medicus
        </span>
      </div>
    </div>
  );
}
