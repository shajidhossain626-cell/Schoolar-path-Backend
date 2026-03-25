require('dotenv').config()
const { PrismaClient } = require('@prisma/client')
const { PrismaNeon } = require('@prisma/adapter-neon')
const bcrypt = require('bcryptjs')

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 Seeding database...')

  const adminPass = await bcrypt.hash('admin123456', 12)
  await prisma.user.upsert({
    where: { email: 'admin@scholarpath.com.bd' },
    update: {},
    create: {
      email: 'admin@scholarpath.com.bd',
      password: adminPass,
      firstName: 'Admin',
      lastName: 'ScholarPath',
      role: 'ADMIN',
      plan: 'PREMIUM',
      isVerified: true,
    },
  })
  console.log('✅ Admin user: admin@scholarpath.com.bd / admin123456')

  const userPass = await bcrypt.hash('test123456', 12)
  await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      password: userPass,
      firstName: 'Rafiqul',
      lastName: 'Alam',
      role: 'USER',
      plan: 'STANDARD',
      isVerified: true,
    },
  })
  console.log('✅ Test user: test@example.com / test123456')

  const scholarships = [
    {
      slug: 'daad-research-2025', flag: '🇩🇪', country: 'Germany',
      name: 'DAAD Research Scholarship 2025', shortName: 'DAAD',
      description: "Fully funded for Master's & PhD. Covers tuition, living costs, insurance, and travel.",
      tags: JSON.stringify(["Master's", 'PhD', 'Engineering']),
      amount: '€934/month', deadline: new Date('2025-12-31'),
      isUrgent: true, funding: 'FULL',
      degree: JSON.stringify(['MASTERS', 'PHD']), field: 'ENGINEERING',
      overview: "The DAAD Scholarship is one of the world's most prestigious funding programs.",
      benefits: JSON.stringify(['Monthly stipend €934', 'Full tuition waiver', 'Round-trip airfare', 'Health insurance']),
      eligibility: JSON.stringify(['Bangladeshi nationality', "Bachelor's CGPA ≥ 3.0", 'IELTS 6.5']),
      documents: JSON.stringify(['DAAD application form', 'CV', 'Statement of Purpose', '2 recommendation letters']),
      steps: JSON.stringify(['Register at portal.daad.de', 'Contact German professor', 'Submit application']),
    },
    {
      slug: 'chevening-2025', flag: '🇬🇧', country: 'United Kingdom',
      name: 'Chevening Scholarship 2025', shortName: 'Chevening',
      description: "UK government flagship scholarship. Full funding for 1-year Master's.",
      tags: JSON.stringify(["Master's", 'Leadership']),
      amount: 'Full + £1,393/mo', deadline: new Date('2025-11-05'),
      isUrgent: false, funding: 'FULL',
      degree: JSON.stringify(['MASTERS']), field: 'SOCIAL',
      overview: "Chevening is the UK government's international awards programme.",
      benefits: JSON.stringify(['Full tuition fees', 'Monthly allowance £1,393', 'Return flights']),
      eligibility: JSON.stringify(['Bangladeshi citizen', '2+ years work experience', 'IELTS 6.5']),
      documents: JSON.stringify(['Application at chevening.org', '4 personal statements', '2 references']),
      steps: JSON.stringify(['Register at chevening.org', 'Complete 4 essays', 'Interview']),
    },
    {
      slug: 'mext-2025', flag: '🇯🇵', country: 'Japan',
      name: 'MEXT Government Scholarship', shortName: 'MEXT',
      description: "Japanese government scholarship from bachelor's to PhD.",
      tags: JSON.stringify(["Bachelor's", "Master's", 'PhD']),
      amount: '¥143,000/month', deadline: new Date('2025-05-26'),
      isUrgent: false, funding: 'FULL',
      degree: JSON.stringify(['BACHELORS', 'MASTERS', 'PHD']), field: 'ENGINEERING',
      overview: 'The MEXT Scholarship covers tuition, living expenses, and travel.',
      benefits: JSON.stringify(['¥143,000/month', 'Full tuition waiver', 'Round-trip airfare']),
      eligibility: JSON.stringify(['Under 35', 'GPA ≥ 3.0', 'Good health']),
      documents: JSON.stringify(['Application form', 'Transcripts', 'Study plan']),
      steps: JSON.stringify(['Apply via Bangladesh Embassy', 'Written exam', 'Interview']),
    },
    {
      slug: 'gks-2025', flag: '🇰🇷', country: 'South Korea',
      name: 'GKS Graduate Scholarship 2025', shortName: 'GKS',
      description: 'Korean Government Scholarship for international graduate students.',
      tags: JSON.stringify(["Master's", 'PhD']),
      amount: '₩900,000/month', deadline: new Date('2025-04-30'),
      isUrgent: false, funding: 'FULL',
      degree: JSON.stringify(['MASTERS', 'PHD']), field: 'ENGINEERING',
      overview: 'The Global Korea Scholarship is offered by NIIED.',
      benefits: JSON.stringify(['₩900,000/month', 'Full tuition', 'Korean language training']),
      eligibility: JSON.stringify(['Under 40', 'GPA ≥ 2.64', 'Good health']),
      documents: JSON.stringify(['Application form', 'Study plan', '2 recommendation letters']),
      steps: JSON.stringify(['Submit to Bangladesh Embassy', 'Primary selection', 'Enrollment']),
    },
    {
      slug: 'fulbright-2026', flag: '🇺🇸', country: 'United States',
      name: 'Fulbright Foreign Student Program', shortName: 'Fulbright',
      description: 'Most prestigious US scholarship for graduate study and research.',
      tags: JSON.stringify(["Master's", 'PhD', 'Research']),
      amount: 'Full + Living', deadline: new Date('2026-02-15'),
      isUrgent: false, funding: 'FULL',
      degree: JSON.stringify(['MASTERS', 'PHD']), field: 'ARTS',
      overview: 'The Fulbright Program is the largest US international exchange program.',
      benefits: JSON.stringify(['Full tuition', 'Monthly stipend', 'Return flights', 'Health insurance']),
      eligibility: JSON.stringify(['Bangladeshi citizenship', "Bachelor's degree", 'IELTS 7.0']),
      documents: JSON.stringify(['IIE application', 'Transcripts', '3 recommendation letters']),
      steps: JSON.stringify(['Apply through USEFB', 'Interview in Dhaka', 'Campus placement']),
    },
    {
      slug: 'csc-2025', flag: '🇨🇳', country: 'China',
      name: 'CSC Chinese Government Scholarship', shortName: 'CSC',
      description: 'Full scholarship at top Chinese universities.',
      tags: JSON.stringify(["Bachelor's", "Master's", 'PhD']),
      amount: '¥3,000/month', deadline: new Date('2025-03-15'),
      isUrgent: true, funding: 'FULL',
      degree: JSON.stringify(['BACHELORS', 'MASTERS', 'PHD']), field: 'ENGINEERING',
      overview: 'CSC scholarships cover tuition, accommodation, and living allowance.',
      benefits: JSON.stringify(['¥3,000/month', 'Free accommodation', 'Full tuition']),
      eligibility: JSON.stringify(['Non-Chinese citizen', 'Under 35', '≥ 60% in previous degree']),
      documents: JSON.stringify(['CSC application', 'Passport', 'Transcripts', 'Study plan']),
      steps: JSON.stringify(['Register at csc.edu.cn', 'Submit application', 'Result notification']),
    },
  ]

  for (const s of scholarships) {
    await prisma.scholarship.upsert({
      where: { slug: s.slug },
      update: {},
      create: s,
    })
    console.log(`✅ Scholarship: ${s.shortName}`)
  }

  console.log('\n🎉 Database seeded!')
  console.log('Admin: admin@scholarpath.com.bd / admin123456')
  console.log('User:  test@example.com / test123456')
}

main()
  .catch(e => { console.error('❌', e); process.exit(1) })
  .finally(() => prisma.$disconnect())
