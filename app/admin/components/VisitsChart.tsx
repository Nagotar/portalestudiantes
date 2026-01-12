"use client"

import { useState } from "react"

export default function VisitsChart() {
  const [period, setPeriod] = useState<"7d" | "30d" | "90d">("7d")

  const data = {
    "7d": [
      { day: "Lun", visits: 1200 },
      { day: "Mar", visits: 1400 },
      { day: "Mié", visits: 1100 },
      { day: "Jue", visits: 1600 },
      { day: "Vie", visits: 1800 },
      { day: "Sáb", visits: 900 },
      { day: "Dom", visits: 800 }
    ],
    "30d": [
      { day: "Sem 1", visits: 8500 },
      { day: "Sem 2", visits: 9200 },
      { day: "Sem 3", visits: 8800 },
      { day: "Sem 4", visits: 10100 }
    ],
    "90d": [
      { day: "Mes 1", visits: 35000 },
      { day: "Mes 2", visits: 38000 },
      { day: "Mes 3", visits: 42000 }
    ]
  }

  const currentData = data[period]
  const maxVisits = Math.max(...currentData.map(d => d.visits))

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
      <div className="relative h-64">
        <div className="absolute inset-0 flex items-end justify-between gap-2">
          {currentData.map((item, index) => {
            const height = (item.visits / maxVisits) * 100
            return (
              <div key={index} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex flex-col items-center">
                  <span className="text-xs font-medium text-gray-900 mb-1">
                    {item.visits.toLocaleString()}
                  </span>
                  <div
                    className="w-full bg-gradient-to-t from-black to-gray-700 rounded-t-lg transition-all duration-500 hover:from-gray-700 hover:to-gray-600 cursor-pointer relative group"
                    style={{ height: `${height}%` }}
                  >
                    <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 rounded-t-lg transition-colors"></div>
                  </div>
                </div>
                <span className="text-xs text-gray-600 font-medium">{item.day}</span>
              </div>
            )
          })}
        </div>
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
