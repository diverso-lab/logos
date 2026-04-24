export function Footer() {
  return (
    <footer className="border-t border-zinc-200 bg-white mt-16">
      <div className="mx-auto max-w-6xl px-6 py-6 text-xs text-zinc-500 flex items-center justify-between">
        <span>
          Developed by{' '}
          <a
            href="https://diversolab.us.es"
            target="_blank"
            rel="noreferrer"
            className="font-medium text-zinc-700 hover:text-zinc-900 underline-offset-4 hover:underline"
          >
            Diverso Lab
          </a>
        </span>
        <a
          href="https://diversolab.us.es"
          target="_blank"
          rel="noreferrer"
          className="font-mono text-zinc-400 hover:text-zinc-700"
        >
          diversolab.us.es
        </a>
      </div>
    </footer>
  );
}
