"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import AppShell from "@/components/AppShell";
import DemandCard from "@/components/DemandCard";
import Link from "next/link";
import { STATUS_OPTIONS, CATEGORY_OPTIONS } from "@/lib/constants";
import type { Demanda } from "@/lib/types";

function CategoryScroll({
  filtroCategoria,
  setFiltroCategoria,
}: {
  filtroCategoria: string;
  setFiltroCategoria: (v: string) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(true);

  const checkArrows = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setShowLeft(el.scrollLeft > 4);
    setShowRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    checkArrows();
    el.addEventListener("scroll", checkArrows, { passive: true });
    return () => el.removeEventListener("scroll", checkArrows);
  }, [checkArrows]);

  function scroll(dir: "left" | "right") {
    scrollRef.current?.scrollBy({
      left: dir === "left" ? -150 : 150,
      behavior: "smooth",
    });
  }

  // Touch drag support
  const dragState = useRef<{ startX: number; scrollLeft: number } | null>(null);

  function onPointerDown(e: React.PointerEvent) {
    const el = scrollRef.current;
    if (!el) return;
    dragState.current = { startX: e.clientX, scrollLeft: el.scrollLeft };
    el.setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!dragState.current || !scrollRef.current) return;
    const dx = e.clientX - dragState.current.startX;
    scrollRef.current.scrollLeft = dragState.current.scrollLeft - dx;
  }

  function onPointerUp() {
    dragState.current = null;
  }

  return (
    <div className="mb-4 relative flex items-center gap-1">
      <button
        onClick={() => scroll("left")}
        className={`flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-full bg-white border border-pink-200 shadow-sm text-pink-600 text-sm transition-opacity ${
          showLeft ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        aria-label="Rolar para esquerda"
      >
        ‹
      </button>
      <div
        ref={scrollRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 touch-pan-x select-none flex-1"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        <button
          onClick={() => setFiltroCategoria("todos")}
          className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
            filtroCategoria === "todos"
              ? "bg-pink-600 text-white"
              : "bg-white text-gray-600 border border-gray-200"
          }`}
        >
          Todas
        </button>
        {CATEGORY_OPTIONS.map((c) => (
          <button
            key={c.value}
            onClick={() =>
              setFiltroCategoria(
                filtroCategoria === c.value ? "todos" : c.value
              )
            }
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              filtroCategoria === c.value
                ? "bg-pink-600 text-white"
                : "bg-white text-gray-600 border border-gray-200"
            }`}
          >
            {c.icon} {c.label}
          </button>
        ))}
      </div>
      <button
        onClick={() => scroll("right")}
        className={`flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-full bg-white border border-pink-200 shadow-sm text-pink-600 text-sm transition-opacity ${
          showRight ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        aria-label="Rolar para direita"
      >
        ›
      </button>
    </div>
  );
}

export default function HomePage() {
  const [demandas, setDemandas] = useState<Demanda[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroStatus, setFiltroStatus] = useState<string>("todos");
  const [filtroCategoria, setFiltroCategoria] = useState<string>("todos");
  const [filtroResponsavel, setFiltroResponsavel] = useState<string>("todos");
  const [busca, setBusca] = useState("");

  useEffect(() => {
    fetchDemandas();
  }, []);

  async function fetchDemandas() {
    try {
      const res = await fetch("/api/demandas");
      const data = await res.json();
      setDemandas(data);
    } catch {
      console.error("Erro ao carregar demandas");
    } finally {
      setLoading(false);
    }
  }

  const filtered = demandas.filter((d) => {
    if (filtroStatus !== "todos" && d.status !== filtroStatus) return false;
    if (filtroCategoria !== "todos" && d.categoria !== filtroCategoria)
      return false;
    if (filtroResponsavel !== "todos" && d.responsavel !== filtroResponsavel)
      return false;
    if (busca) {
      const normalize = (s: string) =>
        s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
      const search = normalize(busca);
      return (
        normalize(d.titulo).includes(search) ||
        normalize(d.responsavel).includes(search) ||
        (d.descricao && normalize(d.descricao).includes(search))
      );
    }
    return true;
  });

  const responsaveis = [...new Set(demandas.map((d) => d.responsavel))].sort();

  const statusCounts = STATUS_OPTIONS.map((s) => ({
    ...s,
    count: demandas.filter((d) => d.status === s.value).length,
  }));

  return (
    <AppShell>
      {/* Resumo de status */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        {statusCounts.map((s) => (
          <button
            key={s.value}
            onClick={() =>
              setFiltroStatus(filtroStatus === s.value ? "todos" : s.value)
            }
            className={`rounded-xl p-2 text-center transition-all ${
              filtroStatus === s.value
                ? "ring-2 ring-pink-500 scale-105"
                : ""
            } ${s.color}`}
          >
            <div className="text-xl font-bold">{s.count}</div>
            <div className="text-[10px] font-medium leading-tight">
              {s.label}
            </div>
          </button>
        ))}
      </div>

      {/* Busca */}
      <div className="mb-3">
        <input
          type="text"
          placeholder="🔍 Buscar demanda..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl border border-pink-200 focus:border-pink-500 focus:outline-none bg-white text-sm"
        />
      </div>

      {/* Filtro responsável */}
      <div className={`flex gap-2 flex-wrap ${responsaveis.length > 1 ? "mb-3" : ""}`}>
        {responsaveis.length > 1 && (
          <>
            <button
              onClick={() => setFiltroResponsavel("todos")}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                filtroResponsavel === "todos"
                  ? "bg-pink-600 text-white"
                  : "bg-white text-gray-600 border border-gray-200"
              }`}
            >
              <span>{"👤 Todos"}</span>
            </button>
            {responsaveis.map((r) => (
              <button
                key={r}
                onClick={() =>
                  setFiltroResponsavel(
                    filtroResponsavel === r ? "todos" : r
                  )
                }
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  filtroResponsavel === r
                    ? "bg-pink-600 text-white"
                    : "bg-white text-gray-600 border border-gray-200"
                }`}
              >
                <span>{"👤 "}{r}</span>
              </button>
            ))}
          </>
        )}
      </div>

      {/* Filtro categoria */}
      <CategoryScroll
        filtroCategoria={filtroCategoria}
        setFiltroCategoria={setFiltroCategoria}
      />

      {/* Lista de demandas */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">
          <div className="text-3xl mb-2 animate-pulse"><span>{"💍"}</span></div>
          <p>{"Carregando..."}</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <div className="text-3xl mb-2"><span>{"📋"}</span></div>
          <p>{"Nenhuma demanda encontrada"}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((d) => (
            <DemandCard
              key={d.id}
              demanda={d}
              responsaveis={responsaveis}
              onUpdate={(updated) =>
                setDemandas((prev) =>
                  prev.map((item) => (item.id === updated.id ? updated : item))
                )
              }
            />
          ))}
        </div>
      )}

      {/* FAB - Novo */}
      <Link
        href="/nova"
        className="fixed bottom-6 right-6 w-14 h-14 bg-pink-600 text-white rounded-full shadow-lg flex items-center justify-center text-3xl hover:bg-pink-700 active:bg-pink-800 transition-colors z-40"
      >
        +
      </Link>
    </AppShell>
  );
}
