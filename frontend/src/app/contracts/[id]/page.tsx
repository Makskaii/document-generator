import Link from 'next/link';
import { Download } from 'lucide-react';
import { getContract, generationDownloadUrl } from '@/shared/api/contracts.api';
import {
  contractTypeLabel,
  formatDate,
  formatDateTime,
  formatMoney,
  paymentTypeLabel,
  statusLabel,
} from '@/shared/lib/format';
import { Header } from '@/widgets/header/Header';
import { Sidebar } from '@/widgets/sidebar/Sidebar';

interface ContractDetailsPageProps {
  params: {
    id: string;
  };
}

export default async function ContractDetailsPage({ params }: ContractDetailsPageProps) {
  const contract = await getContract(Number(params.id));
  const estimate = contract?.estimateJson as any;

  return (
    <main className="shell">
      <Sidebar />
      <section className="workspace">
        <Header title={contract ? `Договор ${contract.number}` : 'Договор не найден'} />
        {!contract ? (
          <section className="panel pagePanel">
            <div className="emptyState">Договор не найден</div>
          </section>
        ) : (
          <div className="detailsGrid">
            <section className="panel">
              <div className="panelHeader">
                <h2>Данные договора</h2>
              </div>
              <dl className="detailsList">
                <div><dt>Номер</dt><dd>{contract.number}</dd></div>
                <div><dt>Дата</dt><dd>{formatDate(contract.date)}</dd></div>
                <div><dt>Город</dt><dd>{contract.city}</dd></div>
                <div><dt>Тип договора</dt><dd>{contractTypeLabel(contract.type)}</dd></div>
                <div><dt>Тип оплаты</dt><dd>{paymentTypeLabel(contract.paymentType)}</dd></div>
                <div><dt>Шаблон</dt><dd>{contract.template?.code ?? '—'}</dd></div>
                <div><dt>Источник</dt><dd>{contract.externalSource ?? 'Локально'}</dd></div>
                <div><dt>Внешний ID</dt><dd>{contract.externalId ?? '—'}</dd></div>
              </dl>
            </section>

            <section className="panel">
              <div className="panelHeader">
                <h2>Клиент</h2>
              </div>
              <dl className="detailsList">
                <div><dt>Название</dt><dd>{contract.client?.name ?? '—'}</dd></div>
                <div><dt>Краткое название</dt><dd>{contract.client?.shortName ?? '—'}</dd></div>
                <div><dt>Юр. тип</dt><dd>{contract.client?.legalType ?? '—'}</dd></div>
                <div><dt>ИНН</dt><dd>{contract.client?.inn ?? '—'}</dd></div>
              </dl>
            </section>

            <section className="panel">
              <div className="panelHeader">
                <h2>Смета и сумма</h2>
              </div>
              <dl className="detailsList">
                <div><dt>Сумма</dt><dd>{formatMoney(contract.amount)}</dd></div>
                <div><dt>Предоплата</dt><dd>{formatMoney(contract.prepaymentAmount)}</dd></div>
                <div><dt>Постоплата</dt><dd>{formatMoney(contract.postpaymentAmount)}</dd></div>
                <div><dt>Проект</dt><dd>{estimate?.metadata?.projectName ?? '—'}</dd></div>
                <div><dt>Всего часов</dt><dd>{estimate?.totalHours ?? '—'}</dd></div>
                <div><dt>Предупреждения</dt><dd>{estimate?.warnings?.length ?? 0}</dd></div>
              </dl>
            </section>

            <section className="panel detailsWide">
              <div className="panelHeader">
                <h2>Генерации</h2>
              </div>
              <div className="tableWrap">
                <table className="dataTable">
                  <thead>
                    <tr>
                      <th>Дата</th>
                      <th>Статус</th>
                      <th>Файл</th>
                      <th>Ошибка</th>
                      <th>Действия</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(contract.generations ?? []).map(generation => (
                      <tr key={generation.id}>
                        <td>{formatDateTime(generation.createdAt)}</td>
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
              <Link className="backLink" href="/contracts">К списку договоров</Link>
            </section>
          </div>
        )}
      </section>
    </main>
  );
}
