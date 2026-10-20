'use client';

import { useEffect, useState } from 'react';
import { FileCheck, FileText, FolderOpen, Users } from 'lucide-react';
import { CreateDocumentForm } from '@/features/create-document/CreateDocumentForm';
import { getDashboardStats, getTemplates } from '@/shared/api/contracts.api';
import type { ApiTemplate, DashboardStats } from '@/shared/api/contracts.api';

const initialStats: DashboardStats = {
  clientsCount: 0,
  contractsCount: 0,
  templatesCount: 0,
  generatedCount: 0,
};

export function DashboardHome() {
  const [stats, setStats] = useState<DashboardStats>(initialStats);
  const [templates, setTemplates] = useState<ApiTemplate[]>([]);

  async function refreshStats() {
    const nextStats = await getDashboardStats();
    setStats(nextStats);
  }

  useEffect(() => {
    refreshStats().catch(() => undefined);
    getTemplates().then(setTemplates).catch(() => undefined);
  }, []);

  const metrics = [
    { label: 'Clients', value: stats.clientsCount, icon: Users },
    { label: 'Contracts', value: stats.contractsCount, icon: FileText },
    { label: 'Templates', value: stats.templatesCount, icon: FolderOpen },
    { label: 'Generated', value: stats.generatedCount, icon: FileCheck },
  ];

  return (
    <>
      <section className="metricsGrid">
        {metrics.map((metric) => {
          const Icon = metric.icon;

          return (
            <article className="metric" key={metric.label}>
              <div className="metricIcon">
                <Icon size={20} />
              </div>
              <div>
                <p>{metric.label}</p>
                <strong>{metric.value}</strong>
              </div>
            </article>
          );
        })}
      </section>
      <section className="contentGrid">
        <CreateDocumentForm onGenerated={() => refreshStats().catch(() => undefined)} />
        <div className="panel">
          <div className="panelHeader">
            <h2>Шаблоны</h2>
          </div>
          <div className="templateSummary">
            {templates.map(template => (
              <div key={template.id}>
                <FolderOpen size={20} />
                <span>{template.name}</span>
                {!template.isActive ? <span className="mutedBadge">Неактивен</span> : null}
              </div>
            ))}
            {templates.length === 0 ? <div>Шаблоны не найдены</div> : null}
          </div>
        </div>
      </section>
    </>
  );
}
