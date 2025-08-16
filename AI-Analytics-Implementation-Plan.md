# AI Summary & Analytics Implementation Plan

This document tracks the step-by-step plan and progress for adding AI-powered summaries and analytics to product dashboards on FoundersWall.

---

## 1. AI Summary (ai_summary)
**Goal:** Generate a shareable, press-release style summary for each product after its launch period (Mon–Thu or Thu–Mon), using all available product data.

### Features:
- Auto-generate summary at the end of each launch period (Monday or Thursday 8am UTC)
- Data sources: product info, timeline entries, logs, upvotes, (future: comments), product page views
- Store result in `products.ai_summary`
- Show summary in user dashboard, with a “Share on X/Twitter” button

### Steps:
1. [x] (In Progress) Add a scheduled backend job (cron or serverless) to run at 8am UTC on launch days
2. [ ] Aggregate all product data for products leaving the launch period
3. [ ] (Future) Add comments feature and product page view tracking
4. [ ] Send data to OpenAI (or similar) to generate summary text
5. [ ] Store summary in `ai_summary` column
6. [ ] Display summary in dashboard with share button

---

## 2. Analytics (analytics JSONB)
**Goal:** Give founders actionable, visual insights about their product’s launch and engagement.

### Features to Implement:
- Upvotes count
- Timeline entries count
- Days since launch
- First/last timeline entry date
- Average days between timeline entries
- Comments count (after feature is added)
- Repeat visitors (if tracked)
- Conversion funnel (if product_url clicks tracked)

### Steps:
1. [ ] Define analytics JSONB schema
2. [ ] Write backend aggregation logic to compute analytics for each product
3. [ ] (Future) Add comments and product_url click tracking
4. [ ] Store analytics in `analytics` column
5. [ ] Display analytics in dashboard (charts, numbers, etc.)

---

## 3. Comments Feature (Required for Full AI/Analytics)
- [ ] Design and add comments table/model
- [ ] Add API endpoints for posting/fetching comments
- [ ] Add UI for comments on product page
- [ ] Integrate comments into AI summary and analytics

---

## 4. Progress Log
- [ ] [DATE] Plan created and committed
- [ ] [DATE] Scheduled job for AI summary implemented
- [ ] [DATE] Analytics backend logic implemented
- [ ] [DATE] Comments feature added
- [ ] [DATE] Dashboard UI for summary/analytics live

---

**Instructions:**
- Update this file after each feature is added or changed.
- Use checkboxes to track progress.
- Add notes/decisions as needed.

---

**Next Step:**
- [ ] Add scheduled backend job for AI summary generation at launch period end.
