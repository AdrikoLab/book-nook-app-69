# BookFlow security review — 2 November 2026

## Status
Interim assessment, not production-security certification. Deep security scan is still running. No existing business data was deleted and the interface was not redesigned.

## Architecture reviewed
TanStack Start browser and server-function boundaries; authenticated administration; public booking and reminder endpoints; tenant database policies and triggers; private branding storage; notification delivery; production dependency lockfile.

## Remediation completed
| Risk | Severity | Change | Verification |
| --- | --- | --- | --- |
| Public branding signer accepted other tenants' private paths | High | Business-scoped reference validation before privileged signing | Four passing unit tests cover own path, foreign tenant, traversal, and unsafe URLs |
| Tenant managers could mutate membership authority | High | Database trigger limits membership changes to actual business owners/platform admins and prevents identity reassignment/platform tenant roles | Trigger installation confirmed in live database; adversarial multi-account checks pending |
| Tenant could modify suspension/ownership | High | Database trigger reserves these fields for platform administrators | Live trigger confirmed; multi-account checks pending |
| Repeat trial insertion bypassed lockout | High | Serialized first-trial check, actual owner requirement, active plan, future end within seven days | Live trigger confirmed; adversarial concurrent tests pending |
| Active services/team/locations readable for unpublished or suspended businesses | Medium | Public policies require a published, unsuspended parent | Live policy predicates read back |
| Customer messages/raw provider responses in diagnostics | Medium | Removed recipient/body logging and raw failure responses | Code review; live external-provider test unavailable |
| Vulnerable production packages | High/Moderate | Updated Zod and patched dependency resolutions | Fresh dependency scan: no known vulnerabilities in 55 production dependencies |

## Tests performed
- Anonymous `/admin` navigation redirects to `/auth`; screenshot confirms sign-in form.
- Home page loads; no browser runtime errors during the above flow.
- Branding isolation: 4/4 unit tests passed.
- Latest app validation reports build OK.
- Quick database scan still reports public `industry_templates` reads. These are intentional public industry configuration, not customer records; finding remains active, not ignored.

## Remaining work and limitations
- Deep scan results pending; final assessment must include its results.
- Public booking must revalidate working hours, holidays, breaks and business timezone at submission; existing database reservation trigger already provides atomic overlap protection, so the earlier read/insert race claim alone is not a verified bypass.
- Make manual admin unlock/payment reconciliation transactional, server-calculated and audited; preserve complimentary unlocks and existing manual payment workflow. Manual administrator reconciliation is not the same as provider-verified settlement.
- Validate upload contents server-side, not merely browser MIME metadata, while preserving private tenant storage.
- Verify all appointment/customer/location references remain in the same tenant.
- Remove ineffective browser platform-role insertion during onboarding; check all required onboarding write failures.
- Hosted auth configuration, administrator MFA, password protection and recovery/session behavior need direct configuration reads and authenticated tests.
- Security headers and published response behavior, log retention, backups/restoration and repository history need verification.
- `.gitignore` is platform-protected and could not be edited to add environment exclusions. No secret values were printed. Its environment file currently contains publishable configuration, not a privileged key; repository history was not audited.
- Rate limiting has no standard backend primitive. An ad-hoc implementation requires the user's explicit acceptance of that tradeoff; none was added.

## Ongoing practices
Review dependency advisories regularly, restrict administrator accounts, rotate credentials known to have been disclosed, verify backup restoration, monitor auth/admin events without logging secrets or customer message bodies, and rerun security tests after permission changes.