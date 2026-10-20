import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    throw new Error('DATABASE_URL is not set');
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
    await prisma.template.upsert({
        where: { code: 'crm_ooo_double' },
        update: {},
        create: {
            code: 'crm_ooo_double',
            name: 'CRM, ООО, двойная оплата',
            type: 'CRM',
            legalType: 'OOO',
            paymentType: 'DOUBLE',
            hasTz: true,
            filePath: 'Шаблон договора crm двойная оплата ООО.docx',
            isActive: true,
        },
    });

    await prisma.template.upsert({
        where: { code: 'site_ip_single_tz' },
        update: {},
        create: {
            code: 'site_ip_single_tz',
            name: 'Сайт, ИП, 1 оплата, с ТЗ',
            type: 'SITE',
            legalType: 'IP',
            paymentType: 'SINGLE',
            hasTz: true,
            filePath: 'Шаблон договора сайт ИП 1 оплата с ТЗ.docx',
            isActive: true,
        },
    });

    await prisma.template.upsert({
        where: { code: 'training_ooo_single' },
        update: {},
        create: {
            code: 'training_ooo_single',
            name: 'Обучение, ООО, 1 оплата',
            type: 'TRAINING',
            legalType: 'OOO',
            paymentType: 'SINGLE',
            hasTz: false,
            filePath: 'Шаблон обучение 1 оплата ООО.docx',
            isActive: true,
        },
    });
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async error => {
        console.error(error);
        await prisma.$disconnect();
        process.exit(1);
    });
