import Link from 'next/link';
import { getTemplate } from '@/shared/api/contracts.api';
import {
  booleanLabel,
  contractTypeLabel,
  legalTypeLabel,
  paymentTypeLabel,
} from '@/shared/lib/format';
import { Header } from '@/widgets/header/Header';
import { Sidebar } from '@/widgets/sidebar/Sidebar';

interface TemplateDetailsPageProps {
  params: {
    id: string;
  };
}

export default async function TemplateDetailsPage({ params }: TemplateDetailsPageProps) {
  const template = await getTemplate(Number(params.id));

  return (
    <main className="shell">
      <Sidebar />
      <section className="workspace">
        <Header title={template ? template.name : 'Template not found'} />
        {!template ? (
          <section className="panel pagePanel">
            <div className="emptyState">Шаблон не найден</div>
          </section>
        ) : (
          <section className="panel pagePanel">
            <div className="panelHeader">
              <h2>Карточка шаблона</h2>
            </div>
            <dl className="detailsList">
              <div><dt>Статус</dt><dd>{template.isActive ? 'Активен' : 'Неактивен'}</dd></div>
              <div><dt>Код</dt><dd>{template.code}</dd></div>
              <div><dt>Название</dt><dd>{template.name}</dd></div>
              <div><dt>Тип</dt><dd>{contractTypeLabel(template.type)}</dd></div>
              <div><dt>Юр. тип</dt><dd>{legalTypeLabel(template.legalType)}</dd></div>
              <div><dt>Оплата</dt><dd>{paymentTypeLabel(template.paymentType)}</dd></div>
              <div><dt>ТЗ</dt><dd>{booleanLabel(template.hasTz)}</dd></div>
              <div><dt>Файл</dt><dd>{template.filePath}</dd></div>
              <div><dt>Файл найден</dt><dd>{booleanLabel(template.fileExists)}</dd></div>
            </dl>
            <Link className="backLink" href="/templates">К списку шаблонов</Link>
          </section>
        )}
      </section>
    </main>
  );
}
