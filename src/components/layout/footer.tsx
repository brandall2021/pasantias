import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-gray-50 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-bold text-lg text-blue-600 mb-2">Gestión de Pasantías</h3>
            <p className="text-sm text-gray-500">
              Conectamos estudiantes con las mejores oportunidades de pasantías.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-sm text-gray-700 mb-2">Enlaces</h4>
            <div className="space-y-1">
              <Link href="/pasantias" className="block text-sm text-gray-500 hover:text-blue-600">Buscar Pasantías</Link>
              <Link href="/register" className="block text-sm text-gray-500 hover:text-blue-600">Registrarse</Link>
              <Link href="/login" className="block text-sm text-gray-500 hover:text-blue-600">Iniciar Sesión</Link>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-sm text-gray-700 mb-2">Contacto</h4>
            <p className="text-sm text-gray-500">
              ¿Preguntas? Contactanos a través de la plataforma.
            </p>
          </div>
        </div>
        <div className="mt-8 pt-4 border-t border-gray-200 text-center text-sm text-gray-400">
          &copy; {new Date().getFullYear()} Gestión de Pasantías. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  )
}
