# BookFlow roadmap

- [~] Security hardening: dependency patches, tenant authority/trial guards, public child policies, private-branding isolation and redacted notification diagnostics implemented; finish booking validation, transactional unlock, upload validation and authenticated permission tests after deep scan results
- [~] Interim security report in SECURITY_REVIEW.md; final report awaits deep scan and remaining verification

- [~] (wording done; service questions, dashboards, plan controls pending) Audit and implement industry-aware configuration, service questions, staff terminology, booking workflows, dashboard widgets, and admin/plan controls
- [ ] Verify salon, barbershop, photography, clinic, and consulting experiences and tenant/feature permissions

- [x] Multi-tenant schema, RLS, demo data
- [x] Marketing pages (home, features, industries, pricing, contact, privacy, terms)
- [x] Auth, public booking page, business dashboard pages, platform admin
- [x] Build passing + preview smoke test
- [x] Reminder dispatcher endpoint (/api/public/send-reminders)
- [x] Super admin account created and verified (admin view loads)
- [x] Temporary bootstrap-admin route deleted
- [ ] Schedule the reminder job (needs the app published)
- [ ] Replace placeholder contact details on /contact
- [x] BookFlow logo, favicon and blue brand colors
- [x] Mark appointments done / failed
- [x] Customer stylist/barber selection and staff-to-service assignments
- [x] Business logo and booking cover uploads
- [x] Redesigned branded public booking page
- [x] Downloadable PDF booking receipt
- [x] Navigation shows the logo without the BookFlow wordmark
- [ ] Connect a real SMS/email sender so booking confirmations and reminders are delivered (needs sender domain / SMS account)
- [x] Admin filters for accounts locking soon / locked
