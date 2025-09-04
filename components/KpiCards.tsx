import React from 'react';

type KpiCardsProps = {
  recommendations: number;
  alerts: number;
  topAssociations: { a: string; b: string; lift: number; }[];
  onRecompute: () => void;
  onGenerateRecs: () => void;
  onRunAlerts: () => void;
};

export function KpiCards({ recommendations, alerts, topAssociations, onRecompute, onGenerateRecs, onRunAlerts }: KpiCardsProps) {
  return (
    <div className="w-full flex flex-col gap-6">
      <div className="flex gap-4">
        <div className="bg-white rounded shadow p-4 flex-1">
          <div className="text-xs text-gray-500">Recomendações ativas</div>
          <div className="text-2xl font-bold">{recommendations}</div>
        </div>
        <div className="bg-white rounded shadow p-4 flex-1">
          <div className="text-xs text-gray-500">Alertas abertos</div>
          <div className="text-2xl font-bold">{alerts}</div>
        </div>
        <div className="bg-white rounded shadow p-4 flex-1">
          <div className="text-xs text-gray-500 mb-2">Top 5 Associações (Lift)</div>
          <ul className="text-sm">
            {topAssociations.map((a, i) => (
              <li key={i}>{a.a} + {a.b} <span className="text-xs text-gray-400">(lift {a.lift.toFixed(2)})</span></li>
            ))}
          </ul>
        </div>
      </div>
      <div className="flex gap-4">
        <button className="bg-blue-600 text-white px-4 py-2 rounded hover:cursor-pointer" onClick={onRecompute}>Recompute</button>
        <button className="bg-green-600 text-white px-4 py-2 rounded hover:cursor-pointer" onClick={onGenerateRecs}>Gerar Recomendações</button>
        <button className="bg-yellow-500 text-white px-4 py-2 rounded hover:cursor-pointer" onClick={onRunAlerts}>Rodar Alertas</button>
      </div>
    </div>
  );
}
