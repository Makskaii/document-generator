import { Injectable } from '@nestjs/common';
import { moneyToWords } from '../../shared/helpers/number-to-words.helper';

@Injectable()
export class DocumentContextBuilder {
  build(contract: any) {
    const amount = Number(contract.amount);
    const prepaymentAmount = this.getPaymentAmount(
      amount,
      contract.prepaymentPercent,
      contract.prepaymentAmount,
    );
    const postpaymentAmount = this.getPaymentAmount(
      amount,
      contract.postpaymentPercent,
      contract.postpaymentAmount,
    );
    const estimateWorks = this.buildEstimateWorks(contract.estimateJson);

    return {
      contract_number: contract.number,
      contract_city: contract.city ?? '',
      contract_date: this.formatDate(contract.date),
      contract_date_text: this.formatDate(contract.date),
      client_name: contract.client?.shortName ?? contract.client?.name ?? '',
      client_full_name: contract.client?.name ?? '',
      client_legal_address: contract.client?.legalAddress ?? '',
      client_postal_address: contract.client?.postalAddress ?? '',
      client_bank_name: contract.client?.bankName ?? '',
      client_bank_account: contract.client?.bankAccount ?? '',
      client_bik: contract.client?.bik ?? '',
      client_correspondent_account: contract.client?.correspondentAccount ?? '',
      client_signer_position: contract.client?.signerPosition ?? '',
      client_signer_position_genitive: this.toPositionGenitive(contract.client?.signerPosition),
      client_signer_full_name: contract.client?.signerFullName ?? '',
      client_signer_genitive_name: contract.client?.signerGenitiveName ?? '',
      client_signer_short_name: contract.client?.signerShortName ?? '',
      client_signer_base: contract.client?.signerBase ?? '',
      client_inn: contract.client?.inn ?? '',
      client_kpp: contract.client?.kpp ?? '',
      client_ogrn: contract.client?.ogrn ?? '',
      client_ogrnip: contract.client?.ogrnip ?? '',
      amount: this.formatAmount(amount),
      amount_number: this.formatAmount(amount),
      amount_text: moneyToWords(amount),
      prepayment_percent: contract.prepaymentPercent ?? '',
      prepayment_amount: this.formatAmount(prepaymentAmount),
      prepayment_amount_text: moneyToWords(prepaymentAmount),
      postpayment_percent: contract.postpaymentPercent ?? '',
      postpayment_amount: this.formatAmount(postpaymentAmount),
      postpayment_amount_text: moneyToWords(postpaymentAmount),
      staff_hiring_penalty_amount: this.formatAmount(0),
      staff_hiring_penalty_amount_text: moneyToWords(0),
      service_period_text: this.formatPeriod(contract.servicePeriodValue, contract.servicePeriodUnit),
      tz_period_text: this.formatPeriod(contract.tzPeriodValue, contract.tzPeriodUnit),
      warranty_period_text: this.formatPeriod(contract.warrantyPeriodValue, contract.warrantyPeriodUnit),
      estimate_works: estimateWorks,
      estimate_total_amount: this.formatAmount(this.getEstimateTotalAmount(contract.estimateJson)),
      estimate_total_hours: this.getEstimateTotalHours(contract.estimateJson),
    };
  }

  private formatDate(value: Date | string) {
    const date = new Date(value);
    return new Intl.DateTimeFormat('ru-RU', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }).format(date);
  }

  private formatAmount(value: number) {
    return new Intl.NumberFormat('ru-RU', {
      maximumFractionDigits: 2,
    }).format(value);
  }

  private getPaymentAmount(amount: number, percent?: number | null, stored?: unknown) {
    if (typeof percent === 'number') {
      return (amount * percent) / 100;
    }

    return Number(stored ?? 0);
  }

  private buildEstimateWorks(estimateJson: any) {
    const stages = Array.isArray(estimateJson?.stages) ? estimateJson.stages : [];
    let index = 0;

    return stages.flatMap((stage: any) => {
      const works = Array.isArray(stage?.works) ? stage.works : [];

      return works.map((work: any) => {
        index += 1;

        return {
          index,
          name: String(work?.name ?? ''),
          amount: this.formatAmount(Number(work?.amount ?? 0)),
          total_hours: Number(work?.totalHours ?? 0),
          stage_title: stage?.title ?? work?.stageTitle ?? '',
        };
      });
    });
  }

  private getEstimateTotalAmount(estimateJson: any) {
    return Number(estimateJson?.totalAmount ?? 0);
  }

  private getEstimateTotalHours(estimateJson: any) {
    return Number(estimateJson?.totalHours ?? 0);
  }

  private formatPeriod(value?: number | null, unit?: string | null) {
    if (!value || !unit) {
      return '';
    }

    return `${value} ${unit}`;
  }

  private toPositionGenitive(position?: string | null) {
    if (!position) {
      return '';
    }

    if (position === 'Генеральный директор') {
      return 'Генерального директора';
    }

    if (position === 'Директор') {
      return 'Директора';
    }

    return position;
  }
}
