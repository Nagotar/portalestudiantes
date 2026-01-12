export default function QuickActions() {
  const actions = [
    {
      title: "Nuevo Banner",
      description: "Agregar banner a portada",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      color: "bg-blue-50 text-blue-700 hover:bg-blue-100"
    },
    {
      title: "Ver Estadísticas",
      description: "Análisis detallado",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      color: "bg-purple-50 text-purple-700 hover:bg-purple-100"
    },
    {
      title: "Exportar Datos",
      description: "Descargar reportes",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      color: "bg-green-50 text-green-700 hover:bg-green-100"
    },
    {
      title: "Configuración",
      description: "Ajustes del portal",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      color: "bg-orange-50 text-orange-700 hover:bg-orange-100"
    }
  ]

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Acciones Rápidas</h3>
        <p className="text-sm text-gray-600">Atajos a funciones comunes</p>
      </div>

      <div className="space-y-3">
        {actions.map((action, index) => (
          <button
            key={index}
            className={`w-full flex items-center gap-3 p-4 rounded-lg transition-all ${action.color}`}
          >
            <div className="flex-shrink-0">
              {action.icon}
            </div>
            <div className="text-left flex-1 min-w-0">
              <div className="font-medium text-sm mb-0.5">{action.title}</div>
              <div className="text-xs opacity-75">{action.description}</div>
            </div>
            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Actividad Reciente</h4>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5 flex-shrink-0"></div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-900">Banner "Bienvenido" actualizado</p>
              <p className="text-xs text-gray-500">Hace 2 horas</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-900">Nueva solicitud de información</p>
              <p className="text-xs text-gray-500">Hace 3 horas</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-purple-500 rounded-full mt-1.5 flex-shrink-0"></div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-900">Reporte mensual generado</p>
              <p className="text-xs text-gray-500">Hace 1 día</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
