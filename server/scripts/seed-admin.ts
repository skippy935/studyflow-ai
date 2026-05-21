import { PrismaClient } from '@prisma/client';

const p = new PrismaClient();

async function main() {
  await p.admin.upsert({
    where: { email: 'danny.sam.allen@gmail.com' },
    update: {
      passwordHash: '$2a$12$IFLaWBJwWruF8i4vM1LKDebxOIB0X4m3c5UGmGuTSJOK7vNdi.Eaa',
      role: 'SUPER_ADMIN',
      inviteAccepted: true,
      isActive: true,
      displayName: 'Danny Allen',
    },
    create: {
      email: 'danny.sam.allen@gmail.com',
      passwordHash: '$2a$12$IFLaWBJwWruF8i4vM1LKDebxOIB0X4m3c5UGmGuTSJOK7vNdi.Eaa',
      displayName: 'Danny Allen',
      role: 'SUPER_ADMIN',
      inviteAccepted: true,
      isActive: true,
    },
  });
  console.log('✓ Admin seeded: danny.sam.allen@gmail.com');
}

main()
  .then(() => p.$disconnect())
  .catch(e => { console.error(e); p.$disconnect(); process.exit(1); });
