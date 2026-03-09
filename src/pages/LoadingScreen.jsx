export default function LoadingScreen() {
  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-16">
      <img
        src="https://th.bing.com/th/id/OIP.8zoJ7gePbR2l782-2jBkzQHaHa?w=200&h=200&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3"
        alt="Bitcoin sign"
        className="h-20 w-20 rounded-full border border-slate-200 bg-white"
      />
      <p className="mt-4 text-sm font-medium text-slate-600">Loading...</p>
    </main>
  );
}
