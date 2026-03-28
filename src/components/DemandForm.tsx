"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { STATUS_OPTIONS, CATEGORY_OPTIONS } from "@/lib/constants";
import type { Demanda } from "@/lib/types";

interface DemandFormProps {
  demanda?: Demanda;
  isEdit?: boolean;
}

export default function DemandForm({ demanda, isEdit }: DemandFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [responsaveis, setResponsaveis] = useState<string[]>([]);
  const [showRespSuggestions, setShowRespSuggestions] = useState(false);
  const respRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/demandas")
      .then((res) => res.json())
      .then((data: Demanda[]) => {
        const unique = [...new Set(data.map((d) => d.responsavel))].sort();
        setResponsaveis(unique);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!showRespSuggestions) return;
    function handleClick(e: MouseEvent) {
      if (respRef.current && !respRef.current.contains(e.target as Node)) {
        setShowRespSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showRespSuggestions]);

  const [form, setForm] = useState({
    titulo: demanda?.titulo || "",
    descricao: demanda?.descricao || "",
    responsavel: demanda?.responsavel || "",
    categoria: demanda?.categoria || "outros",
    status: demanda?.status || "pendente",
    prazo: demanda?.prazo || "",
    valorEstimado: demanda?.valorEstimado || "",
    fornecedor: demanda?.fornecedor || "",
    observacoes: demanda?.observacoes || "",
  });

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const userName = localStorage.getItem("userName") || "Anônimo";

    const payload = {
      ...form,
      atualizadoPor: userName,
    };

    try {
      if (isEdit && demanda) {
        await fetch(`/api/demandas/${demanda.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        await fetch("/api/demandas", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }
      router.push("/");
      router.refresh();
    } catch {
      alert("Erro ao salvar. Tente novamente.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Título */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Título *
        </label>
        <input
          name="titulo"
          value={form.titulo}
          onChange={handleChange}
          required
          placeholder="Ex: Reservar local da festa"
          className="w-full px-4 py-3 rounded-xl border border-pink-200 focus:border-pink-500 focus:outline-none bg-white"
        />
      </div>

      {/* Descrição */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Descrição
        </label>
        <textarea
          name="descricao"
          value={form.descricao}
          onChange={handleChange}
          placeholder="Detalhes sobre a demanda..."
          rows={3}
          className="w-full px-4 py-3 rounded-xl border border-pink-200 focus:border-pink-500 focus:outline-none bg-white resize-none"
        />
      </div>

      {/* Responsável */}
      <div ref={respRef} className="relative">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Responsável *
        </label>
        <input
          name="responsavel"
          value={form.responsavel}
          onChange={(e) => {
            handleChange(e);
            setShowRespSuggestions(true);
          }}
          onFocus={() => setShowRespSuggestions(true)}
          required
          autoComplete="off"
          placeholder="Quem é o responsável?"
          className="w-full px-4 py-3 rounded-xl border border-pink-200 focus:border-pink-500 focus:outline-none bg-white"
        />
        {showRespSuggestions && (() => {
          const normalize = (s: string) =>
            s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
          const filtered = responsaveis.filter((r) =>
            !form.responsavel.trim()
              ? true
              : normalize(r).includes(normalize(form.responsavel))
          );
          if (filtered.length === 0) return null;
          return (
            <div className="absolute left-0 right-0 top-full mt-1 bg-white rounded-xl shadow-lg border border-gray-200 py-1 z-50 max-h-[180px] overflow-y-auto">
              {filtered.map((r) => (
                <button
                  key={r}
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    setForm({ ...form, responsavel: r });
                    setShowRespSuggestions(false);
                  }}
                  className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-pink-50 flex items-center gap-2"
                >
                  <span className="text-gray-400">{"👤"}</span>
                  {r}
                </button>
              ))}
            </div>
          );
        })()}
      </div>

      {/* Status e Categoria lado a lado */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl border border-pink-200 focus:border-pink-500 focus:outline-none bg-white"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Categoria
          </label>
          <select
            name="categoria"
            value={form.categoria}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl border border-pink-200 focus:border-pink-500 focus:outline-none bg-white"
          >
            {CATEGORY_OPTIONS.map((c) => (
              <option key={c.value} value={c.value}>
                {c.icon} {c.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Prazo */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Prazo
        </label>
        <input
          name="prazo"
          type="date"
          value={form.prazo}
          onChange={handleChange}
          className="w-full px-4 py-3 rounded-xl border border-pink-200 focus:border-pink-500 focus:outline-none bg-white"
        />
      </div>

      {/* Valor Estimado */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Valor Estimado (R$)
        </label>
        <input
          name="valorEstimado"
          value={form.valorEstimado}
          onChange={handleChange}
          placeholder="Ex: 5.000,00"
          className="w-full px-4 py-3 rounded-xl border border-pink-200 focus:border-pink-500 focus:outline-none bg-white"
        />
      </div>

      {/* Fornecedor */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Fornecedor / Contato
        </label>
        <input
          name="fornecedor"
          value={form.fornecedor}
          onChange={handleChange}
          placeholder="Nome do fornecedor ou contato"
          className="w-full px-4 py-3 rounded-xl border border-pink-200 focus:border-pink-500 focus:outline-none bg-white"
        />
      </div>

      {/* Observações */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Observações
        </label>
        <textarea
          name="observacoes"
          value={form.observacoes}
          onChange={handleChange}
          placeholder="Notas adicionais..."
          rows={2}
          className="w-full px-4 py-3 rounded-xl border border-pink-200 focus:border-pink-500 focus:outline-none bg-white resize-none"
        />
      </div>

      {/* Botões */}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex-1 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 active:bg-gray-300 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={saving || !form.titulo.trim() || !form.responsavel.trim()}
          className="flex-1 py-3 bg-pink-600 text-white font-semibold rounded-xl hover:bg-pink-700 active:bg-pink-800 transition-colors disabled:opacity-40"
        >
          {saving ? "Salvando..." : isEdit ? "Salvar" : "Criar"}
        </button>
      </div>
    </form>
  );
}
