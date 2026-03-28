"use client";

import AppShell from "@/components/AppShell";
import DemandForm from "@/components/DemandForm";

export default function NovaDemandaPage() {
  return (
    <AppShell>
      <div className="mb-4">
        <h2 className="text-xl font-bold text-gray-900">Nova Demanda</h2>
        <p className="text-sm text-gray-500">
          Adicione uma nova demanda ao casamento
        </p>
      </div>
      <DemandForm />
    </AppShell>
  );
}
