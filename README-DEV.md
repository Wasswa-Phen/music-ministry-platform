# Music Ministry Platform (MVP) — Developer Documentation

**Project:** Kasenge Miracle Centre Church — Alimunze Music Ministry
**Organization:** Aromax Technologies Uganda
**Team Lead & R&D:** Wasswa Stephen Makubuya
**Role:** Team Lead, Research & Development
**Year:** 2026

---

## 1) Executive Summary

This platform is the Minimum Viable Product (MVP) for a scalable digital system supporting Kasenge Miracle Centre Church’s Alimunze Music Ministry. The current release operationalizes **Sunday service evaluations**, enabling leadership to capture structured feedback, compute weekly summaries and KPIs, and drive continuous improvement across Vocalists, Instrumentalists, and Sound/Technical teams.

The architecture is intentionally lightweight, cloud-native, and cost-efficient (free tier), designed to scale into a full ministry platform for training, capacity building, content production, and creative workflows.

---

## 2) Live Links

* **Public Evaluation (Choir Members / Leaders):**
  [https://music-ministry-platform.pages.dev/evaluation.html](https://music-ministry-platform.pages.dev/evaluation.html)

* **Admin Dashboard (Token-gated):**
  [https://music-ministry-platform.pages.dev/admin.html](https://music-ministry-platform.pages.dev/admin.html)

> **Security Note:** Admin access requires a server-side secret token (ADMIN_TOKEN). Do not share the token publicly.

---

## 3) Technology Stack

**Front-end**

* HTML5, CSS3 (responsive, mobile-first)
* Vanilla JavaScript (no frameworks for MVP simplicity)
* Cloudflare Pages (static hosting + global CDN)

**Backend (Serverless)**

* Cloudflare Pages Functions (API endpoints)
* REST endpoints for submissions, admin summaries, and filtered retrieval

**Database**

* Cloudflare D1 (SQLite)
* Structured schema for evaluations, indexed by service date

**DevOps**

* GitHub (source control)
* Cloudflare Pages (CI/CD: every commit triggers deployment)

**Security**

* Token-gated admin endpoints
* Server-side secrets via Cloudflare environment variables
* No database credentials exposed client-side

---

## 4) Current Features (MVP Scope)

**Public (Choir Members / Leaders)**

* Sunday Music Department Evaluation form
* Sections: Vocalists, Instrumentalists, Sound/Technical
* Yes / No / Not sure inputs
* Qualitative comments (What went well, Areas to improve, Suggestions)
* Real-time submission confirmation

**Admin (Leadership)**

* Token-protected admin dashboard
* Weekly summary view with filters (date range, service name)
* KPI scoring per department:

  * Vocalists KPI (%)
  * Instrumentalists KPI (%)
  * Sound/Technical KPI (%)
* Counts: Yes / No / Not sure per department
* Latest submissions table (filtered)

**Analytics Logic**

* KPI = Yes / (Yes + No) × 100
* “Not sure” tracked separately (does not dilute KPI)

---

## 5) Data Model (D1)

**Table:** `evaluations`
Key fields:

* `service_date`, `service_name`, `evaluator_name`
* Vocalists: `v1..v8`
* Instrumentalists: `i1..i4`
* Sound: `s1..s3`
* Qualitative feedback fields
* `created_at` timestamp
* Indexed by `service_date` for performance

---

## 6) Governance & Access Control

* **Public users** can submit evaluations only.
* **Admin users** access summaries and records via token-gated endpoints.
* **Secrets** (ADMIN_TOKEN) stored server-side in Cloudflare environment variables.
* **Operational practice:** rotate ADMIN_TOKEN if exposure is suspected.

---

## 7) Roadmap (Future Upgrades)

**Short-term (Next Iteration)**

* Auto-populate service selector (dropdown)
* Weekly PDF/CSV export for leadership reporting
* Role-based access (Admin, Pastorate, Music Director)

**Mid-term**

* Member profiles (choir, instrumentalists, sound team)
* Attendance tracking + punctuality analytics
* Training modules (vocal warmups, instrumental practice, worship theology)
* Rehearsal scheduling and reminders

**Long-term (Platform Vision)**

* Digital academy for music ministry capacity building
* Media library (practice stems, chord charts, learning tracks)
* Recording & production workflow management
* Content publishing (audio/video distribution)
* Talent development pipelines and mentorship programs
* Multi-church rollout (regional adoption)

---

## 8) Architectural Principles

* **Lean MVP, scalable foundation** — ship value early, expand with confidence
* **Serverless-first** — minimal ops overhead
* **Security by design** — secrets never in client code
* **Data-driven growth** — decisions informed by structured evaluation metrics
* **Cloud-native portability** — components can be replaced or extended without lock-in

---

## 9) Ownership & Credits

**Project Owner:**
Kasenge Miracle Centre Church — Alimunze Music Ministry

**Delivery Partner:**
Aromax Technologies Uganda

**Team Lead & R&D:**
Wasswa Stephen Makubuya
Team Lead, Research & Development

---

## 10) Contribution & Maintenance

* Contributions via GitHub pull requests
* Feature proposals documented in issues
* Production deployments automated via Cloudflare Pages
* Weekly data review cadence recommended for leadership

