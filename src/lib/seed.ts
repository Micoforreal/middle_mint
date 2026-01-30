import { getDatabase, saveDatabase } from './db';
import { jobsDb, applicationsDb, freelancerProfilesDb } from './database';

export function seedDatabase() {
  const db = getDatabase();

  // Check if data already exists
  if (db.jobs.length > 0) {
    console.log('Database already seeded. Skipping...');
    return;
  }

  console.log('Seeding database...');
  const now = new Date().toISOString();

  // Seed freelancer profiles
  const freelancers = [
    {
      id: 'freelancer-001',
      wallet: '8a2Xu9jvhq8mK3pL9nQr5sT2vW4xY6zAb',
      name: 'alex_dev',
      speciality: 'Dev',
      rating: 4.8,
      total_earnings: 15000,
      created_at: now,
    },
    {
      id: 'freelancer-002',
      wallet: '5bN4oPq7rS2tU1vW8xY9zA0cBdEfGhIj',
      name: 'design_wizard',
      speciality: 'Design',
      rating: 4.9,
      total_earnings: 12000,
      created_at: now,
    },
    {
      id: 'freelancer-003',
      wallet: '3c9Vk6mL1nOpQrStUvWxYzAb2CdEfGhIjK',
      name: 'audit_master',
      speciality: 'Audit',
      rating: 4.7,
      total_earnings: 25000,
      created_at: now,
    },
    {
      id: 'freelancer-004',
      wallet: '7dH2JiKlMnOpQrStUvWxYzAbCdEfGhIjKlMn',
      name: 'writer_pro',
      speciality: 'Writing',
      rating: 4.6,
      total_earnings: 8000,
      created_at: now,
    },
  ];

  freelancers.forEach(freelancer => {
    freelancerProfilesDb.create(freelancer);
  });

  // Seed jobs
  const jobs = [
    {
      id: 'job-001',
      title: 'Build Solana NFT Marketplace Smart Contract',
      description:
        'We need a complete NFT marketplace on Solana with listing, bidding, and trading functionality.',
      category: 'Smart Contract' as const,
      budget: 2500,
      client_wallet: 'HN7cABqLq46Es1jh92dQQisAq662SmxvLvfo4adeHLw5',
      client_name: 'crypto_founder_01',
      requirements:
        'Provide: GitHub repo link with complete contract code, deployment instructions, test suite results',
      status: 'open' as const,
      created_at: now,
      updated_at: now,
    },
    {
      id: 'job-002',
      title: 'React Dashboard for Token Analytics',
      description: 'Create a beautiful React dashboard that displays token price data and trading volume.',
      category: 'Dev' as const,
      budget: 1500,
      client_wallet: '9HN7cABqLq46Es1jh92dQQisAq662SmxvLvfo4adeHL7',
      client_name: 'defi_dev_team',
      requirements:
        'Share: Component library, data flow diagram, API integration examples, performance metrics',
      status: 'open' as const,
      created_at: now,
      updated_at: now,
    },
    {
      id: 'job-003',
      title: 'Brand Identity Design for Web3 Startup',
      description:
        'Design complete brand identity including logo, color palette, typography for a decentralized lending platform.',
      category: 'Design' as const,
      budget: 1000,
      client_wallet: '7Nx9cABqLq46Es1jh92dQQisAq662SmxvLvfo4adeHL2',
      client_name: 'design_agency',
      requirements: 'Deliverables: Logo files (SVG, PNG), brand guidelines PDF, color palette documentation',
      status: 'open' as const,
      created_at: now,
      updated_at: now,
    },
    {
      id: 'job-004',
      title: 'Security Audit for DeFi Protocol',
      description: 'Comprehensive security audit for our lending protocol including contract review and recommendations.',
      category: 'Audit' as const,
      budget: 3000,
      client_wallet: '4Km8cABqLq46Es1jh92dQQisAq662SmxvLvfo4adeHJ9',
      client_name: 'security_team',
      requirements: 'Submit: Audit report, vulnerability assessment, remediation recommendations, risk scoring',
      status: 'open' as const,
      created_at: now,
      updated_at: now,
    },
    {
      id: 'job-005',
      title: 'Technical Blog Post on Solana Programming',
      description:
        'Write a comprehensive blog post about advanced Solana programming patterns and best practices.',
      category: 'Writing' as const,
      budget: 800,
      client_wallet: '2Lp7cABqLq46Es1jh92dQQisAq662SmxvLvfo4adeHL1',
      client_name: 'content_creator',
      requirements: 'Provide: Well-written markdown, code examples, diagrams, references to official docs',
      status: 'open' as const,
      created_at: now,
      updated_at: now,
    },
  ];

  jobs.forEach(job => {
    jobsDb.create(job);
  });

  // Seed applications
  const applications = [
    {
      id: 'app-001',
      job_id: 'job-001',
      freelancer_wallet: '8a2Xu9jvhq8mK3pL9nQr5sT2vW4xY6zAb',
      freelancer_name: 'alex_dev',
      cover_letter:
        'I have 5+ years of Solana development experience and have built multiple NFT projects. This is exactly my expertise!',
      requirements_response: 'GitHub: github.com/alex_dev/nft-projects, Experience: 3 live projects on mainnet',
      status: 'pending' as const,
      created_at: now,
      updated_at: now,
    },
    {
      id: 'app-002',
      job_id: 'job-002',
      freelancer_wallet: '5bN4oPq7rS2tU1vW8xY9zA0cBdEfGhIj',
      freelancer_name: 'design_wizard',
      cover_letter: 'I specialize in creating beautiful dashboards. React is my primary framework.',
      requirements_response: 'Portfolio: designwizard.com/dashboard-projects, React experience: 7 years',
      status: 'pending' as const,
      created_at: now,
      updated_at: now,
    },
    {
      id: 'app-003',
      job_id: 'job-003',
      freelancer_wallet: '3c9Vk6mL1nOpQrStUvWxYzAb2CdEfGhIjK',
      freelancer_name: 'audit_master',
      cover_letter: 'Professional brand designer with crypto background. Understand Web3 aesthetics.',
      requirements_response: 'Projects: 15+ successful brand identities, Crypto clients: 5+',
      status: 'pending' as const,
      created_at: now,
      updated_at: now,
    },
    {
      id: 'app-004',
      job_id: 'job-004',
      freelancer_wallet: '7dH2JiKlMnOpQrStUvWxYzAbCdEfGhIjKlMn',
      freelancer_name: 'writer_pro',
      cover_letter: 'DeFi security expert with audit experience. Can review your protocol thoroughly.',
      requirements_response: 'Audits completed: 12, Critical vulnerabilities found: 25+, Success rate: 100%',
      status: 'pending' as const,
      created_at: now,
      updated_at: now,
    },
  ];

  applications.forEach(app => {
    applicationsDb.create(app);
  });

  console.log('Database seeded successfully!');
  saveDatabase();
}
