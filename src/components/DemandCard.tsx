"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import StatusBadge from "./StatusBadge";
import { getCategoryInfo, getStatusInfo } from "@/lib/constants";
import type { Demanda } from "@/lib/types";

function formatDate(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
  });
}

function normalize(s: string) {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export default function DemandCard({
  demanda,
  responsaveis = [],
  onUpdate,
}: {
  demanda: Demanda;
  responsaveis?: string[];
  onUpdate?: (updated: Demanda) => void;
}) {
  const cat = getCategoryInfo(demanda.categoria);
  const router = useRouter();

  // Responsavel editing
  const [editingResp, setEditingResp] = useState(false);
  const [respDraft, setRespDraft] = useState("");
  const [respSaving, setRespSaving] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const respRef = useRef<HTMLDivElement>(null);

  // Status
  const [statusSaving, setStatusSaving] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<string | null>(null);
  const [statusObs, setStatusObs] = useState("");
  const [mounted, setMounted] = useState(false);

  // Descricao editing
  const [editingDesc, setEditingDesc] = useState(false);
  const [descDraft, setDescDraft] = useState("");
  const [descSaving, setDescSaving] = useState(false);
  const descRef = useRef<HTMLTextAreaElement>(null);

  // Need mounted check for createPortal
  useEffect(() => {
    setMounted(true);
  }, []);

  // Close suggestions on outside click
  useEffect(() => {
    if (!showSuggestions) return;
    function handleClick(e: MouseEvent) {
      if (respRef.current && !respRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showSuggestions]);

  // Auto-focus textarea
  useEffect(() => {
    if (editingDesc && descRef.current) {
      descRef.current.focus();
      descRef.current.style.height = "auto";
      descRef.current.style.height = descRef.current.scrollHeight + "px";
    }
  }, [editingDesc]);

  const filteredResp = responsaveis.filter((r) => {
    if (!respDraft.trim()) return true;
    return normalize(r).includes(normalize(respDraft));
  });

  async function saveField(
    fields: Record<string, string | null>,
    setSaving: (v: boolean) => void
  ) {
    setSaving(true);
    try {
      const userName = localStorage.getItem("userName") || "Desconhecido";
      const res = await fetch(`/api/demandas/${demanda.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...fields, atualizadoPor: userName }),
      });
      if (res.ok) {
        const updated = await res.json();
        onUpdate?.(updated);
      }
    } catch {
      // silent
    } finally {
      setSaving(false);
    }
  }

  function startEditResp(e: React.MouseEvent) {
    e.stopPropagation();
    setRespDraft(demanda.responsavel);
    setEditingResp(true);
  }

  async function saveResponsavel(value?: string) {
    const trimmed = (value ?? respDraft).trim();
    if (!trimmed || trimmed === demanda.responsavel) {
      setEditingResp(false);
      return;
    }
    await saveField({ responsavel: trimmed }, setRespSaving);
    setEditingResp(false);
  }

  async function confirmStatusChange() {
    if (!pendingStatus) return;
    const fields: Record<string, string | null> = { status: pendingStatus };
    const obs = statusObs.trim();
    if (obs) {
      const current = demanda.observacoes || "";
      fields.observacoes = current ? `${current}\n${obs}` : obs;
    }
    await saveField(fields, setStatusSaving);
    setPendingStatus(null);
    setStatusObs("");
  }

  function startEditDesc(e: React.MouseEvent) {
    e.stopPropagation();
    setDescDraft(demanda.descricao || "");
    setEditingDesc(true);
  }

  async function saveDescricao() {
    const trimmed = descDraft.trim();
    if (trimmed === (demanda.descricao || "")) {
      setEditingDesc(false);
      return;
    }
    await saveField({ descricao: trimmed || null }, setDescSaving);
    setEditingDesc(false);
  }

  function handleCardClick(e: React.MouseEvent) {
    if ((e.target as HTMLElement).closest("[data-edit-area]")) return;
    router.push(`/demanda/${demanda.id}`);
  }

  const pendingInfo = pendingStatus ? getStatusInfo(pendingStatus) : null;

  return (
    <div
      onClick={handleCardClick}
      className="bg-white rounded-2xl shadow-sm border border-pink-100 p-4 active:scale-[0.98] transition-transform cursor-pointer"
    >
      {/* Title + Status */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-lg flex-shrink-0">{cat.icon}</span>
          <h3 className="font-semibold text-gray-900 truncate">
            {demanda.titulo}
          </h3>
        </div>
        <div onClick={(e) => e.stopPropagation()} data-edit-area>
          <StatusBadge
            status={demanda.status}
            editable
            onStatusChange={(s) => {
              setPendingStatus(s);
              setStatusObs("");
            }}
            saving={statusSaving}
          />
        </div>
      </div>

      {/* Responsavel + Prazo */}
      <div className="flex items-center justify-between text-sm text-gray-500">
        <div
          data-edit-area
          ref={respRef}
          className="flex items-center gap-1 min-w-0 relative"
        >
          <span className="flex-shrink-0">👤</span>
          {editingResp ? (
            <div className="relative w-full max-w-[180px]">
              <input
                type="text"
                value={respDraft}
                onChange={(e) => {
                  setRespDraft(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => {
                  setTimeout(() => {
                    setShowSuggestions(false);
                    saveResponsavel();
                  }, 150);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    setShowSuggestions(false);
                    saveResponsavel();
                  }
                  if (e.key === "Escape") {
                    setShowSuggestions(false);
                    setEditingResp(false);
                  }
                }}
                disabled={respSaving}
                autoFocus
                placeholder="Digite o nome..."
                className="border-b border-pink-400 bg-transparent outline-none text-sm text-gray-700 w-full"
              />
              {showSuggestions && filteredResp.length > 0 && (
                <div className="absolute left-0 top-full mt-1 bg-white rounded-xl shadow-lg border border-gray-200 py-1 z-50 w-full max-h-[150px] overflow-y-auto">
                  {filteredResp.map((r) => (
                    <button
                      key={r}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setShowSuggestions(false);
                        setEditingResp(false);
                        saveField({ responsavel: r }, setRespSaving);
                      }}
                      className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-pink-50 flex items-center gap-2"
                    >
                      <span className="text-xs text-gray-400">👤</span>
                      {r}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={startEditResp}
              className="text-left truncate hover:text-pink-600 transition-colors"
              title="Clique para editar o responsável"
            >
              {"Responsável: "}
              {demanda.responsavel}
            </button>
          )}
        </div>
        {demanda.prazo && (
          <div className="flex items-center gap-1 flex-shrink-0">
            <span>📅</span>
            <span>{formatDate(demanda.prazo)}</span>
          </div>
        )}
      </div>

      {/* Valor */}
      {demanda.valorEstimado && (
        <div className="mt-1 text-sm text-gray-500 flex items-center gap-1">
          <span>💰</span>
          <span>{"R$ "}{demanda.valorEstimado}</span>
        </div>
      )}

      {/* Descricao - texto completo */}
      <div data-edit-area className="mt-2">
        {editingDesc ? (
          <div>
            <textarea
              ref={descRef}
              value={descDraft}
              onChange={(e) => {
                setDescDraft(e.target.value);
                e.target.style.height = "auto";
                e.target.style.height = e.target.scrollHeight + "px";
              }}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  setEditingDesc(false);
                }
              }}
              disabled={descSaving}
              placeholder="Adicionar descrição..."
              className="w-full px-2 py-1.5 rounded-lg border border-pink-300 bg-pink-50/50 outline-none text-sm text-gray-700 resize-none min-h-[60px]"
            />
            <div className="flex justify-end gap-2 mt-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingDesc(false);
                }}
                className="text-xs text-gray-400 px-2 py-1"
              >
                Cancelar
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  saveDescricao();
                }}
                disabled={descSaving}
                className="text-xs text-white bg-pink-600 rounded-lg px-3 py-1 font-medium disabled:opacity-50"
              >
                {descSaving ? "..." : "Salvar"}
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={startEditDesc}
            className="text-left text-sm text-gray-400 hover:text-pink-600 transition-colors flex items-start gap-1"
          >
            <span className="flex-shrink-0 text-xs mt-0.5">📝</span>
            {demanda.descricao ? (
              <span className="text-gray-500 whitespace-pre-wrap break-words">
                {demanda.descricao}
              </span>
            ) : (
              <span className="italic">Adicionar descrição...</span>
            )}
          </button>
        )}
      </div>

      {/* Last update */}
      <div className="mt-2 pt-2 border-t border-gray-50 text-xs text-gray-400">
        {"Atualizado por "}
        {demanda.atualizadoPor}
        {" em "}
        {new Date(demanda.atualizadoEm).toLocaleDateString("pt-BR")}
      </div>

      {/* Modal de status via portal */}
      {mounted &&
        pendingStatus &&
        pendingInfo &&
        createPortal(
          <div
            className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-4"
            onClick={(e) => {
              e.stopPropagation();
              if (e.target === e.currentTarget) {
                setPendingStatus(null);
                setStatusObs("");
              }
            }}
          >
            <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl">
              <div className="p-5">
                <h3 className="text-base font-semibold text-gray-900 mb-1">
                  Alterar status
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${getStatusInfo(demanda.status).color}`}
                  >
                    {getStatusInfo(demanda.status).label}
                  </span>
                  <span className="mx-2">{"\u2192"}</span>
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${pendingInfo.color}`}
                  >
                    {pendingInfo.label}
                  </span>
                </p>

                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {"Observação "}
                  <span className="text-gray-400 font-normal">(opcional)</span>
                </label>
                <textarea
                  value={statusObs}
                  onChange={(e) => setStatusObs(e.target.value)}
                  placeholder="Ex: Fornecedor confirmou entrega..."
                  autoFocus
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:border-pink-500 focus:outline-none text-sm resize-none min-h-[80px] bg-gray-50"
                />
              </div>

              <div className="flex border-t border-gray-100">
                <button
                  onClick={() => {
                    setPendingStatus(null);
                    setStatusObs("");
                  }}
                  className="flex-1 py-3 text-sm font-medium text-gray-500 hover:bg-gray-50 rounded-bl-2xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmStatusChange}
                  disabled={statusSaving}
                  className="flex-1 py-3 text-sm font-semibold text-pink-600 hover:bg-pink-50 rounded-br-2xl transition-colors border-l border-gray-100 disabled:opacity-50"
                >
                  {statusSaving ? "Salvando..." : "Confirmar"}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
