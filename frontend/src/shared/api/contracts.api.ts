import { env } from '../config/env';
import type {
  FullGeneratePayload,
  FullGenerateResponse,
} from '@/features/create-document/types';

export interface ApiClient {
  id: number;
  legalType: string;
  name: string;
  shortName?: string | null;
  inn?: string | null;
}

export interface ApiTemplate {
  id: number;
  code: string;
  name: string;
  type?: string | null;
  legalType?: string | null;
  paymentType?: string | null;
  hasTz?: boolean | null;
  isActive: boolean;
  filePath: string;
  fileExists?: boolean;
}

export interface ApiGeneration {
  id: number;
  contractId: number;
  status: 'PENDING' | 'PROCESSING' | 'SUCCESS' | 'FAILED';
  fileName?: string | null;
  filePath?: string | null;
  errorMessage?: string | null;
  createdAt: string;
  updatedAt: string;
  externalSource?: string | null;
  externalId?: string | null;
  contract?: ApiContract;
}

export interface ApiContract {
  id: number;
  number: string;
  date: string;
  city: string;
  type: string;
  legalType: string;
  paymentType: string;
  amount: string | number;
  prepaymentPercent?: number | null;
  postpaymentPercent?: number | null;
  prepaymentAmount?: string | number | null;
  postpaymentAmount?: string | number | null;
  estimateJson?: unknown;
  createdAt: string;
  updatedAt: string;
  externalSource?: string | null;
  externalId?: string | null;
  client?: ApiClient | null;
  template?: ApiTemplate | null;
  latestGeneration?: ApiGeneration | null;
  generations?: ApiGeneration[];
}

export interface DashboardStats {
  clientsCount: number;
  contractsCount: number;
  templatesCount: number;
  generatedCount: number;
}

export async function fullGenerateContract(
  payload: FullGeneratePayload,
  file: File,
): Promise<FullGenerateResponse> {
  const contractPayload = payload.contract as typeof payload.contract & { templateId?: number };
  const requestPayload = payload as FullGeneratePayload & { clientId?: number };

  console.log('[frontend/full-generate] payload', {
    type: contractPayload.type,
    legalType: contractPayload.legalType,
    paymentType: contractPayload.paymentType,
    hasTz: contractPayload.hasTz,
    date: contractPayload.date,
    city: contractPayload.city,
    templateId: contractPayload.templateId,
    clientId: requestPayload.clientId,
  });
  console.log('[frontend/full-generate] file', {
    fileName: file.name,
    size: file.size,
  });

  const formData = new FormData();
  formData.append('payload', JSON.stringify(payload));
  formData.append('file', file);

  const response = await fetch(`${env.apiUrl}/contracts/full-generate`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    console.log('[frontend/full-generate] response error', {
      status: response.status,
      message: error?.message,
    });
    throw new Error(error?.message ?? `Request failed: ${response.status}`);
  }

  const result = await response.json() as FullGenerateResponse;
  console.log('[frontend/full-generate] response success', result);

  return result;
}

export async function getContracts(): Promise<ApiContract[]> {
  return request('/contracts');
}

export async function getContract(id: number): Promise<ApiContract | null> {
  return request(`/contracts/${id}`);
}

export async function getGenerations(): Promise<ApiGeneration[]> {
  return request('/generations');
}

export async function getDashboardStats(): Promise<DashboardStats> {
  return request('/dashboard/stats');
}

export async function getTemplates(): Promise<ApiTemplate[]> {
  return request('/templates');
}

export async function getTemplate(id: number): Promise<ApiTemplate | null> {
  return request(`/templates/${id}`);
}

export async function getGeneration(id: number): Promise<ApiGeneration | null> {
  return request(`/generations/${id}`);
}

export function generationDownloadUrl(id: number) {
  return `${env.apiUrl}/generations/${id}/download`;
}

async function request<T>(path: string): Promise<T> {
  const response = await fetch(`${env.apiUrl}${path}`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.message ?? `Request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}
