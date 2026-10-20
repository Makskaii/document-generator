import { Download } from 'lucide-react';
import { getGenerations, generationDownloadUrl } from '@/shared/api/contracts.api';
import { formatDateTime, statusLabel } from '@/shared/lib/format';
import { Header } from '@/widgets/header/Header';
import { Sidebar } from '@/widgets/sidebar/Sidebar';

export default async function GeneratedPage() {
  const generations = await getGenerations();

  return (
    <main className="shell">
      <Sidebar />
      <section className="workspace">
        <Header title="История генераций" />
        <section className="panel pagePanel">
          <div className="panelHeader">
            <h2>Сгенерированные документы</h2>
          </div>
          <div className="tableWrap">
            <table className="dataTable">
              <thead>
                <tr>
                  <th>Дата генерации</th>
                  <th>Номер договора</th>
                  <th>Клиент</th>
                  <th>Шаблон</th>
                  <th>Статус</th>
                  <th>Файл</th>
                  <th>Ошибка</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {generations.map(generation => (
                  <tr key={generation.id}>
                    <td>{formatDateTime(generation.createdAt)}</td>
                    <td>{generation.contract?.number ?? '—'}</td>
                    <td>{generation.contract?.client?.shortName ?? generation.contract?.client?.name ?? '—'}</td>
                    <td>{generation.contract?.template?.code ?? '—'}</td>
                    <td><span className={`statusBadge ${generation.status.toLowerCase()}`}>{statusLabel(generation.status)}</span></td>
                    <td>{generation.fileName ?? '—'}</td>
                    <td>{generation.errorMessage ?? '—'}</td>
                    <td>
                      {generation.status === 'SUCCESS' ? (
                        <a className="actionLink" href={generationDownloadUrl(generation.id)}>
                          <Download size={15} />
                          Скачать
                        </a>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {generations.length === 0 ? <div className="emptyState">Генераций пока нет</div> : null}
        </section>
      </section>
    </main>
  );
}
