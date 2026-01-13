"use client"

import { useState, useEffect } from "react"

export default function VisitsChart() {
  const [period, setPeriod] = useState<"7d" | "30d" | "90d">("7d")
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadVisitsData()
  }, [period])

  const loadVisitsData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/visits?period=${period}`)
      const result = await response.json()
      
      console.log('📊 Datos de visitas recibidos:', result)
      
      if (result.success) {
        setData(result.data)
        console.log('📊 Data actualizada:', result.data)
      }
    } catch (error) {
      console.error('Error cargando datos de visitas:', error)
    } finally {
      setLoading(false)
    }
  }

  const currentData = data.length > 0 ? data : [{ day: 'Sin datos', visits: 0 }]
  const maxVisits = Math.max(...currentData.map(d => d.visits), 1)

  console.log('📊 Datos del gráfico:', { currentData, maxVisits })

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Visitas al Portal</h3>
          <p className="text-sm text-gray-600">Registro de visitas por período</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setPeriod("7d")}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              period === "7d"
                ? "bg-black text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            7 días
          </button>
          <button
            onClick={() => setPeriod("30d")}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              period === "30d"
                ? "bg-black text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            30 días
          </button>
          <button
            onClick={() => setPeriod("90d")}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              period === "90d"
                ? "bg-black text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            90 días
          </button>
        </div>
      </div>

      {/* Chart */}
      <div className="h-64 relative">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">Cargando datos...</p>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col">
            {/* Chart area */}
            <div className="flex-1 relative">
              {/* Grid lines */}
              <div className="absolute inset-0 flex flex-col justify-between">
                {[0, 1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-full border-t border-gray-100"></div>
                ))}
              </div>

              {/* Bar chart */}
              <div className="absolute inset-0 flex items-end justify-between gap-2 px-2">
                {currentData.map((item, index) => {
                  // Calcular altura proporcional
                  const heightPercent = item.visits > 0 
                    ? (item.visits / maxVisits) * 85
                    : 0
                  
                  const heightPx = `${heightPercent}%`
                  
                  console.log(`Barra ${item.day}: ${item.visits} visitas = ${heightPercent}% (max: ${maxVisits})`)
                  
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center justify-end h-full">
                      {item.visits > 0 && (
                        <>
                          <span className="text-sm font-bold text-gray-900 mb-1">
                            {item.visits}
                          </span>
                          <div
                            className="w-full bg-gradient-to-t from-gray-900 to-gray-700 rounded-t-lg hover:from-gray-700 hover:to-gray-600 transition-colors cursor-pointer shadow-lg"
                            style={{ height: heightPx }}
                          />
                        </>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* X-axis labels */}
            <div className="flex justify-between pt-3 border-t border-gray-200 mt-2 px-2">
              {currentData.map((item, index) => (
                <div key={index} className="flex-1 text-center">
                  <span className="text-xs text-gray-600 font-medium">{item.day}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Stats Summary */}
      <div className="mt-6 pt-6 border-t border-gray-200 grid grid-cols-3 gap-4">
        <div>
          <p className="text-xs text-gray-600 mb-1">Promedio Diario</p>
          <p className="text-lg font-semibold text-gray-900">
            {Math.round(currentData.reduce((acc, d) => acc + d.visits, 0) / currentData.length).toLocaleString()}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-600 mb-1">Día Pico</p>
          <p className="text-lg font-semibold text-gray-900">
            {maxVisits.toLocaleString()}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-600 mb-1">Total Período</p>
          <p className="text-lg font-semibold text-gray-900">
            {currentData.reduce((acc, d) => acc + d.visits, 0).toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  )
}
