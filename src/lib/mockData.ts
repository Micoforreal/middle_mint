// Mock data - simulating database
export interface MockJob {
  id: string;
  title: string;
  description: string;
  category:
    | "Dev"
    | "Smart Contract"
    | "Writing"
    | "Marketing"
    | "Design"
    | "Audit";
  budget: number;
  client_wallet: string;
  client_name: string;
  requirements: string;
  status: "open" | "in-progress" | "completed";
  created_at: string;
}

export interface MockApplication {
  id: string;
  job_id: string;
  freelancer_wallet: string;
  freelancer_name: string;
  cover_letter: string;
  requirements_response: string;
  status:
    | "pending"
    | "accepted"
    | "rejected"
    | "in-progress"
    | "submitted"
    | "completed";
  created_at: string;
}

export interface MockEscrow {
  id: string;
  job_id: string;
  application_id: string;
  client_wallet: string;
  freelancer_wallet: string;
  amount: number;
  status: "pending" | "funded" | "work-submitted" | "released" | "disputed";
  transaction_signature: string | null;
  work_submission_link: string | null;
  work_submission_proof: string | null;
  created_at: string;
  funded_at: string | null;
  released_at: string | null;
}

// Mock freelancer profiles
const MOCK_FREELANCERS = [
  {
    wallet: "8a2Xu9jvhq8mK3pL9nQr5sT2vW4xY6zAb",
    name: "alex_dev",
    speciality: "Dev",
  },
  {
    wallet: "5bN4oPq7rS2tU1vW8xY9zA0cBdEfGhIj",
    name: "design_wizard",
    speciality: "Design",
  },
  {
    wallet: "3c9Vk6mL1nOpQrStUvWxYzAb2CdEfGhIjK",
    name: "audit_master",
    speciality: "Audit",
  },
  {
    wallet: "7dH2JiKlMnOpQrStUvWxYzAbCdEfGhIjKlMn",
    name: "writer_pro",
    speciality: "Writing",
  },
  {
    wallet: "4ePmN5oP6qRsT7uVwXyZaB8cDeFgHiJkL",
    name: "marketing_guru",
    speciality: "Marketing",
  },
];

// Initial Mock Jobs
const INITIAL_JOBS: MockJob[] = [
  {
    id: "job-001",
    title: "Build Solana NFT Marketplace Smart Contract",
    description:
      "We need a complete NFT marketplace on Solana with listing, bidding, and trading functionality. The contract should include:\n\n- NFT minting and listing\n- Auction system with time-based bidding\n- Royalty support for creators\n- Security audit recommendations\n\nPlease include comprehensive error handling and documentation.",
    category: "Smart Contract",
    budget: 2500,
    client_wallet: "HN7cABqLq46Es1jh92dQQisAq662SmxvLvfo4adeHLw5",
    client_name: "crypto_founder_01",
    requirements:
      "Provide: GitHub repo link with complete contract code, deployment instructions, test suite results, security considerations document",
    status: "open",
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "job-002",
    title: "React Dashboard for Token Analytics",
    description:
      "Create a beautiful React dashboard that displays token price data, trading volume, holder distribution, and transaction history. Integrate with CoinGecko API for real-time data.\n\nRequirements:\n- Dark theme matching Solana ecosystem\n- Real-time data updates\n- Export functionality\n- Mobile responsive design",
    category: "Dev",
    budget: 1500,
    client_wallet: "9HN7cABqLq46Es1jh92dQQisAq662SmxvLvfo4adeHL7",
    client_name: "defi_dev_team",
    requirements:
      "Share: Component library, data flow diagram, API integration examples, performance metrics",
    status: "open",
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "job-003",
    title: "Brand Identity Design for Web3 Startup",
    description:
      "Design complete brand identity including logo, color palette, typography, and brand guidelines. The project is a decentralized lending platform.",
    category: "Design",
    budget: 1000,
    client_wallet: "7Nx9cABqLq46Es1jh92dQQisAq662SmxvLvfo4adeHL2",
    client_name: "design_focused_startup",
    requirements:
      "Deliverables: Logo files (SVG, PNG), style guide, typography samples, mood board, color specifications",
    status: "open",
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "job-004",
    title: "Smart Contract Security Audit",
    description:
      "Audit a sophisticated multi-token staking contract for vulnerabilities, gas optimization, and best practices compliance.",
    category: "Audit",
    budget: 3000,
    client_wallet: "2Ax5cABqLq46Es1jh92dQQisAq662SmxvLvfo4adeHL8",
    client_name: "protocol_maintainer",
    requirements:
      "Provide: Detailed audit report (PDF), vulnerability assessment, gas optimization suggestions, test coverage report",
    status: "open",
    created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "job-005",
    title: "Write Technical Blog Posts on Solana",
    description:
      "Write 4 comprehensive blog posts about Solana development topics:\n1. Building with Anchor Framework\n2. Understanding Program Derived Accounts (PDAs)\n3. Optimizing Smart Contract Performance\n4. Security Best Practices in Solana",
    category: "Writing",
    budget: 800,
    client_wallet: "4Bm7cABqLq46Es1jh92dQQisAq662SmxvLvfo4adeHL3",
    client_name: "content_marketing",
    requirements:
      "Submit: 4 blog posts (2000+ words each), SEO-optimized, code examples included, publication-ready",
    status: "open",
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// Initial Mock Applications
const INITIAL_APPLICATIONS: MockApplication[] = [
  {
    id: "app-001",
    job_id: "job-001",
    freelancer_wallet: "8a2Xu9jvhq8mK3pL9nQr5sT2vW4xY6zAb",
    freelancer_name: "alex_dev",
    cover_letter:
      "I have 3+ years of Solana development experience. I've built multiple NFT contracts and integrated with Metaplex. Looking forward to working on this marketplace.",
    requirements_response:
      "https://github.com/alex_dev/nft-marketplace | Previous contract audits: https://example.com/audits",
    status: "pending",
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "app-002",
    job_id: "job-002",
    freelancer_wallet: "5bN4oPq7rS2tU1vW8xY9zA0cBdEfGhIj",
    freelancer_name: "design_wizard",
    cover_letter:
      "React expert here! I've built several dashboards for DeFi protocols. I'm proficient with TailwindCSS and real-time data visualization.",
    requirements_response:
      "Portfolio: https://example.com/dashboards | GitHub: https://github.com/react_master",
    status: "pending",
    created_at: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "app-003",
    job_id: "job-003",
    freelancer_wallet: "3c9Vk6mL1nOpQrStUvWxYzAb2CdEfGhIjK",
    freelancer_name: "audit_master",
    cover_letter:
      "Professional designer with 5 years experience in Web3 branding. I understand the crypto community aesthetic.",
    requirements_response:
      "Previous brands: https://portfolio.example.com/brands",
    status: "pending",
    created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "app-004",
    job_id: "job-004",
    freelancer_wallet: "7dH2JiKlMnOpQrStUvWxYzAbCdEfGhIjKlMn",
    freelancer_name: "writer_pro",
    cover_letter:
      "Certified security researcher with multiple audits completed. Specializing in Solana and EVM contracts.",
    requirements_response:
      "Audit samples: https://example.com/audits/portfolio",
    status: "pending",
    created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
  },
];

// Storage functions
let mockJobs: MockJob[] = JSON.parse(JSON.stringify(INITIAL_JOBS));
let mockApplications: MockApplication[] = JSON.parse(
  JSON.stringify(INITIAL_APPLICATIONS),
);
let mockEscrows: MockEscrow[] = [];

export const mockDataStore = {
  // Jobs
  getJobs: () => mockJobs,
  getJobById: (id: string) => mockJobs.find((job) => job.id === id),
  getJobsByClient: (wallet: string) =>
    mockJobs.filter((job) => job.client_wallet === wallet),
  addJob: (job: MockJob) => {
    mockJobs.push(job);
    return job;
  },
  updateJob: (id: string, updates: Partial<MockJob>) => {
    const index = mockJobs.findIndex((job) => job.id === id);
    if (index !== -1) {
      mockJobs[index] = { ...mockJobs[index], ...updates };
      return mockJobs[index];
    }
    return null;
  },

  // Applications
  getApplications: () => mockApplications,
  getApplicationsByJob: (jobId: string) =>
    mockApplications.filter((app) => app.job_id === jobId),
  getApplicationsByFreelancer: (wallet: string) =>
    mockApplications.filter((app) => app.freelancer_wallet === wallet),
  addApplication: (app: MockApplication) => {
    mockApplications.push(app);
    return app;
  },
  updateApplication: (id: string, updates: Partial<MockApplication>) => {
    const index = mockApplications.findIndex((app) => app.id === id);
    if (index !== -1) {
      mockApplications[index] = { ...mockApplications[index], ...updates };
      return mockApplications[index];
    }
    return null;
  },

  // Escrows
  getEscrows: () => mockEscrows,
  getEscrowsByJob: (jobId: string) =>
    mockEscrows.filter((escrow) => escrow.job_id === jobId),
  getEscrowsByFreelancer: (wallet: string) =>
    mockEscrows.filter((escrow) => escrow.freelancer_wallet === wallet),
  addEscrow: (escrow: MockEscrow) => {
    mockEscrows.push(escrow);
    return escrow;
  },
  updateEscrow: (id: string, updates: Partial<MockEscrow>) => {
    const index = mockEscrows.findIndex((escrow) => escrow.id === id);
    if (index !== -1) {
      mockEscrows[index] = { ...mockEscrows[index], ...updates };
      return mockEscrows[index];
    }
    return null;
  },

  // Freelancer helpers
  getFreelancerName: (wallet: string) => {
    const freelancer = MOCK_FREELANCERS.find((f) => f.wallet === wallet);
    return freelancer?.name || wallet.slice(0, 6) + "...";
  },
};

// Utility function to generate mock wallet addresses if needed
export const generateMockId = (prefix: string) =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
