# DSCR Market Entry: Deephaven Competitive Brief

**Prepared:** 2026-05-07
**Purpose:** Inform pricing-curve and tech-stack decisions for our DSCR program launch
**Backup detail:** `docs/research/deephaven-dscr-pricing-curve.md`

---

## Executive summary

Deephaven scaled DSCR origination from 16 to 300+ loans/month between May
2023 and May 2026 — riding sales/channel work plus a recent Lightning Docs
API integration that the press release oversells. They sit in the middle of
the DSCR rate band, not at the bottom. Their funding cost is market-standard
non-QM (DRMT 2026-INV2 cleared with normal credit support). Their actual
moat is integration depth and a 200+ correspondent network, not unique
technology — every tool in their stack is available off the shelf.

**We can launch a competitive DSCR program at par-curve parity, undercut
them by 25–50 bps in the volume-weighted middle of the matrix, and reach
that position without proprietary engineering risk.**

---

## What Deephaven looks like today

| Metric | Value |
|---|---|
| DSCR loans/month | 300+ (May 2026) |
| DSCR ramp | 16 → 199 → 300+ over 24 months |
| Non-QM volume target | $80B+ (2025) |
| Channels | Wholesale + Correspondent (200+ partners) |
| Footprint | 47+ states |
| Time-to-close | 14–21 days marketed |
| Owner | Pretium Partners (acq. from Värde, 2022) |
| Servicing sister co. | Selene Finance |
| Most recent securitization | DRMT 2026-INV2 — $296.2M, AAA CE 33.45% |

---

## DSCR market pricing — May 2026

Canonical scenario: 30yr fixed, SFR, NOO, purchase, **740 FICO, 75% LTV,
1.20+ DSCR, 5/4/3/2/1 PPP**.

| Lender / Source | Par rate at canonical |
|---|---|
| Market consensus (HomeAbroad / Defy) | **6.00 – 6.25%** |
| Deephaven (estimated band) | 6.125 – 6.375% |
| CoreVest / Lima One / Visio | 5.75 – 6.125% (tier-leaders) |
| Angel Oak / Kiavi | 6.50 – 7.25% (credit-flexible) |
| Foreign National premium | +75 bps (Deephaven); industry +50–75 |
| STR premium | +25–50 bps (Deephaven and most peers) |

Standard add-on stack across the market:
- LTV: 65 best, 70–75 +12.5–25 bps, 80 +25–50 bps
- DSCR: 1.25+ best, 1.00–1.24 +12.5–37.5 bps, <1.00 +50–150 bps
- FICO: 740+ best, stepped down to +50–150 bps at 620–679 with LTV cap
- PPP: 5yr declining = par; shorter PPP = +12.5–50 bps per year removed

---

## Where we beat them — pricing levers in priority order

| # | Lever | Mechanism | Estimated bps to borrower |
|---|---|---|---|
| 1 | Tighter PPP buyout grid | Cut 5→3 yr buyout from 75–100 bps to 50 bps | 25–50 bps optical savings |
| 2 | Eliminate / cap legal-UW fee | Cap at $995 vs. industry $1,995 | ~10 bps APR optical |
| 3 | Compress 700–739 / 70–75 LTV / 1.10–1.24 DSCR cell | Stack add-ons to 50 bps vs. industry 75 bps | 25 bps in volume-weighted middle |
| 4 | Price STR at par | No add-on instead of +25–50 | 25–50 bps in growing segment |
| 5 | Tighter foreign-national spread | +50 bps vs. their +75 | 25 bps in high-margin segment |
| 6 | Doc-automation parity at launch | Lightning Docs day one = same $500/loan as them | 15–30 bps amortized |
| 7 | Forward purchase line w/ insurance buyer | Thinner gain-on-sale | 12–25 bps to coupon |

**Compounded against the volume-weighted middle of the rate sheet, the
realistic spread we can advertise vs. Deephaven is 25–50 bps.**

---

## Tech stack — why we have no engineering disadvantage

Deephaven's "proprietary loan origination system" framing in their May 2026
press release is press-release spin. The evidence:

- They are actively hiring a **Senior Encompass Administrator** at Charlotte
  HQ. They run **Encompass (ICE Mortgage Tech)** — at minimum on the
  wholesale/correspondent side.
- Their broker-facing AUS (**IDENTI-FI**, powered by LoanScorecard) is
  documented as integrating *inside Encompass and Calyx Point*.
- Cloud: **AWS** (CloudFront, S3, SES indexed by RocketReach; "virtualized
  unified stack" per CTO).
- Income/bank-stmt OCR: **Ocrolus** (their case study claims 2+ hrs
  underwriter time saved per file).
- Doc generation: **Lightning Docs** (which itself is built on **Knackly** —
  confirmed via Lightning Docs' own public GitHub repos including a
  HotDocs→Knackly migration tool and a Knackly-API explorer notebook).

Every layer is a vendor we can also buy.

| Layer | Deephaven | Off-shelf for us | $/loan |
|---|---|---|---|
| LOS | Encompass + middleware | Encompass / LendingPad / BytePro | 150–300 |
| Non-QM AUS | LoanScorecard IDENTI-FI | LoanScorecard / Polly | 10–50 |
| Bank-stmt OCR | Ocrolus | Ocrolus / Plaid Income / FormFree | 5–15 |
| Doc generation | Lightning Docs (Knackly+Fortra) | Lightning Docs day one | 500 |
| PPE | (Polly or LoanPASS likely) | Polly / LoanPASS / Optimal Blue | 5–25 |
| Cloud | AWS | AWS / GCP | variable |

**Identifiable per-file tech cost: ~$670–890. Deephaven likely pays the
same.** Their advantage is 5 years of ops tuning, not unique technology.

---

## Recommended posture

1. **Price 25–50 bps under Deephaven's wholesale rate sheet at the canonical
   740/75/1.20 scenario at launch.** Hold parity at the high-FICO low-LTV
   corner; widen the gap in the volume-weighted middle.
2. **Buy the stack, don't build it.** Encompass + LoanScorecard + Ocrolus
   + Lightning Docs. Skip the 6–12 months of LOS development. Reuse capex
   for sales/channel hires.
3. **Eliminate the $1,995 legal/UW fee at launch as a marketing line.**
   Bundle into rate. Brokers and borrowers compare APRs.
4. **Native Encompass integration on day one** so brokers don't switch tools.
   IDENTI-FI parity (or a Polly equivalent) is the AUS bar to clear.
5. **Forward purchase line with an insurance buyer** to fund coupon parity
   without relying on volume to dilute fixed costs (Deephaven's lever).
6. **Reserve "proprietary tech" claims for things that are.** No press-release
   moats. Compete on price, speed, and broker UX.

---

## Risks and unknowns to validate before pricing committee

- Pull a current Deephaven Wholesale + Correspondent matrix PDF (the indexed
  ones are 12.01.23 / 02.20.24 — stale). Best path: through a broker partner.
- Pull KBRA presale on **DRMT 2026-INV2** for WAC and senior spread — single
  best proxy for Deephaven's all-in funding cost.
- Confirm live Deephaven rate at canonical scenario via DSCR Direct (updates
  hourly) — the public rate is the ceiling we have to beat.
- Confirm Deephaven LLC-vesting and STR add-ons (sources are inconsistent).
- Validate insurance-buyer appetite for forward-purchase committed line at
  the spread we'd need.

---

## Bottom line

Deephaven is a real, scaled competitor — but not a technologically
distinctive one. The headline integration story behind their growth is a
routine HTTP integration with a third-party doc-automation SaaS. Their
funding execution is market-standard. Every tool in their stack is for
sale. The competitive question is not "can we match the tech" — it's "are
we willing to clip 25–50 bps off the volume-weighted middle of the
wholesale rate sheet at launch and absorb thinner gain-on-sale until volume
dilutes our fixed costs." If the answer is yes, the product launch is a
sales-and-channel exercise, not an engineering one.
