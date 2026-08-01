export function DashboardLayout({ nombre, subtitulo, children }: { nombre: string; subtitulo: string; children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-6xl">
      <header className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Bienvenido, {nombre.split(" ")[0]}</h1>
        <p className="mt-1 text-sm text-gray-500">{subtitulo}</p>
      </header>
      {children}
    </div>
  )
}

export function SectionCard({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-card">
      <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
        <div>
          <h2 className="text-base font-semibold text-gray-900">{title}</h2>
          {subtitle && <p className="mt-0.5 text-xs text-gray-400">{subtitle}</p>}
        </div>
      </div>
      <div className="px-6 py-2">{children}</div>
    </div>
  )
}
