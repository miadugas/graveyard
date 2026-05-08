# DSCR Launch — Competitive Intelligence Master Brief

**Subject:** Spring EQ LLC entry into DSCR business-purpose lending vs.
Deephaven Mortgage as the scaled non-QM incumbent.
**Prepared:** 2026-05-07
**Branch:** `claude/research-deephaven-dscr-IaKf7`
**Source PDF (Spring EQ guidelines):** `docs/research/sources/spring-eq-dscr-uw-guidelines.pdf` (Release Date 4/17/2026, NMLS #1464945)
**Companion docs (deduplicated into this one):**
`deephaven-dscr-pricing-curve.md`, `deephaven-dscr-vp-brief.md`,
`deephaven-strategic-vulnerability.md`, `spring-eq-vs-deephaven-comparison.md`

---

## 0. Reading guide

This is the canonical reference. Sections 1–3 set context. Section 4 is
the Deephaven profile. Section 5 is Spring EQ from our own UW guidelines.
Section 6 is the side-by-side. Section 7 names every entrenchment. Section
8 names every moat-buster. Sections 9–10 are pricing and territorial
context. Section 11 is the launch posture recommendation. Sections 12–13
are open data and references.

Every factual claim is sourced. Inferences are flagged "(inferred)".

---

## 1. Executive summary

Deephaven scaled DSCR origination from **16 loans/month (May 2023) to
>300/month (May 2026)** — about **$120M/month** at a $400k average
balance. They sit mid-pack on price (par ~6.125–6.375% at 740/75/1.20),
funded by a market-standard non-QM securitization shelf (DRMT, AAA
credit support 33.45%). Their press-release framing of a "proprietary
LOS" and "Lightning Docs API integration" overstates two routine
realities: they run **Encompass + LoanScorecard + Ocrolus + Lightning
Docs (which itself runs on Knackly)** — every component is a vendor we
can also buy.

Spring EQ's existing DSCR program is a **prime-credit niche product**,
materially tighter than Deephaven on borrower scope (no FN, no ITIN, no
non-PR, no first-time investors, US-citizen/PR only), property scope
(no STR via condotel ban, no rural, no >5 acres, no non-warrantable
condos, no mixed-use), and structure (no layered entities, $500k cash-
out cap, manual UW only, no transferred appraisals). Deephaven is
structurally better positioned to scale **breadth**; Spring EQ is
structurally better positioned to print **clean securitizations**.

**Recommended posture for launch:** stay niche, beat Deephaven by
**25–50 bps** in the cell where matrices overlap (700+ FICO, 1.00+
DSCR, vanilla SFR/2–4 unit, US citizens/PRs), fund the discount through
tighter eventual securitization economics, and pursue **NY licensing**
plus **PPP-buyout-grid transparency** as the two near-term moat-busters
that don't require new product builds.

---

## 2. Trigger / scope

The work was prompted by NMP coverage: *"Deephaven Scales DSCR Lending
Nationwide With API Integration, Surpasses 300 Loans Per Month"* (May 5,
2026). The article is paywalled (HTTP 403 to the fetcher), so all
Deephaven-side facts in this doc are reconstructed from:

- The PR Newswire press release behind the same announcement
- KBRA / National Mortgage News coverage of the DRMT 2026-INV2
  securitization
- HousingWire and Vaultedge interviews with CTO Matthew Lehnen and
  CSO Tom Davis
- Third-party rate aggregators (DSCR Direct, HomeAbroad, Defy)
- Competitor comparison sites (OfferMarket, HonestCasa, Stacking Capital)
- Lightning Docs' **public GitHub organization** (the most useful
  technical signal — see §4.6)
- RocketReach / The Org / LinkedIn for org structure

All Spring EQ facts are direct from `DSCR UW Guidelines.pdf` Release
Date 4/17/2026.

### Scraping limitations encountered

- `deephavenmortgage.com`, `lightningdocs.ai`, `lightningdocs.com`,
  `nationalmortgageprofessional.com`, and `drive.google.com` all
  returned `Host not in allowlist` (HTTP 403) from this container's
  egress proxy. Direct scraping of those domains was not possible from
  the sandbox.
- WebFetch on the same hosts returned 403.
- GitHub API access succeeded for the public LightningDocs org, which
  is where the technical reverse-engineering came from.
- Indexed third-party sources (search summaries) backfilled most
  Deephaven-product content.

---

## 3. Entities at a glance

| Entity | Role | Key facts |
|---|---|---|
| **Spring EQ LLC** | Us — entering DSCR | NMLS #1464945; 1 West Elm St, Ste 450, Conshohocken PA 19428; T 215-302-3850 |
| **Deephaven Mortgage LLC** | Scaled non-QM incumbent | NMLS #958425; 3530 Toringdon Way, Ste 300, Charlotte NC 28277; ~274 employees |
| **Pretium Partners** | Deephaven's parent | Manhattan-based alt-asset manager (~$50B+ AUM); acq. Deephaven from Värde 2022 |
| **Selene Finance** | Deephaven sister-co (servicing) | Houston TX; vertical origination → servicing pipeline |
| **Select Portfolio Servicing (SPS)** | Spring EQ's servicer (per mortgagee clause) | PO Box 7277, Springfield OH 45501 |
| **Lightning Docs LLC** | Deephaven's doc-gen vendor | Owned by **Fortra Law** (rebranded from Geraci LLP); CEO Nema Daghbandan |
| **Fortra Law / Geraci LLP** | Lightning Docs parent | Largest private-lending law firm in US; templates are the actual IP |
| **Knackly Inc.** | Engine under Lightning Docs | knackly.io; SaaS HotDocs replacement; founded by HotDocs veterans |
| **LoanScorecard** | Deephaven's AUS engine | Powers IDENTI-FI AUS for Deephaven's correspondent and broker channels |
| **Ocrolus** | Deephaven's bank-stmt OCR | >99% accuracy claimed; Deephaven case study claims 2+ hr UW time saved/file |
| **ICE Mortgage Technology (Encompass)** | Deephaven's LOS | Confirmed via active hiring of Senior Encompass Administrator |

---

## 4. Deephaven profile

### 4.1 Volume and scale

| Metric | Value | Source |
|---|---|---|
| DSCR loans, May 2023 | 16 | PR Newswire press release; HousingWire |
| DSCR loans, ~Oct 2023 | ~32 (doubled in 5 mo) | PR Newswire |
| DSCR loans, Y1 cumulative | 199 | PR Newswire |
| DSCR loans, May 2026 | >300/month | PR Newswire; NMP |
| Implied DSCR $/month | ~$120M (300 × $400k avg) | inferred |
| Total non-QM volume target | >$80B (2025) | HousingWire / Tom Davis |
| Equity-product volume call-out | $150B segment, ~15% of overall origination market | HousingWire |
| Employees | ~274 across N. America + Europe | The Org / RocketReach (Jan 2026) |
| IT team | ~8 staff under CTO Matthew Lehnen | RocketReach |

### 4.2 Product matrix (reconstructed; matrix PDFs publicly indexed are 12/2023, 02/2024 — stale)

| Lever | Deephaven (apparent) | Source |
|---|---|---|
| Min FICO | 620 (best 740+) | DSCR Direct, HomeAbroad |
| Max LTV (purchase, 1.0+ DSCR) | ~80% (some marketing claims 90% w/ conditions) | DSCR Direct, marketing pages |
| Max loan amount | $3.5M | Multiple aggregators |
| DSCR floor | <1.00x permitted with min loan + LTV haircut | Indexed Corr DSCR matrix 12.01.23 |
| Declining-market haircut | -5% LTV | Indexed matrix |
| Unleased property | max 70% LTV refi, no haircut on purchase | Indexed matrix |
| First-time investor | max 75% LTV | Indexed matrix |
| PPP options | 5/4/3/2/1, 3/2/1, 2/1, 1-yr, **buyout available** | Indexed matrix; Mo Abdel guide |
| Foreign National | Yes — dedicated program (+75 bps band typical) | BusinessWire 2021; HomeAbroad |
| Vesting | Individual + LLC | Marketing pages |
| STR | Permitted with +25–50 bps add-on | DSCR Direct, Defy |
| Geography | 47 states + DC (excludes MO, NY, WV) | Deephaven Disclosures page |
| Time to close | 14–21 days marketed | DSCR Direct |
| Origination fee | 1–2% market norm | OfferMarket |
| Legal/UW fee | ~$1,995 typical for category | DSCR Direct |

### 4.3 Channels

- **Wholesale.** ~1,000 broker network. Field organized East/West.
  Active Wholesale AE openings on Pretium's Workday (i.e., bench is
  still being built).
- **Correspondent.** **200+ partner lenders** delegated and non-
  delegated. Products: Expanded-Prime, Non-Prime, DSCR.
- **Foreign National DSCR.** Dedicated program (expanded Dec 2021,
  per BusinessWire).

### 4.4 Wholesale field organization

| Role | Person | Base | Coverage | Source |
|---|---|---|---|---|
| Senior RVP, Wholesale (AE leadership) | **Sunny Thiara** | San Francisco CA | West / national | NMP |
| Senior RVP, Wholesale (AE leadership) | **Luke Turner** | Charlotte NC | East / national | NMP, Deephaven sales team page |
| RVP Wholesale Sales East | **Jason Dumke** | — | East of TX | NMP |
| Western RVP Wholesale Sales | **Patrick Creek** | — | West of TX | MPA |
| Western expansion lead | **Paul Howarth** | Huntington Beach CA | West AE bench | NMP |
| CSO | **Tom Davis** | — | Industry-facing voice | HousingWire |
| CTO | **Matthew Lehnen** | — | ~5 yr tenure | LinkedIn / The Org |

### 4.5 Geographic footprint

NMLS #958425. **Licensed in 47 states + DC:**

> AL, AK, AZ, AR, CA, CO, CT, DC, DE, FL, GA, HI, ID, IL, IN, IA, KS, KY,
> LA, ME, MD, MA, MI, MN, MS, MT, NE, NV, NH, NJ, NM, NC, ND, OH, OK, OR,
> PA, RI, SC, SD, TN, TX, UT, VT, VA, WA, WI, WY

**Not licensed: Missouri, New York, West Virginia.**

NY is the meaningful gap — NY non-QM business-purpose lending has state-
specific PPP restrictions, RPL exemptions, and licensing complexity.
Industry-wide non-QM RMBS pools concentrate ~10% in NY (S&P Global).

### 4.6 Tech stack — what it actually runs on

#### Loan origination
- **Encompass (ICE Mortgage Technology)** — confirmed via active hiring
  of a **Senior Encompass Administrator** at Charlotte HQ (Indeed,
  Glassdoor). Their May 2026 press-release framing of a "proprietary LOS"
  is press-release spin; the most plausible read is Encompass + custom
  middleware for business-purpose flows that don't fit Encompass's
  QM-default workflow.
- Also references to Calyx Point as a broker-side LOS for IDENTI-FI AUS
  access.

#### AUS / decisioning
- **IDENTI-FI AUS**, powered by LoanScorecard's **Portfolio Underwriter**.
  Deployed inside Encompass and Calyx Point as direct integrations
  (GlobeNewswire 2018, 2019, 2020).
- Returns non-QM fit decisions in seconds (per the LoanScorecard release).

#### OCR / document AI
- **Ocrolus** — bank-statement and income parsing. Their public case
  study claims **2+ hours of underwriter time saved per file** at
  Deephaven, and credits Deephaven with $5B in private liquidity for
  mortgage loans in 2019.

#### Doc generation (the headline "API integration")
- **Lightning Docs.** Generates 90+ page attorney-prepared loan packages
  for bridge / fix-flip / construction / DSCR rental / portfolio rental,
  all 50 states, with state-specific compliance.
- Pricing **$500/loan flat**, no re-draw fees (per their FAQ).
- Used by **>60% of top-50 private lenders**, **>4,000 transactions/mo**,
  **>$2B/mo originations**, **>$50B cumulative since 2018**.
- Deephaven press release dated May 5, 2026 announcing custom API
  integration was the trigger for this entire research stream.

#### Lightning Docs is built on Knackly (the technical reveal)
- Confirmed via Lightning Docs' **public GitHub org**
  `github.com/LightningDocs` (3 public repos):
  1. **`LightningDocs-Knackly-API`** — Jupyter Notebook (Python),
     510 KB, created Oct 26 2023, last pushed Dec 29 2025. Reference /
     exploration code for the Knackly REST API.
  2. **`KnacklyWebhookTesting`** — Python, 33 KB, created Feb 7 2024.
     Their description verbatim: *"Webhook testing whilst we develop our
     billing system more fully."* I.e., Knackly fires a webhook each
     time a doc package is generated, and Lightning Docs invoices off
     that event.
  3. **`anx2json`** — converts HotDocs `.anx` answer files to Knackly
     `.json`. Migration tool from the legacy HotDocs platform to Knackly.
- **Knackly Inc.** is a SaaS HotDocs replacement built by HotDocs
  veterans. REST API (JSON-only, Bearer token), Postman collection
  publicly indexed at `documenter.getpostman.com/view/6868588/SzS7QReU`.
  Architecture: workspace → catalog → app/template.
- **The "Lightning Docs API" is functionally a thin facade over
  Knackly's REST API.** The actual IP Fortra Law sells is the legal
  templates, not the engine.
- Lightning Docs 2.0 (released Oct 22, 2024) launched the "open-ended
  API" with pre-built integrations to Salesforce, Encompass, Mortgage
  Office, LendingWise, Liquid Logics, Mortgage Automator, Elphi, ABS.
  Deephaven's "custom" integration was needed because their LOS is
  in-house (or heavily customized Encompass) and not on the prebuilt
  list.

#### Cloud / infra
- **AWS** — CloudFront, S3, SES indexed by RocketReach (51 technologies
  identified total).
- "Virtualized environment, very nimble, very quick to deploy, very
  scalable" per CTO Lehnen on the Vaultedge Mortgage Vault Podcast.

#### Cybersecurity
- "All of Deephaven's cybersecurity stack incorporates AI" per CTO
  interview. Generic positioning, no specific vendor disclosed.

### 4.7 Funding / secondary execution

- **DRMT 2026-INV2** — Deephaven's most recent securitization. ~$296.2M
  ($289M+ premarketing per IFR), KBRA-rated, 10 tranches across A/M/B.
- A1 credit enhancement: **33.45%**; A1A: **43.45%**. Mainstream non-QM
  execution.
- Pool composition: 100% non-owner-occupied investor first-liens; only
  2.6% full doc, balance is DSCR + 12–23 months of bank statements.
- ATR/QM exempt due to business-purpose origination.
- Sources: KBRA presale; National Mortgage News; AI Journal; IFR.

**Key implication:** Deephaven is **not getting an exotic funding edge**.
The non-QM AAA market clears at standard credit support for DRMT. Their
edge is operational maturity, not cost of funds.

### 4.8 Identifiable per-file tech cost stack

| Layer | Vendor | $/loan |
|---|---|---|
| LOS | Encompass + middleware | $150–300 |
| Non-QM AUS | LoanScorecard IDENTI-FI | $10–50 |
| Bank-statement / income OCR | Ocrolus | $5–15 |
| Doc generation | Lightning Docs ($500 flat) | $500 |
| Pricing engine | (likely Polly or LoanPASS) | $5–25 |
| Cloud | AWS | variable |
| **Total identifiable** | | **~$670–890/loan** |

Spring EQ can buy the same stack at the same cost; the Deephaven
advantage is integration depth and ops headcount, not unique pricing.

---

## 5. Spring EQ DSCR program (verbatim from `spring-eq-dscr-uw-guidelines.pdf`)

### 5.1 Underwriting philosophy

- **All Spring EQ originated or purchased loans are manually
  underwritten.** Additional info may be requested at UW discretion.
- No employment disclosure on Form 1003.
- No personal income / no tax returns / no transcripts.
- Form 1003 must include Schedule of REO listing primary + subject.

### 5.2 Eligibility matrix

#### DSCR ≥ 1.00x

| FICO | Max Loan | R/T + Purchase LTV | Cash-Out LTV |
|---|---|---|---|
| 740+ | **$2,500,000** | 80% | 75% |
| 700–739 | $1,500,000 | 80% | 70% |
| 680–699 | $1,500,000 | 75% | 65% |
| 660–679 | $1,500,000 | 70% | 60% |

#### DSCR 0.75x – 0.99x

| FICO | Max Loan | R/T + Purchase LTV | Cash-Out LTV |
|---|---|---|---|
| 740+ | $1,500,000 | 70% | 60% |
| 700–739 | $1,500,000 | 70% | 60% |
| 680–699 | not eligible | — | — |
| 660–679 | not eligible | — | — |

- Min DSCR: **0.75x**
- Min DSCR for loans > $1.5M: **1.00x**

### 5.3 Product terms

- **30-year fixed, fully amortizing only.** No ARM, no IO.
- Min loan: **$100,000**.
- Max cash-out: **$500,000 hard cap**.
- Cash-out trigger: any refi where borrower receives back > greater of
  1% of new loan amount or $2,000.

### 5.4 DSCR eligibility criteria (eligibility ≠ matrix)

- Transaction must be commercial/business purpose. Borrower executes
  Spring EQ Business Purpose and Occupancy Affidavit.
- All cash-out proceeds must be used for business purposes.
- **No limit** to number of owned/financed properties.
- **Layered entities are NOT permitted.** (Entity-owned-by-entity
  structures excluded.)
- **First-time homebuyers NOT permitted.** Defined as no mortgage or
  ownership in a residential property in past 3 years prior to
  application.
- High-Cost loans not permitted.
- **Non-Permanent Residents NOT permitted** (borrowers or guarantors).
- Non-arm's length transactions not permitted.
- Investment properties only.

### 5.5 Prepayment penalty (PPP)

- **No-PPP option.**
- **1-year PPP: 3%** (within 12 mo, prepayments > 20% of original
  principal trigger fee).
- **3-year PPP: 3%/2%/1%.**
- **5-year PPP: 5%/4%/3%/2%/1%.**
- All PPPs based on curtailment amount.
- 20% annual safe-harbor on prepayments.
- **PPP prohibited states:** AK, MN, NJ, NM, NC, KS, MI, PA, OH, RI.
  (Locked + disclosed as "No PPP" in these states.)

### 5.6 Geographic footprint

- **Ineligible states: Hawaii, New York.**
- Effectively licensed/eligible in **48 states + DC**.

### 5.7 Document age limits (vs. note date)

- Credit: 90 calendar days
- Title: 90 calendar days
- Appraisal: 120 calendar days
- Assets: 60 calendar days

### 5.8 Documentation requirements

- Full interior appraisal (Form 1004, 1025, or 1073) **with comparable
  rent schedule**.
- Purchase: fully executed sales contract + proof & source of down
  payment.
- **All appraisals must be ordered by Spring EQ.**
- **Transferred appraisals NOT permitted.**

### 5.9 DSCR calculation

- DSCR = Annual Gross Rental Income ÷ Annual PITIA (or ITIA) for
  subject.
- **Long-term rental only.**
- Rental income = comparable rent schedule.
- Two appraisals: lower of two values and rents used.
- Vacant property (per appraisal): may use Form 1007 alone for rents,
  no lease required.
- Multi-unit refi: 1 vacant unit OK on 2–3 unit; 2 vacancies OK on 4
  unit.
- **Properties leased to family members are ineligible.**

### 5.10 Borrower / vesting eligibility

#### Eligible
- US Citizen or Permanent Resident only.
- Permanent Resident must have valid I-551 card or passport with I-551
  processing stamp.
- Vesting types: Individuals, Joint Tenants, Tenants in Common,
  Inter-Vivos Revocable / Living Family / Revocable Family Trust, LLC,
  Limited and General Partnerships, Corporations.

#### LLC / business entity vesting (investment property only)
- Entity must be domiciled in US state.
- **Max 4 owners/members.**
- **Personal Guarantee required if lending to a business entity.** When
  lending to an individual whose subject property is vested in a
  business entity, no personal guarantee is required.
- Each entity member on the loan signs security instruments.
- **Min 50% of vesting entity ownership must be borrowers/guarantors.**
- Documentation: Articles of Org, EIN, Certificate of Good Standing,
  Operating Agreement, Cert of Authorization, LLC Borrowing Cert.

#### Ineligible borrowers
- **Trusts (Irrevocable, Land, Blind).**
- Business entities whose members include other LLCs/Corps/
  Partnerships/Trusts (the "layered entity" ban).
- Guardianships.
- Non-arm's length.
- Persons/entities party to a lawsuit.
- **Persons with an ITIN.**

### 5.11 Credit requirements

- **Frozen credit not allowed.**
- Repositories: Experian, Equifax, TransUnion only.
- **Min 2 credit scores required.**
- Score selected: middle of 3, lower of 2; lowest among multiple
  borrowers.
- Min 3 tradelines, with at least one open with last activity within 6
  months and reporting 12+ months. Authorized-user accounts don't
  count.
- Inquiry written explanation NOT required (DSCR-specific exception).
- Foreign credit not OK (because credit score required).
- Non-traditional credit reports not OK.

### 5.12 Payment history

- **No mortgage / HELOC lates of any kind in last 12 months.**
- Most recent mortgage statement on primary AND subject cannot show
  past-due payments.

### 5.13 Significant derogatory credit

- **BK / FC / SS / DIL / Modification: 4 years seasoning** + credit
  must be re-established.

### 5.14 Major adverse credit

- Collections / non-mortgage charge-offs:
  - $250+ individually OR $1,000+ in aggregate must be paid prior to
    closing.
- **All state, IRS, and property tax liens must be paid in full**
  (regardless of seasoning, regardless of whether they affect title).
  No payment plans, no subordination.

### 5.15 Cash to close

- Asset documentation required showing sufficient funds, statement
  within 60 days of close.

### 5.16 Property eligibility

#### Eligible
- Single-family (Detached, Attached)
- 2–4 family
- PUDs
- Condo units in **warrantable** condo projects

#### Ineligible (full list — exhaustive)
- 5+ unit
- < 600 sqft GLA
- Manufactured (incl. on-frame modular, even if titled real)
- Mobile homes
- Cooperatives
- **Condotels / hotel condominiums**
- **Non-warrantable condos**
- Timeshares
- Working farms / ranches
- Unimproved land
- Property currently in litigation
- Land Trust
- Condition rating C5/C6 or Quality rating Q6
- Land contracts
- Leaseholds
- **Rural properties**
- **>5 acres**
- **Mixed-use**
- Homes used commercially (assisted living, daycare)
- Federal/state Indian reservations
- Log homes
- Houseboats
- Geodesic domes
- Commercial properties
- Properties under construction
- Properties not accessible by local-standard roads
- Properties not suitable for year-round occupancy
- Properties with non-residential income-producing structures
  (billboards, cell towers, commercial workshop)

### 5.17 Property valuation

- Second full appraisal required when **loan amount > $1,000,000**.
- Value seasoning: if purchased within last 6 months, lesser of
  current appraised value or most recent purchase price + documented
  improvements.
- Listed-for-sale: must be removed from market prior to application.

### 5.18 Flip rules

- Flip = resold within 180 days with > 10% price increase.
- 2nd full appraisal required:
  - >10% increase if seller acquired in past 90 days
  - >20% increase if seller acquired in past 91–180 days

### 5.19 Other terms

- **Subordinate financing NOT permitted** (except solar liens / PACE
  per FNMA selling guide).
- Senior balloon mortgages may be eligible for refi if active repayment
  + 12+ months timely history.
- POA permitted only for US Citizen / PR; **not allowed for LLC, GP,
  or Corp vesting**; transaction-specific with subject address; expiry
  date required; not for cash-out; recorded with mortgage/DOT;
  interested party cannot act as POA.
- No escrow holdbacks.
- Max 6% seller / interested-party concession (lesser of price or value).
- Rent-loss insurance ≥ 6 months of local average monthly rents.
- FEMA disaster: post-disaster collateral valuation OR inspection
  required.
- Mortgagee clause: Select Portfolio Servicing, INC, PO Box 7277,
  Springfield OH 45501.
- LDP / SAM exclusionary list — any material party listed = ineligible.

---

## 6. Side-by-side parameter map (every cell, deduplicated)

Grade key: **=** parity; **DH+** Deephaven advantaged; **SE+** Spring EQ
advantaged.

### 6.1 Borrower scope

| Parameter | Spring EQ | Deephaven (est.) | Grade |
|---|---|---|---|
| Min FICO | 660 | 620 | DH+ |
| Foreign National | NOT permitted | Dedicated program (+75 bps) | DH+ |
| ITIN | NOT permitted | Permitted in non-trad doc programs | DH+ |
| Non-Permanent Residents | NOT permitted | Permitted | DH+ |
| First-time investors | NOT permitted (3-yr lookback) | Permitted, max 75% LTV | DH+ |
| Trusts (irrevocable, land, blind) | Not permitted | Likely similar | = |
| Guardianships / lawsuit parties | Not permitted | Likely similar | = |
| US Citizen / Perm. Resident | Permitted | Permitted | = |
| Layered entities (entity-owned-by-entity) | NOT permitted | Permitted | DH+ |
| Max LLC members | 4 | Typically more | DH+ |
| LLC vesting (4 or fewer) | Permitted | Permitted | = |
| 50% ownership rep on loan | Required | Likely similar | = |
| Personal guarantee for entity loans | Required | Required (industry std) | = |

### 6.2 Loan size & structure

| Parameter | Spring EQ | Deephaven | Grade |
|---|---|---|---|
| Min loan | $100k | $100k typical | = |
| Max loan @ 740+ | $2.5M | ~$3.5M | DH+ |
| Max loan @ 700–739 | $1.5M | ~$3M | DH+ |
| Max loan @ 660–679 | $1.5M | ~$2M | DH+ |
| Cash-out cap | $500k hard | Not capped at this level | DH+ |
| Term | 30yr fixed, fully amortizing | 30yr fixed + ARM + IO | DH+ |
| ARM / IO | None | Available | DH+ |
| Subordinate financing | NOT permitted (solar/PACE only) | Permitted (incl. DSCR Second) | DH+ |
| HELOC / DSCR Second product | Not in this program | Equity Advantage HELOC up to $1M | DH+ |
| POA for LLC/GP/Corp vesting | Not allowed | Likely permitted | DH+ |

### 6.3 LTV grid

| Cell (FICO / DSCR / direction) | Spring EQ | Deephaven (est.) | Grade |
|---|---|---|---|
| 740+ / 1.0+ / Purch+RT | 80% | ~80% | = |
| 740+ / 1.0+ / C-O | 75% | ~75% | = |
| 700–739 / 1.0+ / Purch+RT | 80% | ~80% | = |
| 700–739 / 1.0+ / C-O | 70% | ~75% | DH+ |
| 680–699 / 1.0+ / Purch+RT | 75% | ~75% | = |
| 680–699 / 1.0+ / C-O | 65% | ~70% | DH+ |
| 660–679 / 1.0+ / Purch+RT | 70% | ~70% | = |
| 660–679 / 1.0+ / C-O | 60% | ~65% | DH+ |
| 620–659 / 1.0+ | not eligible | likely ~65% w/ caps | DH+ |
| Sub-1.0 DSCR (0.75–0.99) / 740+ | 70% Purch / 60% C-O | similar w/ haircuts | = |
| Sub-1.0 DSCR / 680–699 | not eligible | likely permitted | DH+ |
| Declining-market haircut | (not specified) | -5% LTV | (DH explicit) |

### 6.4 DSCR / income calc

| Parameter | Spring EQ | Deephaven | Grade |
|---|---|---|---|
| Min DSCR | 0.75x | <1.00x permitted | = |
| Loan > $1.5M DSCR floor | 1.00x req. | likely similar | = |
| Long-term rental calc (1007/1025) | Yes — only method | Yes | = |
| **STR / Airbnb / VRBO platform income** | **NOT supported** | **Permitted (+25–50 bps)** | **DH+** |
| Family-leased | Ineligible | Likely ineligible | = |
| Vacant unit refi (multi-family) | 1 on 2–3 unit, 2 on 4 unit | Likely similar | = |

### 6.5 Property scope

| Property type | Spring EQ | Deephaven | Grade |
|---|---|---|---|
| SFR (det/att) | Eligible | Eligible | = |
| 2–4 unit | Eligible | Eligible | = |
| PUD | Eligible | Eligible | = |
| Warrantable condo | Eligible | Eligible | = |
| **Non-warrantable condo** | **Ineligible** | Permitted | DH+ |
| **Condotel / hotel condo** | **Ineligible** | Permitted | DH+ |
| 5+ unit | Ineligible | Ineligible (typical) | = |
| < 600 sqft | Ineligible | Likely similar | = |
| Manufactured / mobile | Ineligible | Likely similar | = |
| Co-op | Ineligible | Likely similar | = |
| **Rural properties** | **Ineligible** | Permitted | DH+ |
| **>5 acres** | **Ineligible** | Permitted | DH+ |
| **Mixed-use** | **Ineligible** | Permitted | DH+ |
| Working farm / ranch | Ineligible | Ineligible | = |
| Log / houseboat / geodesic | Ineligible | Likely similar | = |
| Indian reservations | Ineligible | Ineligible (typical) | = |
| C5/C6 condition / Q6 quality | Ineligible | Ineligible | = |

### 6.6 Credit / payment history

| Parameter | Spring EQ | Deephaven | Grade |
|---|---|---|---|
| Min credit scores required | 2 | 2 typical | = |
| Repositories | Exp / Equ / TU only | Same | = |
| Frozen credit | Not allowed | Same | = |
| Tradelines | 3 (1 open last 6 mo) | similar | = |
| Authorized-user accounts | Don't count | Same | = |
| 12-mo mortgage lates | Zero tolerance | Zero tolerance | = |
| **BK/FC/SS/DIL/Mod seasoning** | **4 years** | **2–3 years typical** | **DH+** |
| Collections threshold | $250+/$1,000 must pay | Similar | = |
| Tax liens | All paid in full, no plans | Similar | = |
| Inquiry letters | Not required | Likely not required | = |
| Foreign credit | Not allowed | Allowed for FN program | DH+ |
| Non-traditional credit | Not allowed | Likely not allowed | = |

### 6.7 PPP

| Parameter | Spring EQ | Deephaven | Grade |
|---|---|---|---|
| PPP options | None / 1yr 3% / 3yr 3-2-1 / 5yr 5-4-3-2-1 | None / 1 / 2 / 3 / 5 yr (5-4-3-2-1) | DH+ (extra 2yr option) |
| **Published PPP buyout grid** | Not addressed | Available | **DH+** |
| PPP banned states | AK MN NJ NM NC KS MI PA OH RI | similar | = |

### 6.8 Documentation / appraisal / closing

| Parameter | Spring EQ | Deephaven | Grade |
|---|---|---|---|
| **Appraisal ordered by lender** | **Always Spring EQ** | Likely permits transfer | DH+ |
| **Transferred appraisals** | **NOT permitted** | Likely permitted | DH+ |
| 2nd appraisal threshold | Loans > $1M | Loans > $1.5M typical | DH+ |
| Credit doc age | 90 days | Similar | = |
| Title doc age | 90 days | Similar | = |
| Appraisal age | 120 days | Similar | = |
| Asset doc age | 60 days | Similar | = |
| **UW method** | **Manual only** | **IDENTI-FI AUS automated decisioning** | **DH+** |
| **Time to close (marketed)** | Not stated; ~21–30 days inferred | **14–21 days** | **DH+** |
| Power of Attorney | Permitted w/ restrictions | Likely permitted | = |
| Escrow holdbacks | Not permitted | Industry std varies | = |
| Max 6% seller concession | Yes | Industry std | = |
| Rent loss insurance | ≥ 6 mo | Likely similar | = |

### 6.9 Servicing & secondary

| Parameter | Spring EQ | Deephaven | Grade |
|---|---|---|---|
| Servicer | Select Portfolio Servicing (3rd party, OH) | Selene Finance (sister co., Houston TX) | DH+ |
| Vertical integration | None | Origination → Selene servicing | DH+ |
| Securitization shelf | None established for DSCR | DRMT shelf, multiple deals | DH+ |
| Most recent deal | n/a | DRMT 2026-INV2 ~$296M, AAA CE 33.45% | DH+ |
| Investor relationships | Building | Established (insurance buyers) | DH+ |

### 6.10 Channels & distribution

| Parameter | Spring EQ | Deephaven | Grade |
|---|---|---|---|
| Wholesale broker base | (not in this doc; HELOC base existing) | ~1,000 brokers | DH+ |
| Correspondent partners | (not in this doc) | 200+ delegated/non-delegated | DH+ |
| AE field | (not in this doc) | East/West RVPs + AE bench, still hiring | DH+ |
| AUS in broker portal | None | IDENTI-FI in Encompass + Calyx | DH+ |
| Broker self-quote | Not visible — call required (inferred) | IDENTI-FI returns fit + price | DH+ |

### 6.11 Tech stack

| Layer | Spring EQ (assumed) | Deephaven | Grade |
|---|---|---|---|
| LOS | (not in this doc) | Encompass + custom middleware | DH+ |
| AUS | None (manual) | IDENTI-FI / LoanScorecard | DH+ |
| Bank-stmt OCR | (not in this doc) | Ocrolus | DH+ |
| Doc generation | (not in this doc) | Lightning Docs (Knackly + Fortra) | (open) |
| Pricing engine | (not in this doc) | Polly / LoanPASS likely | (open) |
| Cloud | (not in this doc) | AWS | (open) |

### 6.12 Geography

| Parameter | Spring EQ | Deephaven | Grade |
|---|---|---|---|
| Total state count | 48 + DC | 47 + DC | SE+ |
| Ineligible states | HI, NY | MO, NY, WV | mixed |
| NY status | Not permitted | Not permitted | = (both miss the prize) |
| HI status | Not permitted | Permitted | DH+ |
| MO status | Permitted | Not permitted | SE+ |
| WV status | Permitted | Not permitted | SE+ |

### 6.13 Currency / freshness

| Parameter | Spring EQ | Deephaven | Grade |
|---|---|---|---|
| Guidelines release date | **4/17/2026 (current)** | Indexed matrices 12/01/2023 + 02/20/2024 (stale) | SE+ |

---

## 7. Entrenchments — where Deephaven is hard to dislodge

These are positions Spring EQ should **plan around, not through**. First-
year displacement is unlikely; design the launch to coexist.

### 7.1 Borrower-segment entrenchments

1. **Foreign National.** Deephaven has a dedicated program; we have a
   ban. LATAM and Asian capital flowing into US rentals goes to them by
   default. (Source: BusinessWire Dec 2021 announcement; HomeAbroad
   pricing comp.)
2. **ITIN borrowers.** Same forfeit.
3. **Non-Permanent Residents.** Same forfeit.
4. **First-time investors.** Their permitted-with-LTV-cap (max 75%) vs.
   our outright 3-yr-lookback ban. The "BiggerPockets generation" of
   new investors goes to them. Significant volume segment.
5. **Sub-660 FICO investors (620–659).** We have a hard floor at 660;
   Deephaven goes to 620.

### 7.2 Loan-structure entrenchments

6. **Big-ticket loans ($2.5M+).** Our matrix tops out where theirs
   continues to $3.5M. High-NW investors flow to them.
7. **Layered entities / holdco vesting / >4 LLC members.** They permit;
   we ban outright. Sophisticated investors holding via parent-LLC or
   family-LLC structures lock us out.
8. **Big cash-out (>$500k) refis.** Our hard cap kills BRRRR-strategy
   investors who refi out portfolio positions.
9. **Subordinate financing / DSCR Second / DSCR HELOC.** They sell a
   product ladder (Equity Advantage HELOC up to $1M + DSCR 2nd + DSCR
   1st). We sell a single rung.
10. **ARM and IO products.** Their menu includes; ours doesn't.

### 7.3 Property-scope entrenchments

11. **STR investors (Airbnb / VRBO).** Our long-term-lease-only DSCR
    calc + condotel ban + non-warrantable condo ban = STR investors
    walk. Deephaven takes 25–50 bps and books it.
12. **Beach / resort / mountain investors.** Condotel + non-warrantable
    condo ban removes the resort-rental segment.
13. **Rural and >5-acre investors.** Our ban; their permission. Farm-
    land-with-residence and rural-investor segments forfeited.
14. **Mixed-use.** Same forfeit.

### 7.4 Operational entrenchments

15. **Speed to close (14–21 days vs. our ~21–30 days).** Manual UW +
    lender-ordered appraisal + transfer ban = structural ~7–10 day gap.
16. **Speed to quote.** IDENTI-FI returns AUS fit decisions in 1–3 min
    inside Encompass. We are manual UW with no AUS — broker self-quote
    is not possible, every file requires a phone call.
17. **Selene servicing integration.** ~5–10 bps execution efficiency
    we can't match without buying or partnering with a servicer.
18. **DRMT securitization shelf.** Multiple completed deals = investor
    familiarity = tighter senior spreads. Our shelf starts at zero.
19. **Pretium balance sheet capacity.** $50B+ AUM parent gives them
    appetite to hold loans through volatile windows. We cannot match
    without committed warehousing.

### 7.5 Distribution entrenchments

20. **200+ correspondent partner contracts.** Multi-month legal/
    compliance work to displace. Switching cost is high.
21. **Carolinas / mid-Atlantic wholesale relationships.** Charlotte HQ
    + Luke Turner RVP East = deep, multi-year broker relationships.
22. **Bay Area / NorCal wholesale relationships.** Sunny Thiara senior
    RVP in SF anchors top CA broker shops.
23. **Tom Davis as known industry voice.** Free distribution on
    HousingWire / NMP / podcast circuit.
24. **AAPL sponsorship + industry conference presence.** Lead
    generation we don't have.

### 7.6 Brand / regulatory entrenchments

25. **"Non-QM pioneer since 2012" recall.** Even at price parity,
    new entrants pay an attention tax to be considered.
26. **13 years of dialogue with 47 state regulators.** We start that
    clock at zero in any state where we don't currently lend.
27. **Lightning Docs partnership.** Cosmetic in technical terms, but
    real in PR currency among brokers and corr partners.

---

## 8. Moat busters — where we attack

Each moat-buster is rated by **leverage** (impact on broker / borrower
choice) and **cost** (engineering / legal / pricing trade required).

### 8.1 Tier 1 — high leverage, low-to-medium cost

| Moat-buster | Leverage | Cost | Notes |
|---|---|---|---|
| **NY licensing.** Both Spring EQ and Deephaven exclude NY. ~10% of national non-QM volume sits unbooked. First mover wins. | **Very high** | Medium (3–6 mo legal/compliance + match NY PPP-restriction rules with our 1/3/5yr structures) | The single biggest white space against Deephaven. |
| **PPP buyout grid published.** Deephaven has a buyout option but doesn't publish pricing transparently. Publishing a flat $X-per-bps buyout grid is a visible price signal that doesn't touch coupon. | High | Low (rate sheet update) | Quick win. Brokers and borrowers respond to price clarity. |
| **Beat 25–50 bps in the 700–739 / 70–75 LTV / 1.20+ DSCR overlap cell.** This is the volume-weighted middle of the matrix where our scope and theirs collide. | High | Medium (margin trade; clean book funds it via tighter eventual securitization) | Pricing-committee decision. |
| **Cross-sell from Spring EQ HELOC originator base.** Existing brokers who already trust the Spring EQ name. Warm-start vs. cold acquisition. | High | Low (channel marketing motion) | Asset Deephaven cannot replicate without acquiring a HELOC shop. |
| **Eliminate / cap legal-UW fee.** Industry norm $1,995. Capping at $995 or folding into rate is ~10 bps APR optical savings. | Medium | Low (fee schedule update) | APR-comparison advantage at every quote. |
| **MO + WV "lower 48 minus HI" marketing.** Coverage we have, Deephaven doesn't. | Low | Zero (already have it) | Marketing parity talking point. |
| **Manual UW positioned as a feature.** "Every file gets a senior underwriter" pitch for off-script deals where AUS would say no. | Medium | Zero (already true) | Reframes a structural disadvantage as a niche-broker pitch. |

### 8.2 Tier 2 — high leverage, multi-quarter cost

| Moat-buster | Leverage | Cost | Notes |
|---|---|---|---|
| **STR-native product cell.** Underwrite Airbnb/VRBO platform statements directly; lift condotel ban for warrantable rental condos; reprice. | Very high | High (new product cell, 6+ mo) | One of the three "be the X program" positioning bets. STR is moving from niche to mainstream. |
| **Foreign National program at +50 bps with multilingual UX.** Tighter spread vs. Deephaven's +75. Targets growing LATAM / Asian capital flows. | High | High (legal review, ITIN/passport doc workflow, multi-lingual marketing, 6+ mo) | Captures a Deephaven-only segment. |
| **First-time investor tier.** Drop the 3-yr lookback ban; cap at 75% LTV like Deephaven. | High | Medium (UW methodology + reserve overlay; ~3 mo) | Captures BiggerPockets-generation volume. |
| **AUS / pricing engine + broker portal.** <60s indicative quote in a portal that doesn't feel like Encompass. | Very high | Very high (9–12 mo build or buy LoanPASS / Polly) | Reverses the speed-to-quote disadvantage entirely. |
| **DSCR Second / DSCR HELOC.** Build the equity ladder Deephaven already has. | Medium | High (new product, 6+ mo) | Cross-sell into Spring EQ's existing HELOC base. |
| **Securitization shelf (Spring EQ DSCR Trust).** Print first deal once volume justifies. Our cleaner book (660 floor + 4-yr seasoning + zero 12-mo lates + paid liens) should price tighter than DRMT. | Very high (long-term) | Very high (12–18 mo + capital markets relationships) | Shifts cost-of-funds permanently. |

### 8.3 Tier 3 — accumulating advantages

| Moat-buster | Leverage | Cost | Notes |
|---|---|---|---|
| Native LLC / multi-LLC vesting workflow with online entity verification | Medium | Medium | Reduces ops friction on entity files. |
| Public lender-facing API (developer portal style) for Stessa, Roofstock, Avail integration | Medium | High | Distribution channel Deephaven doesn't have. |
| Forward purchase line with insurance-company buyer for thinner gain-on-sale → coupon parity | Medium | Medium | Funding lever to support price cuts. |

### 8.4 Where moat-busting will NOT work

- **Cheaper securitization execution** out of the gate. The non-QM AAA
  market is efficient; DRMT prints normal credit support. We won't
  materially beat them on cost of funds for the first 1–2 deals.
- **In-house legal templates** to undercut Lightning Docs. Fortra's
  templates are litigation-tested and used in securitizations.
  Reinventing 50-state compliance to save $200–300/loan is not worth
  it at launch scale.
- **Displacing Carolinas wholesale relationships.** Don't try.
- **$3M+ loan size segment.** Their matrix is structurally bigger;
  rebuilding ours at that size requires reserve/concentration changes.

---

## 9. Pricing context (May 2026 market)

Canonical scenario: 30yr fixed, SFR, NOO, purchase, **740 FICO, 75% LTV,
1.20+ DSCR, 5/4/3/2/1 PPP**.

### 9.1 Par-rate consensus

| Source / lender | Par rate | Note |
|---|---|---|
| HomeAbroad baseline (domestic) | **6.12%** | Cross-lender average |
| HomeAbroad (foreign-national) | 6.875% | +75 bps spread to domestic |
| Defy Mortgage | 6.125% | At 1.0 DSCR; 1.20+ likely 6.00% |
| Industry range (Defy / Griffin / HonestCasa) | 6.00 – 8.50% | Whole curve, all FICO/LTV |
| Kiavi top tier | 7.25% start | Promo "from 5.75%" is teaser |
| Angel Oak | 7.25%+ | +25–50 bps to Visio/Kiavi |
| CoreVest | tier-leader | -50 to -75 bps vs. peers at 740 / 1.4 / 70 LTV |
| Lima One | tier-leader | Best for portfolio repeat clients |
| Visio | tier-leader | Faster closings than most low-rate competitors |
| **Deephaven (estimated band)** | **6.125–6.375%** | Mid-pack |
| **Spring EQ (target band post-launch)** | **5.875–6.125%** | 25–50 bps under Deephaven in overlap cell |

### 9.2 Standard LLPA stack across the market

- **LTV:** 65 best, 70–75 +12.5 to 25 bps, 80 +25 to 50 bps
- **DSCR:** 1.25+ best; 1.00–1.24 +12.5 to 37.5 bps; <1.00 +50 to 150 bps
- **FICO:** 740+ best; 700–739 +12.5 to 25; 680–699 +25 to 50;
  620–679 +50 to 150 bps with LTV cap
- **PPP:** 5yr declining = par; shorter PPP = +12.5 to 50 bps per year
  removed
- **Property:** 2–4 unit +12.5 to 25; **STR +25 to 50**;
  **condotel +50+**; 5–8 unit +50 to 100

### 9.3 Cost stack benchmarks

- Origination fee industry norm: 1–2% (= $2,000–6,000 on $300k loan)
- Legal / UW fee industry norm: ~$1,995 standard
- Doc generation: ~$500/loan via Lightning Docs (or higher with
  outside counsel)
- Industry note from AAPL: large lenders see small-to-midsize lenders
  making "really good margins" in DSCR space. Securitization market
  is the secondary outlet (insurance company buyers dominate).

---

## 10. Territorial analysis

### 10.1 Headquarters and sales geography

| Org | HQ | Sales reach |
|---|---|---|
| Spring EQ | Conshohocken PA | (HELOC base; DSCR field structure not in this doc) |
| Deephaven | Charlotte NC + AEs in SF, Huntington Beach, others | National wholesale + 200+ correspondent |

### 10.2 State licensing footprint

- **Spring EQ:** 48 states + DC (excludes HI, NY)
- **Deephaven:** 47 states + DC (excludes MO, NY, WV)
- **Both miss NY.**
- Spring EQ uniquely covers MO + WV. Small markets (~<2% of national
  non-QM pool balance combined) but 2 more "yes" states for marketing.
- Deephaven uniquely covers HI. Premium-investor market but small
  share.

### 10.3 Likely Deephaven origination concentration (inferred)

Industry-wide non-QM RMBS pool concentration:
- CA ~50% of typical non-QM closing balance (S&P Global)
- FL ~15%
- NY ~10% (Deephaven gets 0% of this)
- All other states ~25%

Because Deephaven cannot book NY, their pool is most likely **over-
indexed to CA + FL** with the long tail in TX, AZ, GA, NJ, NC. Confirm
by pulling state-distribution table from KBRA's DRMT 2026-INV2 presale.

### 10.4 Where to attack territorially

1. **NY** — single biggest white space. Both lenders forfeit it today.
2. **TX, AZ, FL (Tampa/Orlando), NV** — growth investor metros where
   Deephaven's AE bench is still being built (active Wholesale AE
   openings on Pretium Workday). Concentrate launch in 3–5 metros.
3. **Avoid Charlotte / Carolinas** unless we have pre-existing broker
   relationships to lift. Their home turf.
4. **MO + WV** — coverage parity claim Deephaven cannot make.

---

## 11. Recommended launch posture

### 11.1 Path A — Niche, immediate (recommended)

**Position:** "Prime DSCR." Cleaner credit, cleaner property scope,
manual underwriting that knows the file, transparent pricing.

**Pricing:**
- Beat Deephaven by **25–50 bps** at the 700–739 / 70–75 LTV / 1.20+
  DSCR overlap cell.
- Hold parity at the 740+ / 75 / 1.20 corner.
- Publish a **PPP buyout grid** — first-mover transparency.
- Cap legal-UW fee at $995 (or fold into rate).

**Distribution:**
- Activate Spring EQ's existing HELOC broker base for DSCR cross-sell.
- Concentrate AE coverage in TX, AZ, FL, NV growth metros where
  Deephaven is still hiring.

**Geography:**
- File for **NY licensing** as the priority state expansion.
- Marketing line: "DSCR in 48 states, NY in progress."

**Operations:**
- Position manual UW + 4-yr seasoning + zero-tolerance lates as
  "the loan that securitizes" — sell the secondary-market quality
  story to brokers who care about pull-through and to capital-markets
  buyers when we eventually print.
- Hold the line on 21–30 day close; don't promise 14–21 until UW
  workflow changes.

**Concede:**
- FN, ITIN, non-PR, first-time investor, STR, condotel, rural,
  mixed-use, layered-entity, $2.5M+ loan, $500k+ cash-out segments —
  all to Deephaven for now.

### 11.2 Path B — Multi-quarter product expansion

Sequenced 12–24 month roadmap to plug entrenchments:

| Quarter | Build | Captures |
|---|---|---|
| Q1 (post-launch) | NY licensing | NY market |
| Q1 | PPP buyout grid + fee cap | Pricing optics |
| Q2 | First-time investor tier (75% LTV cap) | BiggerPockets segment |
| Q2 | DSCR 0.75x relaxed for 680–699 FICO | Sub-ratio at lower FICO |
| Q3 | STR-native UW (Airbnb/VRBO platform income; lift condotel ban for warrantable rental condos) | STR investors |
| Q3 | AUS / broker portal (LoanPASS or Polly + thin POS) | Speed-to-quote parity |
| Q4 | Foreign National program | LATAM/Asia capital |
| Q4 | DSCR Second / DSCR HELOC tied to existing HELOC infrastructure | Equity ladder |
| Q5+ | Layered entity vesting + >4 LLC members | Sophisticated investors |
| Q5+ | First Spring EQ DSCR Trust securitization | Cost of funds |

### 11.3 The three position-defining commitments

If we make any three commitments at launch, they should be:

1. **Be the NY DSCR program** that Deephaven isn't.
2. **Be the prime-credit DSCR program** with the cleanest book on the
   street and the best eventual securitization economics.
3. **Be the broker-friendliest DSCR program on price transparency** —
   PPP buyout grid published, fees capped, rate sheet self-servable.

These three don't require new product builds (NY needs licensing,
nothing else does), and they create a defensible niche while Path B
expands the matrix.

---

## 12. Open data / things to validate before pricing committee

1. **Spring EQ DSCR wholesale rate sheet.** This guidelines PDF has no
   pricing. Need it to confirm the 25–50 bps gap target is achievable.
2. **Spring EQ DSCR field structure.** AE roster, territories, and
   broker portal status not in this PDF.
3. **Spring EQ current DSCR origination volume.** Sizes the pricing
   trade.
4. **Deephaven's current published matrix** (the indexed PDFs are 12/2023
   and 02/2024 — 18+ months stale). Best path: through a broker
   partner, or via DSCR Direct's hourly-updated Deephaven page.
5. **KBRA DRMT 2026-INV2 presale, state-distribution and WAC tables.**
   Confirms Deephaven's geographic concentration and gives us a direct
   read on their funding cost / senior spread.
6. **Live Deephaven rate at canonical scenario** via DSCR Direct.
7. **Confirmation of NY PPP-restriction compatibility** with Spring EQ's
   1/3/5yr structures.
8. **Insurance-buyer appetite** for forward-purchase commitment line at
   the spread Spring EQ would need.

---

## 13. References (deduplicated, by topic)

### Source article (trigger)
- [Deephaven Scales DSCR Lending Nationwide With API Integration, Surpasses 300 Loans Per Month — NMP](https://nationalmortgageprofessional.com/news/deephaven-scales-dscr-lending-nationwide-api-integration-surpasses-300-loans-month) (paywalled / 403)
- [Deephaven Scales DSCR Lending Nationwide with Lightning Docs API Integration — PR Newswire](https://www.prnewswire.com/news-releases/deephaven-scales-dscr-lending-nationwide-with-lightning-docs-api-integration-302761932.html)

### Deephaven product / channel
- [DSCR Wholesale Lender — Deephaven](https://deephavenmortgage.com/dscr-wholesale-lender/)
- [Correspondent Partnerships — Deephaven](https://deephavenmortgage.com/correspondent/)
- [DSCR Cash Flow Loan Opportunity — Deephaven](https://deephavenmortgage.com/dscr-loans-requirements/)
- [Corr DSCR Product Matrix 12.01.23 (PDF)](https://deephavenmortgage.com/wp-content/uploads/Corr_DSCR_Product_Matrices_12.01.23.pdf)
- [Wholesale Product Matrix 02.20.24 (PDF)](https://deephavenmortgage.com/wp-content/uploads/WHSL-Product-Matrices_02.20.24.pdf)
- [Disclosures & Licenses — Deephaven](https://deephavenmortgage.com/disclosures-and-licenses/)
- [Deephaven goes deep with DSCR lending — MPA](https://www.mpamag.com/us/specialty/non-prime/deephaven-goes-deep-with-dscr-lending/462729)
- [Deephaven DSCR vs OfferMarket — OfferMarket](https://www.offermarket.us/blog/deephaven-dscr)
- [Deephaven Mortgage DSCR Loan Rates — DSCR Direct](https://dscrdirect.net/lenders/deephaven-mortgage)
- [Deephaven Foreign National DSCR (BusinessWire 2021)](https://www.businesswire.com/news/home/20211206005582/en/Deephaven-Amps-Up-Foreign-National-DSCR-Program-in-Response-to-Growing-Real-Estate-Investment-Market)

### Deephaven org / leadership
- [Deephaven Names Two Regional Sales VPs of Wholesale (Thiara, Turner) — NMP](https://nationalmortgageprofessional.com/news/deephaven-names-two-regional-sales-vps-wholesale)
- [Deephaven Hires RVP Wholesale Sales (Howarth, West) — NMP](https://nationalmortgageprofessional.com/news/deephaven-mortgage-hires-regional-vp-wholesale-sales)
- [Deephaven Names New RVP, Wholesale Sales East (Dumke) — NMP](https://nationalmortgageprofessional.com/news/deephaven-names-new-rvp-wholesale-sales-east)
- [Wholesale AE openings — Pretium Workday](https://pretiumenterpriseservices.wd1.myworkdayjobs.com/en-US/Deephaven/job/Wholesale-Account-Executive_JR107741)
- [Deephaven HQ — TheOrg](https://theorg.com/org/deephaven-mortgage/offices/hq)
- [Tom Davis on non-QM lending — HousingWire](https://www.housingwire.com/articles/deephaven-tom-davis-on-non-qm-lending-opportunities-in-2025/)
- [Matt Lehnen, CTO Deephaven — Mortgage Vault Podcast](https://www.vaultedge.com/podcast/state-of-technology-adoption-in-mortgage-industry-in-depth-conversation-with-matthew-lehnen-cto-at-deephaven-mortgage)
- [Deephaven CTO on building a non-QM tech stack — HousingWire](https://www.housingwire.com/articles/deephaven-cto-on-building-a-non-qm-tech-stack/)

### Deephaven tech stack
- [Deephaven Mortgage Technology Stack — RocketReach](https://rocketreach.co/deephaven-mortgage-technology-stack_b5f15812f66db25f)
- [Deephaven + Ocrolus customer story](https://www.ocrolus.com/customer-stories/deephaven/)
- [Deephaven Mortgage and LoanScorecard Launch IDENTI-FI AUS — GlobeNewswire 2018](https://www.globenewswire.com/news-release/2018/09/24/1574999/0/en/Deephaven-Mortgage-and-LoanScorecard-Launch-IDENTI-FI-AUS.html)
- [Deephaven Mortgage Expands Partnership with LoanScorecard — GlobeNewswire 2019](https://www.globenewswire.com/news-release/2019/04/17/1805457/0/en/Deephaven-Mortgage-Expands-Partnership-with-LoanScorecard.html)

### Deephaven funding / securitization
- [Mortgage pool attached to Deephaven secures $296.2M in RMBS — National Mortgage News](https://www.nationalmortgagenews.com/news/mortgage-pool-attached-to-deephaven-secures-296-2-million-in-rmbs)
- [KBRA Preliminary Ratings DRMT 2026-INV2 — The AI Journal](https://aijourn.com/kbra-assigns-preliminary-ratings-to-deephaven-residential-mortgage-trust-2026-inv2-drmt-2026-inv2/)
- [DRMT 2026-INV2 Pre-Sale Report — KBRA](https://www.kbra.com/publications/rVDGGNWT/deephaven-residential-mortgage-trust-2026-inv2-drmt-2026-inv2-pre-sale-report?format=file)
- [DRMT 2026-INV2 Premarketing — IFR](https://www.ifre.com/securitisation/2400665/rmbs-deephaven-non-qm-drmt-2026-inv2-us289m-premarketing)
- [Pretium completes acquisition of Deephaven from Värde](https://varde.com/pretium-completes-acquisition-of-deephaven-mortgage-from-varde-partners/)
- [Pretium / Deephaven / Selene residential credit ecosystem (PDF)](https://pretium.com/wp-content/uploads/2020/02/Deephaven-and-Selene-Complete-Residential-Credit-Ecosystem.pdf)

### Lightning Docs / Knackly
- [LightningDocs — GitHub org](https://github.com/LightningDocs)
- [LightningDocs/LightningDocs-Knackly-API](https://github.com/LightningDocs/LightningDocs-Knackly-API)
- [LightningDocs/KnacklyWebhookTesting](https://github.com/LightningDocs/KnacklyWebhookTesting)
- [LightningDocs/anx2json (HotDocs → Knackly migration)](https://github.com/LightningDocs/anx2json)
- [Lightning Docs — Loan Document Software for Private Lenders](https://lightningdocs.ai/)
- [Lightning Docs — About](https://lightningdocs.ai/about/)
- [Lightning Docs — FAQ ($500/loan, no re-draw fees)](https://lightningdocs.ai/faq/)
- [Lightning Docs Named Official Loan Docs of AAPL](https://lightningdocs.ai/lightning-docs-named-official-loan-docs-of-the-american-association-of-private-lenders-aapl/)
- [Private Lending Software with Open-Ended API; Lightning Docs 2.0 Released — PR Newswire](https://www.prnewswire.com/news-releases/private-lending-software-with-open-ended-api-lightning-docs-2-0-released-302282061.html)
- [Lightning Docs and The Mortgage Office API Integration](https://www.themortgageoffice.com/lightning-docs-and-the-mortgage-office-announce-seamless-api-integration/)
- [Lightning Docs and LendingWise API Integration — PR Newswire](https://www.prnewswire.com/news-releases/lightning-docs-and-lendingwise-partner-to-deliver-seamless-api-integration-for-private-lenders-302503676.html)
- [Lightning Docs and Mortgage Automator API Integration — PR Newswire](https://www.prnewswire.com/news-releases/lightning-docs-and-mortgage-automator-announce-api-integration-302296267.html)
- [Liquid Logics Integration With Lightning Docs](https://www.liquidlogics.com/integration-with-lightning-docs/)
- [ABS Integration with Lightning Docs / Geraci LLP — PR Newswire](https://www.prnewswire.com/news-releases/abs-announces-integration-with-lightning-docs-geraci-llps-national-loan-document-solution-301422200.html)
- [Lightning Docs Surpasses $3B Monthly BP Loan Originations](https://lightningdocs.ai/lightning-docs-surpasses-3-billion-in-monthly-business-purpose-loan-originations-with-record-july/)
- [Geraci LLP Rebrands As Fortra Law](https://fortralaw.com/geraci-llp-rebrands-fortra-law/)
- [Nema Daghbandan — Lightning Docs CEO bio](https://lightningdocs.ai/our-professional-team/nema-daghbandan/)
- [AAPL Directory — Lightning Docs](https://aaplonline.com/directory/lightning-docs/)
- [Knackly — knackly.io](https://knackly.io/)
- [Knackly vs HotDocs](https://knackly.io/knackly-vs-hotdocs/)
- [Knackly API — Getting Started](https://knackly.io/knowledge-base/api/getting-started-with-the-knackly-api/)
- [Knackly API — public Postman collection](https://documenter.getpostman.com/view/6868588/SzS7QReU)
- [HotDocs to Knackly migration — Knackly Support](https://help.knackly.io/category/65-hotdocs-to-knackly)
- [Knackly on Capterra](https://www.capterra.com/p/217426/Knackly/)

### Market pricing / industry context
- [DSCR Loan Rates Today (May 2026) — Defy Mortgage](https://defymortgage.com/dscr-loan-rates/)
- [DSCR Loan Rates Today [May, 2026] — HomeAbroad](https://homeabroadinc.com/mortgages/dscr-loan-interest-rates/)
- [Best DSCR Loan Rates 2026 — HonestCasa](https://honestcasa.com/blog/best-dscr-loan-rates-march-2026-update)
- [DSCR Investor Loan Guide 2026 — Stacking Capital](https://www.stacking.capital/articles/dscr-investor-loan-real-estate-property-types-2026.html)
- [Best DSCR Lenders 2026: Griffin vs Angel Oak vs Kiavi vs Visio vs Lima One](https://griffinfunding.com/blog/mortgage/best-dscr-lenders-griffin-funding-vs-angel-oak-vs-kiavi-vs-visio-vs-lima-one/)
- [Why DSCR demand ramped up in 2025 — HousingWire](https://www.housingwire.com/articles/dscr-loans-demand-2025/)
- [State of the Industry: Bridge Loan, DSCR Tradeoffs — AAPL](https://aaplonline.com/articles/market-trends/state-of-the-industry-bridge-loan-dscr-tradeoffs/)
- [Non-QM RMBS state exposure — S&P Global](https://www.spglobal.com/ratings/en/research/articles/200601-non-qm-rmbs-and-covid-19-locking-down-states-exposure-11506543)

### Spring EQ source
- `docs/research/sources/spring-eq-dscr-uw-guidelines.pdf` — Release Date 4/17/2026

---

## 14. Document control

This is the canonical brief. The companion docs remain in the repo as
working notes:

- `deephaven-dscr-pricing-curve.md` — first-pass research log
- `deephaven-dscr-vp-brief.md` — earlier 2-page VP brief (superseded by §1)
- `deephaven-strategic-vulnerability.md` — first strategic pass
- `spring-eq-vs-deephaven-comparison.md` — first side-by-side

If anything in those four contradicts this master brief, **this brief
wins** unless newer source data is added.
