# Middlemint MVP - Working Demo Guide

## 🎉 What's Been Implemented

Your Middlemint app is now a fully working demo with:

### ✅ Mock Data System

- **5 pre-loaded jobs** with real descriptions (Smart Contracts, Dev, Design, Audit, Writing)
- **4 pre-loaded freelancer applications** with sample pitches and qualifications
- All data stored in memory (no Supabase needed)
- Realistic client/freelancer wallet names

### ✅ Complete Escrow Workflow

#### 1. **Client Side - Hire & Fund**

- View applicants for your posted jobs
- Click "Hire & Create Escrow" to lock in a freelancer
- Specify the escrow amount (defaults to job budget)
- Create escrow contract (funds marked as "pending")
- Simulate funding the escrow (Demo mode - no real Solana transactions)
- Once funded, wait for freelancer to submit work

#### 2. **Freelancer Side - Work & Get Paid**

- See accepted job offers with secured escrow funds
- Submit work by providing:
  - **Work Link**: GitHub repo, portfolio URL, or project link
  - **Proof Image**: Screenshot or visual proof (uses image URL)
- Client reviews and releases funds
- Get paid once client approves!

#### 3. **Client Review & Release**

- View work submission in dashboard
- See work link and proof image
- Click "Release Funds to Freelancer" to complete payment
- Funds released → job marked complete

---

## 🚀 How to Use the Demo

### **Starting the App**

```bash
cd c:\Users\mjjam\Desktop\Deals\middlemint-mvp
npm run dev
```

App runs on `http://localhost:3000`

### **Testing the Full Flow**

#### Step 1: Connect Your Wallet

- Click "Connect Wallet" in navbar
- Use Phantom or Solflare (Devnet)
- This establishes your wallet address

#### Step 2: See Existing Jobs (As Client/Freelancer)

- Go to **"Find"** page to browse all 5 mock jobs
- Click any job to see full details
- **If you're a freelancer**: Apply to jobs here
- **If you're a client**: Go to dashboard to hire

#### Step 3: Post a New Job (As Client)

- Click **"Post a Job"** in navbar
- Fill in title, category, budget, description
- Add application requirements
- Click **"Post Job"** - saved to mock data

#### Step 4: View Applicants (As Client)

- Go to **"Dashboard"** → "Posted Jobs & Escrows" tab
- Click **"View Applicants"** on any job
- See freelancer pitch and qualifications
- Click **"Hire & Create Escrow"**

#### Step 5: Create Escrow & Fund

- Modal appears with freelancer name
- Edit escrow amount if needed
- Click **"Create Escrow"**
- Status: **"pending"** → freelancer is chosen!

#### Step 6: Submit Work (As Freelancer)

- Switch to **"Freelancer"** view (or use different wallet)
- See jobs you applied to with status
- Find the job with escrow status: **"funded"**
- Click **"Submit Work"**
- Paste work link (e.g., GitHub URL)
- Paste proof image URL (e.g., screenshot)
- Click **"Submit Work"**
- Status changes to: **"work-submitted"**

#### Step 7: Release Funds (As Client)

- Switch back to client view
- See work submission details
- Review work link and proof image
- Click **"Release Funds to Freelancer"**
- Status changes to: **"released"** ✓
- Freelancer sees: "✓ Payment released! Work complete!"

---

## 📁 File Structure

### Core System Files

- **`src/lib/mockData.ts`** - Mock database with jobs, applications, freelancers
- **`src/lib/EscrowContext.tsx`** - Escrow state management (useEscrow hook)
- **`src/lib/solanaEscrow.ts`** - Solana transaction helpers (demo/placeholder)

### Updated Pages

- **`src/app/page.tsx`** - Home with trending mock jobs
- **`src/app/find/page.tsx`** - Browse all jobs with search
- **`src/app/post/page.tsx`** - Post new job to mock data
- **`src/app/gig/[id]/page.tsx`** - Job details & apply
- **`src/app/dashboard/page.tsx`** - **Complete escrow workflow** (biggest change!)
- **`src/app/layout.tsx`** - Added EscrowProvider

---

## 🔄 Escrow Status Flows

### Client Perspective

```
Apply → Hired → Escrow Pending → Escrow Funded
→ Work Submitted → Release → COMPLETE
```

### Freelancer Perspective

```
Applied → Accepted → Escrow Created → Escrow Funded
→ Submit Work → Waiting for Review → PAID
```

---

## 🎨 UI/UX Features

- **Status badges** with color coding:
  - Green: Funded, Released, Complete
  - Yellow: Pending, Work Submitted
  - Blue: Accepted, Funded
  - Red: Rejected

- **Responsive modals** for:
  - Viewing applicants
  - Creating escrow
  - Submitting work

- **Real-time updates** (mock state management)

- **Consistent theme**: Purple (#9945FF) & Green (#14F195)

---

## 🧪 Demo Data

### Pre-loaded Jobs

1. **Solana NFT Marketplace Contract** - $2500 - Smart Contract
2. **React Dashboard for Token Analytics** - $1500 - Dev
3. **Brand Identity Design for Web3** - $1000 - Design
4. **Smart Contract Security Audit** - $3000 - Audit
5. **Write Solana Blog Posts** - $800 - Writing

### Pre-loaded Freelancers

- alex_dev (Dev specialist)
- design_wizard (Designer)
- audit_master (Security expert)
- writer_pro (Content writer)
- marketing_guru (Marketing expert)

---

## 🔧 How to Extend This

### Add More Mock Jobs

Edit `src/lib/mockData.ts`:

```typescript
const INITIAL_JOBS: MockJob[] = [
  // Add new job object here
  {
    id: "job-006",
    title: "Your Job Title",
    // ... rest of fields
  },
];
```

### Customize Escrow Logic

All escrow operations in `src/lib/EscrowContext.tsx`:

- `createEscrow()` - Create new contract
- `fundEscrow()` - Simulate funding
- `submitWork()` - Record work submission
- `releaseEscrow()` - Release payment

### Connect Real Solana (Future)

When ready to go live:

1. Deploy actual smart contract to Solana Devnet
2. Update `src/lib/solanaEscrow.ts` with real program ID & instructions
3. Implement real token transfers (USDC)
4. Replace mock escrow functions with contract calls

---

## 📊 Application States

### Job Status

- `open` - Accepting applications
- `in-progress` - Freelancer hired
- `completed` - Work delivered & paid

### Application Status

- `pending` - Submitted, waiting for review
- `accepted` - Client hired this freelancer
- `rejected` - Client rejected application
- `in-progress` - Work in progress
- `submitted` - Work submitted for review
- `completed` - Paid and complete

### Escrow Status

- `pending` - Created, waiting for client to fund
- `funded` - Client funded, ready for work
- `work-submitted` - Freelancer submitted work
- `released` - Payment released to freelancer
- `disputed` - (Future enhancement)

---

## 💡 Tips for Demo

1. **Use Two Different Wallets**:
   - Connect one wallet as client
   - Disconnect and connect different wallet as freelancer
   - This simulates real marketplace

2. **Check Proof Image URLs**:
   - Use real image URLs for visual proof
   - Example: `https://images.unsplash.com/...`
   - Invalid URLs will silently fail preview

3. **Monitor Console**:
   - Open DevTools (F12) → Console
   - See mock data operations logged
   - Useful for debugging

4. **All Data in Memory**:
   - Refresh page: data persists (same session)
   - Close browser: demo data resets
   - This is intentional for testing!

---

## 🎯 Next Steps (When Going Live)

1. ✅ **MVP Complete**: Mock data + escrow workflow
2. ⏳ **Connect Supabase**: Replace mock data with real database
3. ⏳ **Deploy Smart Contract**: Real Solana program for escrow
4. ⏳ **Token Integration**: USDC transfers instead of demo
5. ⏳ **Authentication**: User login/profiles
6. ⏳ **Ratings System**: Client & freelancer reviews
7. ⏳ **Dispute Resolution**: Arbitration system

---

## 📝 Summary

Your app now has a **complete, working escrow system** where:

- Clients can post jobs and hire freelancers
- Freelancers can apply and submit work
- Payments are locked in escrow until work is approved
- Everything uses mock data (no Supabase needed)
- All state management with React Context

**Try the full flow from hiring to payment release!** 🚀
