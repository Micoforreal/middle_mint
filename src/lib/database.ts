import { getDatabase, saveDB, initializeDatabase as initDB } from "./db";

// Types
export interface Job {
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
  updated_at: string;
}

export interface Application {
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
  updated_at: string;
}

export interface Escrow {
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

export interface StreamRecord {
  id: string;
  escrow_id: string;
  sender: string;
  recipient: string;
  mint: string;
  amount: number;
  start_time: number;
  end_time: number;
  withdrawn: number;
  status: "active" | "paused" | "completed" | "cancelled";
  transaction_hash: string;
  created_at: string;
  updated_at: string;
}

// JOBS DATABASE
export const jobsDb = {
  create: (job: Job): Job => {
    const db = getDatabase();
    db.jobs.push(job);
    saveDB();
    return job;
  },

  getAll: (): Job[] => {
    const db = getDatabase();
    return db.jobs.sort((a: Job, b: Job) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  },

  getById: (id: string): Job | undefined => {
    const db = getDatabase();
    return db.jobs.find((j: Job) => j.id === id);
  },

  getByClient: (clientWallet: string): Job[] => {
    const db = getDatabase();
    return db.jobs
      .filter((j: Job) => j.client_wallet === clientWallet)
      .sort((a: Job, b: Job) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
  },

  update: (id: string, updates: Partial<Job>): Job | undefined => {
    const db = getDatabase();
    const index = db.jobs.findIndex((j: Job) => j.id === id);
    if (index === -1) return undefined;

    const updated = {
      ...db.jobs[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    db.jobs[index] = updated;
    saveDB();
    return updated;
  },

  delete: (id: string): boolean => {
    const db = getDatabase();
    const index = db.jobs.findIndex((j: Job) => j.id === id);
    if (index === -1) return false;
    db.jobs.splice(index, 1);
    saveDB();
    return true;
  },
};

// APPLICATIONS DATABASE
export const applicationsDb = {
  create: (app: Application): Application => {
    const db = getDatabase();
    db.applications.push(app);
    saveDB();
    return app;
  },

  getAll: (): Application[] => {
    const db = getDatabase();
    return db.applications.sort((a: Application, b: Application) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  },

  getById: (id: string): Application | undefined => {
    const db = getDatabase();
    return db.applications.find((a: Application) => a.id === id);
  },

  getByJob: (jobId: string): Application[] => {
    const db = getDatabase();
    return db.applications
      .filter((a: Application) => a.job_id === jobId)
      .sort((a: Application, b: Application) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
  },

  getByFreelancer: (freelancerWallet: string): Application[] => {
    const db = getDatabase();
    return db.applications
      .filter((a: Application) => a.freelancer_wallet === freelancerWallet)
      .sort((a: Application, b: Application) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
  },

  update: (
    id: string,
    updates: Partial<Application>
  ): Application | undefined => {
    const db = getDatabase();
    const index = db.applications.findIndex((a: Application) => a.id === id);
    if (index === -1) return undefined;

    const updated = {
      ...db.applications[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    db.applications[index] = updated;
    saveDB();
    return updated;
  },

  delete: (id: string): boolean => {
    const db = getDatabase();
    const index = db.applications.findIndex((a: Application) => a.id === id);
    if (index === -1) return false;
    db.applications.splice(index, 1);
    saveDB();
    return true;
  },
};

// ESCROWS DATABASE
export const escrowsDb = {
  create: (escrow: Escrow): Escrow => {
    const db = getDatabase();
    db.escrows.push(escrow);
    saveDB();
    return escrow;
  },

  getAll: (): Escrow[] => {
    const db = getDatabase();
    return db.escrows.sort((a: Escrow, b: Escrow) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  },

  getById: (id: string): Escrow | undefined => {
    const db = getDatabase();
    return db.escrows.find((e: Escrow) => e.id === id);
  },

  getByJob: (jobId: string): Escrow[] => {
    const db = getDatabase();
    return db.escrows
      .filter((e: Escrow) => e.job_id === jobId)
      .sort((a: Escrow, b: Escrow) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
  },

  getByFreelancer: (freelancerWallet: string): Escrow[] => {
    const db = getDatabase();
    return db.escrows
      .filter((e: Escrow) => e.freelancer_wallet === freelancerWallet)
      .sort((a: Escrow, b: Escrow) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
  },

  getByClient: (clientWallet: string): Escrow[] => {
    const db = getDatabase();
    return db.escrows
      .filter((e: Escrow) => e.client_wallet === clientWallet)
      .sort((a: Escrow, b: Escrow) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
  },

  update: (id: string, updates: Partial<Escrow>): Escrow | undefined => {
    const db = getDatabase();
    const index = db.escrows.findIndex((e: Escrow) => e.id === id);
    if (index === -1) return undefined;

    const updated = {
      ...db.escrows[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    db.escrows[index] = updated;
    saveDB();
    return updated;
  },

  delete: (id: string): boolean => {
    const db = getDatabase();
    const index = db.escrows.findIndex((e: Escrow) => e.id === id);
    if (index === -1) return false;
    db.escrows.splice(index, 1);
    saveDB();
    return true;
  },
};

// FREELANCER PROFILES DATABASE
export const freelancerProfilesDb = {
  create: (profile: FreelancerProfile): FreelancerProfile => {
    const db = getDatabase();
    db.freelancer_profiles.push(profile);
    saveDB();
    return profile;
  },

  getAll: (): FreelancerProfile[] => {
    const db = getDatabase();
    return db.freelancer_profiles.sort((a: FreelancerProfile, b: FreelancerProfile) => 
      b.rating - a.rating
    );
  },

  getById: (id: string): FreelancerProfile | undefined => {
    const db = getDatabase();
    return db.freelancer_profiles.find((p: FreelancerProfile) => p.id === id);
  },

  getByWallet: (wallet: string): FreelancerProfile | undefined => {
    const db = getDatabase();
    return db.freelancer_profiles.find((p: FreelancerProfile) => p.wallet === wallet);
  },

  update: (
    id: string,
    updates: Partial<FreelancerProfile>
  ): FreelancerProfile | undefined => {
    const db = getDatabase();
    const index = db.freelancer_profiles.findIndex((p: FreelancerProfile) => p.id === id);
    if (index === -1) return undefined;

    const updated = {
      ...db.freelancer_profiles[index],
      ...updates,
    };
    db.freelancer_profiles[index] = updated;
    saveDB();
    return updated;
  },

  delete: (id: string): boolean => {
    const db = getDatabase();
    const index = db.freelancer_profiles.findIndex((p: FreelancerProfile) => p.id === id);
    if (index === -1) return false;
    db.freelancer_profiles.splice(index, 1);
    saveDB();
    return true;
  },
};

// STREAMS DATABASE
export const streamsDb = {
  create: (stream: StreamRecord): StreamRecord => {
    const db = getDatabase();
    db.streams.push(stream);
    saveDB();
    return stream;
  },

  getAll: (): StreamRecord[] => {
    const db = getDatabase();
    return db.streams.sort((a: StreamRecord, b: StreamRecord) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  },

  getById: (id: string): StreamRecord | undefined => {
    const db = getDatabase();
    return db.streams.find((s: StreamRecord) => s.id === id);
  },

  getByEscrowId: (escrowId: string): StreamRecord | undefined => {
    const db = getDatabase();
    return db.streams.find((s: StreamRecord) => s.escrow_id === escrowId);
  },

  getBySender: (sender: string): StreamRecord[] => {
    const db = getDatabase();
    return db.streams
      .filter((s: StreamRecord) => s.sender === sender)
      .sort((a: StreamRecord, b: StreamRecord) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
  },

  getByRecipient: (recipient: string): StreamRecord[] => {
    const db = getDatabase();
    return db.streams
      .filter((s: StreamRecord) => s.recipient === recipient)
      .sort((a: StreamRecord, b: StreamRecord) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
  },

  update: (
    id: string,
    updates: Partial<StreamRecord>
  ): StreamRecord | undefined => {
    const db = getDatabase();
    const index = db.streams.findIndex((s: StreamRecord) => s.id === id);
    if (index === -1) return undefined;

    const updated = {
      ...db.streams[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    db.streams[index] = updated;
    saveDB();
    return updated;
  },

  delete: (id: string): boolean => {
    const db = getDatabase();
    const index = db.streams.findIndex((s: StreamRecord) => s.id === id);
    if (index === -1) return false;
    db.streams.splice(index, 1);
    saveDB();
    return true;
  },
};

export { initDB as initializeDatabase };
