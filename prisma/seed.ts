import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Cleaning existing data (if any)...')
  await prisma.transactionLedger.deleteMany()
  await prisma.submission.deleteMany()
  await prisma.campaign.deleteMany()
  await prisma.user.deleteMany()

  console.log('Seeding pure environment...')

  const adminPassword = await bcrypt.hash('password123', 10)
  
  await prisma.user.create({
    data: {
      email: 'admin@roveclip.com',
      name: 'RoveClip Admin',
      role: 'ADMIN',
      password: adminPassword,
      wallet_balance: 0
    }
  })

  console.log('Seed completed. Clean slate ready. Only Admin account exists.')
  console.log('Admin: admin@roveclip.com / password123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
