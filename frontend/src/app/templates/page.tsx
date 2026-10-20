import Link from 'next/link';
import { Eye } from 'lucide-react';
import { getTemplates } from '@/shared/api/contracts.api';
import {
  booleanLabel,
  contractTypeLabel,
  legalTypeLabel,
  paymentTypeLabel,
} from '@/shared/lib/format';
import { Header } from '@/widgets/header/Header';
import { Sidebar } from '@/widgets/sidebar/Sidebar';

export default async function TemplatesPage() {
  const templates = await getTemplates();

  return (
    <main className="shell">
      <Sidebar />
      <section className="workspace">
        <Header title="Templates" />
        <section className="panel pagePanel">
          <div className="panelHeader">
            <h2>Шаблоны</h2>
          </div>
          <div className="tableWrap">
            <table className="dataTable">
              <thead>
                <tr>
                  <th>Статус</th>
                  <th>Код</th>
                  <th>Название</th>
                  <th>Тип</th>
                  <th>Юр. тип</th>
                  <th>Оплата</th>
                  <th>ТЗ</th>
                  <th>Файл</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {templates.map(template => (
                  <tr key={template.id}>
                    <td>
                      <span className={`statusBadge ${template.isActive ? 'success' : ''}`}>
                        {template.isActive ? 'Активен' : 'Неактивен'}
                      </span>
                    </td>
                    <td>{template.code}</td>
                    <td>{template.name}</td>
                    <td>{contractTypeLabel(template.type)}</td>
                    <td>{legalTypeLabel(template.legalType)}</td>
                    <td>{paymentTypeLabel(template.paymentType)}</td>
                    <td>{booleanLabel(template.hasTz)}</td>
                    <td>{template.filePath}</td>
                    <td>
                      <Link className="actionLink" href={`/templates/${template.id}`}>
                        <Eye size={15} />
                        Открыть
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {templates.length === 0 ? <div className="emptyState">Шаблоны не найдены</div> : null}
        </section>
      </section>
    </main>
  );
}
