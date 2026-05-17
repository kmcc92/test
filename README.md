# TESTF — Blockchain Luxury Fashion Authentication & Auction Marketplace

A production-grade MVP combining physical luxury item verification (NFC/QR), NFT-backed ownership records, live auctions, and merchant management tools.

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 18 + Vite + Tailwind CSS + ethers.js |
| Merchant Portal | React 18 + Vite + Tailwind CSS |
| Backend | Node.js + Express + Prisma ORM |
| Database | Supabase (PostgreSQL) |
| Blockchain | Solidity 0.8.24 + Hardhat + Polygon Amoy |
| Storage | IPFS via Pinata |
| Realtime | Socket.io |
| Auth | JWT + MetaMask |
| Hosting | Vercel (frontend + merchant) |

## Prerequisites

- Node.js >= 20 + npm >= 10
- MetaMask browser extension
- [Supabase](https://supabase.com) account
- [Alchemy](https://alchemy.com) account (Polygon Amoy RPC)
- [Pinata](https://pinata.cloud) account (IPFS)
- [Vercel](https://vercel.com) account

## Quick Start

```bash
# 1. Clone and install root deps
git clone https://github.com/kmcc92/test.git testf && cd testf
npm install

# 2. Configure environment
cp .env.example .env
# Fill in all values (see Environment Variables below)

# 3. Compile smart contracts (requires local Node.js)
cd contracts && npm install && npx hardhat compile && cd ..

# 4. Run contract tests
npm run test:contracts

# 5. Set up Supabase database
npm run db:migrate        # runs Prisma migrations
npm run db:seed           # seeds demo data

# 6. Start all services (3 terminals)
npm run dev:backend       # http://localhost:3001
npm run dev:frontend      # http://localhost:5173
npm run dev:merchant      # http://localhost:5174
```

## Project Structure

```
testf/
├── apps/
│   ├── frontend/          # Public marketplace (Vercel)
│   ├── merchant-portal/   # Brand dashboard (Vercel)
│   └── backend/           # REST API + WebSocket
│       ├── prisma/        # Database schema + migrations
│       └── src/
│           ├── routes/    # auth, items, auctions, brands
│           ├── middleware/ # JWT auth, error handler
│           └── lib/       # Prisma client, env validation
├── contracts/
│   ├── contracts/
│   │   ├── BrandRegistry.sol   # Brand onboarding + approval
│   │   ├── ItemRegistry.sol    # ERC721 NFT + chip binding
│   │   └── AuctionHouse.sol    # Live auctions + escrow
│   ├── scripts/deploy.ts
│   └── test/              # Hardhat + Chai test suite
├── docs/
├── .env.example
└── package.json           # npm workspaces root
```

## Smart Contracts

### BrandRegistry.sol
- Brand registration and admin approval workflow
- On-chain verification rules (NFC, QR, SERIAL, HOLOGRAM patterns)
- Role-based access control via OpenZeppelin AccessControl

### ItemRegistry.sol (ERC721)
- Mints NFTs for physical items, bound to NFC/QR chip IDs
- Public `verifyByChipId()` for authenticity lookups
- Full ownership history on-chain
- Stolen item flagging

### AuctionHouse.sol
- Creates auctions with NFT escrow
- Live bidding with 5% minimum increment enforcement
- **Anti-sniping**: bids in last 5 min extend auction by 10 min
- Pull-pattern refunds (reentrancy-safe)
- Dual confirmation (buyer + seller) before NFT transfer
- 2.5% platform fee on settlement

### Contract Interaction Flow
```
Admin deploys BrandRegistry → ItemRegistry → AuctionHouse
Brand registers → Admin verifies brand
Brand mints NFT via ItemRegistry.mintItem()
NFT owner approves AuctionHouse → calls createAuction() (NFT escrowed)
Buyers call placeBid() → outbid amounts in pendingReturns
After endTime → endAuction() called → seller + buyer confirm → NFT transferred
```

## API Routes

```
POST /auth/register          Register user (BUYER or BRAND_OWNER)
POST /auth/login             Login, returns JWT

POST /items/register         Register item (brand owners only)
GET  /items/:chipId/verify   Public authenticity check

GET  /auctions/live          All active auctions
GET  /auctions/:id           Auction detail + bid history
POST /auctions/create        Create auction (brand owners)
POST /auctions/:id/bid       Place bid

POST /brands/register        Register brand
GET  /brands                 List verified brands
GET  /brands/:id             Brand detail + inventory
PUT  /brands/:id/rules       Update verification rules
POST /brands/:id/approve     Admin: approve brand
```

## Supabase Setup

1. Create a new Supabase project
2. Go to Settings → Database → Connection string (URI)
3. Copy the **Transaction** pooler URL → `DATABASE_URL`
4. Copy the **Session** pooler URL → `DIRECT_URL`
5. Run: `npm run db:migrate`

## Deploying Contracts

```bash
# Polygon Amoy testnet
npm run deploy:contracts

# Local Hardhat node (for development)
npm run dev:contracts &
cd contracts && npx hardhat run scripts/deploy.ts --network localhost
```

Contract addresses are saved to `contracts/deployments/latest.json`.

## Deploying to Vercel

### Frontend

```bash
cd apps/frontend
vercel --prod
```

Set environment variables in Vercel dashboard:
- `VITE_API_URL` = your backend URL

### Merchant Portal

```bash
cd apps/merchant-portal
vercel --prod
```

### Backend

Deploy to [Railway](https://railway.app) or [Render](https://render.com) — both support Node.js + persistent env vars.

Set all variables from `.env.example` in your deployment platform.

## Environment Variables

See `.env.example` for the full list. Required:

| Variable | Description |
|---|---|
| `DATABASE_URL` | Supabase transaction pooler URL |
| `DIRECT_URL` | Supabase session pooler URL |
| `JWT_SECRET` | Random 32+ char string |
| `ALCHEMY_RPC_URL` | Polygon Amoy endpoint |
| `DEPLOYER_PRIVATE_KEY` | Wallet private key for deployment |
| `PINATA_API_KEY` | For IPFS uploads |
| `PINATA_SECRET` | For IPFS uploads |

## Seed Accounts (development)

After running `npm run db:seed`:

| Email | Password | Role |
|---|---|---|
| admin@testf.io | admin123456 | ADMIN |
| brand@gucci.com | brand123456 | BRAND_OWNER |
