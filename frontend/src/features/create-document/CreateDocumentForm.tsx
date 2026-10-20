'use client';

import { ChangeEvent, FormEvent, useMemo, useState } from 'react';
import { Download, FileSpreadsheet, FileText, Loader2, Moon, Sun } from 'lucide-react';
import { fullGenerateContract } from '@/shared/api/contracts.api';
import { env } from '@/shared/config/env';
import {
  ContractType,
  FullGenerateResponse,
  LegalType,
  PaymentType,
} from './types';

const contractTypes: ContractType[] = ['CRM', 'SITE', 'TRAINING'];
const legalTypes: LegalType[] = ['OOO', 'IP'];
const paymentTypes: PaymentType[] = ['SINGLE', 'DOUBLE'];
const optionLabels: Record<ContractType | LegalType | PaymentType, string> = {
  CRM: 'CRM',
  SITE: 'Сайт',
  TRAINING: 'Обучение',
  OOO: 'ООО',
  IP: 'ИП',
  SINGLE: 'Одна оплата',
  DOUBLE: 'Две оплаты',
};
const contractTypePresets: Record<
  ContractType,
  {
    templateCode: string;
    legalType: LegalType;
    paymentType: PaymentType;
    hasTz: boolean;
  }
> = {
  CRM: {
    templateCode: 'crm_ooo_double',
    legalType: 'OOO',
    paymentType: 'DOUBLE',
    hasTz: true,
  },
  SITE: {
    templateCode: 'site_ip_single_tz',
    legalType: 'IP',
    paymentType: 'SINGLE',
    hasTz: true,
  },
  TRAINING: {
    templateCode: 'training_ooo_single',
    legalType: 'OOO',
    paymentType: 'SINGLE',
    hasTz: false,
  },
};

interface CreateDocumentFormProps {
  onGenerated?: () => void;
}

export function CreateDocumentForm({ onGenerated }: CreateDocumentFormProps) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [type, setType] = useState<ContractType>('CRM');
  const [templateCode, setTemplateCode] = useState(contractTypePresets.CRM.templateCode);
  const [legalType, setLegalType] = useState<LegalType>('OOO');
  const [paymentType, setPaymentType] = useState<PaymentType>('DOUBLE');
  const [hasTz, setHasTz] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<FullGenerateResponse | null>(null);

  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    city: 'г. Пенза',
    name: '',
    shortName: '',
    inn: '',
    kpp: '',
    ogrn: '',
    ogrnip: '',
    legalAddress: '',
    postalAddress: '',
    bankName: '',
    bankAccount: '',
    correspondentAccount: '',
    bik: '',
    signerPosition: '',
    signerFullName: '',
    signerGenitiveName: '',
    signerShortName: '',
    signerBase: '',
    prepaymentPercent: '70',
    postpaymentPercent: '30',
    servicePeriodValue: '3',
    servicePeriodUnit: 'месяца',
    tzPeriodValue: '14',
    tzPeriodUnit: 'дней',
    warrantyPeriodValue: '1',
    warrantyPeriodUnit: 'месяц',
  });

  const downloadUrl = useMemo(() => {
    if (!result) {
      return null;
    }

    return `${env.apiUrl}${result.downloadUrl}`;
  }, [result]);

  function updateField(event: ChangeEvent<HTMLInputElement>) {
    setForm(current => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  }

  function handleContractTypeChange(nextType: ContractType) {
    const preset = contractTypePresets[nextType];

    console.log('[create-document-form] type changed', {
      type: nextType,
      templateCode: preset.templateCode,
      legalType: preset.legalType,
      paymentType: preset.paymentType,
      hasTz: preset.hasTz,
    });
    setType(nextType);
    setTemplateCode(preset.templateCode);
    setLegalType(preset.legalType);
    setPaymentType(preset.paymentType);
    setHasTz(preset.hasTz);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setResult(null);

    console.log('[create-document-form] submit', {
      type,
      templateCode,
      legalType,
      paymentType,
      hasTz,
      prepaymentPercent: form.prepaymentPercent,
      postpaymentPercent: form.postpaymentPercent,
      servicePeriodValue: form.servicePeriodValue,
      servicePeriodUnit: form.servicePeriodUnit,
      tzPeriodValue: form.tzPeriodValue,
      tzPeriodUnit: form.tzPeriodUnit,
      warrantyPeriodValue: form.warrantyPeriodValue,
      warrantyPeriodUnit: form.warrantyPeriodUnit,
      fileName: file?.name,
    });

    if (!file) {
      setError('Загрузите .xlsx смету');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fullGenerateContract(
        {
          client: {
            legalType,
            name: form.name,
            shortName: form.shortName || undefined,
            inn: form.inn || undefined,
            kpp: legalType === 'OOO' ? form.kpp || undefined : undefined,
            ogrn: legalType === 'OOO' ? form.ogrn || undefined : undefined,
            ogrnip: legalType === 'IP' ? form.ogrnip || undefined : undefined,
            legalAddress: form.legalAddress || undefined,
            postalAddress: form.postalAddress || undefined,
            bankName: form.bankName || undefined,
            bankAccount: form.bankAccount || undefined,
            correspondentAccount: form.correspondentAccount || undefined,
            bik: form.bik || undefined,
            signerPosition: form.signerPosition || undefined,
            signerFullName: form.signerFullName || undefined,
            signerGenitiveName: form.signerGenitiveName || undefined,
            signerShortName: form.signerShortName || undefined,
            signerBase: form.signerBase || undefined,
          },
          contract: {
            date: form.date,
            city: form.city || undefined,
            templateCode,
            type,
            legalType,
            paymentType,
            hasTz,
            prepaymentPercent:
              paymentType === 'DOUBLE' ? Number(form.prepaymentPercent) : undefined,
            postpaymentPercent:
              paymentType === 'DOUBLE' ? Number(form.postpaymentPercent) : undefined,
            servicePeriodValue: form.servicePeriodValue
              ? Number(form.servicePeriodValue)
              : undefined,
            servicePeriodUnit: form.servicePeriodUnit || undefined,
            tzPeriodValue: hasTz && form.tzPeriodValue ? Number(form.tzPeriodValue) : undefined,
            tzPeriodUnit: hasTz ? form.tzPeriodUnit || undefined : undefined,
            warrantyPeriodValue: form.warrantyPeriodValue
              ? Number(form.warrantyPeriodValue)
              : undefined,
            warrantyPeriodUnit: form.warrantyPeriodUnit || undefined,
          },
        },
        file,
      );

      setResult(response);
      onGenerated?.();
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Не удалось сгенерировать договор',
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="generatorSurface" data-theme={theme}>
      <div className="formTopbar">
        <div>
          <h2>Генерация договора</h2>
          <p>Создание договора, загрузка сметы и получение DOCX</p>
        </div>
        <button
          className="iconButton"
          type="button"
          aria-label="Toggle theme"
          onClick={() => setTheme(current => (current === 'light' ? 'dark' : 'light'))}
        >
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>
      </div>

      <form className="documentForm" onSubmit={handleSubmit}>
        <section className="formSection">
          <div className="sectionTitle">
            <h3>Тип договора</h3>
          </div>
          <div className="segmentedGrid">
            <SegmentedGroup
              label="Тип"
              value={type}
              values={contractTypes}
              onChange={value => handleContractTypeChange(value as ContractType)}
            />
            <SegmentedGroup
              label="Юр. тип"
              value={legalType}
              values={legalTypes}
              onChange={value => setLegalType(value as LegalType)}
            />
            <SegmentedGroup
              label="Оплата"
              value={paymentType}
              values={paymentTypes}
              onChange={value => setPaymentType(value as PaymentType)}
            />
          </div>
          <label className="checkboxLine">
            <input checked={hasTz} type="checkbox" onChange={event => setHasTz(event.target.checked)} />
            <span>С техническим заданием</span>
          </label>
        </section>

        <section className="formSection">
          <div className="sectionTitle">
            <h3>Заказчик</h3>
          </div>
          <div className="fieldGrid">
            <TextField label="Полное название" name="name" required value={form.name} onChange={updateField} />
            <TextField label="Краткое название" name="shortName" value={form.shortName} onChange={updateField} />
            <TextField label="ИНН" name="inn" value={form.inn} onChange={updateField} />
            {legalType === 'OOO' ? (
              <>
                <TextField label="КПП" name="kpp" value={form.kpp} onChange={updateField} />
                <TextField label="ОГРН" name="ogrn" value={form.ogrn} onChange={updateField} />
              </>
            ) : (
              <TextField label="ОГРНИП" name="ogrnip" value={form.ogrnip} onChange={updateField} />
            )}
            <TextField label="Юр. адрес" name="legalAddress" value={form.legalAddress} onChange={updateField} />
            <TextField label="Почтовый адрес" name="postalAddress" value={form.postalAddress} onChange={updateField} />
          </div>
        </section>

        <section className="formSection">
          <div className="sectionTitle">
            <h3>Реквизиты и подписант</h3>
          </div>
          <div className="fieldGrid">
            <TextField label="Банк" name="bankName" value={form.bankName} onChange={updateField} />
            <TextField label="Расчётный счёт" name="bankAccount" value={form.bankAccount} onChange={updateField} />
            <TextField label="Корр. счёт" name="correspondentAccount" value={form.correspondentAccount} onChange={updateField} />
            <TextField label="БИК" name="bik" value={form.bik} onChange={updateField} />
            <TextField label="Должность" name="signerPosition" value={form.signerPosition} onChange={updateField} />
            <TextField label="ФИО" name="signerFullName" value={form.signerFullName} onChange={updateField} />
            <TextField label="ФИО в род. падеже" name="signerGenitiveName" value={form.signerGenitiveName} onChange={updateField} />
            <TextField label="Краткое ФИО" name="signerShortName" value={form.signerShortName} onChange={updateField} />
            <TextField label="Основание" name="signerBase" value={form.signerBase} onChange={updateField} />
          </div>
        </section>

        <section className="formSection">
          <div className="sectionTitle">
            <h3>Сроки и оплата</h3>
          </div>
          <div className="fieldGrid compact">
            <TextField label="Дата" name="date" required type="date" value={form.date} onChange={updateField} />
            <TextField label="Город" name="city" required value={form.city} onChange={updateField} />
            {paymentType === 'DOUBLE' ? (
              <>
                <TextField label="Предоплата, %" name="prepaymentPercent" required type="number" value={form.prepaymentPercent} onChange={updateField} />
                <TextField label="Постоплата, %" name="postpaymentPercent" required type="number" value={form.postpaymentPercent} onChange={updateField} />
              </>
            ) : null}
            <TextField label="Срок услуги" name="servicePeriodValue" type="number" value={form.servicePeriodValue} onChange={updateField} />
            <TextField label="Ед. срока услуги" name="servicePeriodUnit" value={form.servicePeriodUnit} onChange={updateField} />
            {hasTz ? (
              <>
                <TextField label="Срок ТЗ" name="tzPeriodValue" type="number" value={form.tzPeriodValue} onChange={updateField} />
                <TextField label="Ед. срока ТЗ" name="tzPeriodUnit" value={form.tzPeriodUnit} onChange={updateField} />
              </>
            ) : null}
            <TextField label="Гарантия" name="warrantyPeriodValue" type="number" value={form.warrantyPeriodValue} onChange={updateField} />
            <TextField label="Ед. гарантии" name="warrantyPeriodUnit" value={form.warrantyPeriodUnit} onChange={updateField} />
          </div>
        </section>

        <section className="formSection">
          <div className="sectionTitle">
            <h3>Смета</h3>
          </div>
          <label className="fileDrop">
            <FileSpreadsheet size={22} />
            <span>{file ? file.name : 'Выберите .xlsx файл'}</span>
            <input
              accept=".xlsx"
              type="file"
              onChange={event => setFile(event.target.files?.[0] ?? null)}
            />
          </label>
        </section>

        {error ? <div className="statusMessage error">{error}</div> : null}
        {downloadUrl ? (
          <div className="statusMessage success">
            <span>{result?.fileName}</span>
            <a href={downloadUrl}>
              <Download size={16} />
              Скачать DOCX
            </a>
          </div>
        ) : null}

        <button className="submitButton" disabled={isSubmitting} type="submit">
          {isSubmitting ? <Loader2 className="spin" size={18} /> : <FileText size={18} />}
          <span>{isSubmitting ? 'Генерация' : 'Сгенерировать договор'}</span>
        </button>
      </form>
    </section>
  );
}

interface TextFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  type?: string;
}

function TextField({ label, name, value, onChange, required, type = 'text' }: TextFieldProps) {
  return (
    <label className="field">
      <span>{required ? `${label} *` : label}</span>
      <input name={name} required={required} type={type} value={value} onChange={onChange} />
    </label>
  );
}

interface SegmentedGroupProps {
  label: string;
  value: string;
  values: string[];
  onChange: (value: string) => void;
}

function SegmentedGroup({ label, value, values, onChange }: SegmentedGroupProps) {
  return (
    <div className="segmentedGroup">
      <span>{label}</span>
      <div className="segmentedControl">
        {values.map(item => (
          <button
            className={item === value ? 'active' : ''}
            key={item}
            type="button"
            onClick={() => onChange(item)}
          >
            {optionLabels[item as ContractType | LegalType | PaymentType] ?? item}
          </button>
        ))}
      </div>
    </div>
  );
}
