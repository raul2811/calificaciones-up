"use client";

import { useState, useMemo } from "react";
import { useStudentData } from "@/features/student/context/StudentDataContext";

type AnalyticsTab = "indice" | "distribucion" | "progreso";

export function AnalyticsPage() {
  const { state, student } = useStudentData();
  const [activeTab, setActiveTab] = useState<AnalyticsTab>("indice");
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // 1. Datos simulados de progresión basados en el índice actual del contexto
  const indiceActual = parseFloat(student.currentIndex || "0.0");
  
  const historialSemestres = useMemo(() => [
    { periodo: "2024-1S", indice: Math.max(1.0, indiceActual - 0.4), aprobadas: 5, creditos: 15 },
    { periodo: "2024-2S", indice: Math.max(1.0, indiceActual - 0.2), aprobadas: 6, creditos: 18 },
    { periodo: "2025-1S", indice: Math.max(1.0, indiceActual - 0.1), aprobadas: 5, creditos: 16 },
    { periodo: "2025-2S", indice: indiceActual, aprobadas: 6, creditos: 19 },
  ], [indiceActual]);

  // 2. Distribución interactiva de calificaciones (A, B, C, D, F)
  const distribucionNotas = [
    { letra: "A", cantidad: 14, porcentaje: 45, color: "bg-emerald-500 text-emerald-500" },
    { letra: "B", cantidad: 10, porcentaje: 32, color: "bg-blue-500 text-blue-500" },
    { letra: "C", cantidad: 5, porcentaje: 16, color: "bg-amber-500 text-amber-500" },
    { letra: "D", cantidad: 2, porcentaje: 6, color: "bg-orange-500 text-orange-500" },
    { letra: "F", cantidad: 0, porcentaje: 0, color: "bg-rose-500 text-rose-500" },
  ];

  if (state.status === "loading") {
    return (
      <div className="flex items-center gap-3 p-8 surface-panel rounded-2xl justify-center">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent" />
        <p className="text-sm text-[var(--foreground-soft)]">Procesando métricas del estudiante...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tarjetas de Métricas de Alto Impacto */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <div className="surface-panel rounded-2xl p-5 border border-[var(--border-soft)] shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--foreground-muted)]">Índice Académico</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-4xl font-black text-[var(--foreground)]">{student.currentIndex || "0.00"}</span>
            <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">⚡ Superior</span>
          </div>
          <p className="mt-2 text-xs text-[var(--foreground-soft)]">Índice general acumulado en la carrera.</p>
        </div>

        <div className="surface-panel rounded-2xl p-5 border border-[var(--border-soft)] shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--foreground-muted)]">Eficiencia de Aprobación</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-4xl font-black text-[var(--foreground)]">93.5%</span>
            <span className="text-xs font-bold text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded-full">↑ +2.1%</span>
          </div>
          <p className="mt-2 text-xs text-[var(--foreground-soft)]">Relación de materias aprobadas en primer intento.</p>
        </div>

        <div className="surface-panel rounded-2xl p-5 border border-[var(--border-soft)] shadow-sm sm:col-span-2 lg:col-span-1">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--foreground-muted)]">Carga de Créditos</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-4xl font-black text-[var(--foreground)]">68</span>
            <span className="text-sm text-[var(--foreground-muted)]">/ 140 obtenidos</span>
          </div>
          <div className="mt-3 w-full bg-[var(--surface-muted)] h-1.5 rounded-full overflow-hidden">
            <div className="bg-[var(--accent)] h-full rounded-full transition-all duration-500" style={{ width: "48.5%" }} />
          </div>
        </div>
      </div>

      {/* Selectores de Analíticas Avanzadas */}
      <div className="surface-panel rounded-2xl border border-[var(--border-soft)] shadow-sm overflow-hidden">
        <div className="flex border-b border-[var(--border-soft)] bg-[var(--surface-muted)]/50 p-1">
          {([
            { id: "indice", label: "Evolución de Índice" },
            { id: "distribucion", label: "Distribución de Notas" },
            { id: "progreso", label: "Esfuerzo por Semestre" }
          ] as const).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2.5 text-center text-xs font-bold rounded-xl transition-all duration-200 focus:outline-none ${
                activeTab === tab.id
                  ? "bg-[var(--surface-panel)] text-[var(--accent)] shadow-sm"
                  : "text-[var(--foreground-soft)] hover:text-[var(--foreground)]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* VISTA 1: Gráfico Interactivo de Evolución SVG */}
          {activeTab === "indice" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center flex-wrap gap-2">
                <h3 className="text-sm font-bold text-[var(--foreground)]">Línea de Rendimiento Histórico</h3>
                <span className="text-xs font-medium text-[var(--foreground-soft)]">Pasa el cursor por los nodos para ver detalles</span>
              </div>
              
              <div className="relative w-full h-48 flex items-end justify-between border-b border-l border-[var(--border-soft)] pb-2 pl-2">
                {/* SVG dinámico interactivo */}
                <svg className="absolute inset-0 w-full h-full p-4 overflow-visible" preserveAspectRatio="none">
                  <polyline
                    fill="none"
                    stroke="var(--accent)"
                    strokeWidth="3"
                    strokeDasharray="4"
                    className="animate-[dash_2s_ease-out_forwards]"
                    points={historialSemestres.map((s, i) => `${(i / (historialSemestres.length - 1)) * 100}%, ${100 - (s.indice / 3.0) * 80}%`).join(" ")}
                  />
                </svg>

                {historialSemestres.map((semestre, idx) => {
                  const xPos = `${(idx / (historialSemestres.length - 1)) * 100}%`;
                  const yPos = `${100 - (semestre.indice / 3.0) * 80}%`;
                  const isHovered = hoveredIndex === idx;

                  return (
                    <div
                      key={semestre.periodo}
                      className="absolute group flex flex-col items-center"
                      style={{ left: xPos, bottom: `calc(${100 - parseFloat(yPos)}% - 6px)`, transform: "translateX(-50%)" }}
                      onMouseEnter={() => setHoveredIndex(idx)}
                      onMouseLeave={() => setHoveredIndex(null)}
                    >
                      {/* Nodo interactivo */}
                      <button
                        className={`h-3 w-3 rounded-full transition-all duration-150 ${
                          isHovered ? "bg-[var(--accent)] ring-4 ring-[var(--accent-soft)] scale-125" : "bg-[var(--surface-panel)] border-2 border-[var(--accent)]"
                        }`}
                        aria-label={`Detalles de ${semestre.periodo}`}
                      />

                      {/* Tooltip flotante */}
                      <div className={`absolute bottom-full mb-2 flex flex-col items-center transition-all duration-200 pointer-events-none z-10 ${
                        isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1 hidden"
                      }`}>
                        <div className="bg-slate-900 text-white text-[11px] p-2 rounded-xl shadow-xl space-y-0.5 font-sans min-w-[100px]">
                          <p className="font-bold border-b border-white/10 pb-0.5 text-center">{semestre.periodo}</p>
                          <p className="text-emerald-400">Index: <b>{semestre.indice.toFixed(2)}</b></p>
                          <p className="text-slate-300">Materias: <b>{semestre.aprobadas}</b></p>
                        </div>
                        <div className="w-1.5 h-1.5 bg-slate-900 rotate-45 -mt-1" />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Eje X de períodos */}
              <div className="flex justify-between text-[11px] font-bold text-[var(--foreground-muted)] px-2 font-mono">
                {historialSemestres.map((s) => <span key={s.periodo}>{s.periodo}</span>)}
              </div>
            </div>
          )}

          {/* VISTA 2: Distribución de Calificaciones (Barras Interactivas) */}
          {activeTab === "distribucion" && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-[var(--foreground)] mb-2">Conteo de Calificaciones Obtenidas</h3>
              {distribucionNotas.map((item) => (
                <div key={item.letra} className="space-y-1.5 group cursor-pointer">
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span className="flex items-center gap-2">
                      <span className={`w-6 h-6 flex items-center justify-center rounded-lg ${item.color.split(" ")[0]} bg-opacity-20 font-black text-sm`}>
                        {item.letra}
                      </span>
                      <span className="text-[var(--foreground-soft)]">{item.cantidad} asignaturas</span>
                    </span>
                    <span className="text-[var(--foreground)] font-mono">{item.porcentaje}%</span>
                  </div>
                  <div className="w-full bg-[var(--surface-muted)] h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ease-out ${item.color.split(" ")[0]} group-hover:brightness-110`}
                      style={{ width: `${item.porcentaje}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* VISTA 3: Esfuerzo de créditos ganados */}
          {activeTab === "progreso" && (
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
              {historialSemestres.map((semestre) => (
                <div key={semestre.periodo} className="surface-elevated rounded-xl p-4 border border-[var(--border-soft)] shadow-sm flex flex-col justify-between">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-mono font-bold text-[var(--foreground-muted)]">{semestre.periodo}</span>
                    <span className="status-success text-[10px] font-bold uppercase tracking-wider border px-2 py-0.5 rounded-full">Completado</span>
                  </div>
                  <div className="mt-4 flex items-baseline justify-between">
                    <div>
                      <p className="text-2xl font-black text-[var(--foreground)]">{semestre.creditos}</p>
                      <p className="text-[11px] text-[var(--foreground-soft)]">Créditos cursados</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-[var(--accent)]">{semestre.aprobadas}</p>
                      <p className="text-[11px] text-[var(--foreground-soft)]">Materias limpias</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
