import { getCollectionsDB, initializeDatabase as initDB } from "./db";

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
  create: async (job: Job): Promise<Job> => {
    const { jobs } = await getCollectionsDB();
    await jobs.insertOne(job as any);
    return job;
  },

  getAll: async (): Promise<Job[]> => {
    const { jobs } = await getCollectionsDB();
    return (await jobs
      .find({})
      .sort({ created_at: -1 })
      .toArray()) as unknown as Job[];
  },

  getById: async (id: string): Promise<Job | undefined> => {
    const { jobs } = await getCollectionsDB();
    return (await jobs.findOne({ id })) as unknown as Job | undefined;
  },

  getByClient: async (clientWallet: string): Promise<Job[]> => {
    const { jobs } = await getCollectionsDB();
    return (await jobs
      .find({ client_wallet: clientWallet })
      .sort({ created_at: -1 })
      .toArray()) as unknown as Job[];
  },

  update: async (
    id: string,
    updates: Partial<Job>,
  ): Promise<Job | undefined> => {
    const { jobs } = await getCollectionsDB();
    const current = (await jobs.findOne({ id })) as unknown as Job | undefined;
    if (!current) return undefined;

    const updated = {
      ...current,
      ...updates,
      updated_at: new Date().toISOString(),
    };
    await jobs.updateOne({ id }, { $set: updated });
    return updated;
  },

  delete: async (id: string): Promise<boolean> => {
    const { jobs } = await getCollectionsDB();
    const result = await jobs.deleteOne({ id });
    return result.deletedCount > 0;
  },
};

// APPLICATIONS DATABASE
export const applicationsDb = {
  create: async (app: Application): Promise<Application> => {
    const { applications } = await getCollectionsDB();
    await applications.insertOne(app as any);
    return app;
  },

  getAll: async (): Promise<Application[]> => {
    const { applications } = await getCollectionsDB();
    return (await applications
      .find({})
      .sort({ created_at: -1 })
      .toArray()) as unknown as Application[];
  },

  getById: async (id: string): Promise<Application | undefined> => {
    const { applications } = await getCollectionsDB();
    return (await applications.findOne({ id })) as unknown as
      | Application
      | undefined;
  },

  getByJob: async (jobId: string): Promise<Application[]> => {
    const { applications } = await getCollectionsDB();
    return (await applications
      .find({ job_id: jobId })
      .sort({ created_at: -1 })
      .toArray()) as unknown as Application[];
  },

  getByFreelancer: async (freelancerWallet: string): Promise<Application[]> => {
    const { applications } = await getCollectionsDB();
    return (await applications
      .find({ freelancer_wallet: freelancerWallet })
      .sort({ created_at: -1 })
      .toArray()) as unknown as Application[];
  },

  update: async (
    id: string,
    updates: Partial<Application>,
  ): Promise<Application | undefined> => {
    const { applications } = await getCollectionsDB();
    const current = (await applications.findOne({ id })) as unknown as
      | Application
      | undefined;
    if (!current) return undefined;

    const updated = {
      ...current,
      ...updates,
      updated_at: new Date().toISOString(),
    };
    await applications.updateOne({ id }, { $set: updated });
    return updated;
  },

  delete: async (id: string): Promise<boolean> => {
    const { applications } = await getCollectionsDB();
    const result = await applications.deleteOne({ id });
    return result.deletedCount > 0;
  },
};

// ESCROWS DATABASE
export const escrowsDb = {
  create: async (escrow: Escrow): Promise<Escrow> => {
    const { escrows } = await getCollectionsDB();
    await escrows.insertOne(escrow as any);
    return escrow;
  },

  getAll: async (): Promise<Escrow[]> => {
    const { escrows } = await getCollectionsDB();
    return (await escrows
      .find({})
      .sort({ created_at: -1 })
      .toArray()) as unknown as Escrow[];
  },

  getById: async (id: string): Promise<Escrow | undefined> => {
    const { escrows } = await getCollectionsDB();
    return (await escrows.findOne({ id })) as unknown as Escrow | undefined;
  },

  getByJob: async (jobId: string): Promise<Escrow[]> => {
    const { escrows } = await getCollectionsDB();
    return (await escrows
      .find({ job_id: jobId })
      .sort({ created_at: -1 })
      .toArray()) as unknown as Escrow[];
  },

  getByFreelancer: async (freelancerWallet: string): Promise<Escrow[]> => {
    const { escrows } = await getCollectionsDB();
    return (await escrows
      .find({ freelancer_wallet: freelancerWallet })
      .sort({ created_at: -1 })
      .toArray()) as unknown as Escrow[];
  },

  getByClient: async (clientWallet: string): Promise<Escrow[]> => {
    const { escrows } = await getCollectionsDB();
    return (await escrows
      .find({ client_wallet: clientWallet })
      .sort({ created_at: -1 })
      .toArray()) as unknown as Escrow[];
  },

  update: async (
    id: string,
    updates: Partial<Escrow>,
  ): Promise<Escrow | undefined> => {
    const { escrows } = await getCollectionsDB();
    const current = (await escrows.findOne({ id })) as unknown as
      | Escrow
      | undefined;
    if (!current) return undefined;

    const updated = {
      ...current,
      ...updates,
      updated_at: new Date().toISOString(),
    };
    await escrows.updateOne({ id }, { $set: updated });
    return updated;
  },

  delete: async (id: string): Promise<boolean> => {
    const { escrows } = await getCollectionsDB();
    const result = await escrows.deleteOne({ id });
    return result.deletedCount > 0;
  },
};

// FREELANCER PROFILES DATABASE
export const freelancerProfilesDb = {
  create: async (profile: FreelancerProfile): Promise<FreelancerProfile> => {
    const { freelancer_profiles } = await getCollectionsDB();
    await freelancer_profiles.insertOne(profile as any);
    return profile;
  },

  getAll: async (): Promise<FreelancerProfile[]> => {
    const { freelancer_profiles } = await getCollectionsDB();
    return (await freelancer_profiles
      .find({})
      .sort({ rating: -1 })
      .toArray()) as unknown as FreelancerProfile[];
  },

  getById: async (id: string): Promise<FreelancerProfile | undefined> => {
    const { freelancer_profiles } = await getCollectionsDB();
    return (await freelancer_profiles.findOne({ id })) as unknown as
      | FreelancerProfile
      | undefined;
  },

  getByWallet: async (
    wallet: string,
  ): Promise<FreelancerProfile | undefined> => {
    const { freelancer_profiles } = await getCollectionsDB();
    return (await freelancer_profiles.findOne({ wallet })) as unknown as
      | FreelancerProfile
      | undefined;
  },

  update: async (
    id: string,
    updates: Partial<FreelancerProfile>,
  ): Promise<FreelancerProfile | undefined> => {
    const { freelancer_profiles } = await getCollectionsDB();
    const current = (await freelancer_profiles.findOne({ id })) as unknown as
      | FreelancerProfile
      | undefined;
    if (!current) return undefined;

    const updated = {
      ...current,
      ...updates,
    };
    await freelancer_profiles.updateOne({ id }, { $set: updated });
    return updated;
  },

  delete: async (id: string): Promise<boolean> => {
    const { freelancer_profiles } = await getCollectionsDB();
    const result = await freelancer_profiles.deleteOne({ id });
    return result.deletedCount > 0;
  },
};

// STREAMS DATABASE
export const streamsDb = {
  create: async (stream: StreamRecord): Promise<StreamRecord> => {
    const { streams } = await getCollectionsDB();
    await streams.insertOne(stream as any);
    return stream;
  },

  getAll: async (): Promise<StreamRecord[]> => {
    const { streams } = await getCollectionsDB();
    return (await streams
      .find({})
      .sort({ created_at: -1 })
      .toArray()) as unknown as StreamRecord[];
  },

  getById: async (id: string): Promise<StreamRecord | undefined> => {
    const { streams } = await getCollectionsDB();
    return (await streams.findOne({ id })) as unknown as
      | StreamRecord
      | undefined;
  },

  getByEscrowId: async (
    escrowId: string,
  ): Promise<StreamRecord | undefined> => {
    const { streams } = await getCollectionsDB();
    return (await streams.findOne({ escrow_id: escrowId })) as unknown as
      | StreamRecord
      | undefined;
  },

  getBySender: async (sender: string): Promise<StreamRecord[]> => {
    const { streams } = await getCollectionsDB();
    return (await streams
      .find({ sender })
      .sort({ created_at: -1 })
      .toArray()) as unknown as StreamRecord[];
  },

  getByRecipient: async (recipient: string): Promise<StreamRecord[]> => {
    const { streams } = await getCollectionsDB();
    return (await streams
      .find({ recipient })
      .sort({ created_at: -1 })
      .toArray()) as unknown as StreamRecord[];
  },

  update: async (
    id: string,
    updates: Partial<StreamRecord>,
  ): Promise<StreamRecord | undefined> => {
    const { streams } = await getCollectionsDB();
    const current = (await streams.findOne({ id })) as unknown as
      | StreamRecord
      | undefined;
    if (!current) return undefined;

    const updated = {
      ...current,
      ...updates,
      updated_at: new Date().toISOString(),
    };
    await streams.updateOne({ id }, { $set: updated });
    return updated;
  },

  delete: async (id: string): Promise<boolean> => {
    const { streams } = await getCollectionsDB();
    const result = await streams.deleteOne({ id });
    return result.deletedCount > 0;
  },
};

export { initDB as initializeDatabase };
