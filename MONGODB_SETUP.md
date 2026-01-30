# MongoDB Migration Guide

## Summary of Changes

The app has been migrated from JSON file-based storage to **MongoDB Atlas** cloud database. This enables:

✅ **Persistent data storage** across Vercel deployments  
✅ **Scalable database** that grows with your app  
✅ **Cloud-hosted solution** with automatic backups  
✅ **Real-time data access** without file system limitations

## What Changed

### Database Layer (`src/lib/db.ts`)

- **Removed**: File system storage (JSON files)
- **Added**: MongoDB connection pool with automatic indexing
- **Method**: Async/await pattern for all database operations

### CRUD Operations (`src/lib/database.ts`)

All database modules now use MongoDB:

- `jobsDb` - Job listings
- `applicationsDb` - Job applications
- `escrowsDb` - Payment escrows
- `freelancerProfilesDb` - Freelancer profiles
- `streamsDb` - Payment streams

**All methods are now async**:

```typescript
// Before (Sync)
const jobs = jobsDb.getAll();

// After (Async)
const jobs = await jobsDb.getAll();
```

### API Routes

All API routes updated to `await` database calls:

- `/api/jobs`
- `/api/jobs/[id]`
- `/api/applications`
- `/api/applications/[id]`
- `/api/escrows`
- `/api/escrows/[id]`
- `/api/streams`
- `/api/streams/[id]`

### Seeding (`src/lib/seed.ts`)

- Changed from sync to async function
- Uses MongoDB collections directly
- Checks existence before seeding to prevent duplicates

## Setup Instructions

### 1. Create MongoDB Atlas Account

```bash
# Go to: https://www.mongodb.com/cloud/atlas
# Sign up and create a free account
```

### 2. Create a Cluster

```
1. Click "Create a Project" (or use existing)
2. Click "Create a Deployment"
3. Select "M0 Sandbox" (free tier)
4. Choose AWS as provider
5. Select a region close to you
6. Click "Create Deployment"
```

### 3. Setup Network Access

```
1. Go to "Network Access" in left menu
2. Click "Add IP Address"
3. For development: Click "Allow access from anywhere" (0.0.0.0/0)
4. For production: Add specific IP addresses
```

### 4. Create Database User

```
1. Go to "Database Access" in left menu
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Set username (e.g., "middlemint_user")
5. Generate a strong password and save it
6. Role: Select "Atlas Admin" or "readWriteAnyDatabase"
7. Click "Add User"
```

### 5. Get Connection String

```
1. Go to "Clusters" or "Deployments"
2. Click "Connect"
3. Choose "Drivers"
4. Copy the connection string
5. Format: mongodb+srv://username:password@cluster-url.mongodb.net/middlemint?retryWrites=true&w=majority
```

### 6. Set Environment Variable

```bash
# In your .env.local file (create if doesn't exist):
MONGODB_URI=mongodb+srv://username:password@your-cluster.mongodb.net/middlemint?retryWrites=true&w=majority
```

### 7. Install Dependencies

```bash
npm install mongodb
```

### 8. Run Locally

```bash
npm run dev
# Database will auto-initialize on first request
# Collections will be created automatically
# Seed data will be inserted on first initialization
```

## Vercel Deployment

### 1. Update Environment Variables in Vercel

```
1. Go to your Vercel project settings
2. Go to "Environment Variables"
3. Add: MONGODB_URI = your_connection_string
4. Add: ESCROW_KEYPAIR_B64 = your_keypair (if using)
5. Save and redeploy
```

### 2. Deploy

```bash
git push origin main
# Vercel will automatically deploy
```

## Data Migration (If Coming from JSON)

If you have existing data in `middlemint.json`, migrate it:

```typescript
// 1. Export JSON data
const fs = require("fs");
const data = JSON.parse(fs.readFileSync("middlemint.json", "utf-8"));

// 2. Connect to MongoDB
const { MongoClient } = require("mongodb");
const client = new MongoClient(process.env.MONGODB_URI);

// 3. Insert each collection
await client.connect();
const db = client.db("middlemint");

// Insert jobs
if (data.jobs.length > 0) {
  await db.collection("jobs").insertMany(data.jobs);
  console.log(`✅ Inserted ${data.jobs.length} jobs`);
}

// Insert applications
if (data.applications.length > 0) {
  await db.collection("applications").insertMany(data.applications);
  console.log(`✅ Inserted ${data.applications.length} applications`);
}

// Repeat for other collections...
```

## Collections Schema

MongoDB will auto-create these collections:

### jobs

```
{
  id: String (unique),
  title: String,
  description: String,
  category: "Dev" | "Smart Contract" | "Writing" | "Marketing" | "Design" | "Audit",
  budget: Number,
  client_wallet: String,
  client_name: String,
  requirements: String,
  status: "open" | "in-progress" | "completed",
  created_at: String (ISO timestamp),
  updated_at: String (ISO timestamp)
}
```

### applications

```
{
  id: String (unique),
  job_id: String,
  freelancer_wallet: String,
  freelancer_name: String,
  cover_letter: String,
  requirements_response: String,
  status: "pending" | "accepted" | "rejected" | "in-progress" | "submitted" | "completed",
  created_at: String,
  updated_at: String
}
```

### escrows

```
{
  id: String (unique),
  job_id: String,
  application_id: String,
  client_wallet: String,
  freelancer_wallet: String,
  amount: Number,
  status: "pending" | "funded" | "work-submitted" | "released" | "disputed",
  transaction_signature: String | null,
  work_submission_link: String | null,
  work_submission_proof: String | null,
  created_at: String,
  updated_at: String,
  funded_at: String | null,
  released_at: String | null
}
```

### freelancer_profiles

```
{
  id: String (unique),
  wallet: String (unique),
  name: String,
  speciality: String,
  rating: Number,
  total_earnings: Number,
  created_at: String
}
```

### streams

```
{
  id: String (unique),
  escrow_id: String,
  sender: String,
  recipient: String,
  mint: String,
  amount: Number,
  start_time: Number,
  end_time: Number,
  withdrawn: Number,
  status: "active" | "paused" | "completed" | "cancelled",
  transaction_hash: String,
  created_at: String,
  updated_at: String
}
```

## Indexes Created

MongoDB automatically creates these indexes for performance:

```
jobs: { client_wallet: 1 }
applications: { job_id: 1, freelancer_wallet: 1 }
escrows: { job_id: 1, client_wallet: 1, freelancer_wallet: 1 }
freelancer_profiles: { wallet: 1 (unique) }
streams: { escrow_id: 1 }
```

## Troubleshooting

### Connection Failed

```
Error: Could not connect to MongoDB
- Check MONGODB_URI is set correctly
- Verify IP whitelist includes your IP (or 0.0.0.0/0)
- Verify database user credentials
```

### Data Not Persisting

```
Error: Data disappeared after restart
- This shouldn't happen with MongoDB!
- Check connection string is correct
- Verify database operations are awaited
```

### Slow Queries

```
Monitor performance in MongoDB Atlas:
1. Go to Clusters > your cluster
2. Click "Performance Advisor"
3. View slow query recommendations
4. Create indexes as suggested
```

## Testing Locally

```bash
# Start dev server
npm run dev

# Test endpoints
curl http://localhost:3000/api/jobs
curl http://localhost:3000/api/applications
curl http://localhost:3000/api/escrows

# Check MongoDB compass to verify data:
# Install: https://www.mongodb.com/products/compass
# Connection: mongodb+srv://user:pass@cluster-url.mongodb.net/
```

## Success Indicators

After deployment:

✅ All API endpoints return data from MongoDB  
✅ New jobs/applications persist across restarts  
✅ Vercel deployment completes without errors  
✅ MongoDB Atlas shows active connections  
✅ Seed data appears in first request

## What's Next

1. Monitor MongoDB Atlas usage in "Metrics" tab
2. Set up automated backups (automatic in free tier)
3. Scale to paid tier if approaching limits
4. Add role-based authentication if needed
5. Set up monitoring alerts for connection issues

## Support

- MongoDB Docs: https://docs.mongodb.com/
- Vercel Environment Variables: https://vercel.com/docs/concepts/projects/environment-variables
- MongoDB Atlas FAQ: https://www.mongodb.com/cloud/atlas/faq
