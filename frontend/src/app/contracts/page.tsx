import Link from 'next/link';
import { Download, Eye } from 'lucide-react';
import { getContracts, generationDownloadUrl } from '@/shared/api/contracts.api';
import {
  contractTypeLabel,
  formatDate,
  formatDateTime,
  formatMoney,
  paymentTypeLabel,
} from '@/shared/lib/format';
import { Header } from '@/widgets/header/Header';
import { Sidebar } from '@/widgets/sidebar/Sidebar';

export default async function ContractsPage() {
  const contracts = await getContracts();

  return (
    <main className="shell">
      <Sidebar />
      <section className="workspace">
        <Header title="Договоры" />
        <section className="panel pagePanel">
          <div className="panelHeader">
            <h2>История договоров</h2>
          </div>
          <div className="tableWrap">
            <table className="dataTable">
              <thead>
                <tr>
                  <th>Номер</th>
                  <th>Дата</th>
                  <th>Клиент</th>
                  <th>Тип договора</th>
                  <th>Тип оплаты</th>
                  <th>Сумма</th>
                  <th>Шаблон</th>
                  <th>Дата создания</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {contracts.map(contract => (
                  <tr key={contract.id}>
                    <td>{contract.number}</td>
                    <td>{formatDate(contract.date)}</td>
                    <td>{contract.client?.shortName ?? contract.client?.name ?? '—'}</td>
                    <td>{contractTypeLabel(contract.type)}</td>
                    <td>{paymentTypeLabel(contract.paymentType)}</td>
                    <td>{formatMoney(contract.amount)}</td>
                    <td>{contract.template?.code ?? '—'}</td>
                    <td>{formatDateTime(contract.createdAt)}</td>
                    <td>
                      <div className="rowActions">
                        <Link className="actionLink" href={`/contracts/${contract.id}`}>
                          <Eye size={15} />
                          Открыть
                        </Link>
                        {contract.latestGeneration ? (
                          <a
                            className="actionLink"
                            href={generationDownloadUrl(contract.latestGeneration.id)}
                          >
                            <Download size={15} />
                            Скачать
                          </a>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {contracts.length === 0 ? <div className="emptyState">Договоры пока не созданы</div> : null}
        </section>
      </section>
    </main>
  );
}
