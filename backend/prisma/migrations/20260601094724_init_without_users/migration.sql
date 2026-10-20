-- CreateEnum
CREATE TYPE "LegalType" AS ENUM ('OOO', 'IP');

-- CreateEnum
CREATE TYPE "ContractType" AS ENUM ('CRM', 'SITE', 'TRAINING');

-- CreateEnum
CREATE TYPE "PaymentType" AS ENUM ('SINGLE', 'DOUBLE');

-- CreateEnum
CREATE TYPE "GenerationStatus" AS ENUM ('PENDING', 'PROCESSING', 'SUCCESS', 'FAILED');

-- CreateTable
CREATE TABLE "Client" (
    "id" SERIAL NOT NULL,
    "legalType" "LegalType" NOT NULL,
    "name" TEXT NOT NULL,
    "shortName" TEXT,
    "inn" TEXT,
    "kpp" TEXT,
    "ogrn" TEXT,
    "ogrnip" TEXT,
    "legalAddress" TEXT,
    "postalAddress" TEXT,
    "bankName" TEXT,
    "bankAccount" TEXT,
    "correspondentAccount" TEXT,
    "bik" TEXT,
    "signerPosition" TEXT,
    "signerFullName" TEXT,
    "signerGenitiveName" TEXT,
    "signerShortName" TEXT,
    "signerBase" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Template" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "ContractType" NOT NULL,
    "legalType" "LegalType",
    "paymentType" "PaymentType",
    "hasTz" BOOLEAN,
    "filePath" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Template_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contract" (
    "id" SERIAL NOT NULL,
    "number" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "city" TEXT NOT NULL DEFAULT 'Penza',
    "type" "ContractType" NOT NULL,
    "legalType" "LegalType" NOT NULL,
    "paymentType" "PaymentType" NOT NULL,
    "hasTz" BOOLEAN NOT NULL DEFAULT false,
    "amount" DECIMAL(12,2) NOT NULL,
    "amountText" TEXT,
    "prepaymentPercent" INTEGER,
    "postpaymentPercent" INTEGER,
    "prepaymentAmount" DECIMAL(12,2),
    "postpaymentAmount" DECIMAL(12,2),
    "servicePeriodValue" INTEGER,
    "servicePeriodUnit" TEXT,
    "tzPeriodValue" INTEGER,
    "tzPeriodUnit" TEXT,
    "warrantyPeriodValue" INTEGER,
    "warrantyPeriodUnit" TEXT,
    "estimateJson" JSONB,
    "formDataJson" JSONB,
    "clientId" INTEGER NOT NULL,
    "templateId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Contract_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Generation" (
    "id" SERIAL NOT NULL,
    "contractId" INTEGER NOT NULL,
    "status" "GenerationStatus" NOT NULL DEFAULT 'PENDING',
    "fileName" TEXT,
    "filePath" TEXT,
    "errorMessage" TEXT,
    "sourceDataJson" JSONB,
    "createdBy" TEXT DEFAULT 'manual',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Generation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContractCounter" (
    "id" SERIAL NOT NULL,
    "dateKey" TEXT NOT NULL,
    "value" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContractCounter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AppSetting" (
    "id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AppSetting_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Template_code_key" ON "Template"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Contract_number_key" ON "Contract"("number");

-- CreateIndex
CREATE UNIQUE INDEX "ContractCounter_dateKey_key" ON "ContractCounter"("dateKey");

-- CreateIndex
CREATE UNIQUE INDEX "AppSetting_key_key" ON "AppSetting"("key");

-- AddForeignKey
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "Template"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Generation" ADD CONSTRAINT "Generation_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "Contract"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
