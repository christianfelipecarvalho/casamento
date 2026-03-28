"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [nome, setNome] = useState("");
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = nome.trim();
    if (trimmed) {
      localStorage.setItem("userName", trimmed);
      router.push("/");
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-100 to-pink-50 flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <span className="text-6xl block mb-4">💍</span>
          <h1 className="text-2xl font-bold text-pink-800 mb-1">
            Casamento C & P
          </h1>
          <p className="text-pink-600 text-sm">
            Organização de demandas
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="nome"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Qual é o seu nome?
            </label>
            <input
              id="nome"
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Digite seu nome"
              className="w-full px-4 py-3 rounded-xl border-2 border-pink-200 focus:border-pink-500 focus:outline-none text-lg bg-white shadow-sm"
              autoFocus
              autoComplete="name"
            />
          </div>

          <button
            type="submit"
            disabled={!nome.trim()}
            className="w-full py-3 bg-pink-600 text-white font-semibold rounded-xl text-lg shadow-md hover:bg-pink-700 active:bg-pink-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Entrar
          </button>
        </form>

        <p className="text-center text-xs text-pink-400 mt-8">
          Desenvolvido por Christian Felipe Carvalho
        </p>
      </div>
    </div>
  );
}
