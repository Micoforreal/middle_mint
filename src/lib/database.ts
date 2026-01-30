import { getDatabase, saveDatabase, DBData } from './db';

// Types
export interface Job {
  id: string;
  title: string;
  description: string;
  category: 'Dev' | 'Smart Contract' | 'Writing' | 'Marketing' | 'Design' | 'Audit';
  budget: number;
  client_wallet: string;
  client_name: string;
  requirements: string;
  status: 'open' | 'in-progress' | 'completed';
  created_at: string;
  updated_at: string;
}

export interface Application {
  id: string;
  job_id: string;
  freelancer_wallet: string;
  freelancer_name: string;
  cover_letter: string;
  requirements_response: string;
  status: 'pending' | 'accepted' | 'rejected' | 'in-progress' | 'submitted' | 'completed';
  created_at: string;
  updated_at: string;
}

export interface Escrow {
  id: string;
  job_id: string;
  application_id: string;
  client_wallet: string;
  freelancer_wallet: string;
  amount: number;
  status: 'pending' | 'funded' | 'work-submitted' | 'released' | 'disputed';
  transaction_signature: string | null;
  work_submission_link: string | null;
  work_submission_proof: string | null;
  created_at: string;
  updated_at: string;
  funded_at: string | null;
  released_at: string | null;
}

export interface FreelancerProfile {
  id: string;
  wallet: string;
  name: string;
  speciality: string;
  rating: number;
  total_earnings: number;
  created_at: string;
}

// JOBS DATABASE
export const jobsDb = {
  create: (job: Job): Job => {
    const db = getDatabase();
    db.jobs.push(job);
    saveDatabase();
    return job;
  },

  getAll: (): Job[] => {
    const db = getDatabase();
    return db.jobs;
  },

  getById: (id: string): Job | undefined => {
    const db = getDatabase();
    return db.jobs.find(j => j.id === id);
  },

  getByClient: (clientWallet: string): Job[] => {
    const db = getDatabase();
    return db.jobs.filter(j => j.client_wallet === clientWallet);
  },

  update: (id: string, updates: Partial<Job>): Job | undefined => {
    const db = getDatabase();
    const index = db.jobs.findIndex(j => j.id === id);
    if (index !== -1) {
      db.jobs[index] = { ...db.jobs[index], ...updates, updated_at: new Date().toISOString() };
      saveDatabase();
      return db.jobs[index];
    }
    return undefined;
  },

  delete: (id: string): boolean => {
    const db = getDatabase();
    const index = db.jobs.findIndex(j => j.id === id);
    if (index !== -1) {
      db.jobs.splice(index, 1);
      saveDatabase();
      return true;
    }
    return false;
  },
};

// APPLICATIONS DATABASE
export const applicationsDb = {
  create: (app: Application): Application => {
    const db = getDatabase();
    db.applications.push(app);
    saveDatabase();
    return app;
  },

  getAll: (): Application[] => {
    const db = getDatabase();
    return db.applications;
  },

  getById: (id: string): Application | undefined => {
    const db = getDatabase();
    return db.applications.find(a => a.id === id);
  },

  getByJob: (jobId: string): Application[] => {
    const db = getDatabase();
    return db.applications.filter(a => a.job_id === jobId);
  },

  getByFreelancer: (freelancerWallet: string): Application[] => {
    const db = getDatabase();
    return db.applications.filter(a => a.freelancer_wallet === freelancerWallet);
  },

  update: (id: string, updates: Partial<Application>): Application | undefined => {
    const db = getDatabase();
    const index = db.applications.findIndex(a => a.id === id);
    if (index !== -1) {
      db.applications[index] = { ...db.applications[index], ...updates, updated_at: new Date().toISOString() };
      saveDatabase();
      return db.applications[index];
    }
    return undefined;
  },

  delete: (id: string): boolean => {
    const db = getDatabase();
    const index = db.applications.findIndex(a => a.id === id);
    if (index !== -1) {
      db.applications.splice(index, 1);
      saveDatabase();
      return true;
    }
    return false;
  },
};

// ESCROWS DATABASE
export const escrowsDb = {
  create: (escrow: Escrow): Escrow => {
    const db = getDatabase();
    db.escrows.push(escrow);
    saveDatabase();
    return escrow;
  },

  getAll: (): Escrow[] => {
    const db = getDatabase();
    return db.escrows;
  },

  getById: (id: string): Escrow | undefined => {
    const db = getDatabase();
    return db.escrows.find(e => e.id === id);
  },

  getByJob: (jobId: string): Escrow[] => {
    const db = getDatabase();
    return db.escrows.filter(e => e.job_id === jobId);
  },

  getByFreelancer: (freelancerWallet: string): Escrow[] => {
    const db = getDatabase();
    return db.escrows.filter(e => e.freelancer_wallet === freelancerWallet);
  },

  getByClient: (clientWallet: string): Escrow[] => {
    const db = getDatabase();
    return db.escrows.filter(e => e.client_wallet === clientWallet);
  },

  update: (id: string, updates: Partial<Escrow>): Escrow | undefined => {
    const db = getDatabase();
    const index = db.escrows.findIndex(e => e.id === id);
    if (index !== -1) {
      db.escrows[index] = { ...db.escrows[index], ...updates, updated_at: new Date().toISOString() };
      saveDatabase();
      return db.escrows[index];
    }
    return undefined;
  },

  delete: (id: string): boolean => {
    const db = getDatabase();
    const index = db.escrows.findIndex(e => e.id === id);
    if (index !== -1) {
      db.escrows.splice(index, 1);
      saveDatabase();
      return true;
    }
    return false;
  },
};

// FREELANCER PROFILES DATABASE
export const freelancerProfilesDb = {
  create: (profile: FreelancerProfile): FreelancerProfile => {
    const db = getDatabase();
    db.freelancer_profiles.push(profile);
    saveDatabase();
    return profile;
  },

  getAll: (): FreelancerProfile[] => {
    const db = getDatabase();
    return db.freelancer_profiles;
  },

  getById: (id: string): FreelancerProfile | undefined => {
    const db = getDatabase();
    return db.freelancer_profiles.find(f => f.id === id);
  },

  getByWallet: (wallet: string): FreelancerProfile | undefined => {
    const db = getDatabase();
    return db.freelancer_profiles.find(f => f.wallet === wallet);
  },

  update: (id: string, updates: Partial<FreelancerProfile>): FreelancerProfile | undefined => {
    const db = getDatabase();
    const index = db.freelancer_profiles.findIndex(f => f.id === id);
    if (index !== -1) {
      db.freelancer_profiles[index] = { ...db.freelancer_profiles[index], ...updates };
      saveDatabase();
      return db.freelancer_profiles[index];
    }
    return undefined;
  },

  delete: (id: string): boolean => {
    const db = getDatabase();
    const index = db.freelancer_profiles.findIndex(f => f.id === id);
    if (index !== -1) {
      db.freelancer_profiles.splice(index, 1);
      saveDatabase();
      return true;
    }
    return false;
  },
};
