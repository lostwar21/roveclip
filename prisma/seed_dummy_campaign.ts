import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Menyiapkan data simulasi Brand dan Kampanye...');

  let brand = await prisma.user.findUnique({
    where: { email: 'brand_test@roveclip.com' }
  });

  if (!brand) {
    const pwd = await bcrypt.hash('password123', 10);
    brand = await prisma.user.create({
      data: {
        email: 'brand_test@roveclip.com',
        name: 'Simulated Brand (Nike)',
        role: 'BRAND',
        password: pwd,
        wallet_balance: 5000.00
      }
    });
  }

  const campaign = await prisma.campaign.create({
    data: {
      brand_id: brand.id,
      video_url: 'https://www.youtube.com/watch?v=123456789 (Video Promosi Sepatu)',
      cpm_rate: 15.00,
      total_budget: 1000.00,
      status: 'ACTIVE'
    }
  });

  console.log('Berhasil! Kampanye baru telah ditambahkan ke Marketplace.');
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
