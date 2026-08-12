
---
document_type: "System Design & PRD (Product Requirements Document)"
project_name: "RoveClip"
version: "1.0.0"
status: "Draft for Agentic Implementation"
target_audience: "Autonomous AI Agents (Backend, Frontend, DevOps, QA)"
---

# RoveClip - System Design Document

## 1. Executive Summary
**RoveClip** is a two-sided marketplace bridging the gap between **Brands/Influencers (Clients)** who need their long-form content distributed, and **Micro-Editors (Clippers)** who edit and distribute the content on short-form video platforms (TikTok, YouTube Shorts, IG Reels) for performance-based compensation.

**Core Business Model:**
- Compensation is based on Cost Per Mille (CPM) or Cost Per 1,000 Views.
- The platform deducts a strictly enforced **20% platform fee** from the Clipper's gross earnings before transferring funds to their internal wallet.

## 2. Agentic Directives (Instructions for AI Agents)
- **Role:** You are a senior software engineer operating at a top-tier Silicon Valley tech company.
- **Task:** Implement features exactly as specified in this document without deviating from the database schema or business logic.
- **Modularity:** Ensure separation of concerns. Keep frontend UI components decoupled from backend business logic.
- **Security:** Assume zero-trust. All endpoints handling wallet transactions, view validations, and file uploads must be strictly authenticated and rate-limited.

## 3. System Architecture
- **Architecture Pattern:** Serverless Microservices / Monolithic-ready backend (Node.js/Python).
- **Frontend:** Next.js (React) + TailwindCSS for SSR and SEO optimization.
- **Database:** PostgreSQL (Relational integrity is mandatory for financial ledgers).
- **Storage:** AWS S3 or equivalent (for storing long-form raw video files).
- **Background Jobs:** Redis + BullMQ / Celery (for asynchronous view validation and payout calculations).

## 4. Core Business Logic & Algorithms

### 4.1 Payout Calculation Engine
This logic must be implemented as an isolated, unit-tested utility function.

```typescript
function calculatePayout(views: number, cpm: number): PayoutResult {
  const PLATFORM_FEE_PERCENTAGE = 0.20; // 20%
  
  // Calculate Gross Earnings
  const grossEarnings = (views / 1000) * cpm;
  
  // Calculate Deductions & Net
  const platformFee = grossEarnings * PLATFORM_FEE_PERCENTAGE;
  const netClipperEarnings = grossEarnings - platformFee;

  return {
    grossEarnings,
    platformFee,
    netEarnings: netClipperEarnings
  };
}

```

### 4.2 View Validation Logic (Anti-Fraud)

* AI Agent must implement an API integration (e.g., TikTok API, YouTube Data API) or an OCR-based fallback to verify the exact view count of submitted URLs.
* Views are snapshotted at `T+7 days` (7 days after link submission) to lock in the final view count for payout.

## 5. Database Schema (Prisma/SQL Reference)

Agents must strictly follow this relational structure.

### `User` Table

| Field | Type | Description |
| --- | --- | --- |
| `id` | UUID | Primary Key |
| `role` | Enum | `BRAND`, `CLIPPER`, `ADMIN` |
| `name` | String | User's full name or Brand name |
| `email` | String | Unique identifier |
| `wallet_balance` | Decimal | Current available balance |

### `Campaign` Table

| Field | Type | Description |
| --- | --- | --- |
| `id` | UUID | Primary Key |
| `brand_id` | UUID | Foreign Key -> User.id |
| `video_url` | String | S3 URL of the raw video |
| `cpm_rate` | Decimal | Payout per 1,000 views (e.g., 10000.00) |
| `total_budget` | Decimal | Max spend limit for this campaign |
| `status` | Enum | `ACTIVE`, `PAUSED`, `COMPLETED` |

### `Submission` Table

| Field | Type | Description |
| --- | --- | --- |
| `id` | UUID | Primary Key |
| `campaign_id` | UUID | Foreign Key -> Campaign.id |
| `clipper_id` | UUID | Foreign Key -> User.id |
| `social_url` | String | URL of the published short video |
| `validated_views` | Integer | View count fetched by the system |
| `status` | Enum | `PENDING`, `VALIDATING`, `APPROVED`, `REJECTED` |

### `TransactionLedger` Table

| Field | Type | Description |
| --- | --- | --- |
| `id` | UUID | Primary Key |
| `user_id` | UUID | Foreign Key -> User.id |
| `amount` | Decimal | Positive (Credit) or Negative (Debit) |
| `type` | Enum | `DEPOSIT`, `PAYOUT`, `WITHDRAWAL`, `FEE` |
| `reference_id` | UUID | Nullable (e.g., Submission.id) |

## 6. User Flows / State Machines

### Brand Flow

1. Authenticate -> Access `Brand Dashboard`.
2. Deposit funds via Payment Gateway (Stripe/Xendit) -> `wallet_balance` increases.
3. Create `Campaign` -> Upload raw video, set `cpm_rate` and `total_budget`.
4. Monitor active `Submissions` and real-time view accumulation.

### Clipper Flow

1. Authenticate -> Access `Clipper Marketplace`.
2. Browse active `Campaigns` -> Filter by highest `cpm_rate`.
3. Download raw video -> Edit offline.
4. Upload to social media -> Submit `social_url` to RoveClip.
5. Check `Wallet` -> Request `WITHDRAWAL` once `validated_views` are processed.

## 7. Implementation Roadmap for Agents

* **Agent 1 (Database & Backend API):**
* Initialize PostgreSQL database.
* Build CRUD REST/GraphQL APIs for Users, Campaigns, and Submissions.
* Implement robust JWT authentication.


* **Agent 2 (Frontend App):**
* Scaffold Next.js application.
* Build the three separate dashboards (Admin, Brand, Clipper) using TailwindCSS components.
* Connect to Backend APIs.


* **Agent 3 (Background Workers & Integrations):**
* Implement Cron Jobs for view validation.
* Implement the `calculatePayout` financial engine and ledger transaction generation.
* Integrate third-party API for link validation.
