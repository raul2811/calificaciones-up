"use client";

import { useState, useMemo } from "react";
import { useStudentData } from "@/features/student/context/StudentDataContext";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type AnalyticsTab = "indice" | "distribucion" | "progreso";

type SemesterHistoryPoint = {
  periodo: string;
  indice: number;
  aprobadas: number;
  creditos: number;
};

type CustomTooltipProps = {
  active?: boolean;
  payload?: Array<{
    payload: SemesterHistoryPoint;
  }>;
  label?: string | number;
};

export function AnalyticsPage() {
  const { state, student } = useStudentData();
  const [activeTab, setActiveTab] = useState<AnalyticsTab>("indice");

  // 1. Datos simulados
  const indiceActual = parseFloat(student.currentIndex || "0.0");

  const historialSemestres = useMemo<SemesterHistoryPoint[]>(
    () => [
      {
        periodo: "2024-1S",
        indice: Math.max(1.0, indiceActual - 0.4),
        aprobadas: 5,
        creditos: 15,
      },
      {
        periodo: "2024-2S",
        indice: Math.max(1.0, indiceActual - 0.2),
        aprobadas: 6,
        creditos: 18,
      },
      {
        periodo: "2025-1S",
        indice: Math.max(1.0, indiceActual - 0.1),
        aprobadas: 5,
        creditos: 16,
      },
      {
        periodo: "2025-2S",
        indice: indiceActual,
        aprobadas: 6,
        creditos: 19,
      },
    ],
    [indiceActual],
  );

  // 2. Distribución de calificaciones
  const distribucionNotas = [
    {
      letra: "A",
      cantidad: 14,
      porcentaje: 45,
      color: "var(--chart-success)",
      bg: "bg-emerald-500/15",
      text: "text-emerald-500",
    },
    {
      letra: "B",
      cantidad: 10,
      porcentaje: 32,
      color: "var(--chart-info)",
      bg: "bg-blue-500/15",
      text: "text-blue-500",
    },
    {
      letra: "C",
      cantidad: 5,
      porcentaje: 16,
      color: "var(--chart-warning)",
      bg: "bg-amber-500/15",
      text: "text-amber-500",
    },
    {
      letra: "D",
      cantidad: 2,
      porcentaje: 6,
      color: "var(--chart-danger)",
      bg: "bg-orange-500/15",
      text: "text-orange-500",
    },
    {
      letra: "F",
      cantidad: 0,
      porcentaje: 0,
      color: "#f43f5e",
      bg: "bg-rose-500/15",
      text: "text-rose-500",
    },
  ];

  if (state.status === "loading") {
    return (
      <div className="flex items-center gap-3 p-8 surface-panel rounded-[1.6rem] justify-center">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent" />
        <p className="text-sm text-[var(--foreground-soft)] font-medium">
          Procesando métricas del estudiante...
        </p>
      </div>
    );
  }

  // Custom tooltip para el gráfico de área
  const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
    if (active && payload?.length) {
      const data = payload[0]?.payload;

      if (!data) {
        return null;
      }

      return (
        <div className="surface-elevated border border-[var(--border-strong)] shadow-xl p-3 rounded-xl min-w-[140px] backdrop-blur-xl">
          <p className="text-xs font-bold uppercase tracking-wider text-[var(--foreground-muted)] mb-2 border-b border-[var(--border-soft)] pb-1">
            {label}
          </p>
          <div className="space-y-1 text-sm">
            <p className="flex justify-between gap-4">
              <span className="text-[var(--foreground-soft)]">Índice:</span>
              <span className="font-black text-[var(--accent)]">
                {data.indice.toFixed(2)}
              </span>
            </p>
            <p className="flex justify-between gap-4">
              <span className="text-[var(--foreground-soft)]">Materias:</span>
              <span className="font-bold text-[var(--foreground)]">
                {data.aprobadas}
              </span>
            </p>
            <p className="flex justify-between gap-4">
              <span className="text-[var(--foreground-soft)]">Créditos:</span>
              <span className="font-bold text-[var(--foreground)]">
                {data.creditos}
              </span>
            </p>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Tarjetas de Métricas de Alto Impacto */}
      <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {/* KPI 1 */}
        <div className="surface-panel rounded-[1.6rem] p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg animate-fade-in-up cursor-default">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--foreground-muted)]">
            Índice Académico
          </p>
          <div className="mt-3 flex items-baseline gap-3">
            <span className="text-5xl font-black tracking-tight text-[var(--foreground)]">
              {student.currentIndex || "0.00"}
            </span>
            <span className="text-[11px] font-bold text-emerald-500 bg-emerald-500/15 px-2.5 py-1 rounded-full border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.15)]">
              ⚡ Superior
            </span>
          </div>
          <p className="mt-3 text-sm text-[var(--foreground-soft)] leading-relaxed">
            Índice general acumulado histórico a lo largo de la carrera.
          </p>
        </div>

        {/* KPI 2 */}
        <div className="surface-panel rounded-[1.6rem] p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg animate-fade-in-up delay-100 cursor-default">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--foreground-muted)]">
            Eficiencia Académica
          </p>
          <div className="mt-3 flex items-baseline gap-3">
            <span className="text-5xl font-black tracking-tight text-[var(--foreground)]">
              93.5%
            </span>
            <span className="text-[11px] font-bold text-blue-500 bg-blue-500/15 px-2.5 py-1 rounded-full border border-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.15)]">
              ↑ +2.1%
            </span>
          </div>
          <p className="mt-3 text-sm text-[var(--foreground-soft)] leading-relaxed">
            Relación de materias aprobadas en primer intento vs reprobadas.
          </p>
        </div>

        {/* KPI 3 */}
        <div className="surface-panel rounded-[1.6rem] p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg sm:col-span-2 lg:col-span-1 animate-fade-in-up delay-200 cursor-default">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--foreground-muted)]">
            Carga de Créditos
          </p>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-5xl font-black tracking-tight text-[var(--foreground)]">
              68
            </span>
            <span className="text-sm font-semibold text-[var(--foreground-muted)]">
              / 140 obtenidos
            </span>
          </div>
          <div className="mt-4 w-full bg-[var(--surface-muted)] h-2.5 rounded-full overflow-hidden border border-[var(--border-soft)]">
            <div
              className="bg-gradient-to-r from-[var(--accent)] to-[var(--accent-strong)] h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_var(--accent-glow)]"
              style={{ width: "48.5%" }}
            />
          </div>
          <p className="mt-3 text-sm font-medium text-[var(--accent)]">
            48.5% de la carrera completada
          </p>
        </div>
      </div>

      {/* Panel Analítico Principal */}
      <div className="surface-panel rounded-[2rem] border border-[var(--border)] shadow-xl overflow-hidden animate-fade-in-up delay-300">
        {/* Header Tabs Premium */}
        <div className="p-2 bg-[var(--surface-muted)]/80 border-b border-[var(--border-soft)] backdrop-blur-md flex flex-wrap gap-2">
          {([
          { id: "indice", label: "Evolución de Índice" },
          { id: "distribucion", label: "Distribución de Notas" },
          { id: "progreso", label: "Esfuerzo por Semestre" },
            ] as const).map((tab) => {

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex-1 min-w-[140px] py-3 px-4 text-center text-sm font-bold rounded-[1.2rem] transition-all duration-300 outline-none ${
                  isActive
                    ? "text-white shadow-lg shadow-[var(--accent-glow)]"
                    : "text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-elevated)]"
                }`}
              >
                {isActive && (
                  <div className="absolute inset-0 rounded-[1.2rem] bg-gradient-to-r from-[var(--accent)] to-[var(--accent-strong)] -z-10" />
                )}
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="p-6 md:p-8 min-h-[400px]">
          {/* VISTA 1: Recharts AreaChart */}
          {activeTab === "indice" && (
            <div className="h-full flex flex-col animate-fade-in-up">
              <div className="mb-6 flex justify-between items-end flex-wrap gap-4">
                <div>
                  <h3 className="text-xl font-black text-[var(--foreground)]">
                    Rendimiento Histórico
                  </h3>
                  <p className="text-sm text-[var(--foreground-soft)] mt-1">
                    Evolución del índice por cada semestre cursado
                  </p>
                </div>
              </div>

              <div className="w-full h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={historialSemestres}
                    margin={{ top: 10, right: 0, left: -20, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient
                        id="colorIndice"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="var(--accent)"
                          stopOpacity={0.5}
                        />
                        <stop
                          offset="95%"
                          stopColor="var(--accent)"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="var(--border-soft)"
                    />
                    <XAxis
                      dataKey="periodo"
                      axisLine={false}
                      tickLine={false}
                      tick={{
                        fill: "var(--foreground-muted)",
                        fontSize: 12,
                        fontWeight: 700,
                      }}
                      dy={10}
                    />
                    <YAxis
                      domain={["dataMin - 0.2", 3.0]}
                      axisLine={false}
                      tickLine={false}
                      tick={{
                        fill: "var(--foreground-muted)",
                        fontSize: 12,
                      }}
                      dx={-10}
                    />
                    <Tooltip
                      content={<CustomTooltip />}
                      cursor={{
                        stroke: "var(--border-strong)",
                        strokeWidth: 1,
                        strokeDasharray: "4 4",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="indice"
                      stroke="var(--accent)"
                      strokeWidth={4}
                      fillOpacity={1}
                      fill="url(#colorIndice)"
                      activeDot={{
                        r: 8,
                        strokeWidth: 0,
                        fill: "var(--foreground-on-accent)",
                        className: "drop-shadow-md",
                      }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* VISTA 2: Distribución */}
          {activeTab === "distribucion" && (
            <div className="space-y-6 animate-fade-in-up">
              <div className="mb-6">
                <h3 className="text-xl font-black text-[var(--foreground)]">
                  Distribución de Calificaciones
                </h3>
                <p className="text-sm text-[var(--foreground-soft)] mt-1">
                  Desglose de notas obtenidas a lo largo de la carrera
                </p>
              </div>

              <div className="grid gap-6">
                {distribucionNotas.map((item, index) => (
                  <div key={item.letra} className="group relative">
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-lg ${item.bg} ${item.text} border border-[var(--border-soft)] shadow-sm`}
                        >
                          {item.letra}
                        </div>
                        <span className="text-sm font-semibold text-[var(--foreground-soft)] group-hover:text-[var(--foreground)] transition-colors">
                          {item.cantidad}{" "}
                          {item.cantidad === 1 ? "asignatura" : "asignaturas"}
                        </span>
                      </div>
                      <span className="text-xl font-black font-mono text-[var(--foreground)]">
                        {item.porcentaje}%
                      </span>
                    </div>

                    <div className="w-full bg-[var(--surface-muted)] h-3.5 rounded-full overflow-hidden border border-[var(--border-soft)]">
                      <div
                        className="h-full rounded-full transition-all duration-1000 ease-out shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)] relative overflow-hidden"
                        style={{
                          width: `${item.porcentaje}%`,
                          backgroundColor: item.color,
                          animationDelay: `${index * 100}ms`,
                        }}
                      >
                        <div className="absolute inset-0 bg-white/20 w-full h-full transform -skew-x-12 translate-x-[-100%] group-hover:animate-[shine_1.5s_ease-in-out]" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* VISTA 3: Esfuerzo / Progreso Semestral */}
          {activeTab === "progreso" && (
            <div className="animate-fade-in-up">
              <div className="mb-6">
                <h3 className="text-xl font-black text-[var(--foreground)]">
                  Esfuerzo Académico
                </h3>
                <p className="text-sm text-[var(--foreground-soft)] mt-1">
                  Créditos y materias cursadas por período
                </p>
              </div>

              <div className="grid gap-5 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
                {historialSemestres.map((semestre) => (
                  <div
                    key={semestre.periodo}
                    className="surface-elevated rounded-[1.6rem] p-5 border border-[var(--border-soft)] shadow-sm hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition-all duration-300 hover:-translate-y-1 group"
                  >
                    <div className="flex justify-between items-center border-b border-[var(--border-soft)] pb-4 mb-5">
                      <span className="text-sm font-mono font-bold text-[var(--foreground)] bg-[var(--surface-muted)] px-3 py-1 rounded-lg border border-[var(--border)]">
                        {semestre.periodo}
                      </span>
                      <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                    </div>
                    <div className="space-y-5">
                      <div className="flex items-center justify-between">
                        <p className="text-[11px] font-bold text-[var(--foreground-muted)] uppercase tracking-wider">
                          Créditos
                        </p>
                        <p className="text-3xl font-black text-[var(--foreground)] group-hover:text-[var(--accent)] transition-colors">
                          {semestre.creditos}
                        </p>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-[11px] font-bold text-[var(--foreground-muted)] uppercase tracking-wider">
                          Materias
                        </p>
                        <p className="text-2xl font-black text-[var(--foreground)]">
                          {semestre.aprobadas}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
