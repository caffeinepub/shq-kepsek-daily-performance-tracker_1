# Specification

## Summary
**Goal:** Build a role-based daily performance tracking dashboard where Kepsek (Principals) submit daily reports with photo proof and receive scores, while Directors monitor performance via analytics and leaderboards.

**Planned changes:**
- Add Internet Identity sign-in and role-based access control (Director/Management vs Kepsek) with role-protected routing and session UI state.
- Implement Director-only admin flow to create/update Kepsek profiles (Principal Name, School Name, Region/Wilayah) tied to Internet Identity principals; Kepsek can view (not edit) their profile header.
- Create backend daily submission model (one per Kepsek per day) with deterministic resubmission behavior and scoring (5 categories × 20 points; blank = 0; Attendance requires both times + photo).
- Build Kepsek dashboard: profile header, daily submission form (arrival/departure times, attendance photo upload, category checklists/notes, problem-solving text), and submission history with detail viewing.
- Store and serve attendance images in-canister with defined file type/size limits; show actionable validation errors; allow Kepsek and Director to view images in submission details.
- Build Director dashboard: stat cards (active schools, submitted today, average score), leaderboard ranking, and principal detail view showing daily submissions, images, and problem-solving notes.
- Add Director analytics: selectable time range (at least 7/30 days), line chart for daily performance trend, and donut/pie charts for completion rates (Class Control, Teacher Control, Running Programs).
- Apply a consistent, professional, responsive dashboard theme with sidebar navigation and English UI text throughout (avoiding blue/purple as primary colors).

**User-visible outcome:** Users can sign in with Internet Identity and are taken to their role’s dashboard: Kepsek can submit and review scored daily performance reports with an attendance photo, while Directors can manage Kepsek profiles and monitor school performance through stats, leaderboards, detailed submissions, and trend/completion charts.
