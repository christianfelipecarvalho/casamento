"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import AppShell from "@/components/AppShell";
import DemandForm from "@/components/DemandForm";
import StatusBadge from "@/components/StatusBadge";
import { getCategoryInfo } from "@/lib/constants";
import type { Demanda, Historico } from "@/lib/types";

function formatDateTime(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function DemandaPage() {
  const params = useParams();
  const router = useRouter();
  const [demanda, setDemanda] = useState<Demanda | null>(null);
  const [historico, setHistorico] = useState<Historico[]>([]);
  const [loading, setLoading] = useState(true);
  const [editando, setEditando] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchData();
    }
  }, [params.id]);

  async function fetchData() {
    try {
      const [demRes, histRes] = await Promise.all([
        fetch(`/api/demandas/${params.id}`),
        fetch(`/api/demandas/${params.id}/historico`),
      ]);
      const demData = await demRes.json();
      const histData = await histRes.json();
      setDemanda(demData);
      setHistorico(histData);
    } catch {
      console.error("Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    await fetch(`/api/demandas/${params.id}`, { method: "DELETE" });
    router.push("/");
  }

  if (loading) {
    return (
      <AppShell>
        <div className="text-center py-12 text-gray-400">
          <div className="text-3xl mb-2 animate-pulse">💍</div>
          <p>Carregando...</p>
        </div>
      </AppShell>
    );
  }

  if (!demanda) {
    return (
      <AppShell>
        <div className="text-center py-12">
          <p className="text-gray-500">Demanda não encontrada</p>
        </div>
      </AppShell>
    );
  }

  if (editando) {
    return (
      <AppShell>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Editar Demanda
            </h2>
            <p className="text-sm text-gray-500">{demanda.titulo}</p>
          </div>
          <button
            onClick={() => setEditando(false)}
            className="text-sm text-pink-600 font-medium"
          >
            Cancelar
          </button>
        </div>
        <DemandForm demanda={demanda} isEdit />
      </AppShell>
    );
  }

  const cat = getCategoryInfo(demanda.categoria);

  return (
    <AppShell>
      {/* Cabeçalho */}
      <div className="bg-white rounded-2xl shadow-sm border border-pink-100 p-4 mb-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{cat.icon}</span>
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                {demanda.titulo}
              </h2>
              <p className="text-xs text-gray-400">{cat.label}</p>
            </div>
          </div>
          <StatusBadge status={demanda.status} />
        </div>

        {demanda.descricao && (
          <p className="text-sm text-gray-600 mb-3">{demanda.descricao}</p>
        )}

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="bg-pink-50 rounded-xl p-3">
            <p className="text-xs text-gray-400 mb-1">Responsável</p>
            <p className="font-semibold text-gray-800">
              👤 {demanda.responsavel}
            </p>
          </div>
          {demanda.prazo && (
            <div className="bg-pink-50 rounded-xl p-3">
              <p className="text-xs text-gray-400 mb-1">Prazo</p>
              <p className="font-semibold text-gray-800">
                📅{" "}
                {new Date(demanda.prazo + "T12:00:00").toLocaleDateString(
                  "pt-BR"
                )}
              </p>
            </div>
          )}
          {demanda.valorEstimado && (
            <div className="bg-pink-50 rounded-xl p-3">
              <p className="text-xs text-gray-400 mb-1">Valor Estimado</p>
              <p className="font-semibold text-gray-800">
                💰 R$ {demanda.valorEstimado}
              </p>
            </div>
          )}
          {demanda.fornecedor && (
            <div className="bg-pink-50 rounded-xl p-3">
              <p className="text-xs text-gray-400 mb-1">Fornecedor</p>
              <p className="font-semibold text-gray-800">
                🏪 {demanda.fornecedor}
              </p>
            </div>
          )}
        </div>

        {demanda.observacoes && (
          <div className="mt-3 bg-yellow-50 rounded-xl p-3">
            <p className="text-xs text-gray-400 mb-1">Observações</p>
            <p className="text-sm text-gray-700">{demanda.observacoes}</p>
          </div>
        )}

        <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-400">
          Última atualização por{" "}
          <span className="font-medium text-gray-600">
            {demanda.atualizadoPor}
          </span>{" "}
          em {formatDateTime(demanda.atualizadoEm)}
        </div>
      </div>

      {/* Ações */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={() => setEditando(true)}
          className="flex-1 py-3 bg-pink-600 text-white font-semibold rounded-xl hover:bg-pink-700 active:bg-pink-800 transition-colors"
        >
          ✏️ Editar
        </button>
        {!confirmDelete ? (
          <button
            onClick={() => setConfirmDelete(true)}
            className="py-3 px-4 bg-red-50 text-red-600 font-semibold rounded-xl hover:bg-red-100 transition-colors"
          >
            🗑️
          </button>
        ) : (
          <button
            onClick={handleDelete}
            className="py-3 px-4 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-colors animate-pulse"
          >
            Confirmar?
          </button>
        )}
      </div>

      {/* Histórico */}
      <div className="mb-4">
        <h3 className="text-lg font-bold text-gray-900 mb-3">
          📜 Histórico de Alterações
        </h3>

        {historico.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">
            Nenhuma alteração registrada
          </p>
        ) : (
          <div className="space-y-2">
            {historico.map((h) => (
              <div
                key={h.id}
                className="bg-white rounded-xl border border-gray-100 p-3"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-pink-700">
                    {h.campo}
                  </span>
                  <span className="text-xs text-gray-400">
                    {formatDateTime(h.alteradoEm)}
                  </span>
                </div>
                {h.valorAnterior && (
                  <p className="text-xs text-gray-400 line-through">
                    {h.valorAnterior}
                  </p>
                )}
                <p className="text-sm text-gray-700">{h.valorNovo}</p>
                <p className="text-xs text-gray-400 mt-1">
                  por <span className="font-medium">{h.alteradoPor}</span>
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
