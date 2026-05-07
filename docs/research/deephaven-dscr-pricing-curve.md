# Deephaven DSCR — Competitive Intelligence for Pricing Curve

Compiled: 2026-05-07
Branch: `claude/research-deephaven-dscr-IaKf7`

## Scraping note

`deephavenmortgage.com` is behind a WAF that blocks server-side fetchers (HTTP 403
to WebFetch and to `curl` with realistic browser headers). Their wholesale and
correspondent product matrix PDFs are gated similarly. The intel below was
assembled from publicly indexed sources: the PR Newswire press release, KBRA /
National Mortgage News securitization coverage, NMP and HousingWire interviews
with Deephaven's CSO Tom Davis, third-party rate aggregators (DSCR Direct,
HomeAbroad, Defy), and competitor comparison sites (OfferMarket, HonestCasa,
Stacking Capital). Anything tagged "rate sheet exact" should be confirmed by
pulling current PDFs through a residential-IP browser session before pricing
decisions go to committee.

## What Deephaven actually does

### Volume / scale
- May 2023: closed **16** DSCR loans on the Lightning Docs system.
- ~Oct 2023 (5 mo later): roughly doubled.
- Year-1 cumulative: **199** DSCR loans.
- May 2026: **>300 DSCR loans/month** running through the platform.
- Total non-QM volume target: **>$80B in 2025** (corporate-wide, not DSCR-only).

### Channels
- **Wholesale**: brokers via `dscr-wholesale-lender` portal, IDENTI-FI AUS access through Encompass and Calyx Point.
- **Correspondent**: **200+ partner lenders**, both delegated and non-delegated; products include Expanded-Prime, Non-Prime, and DSCR.
- **Foreign National DSCR**: dedicated program (expanded Dec 2021).

### Tech / cost stack (this is where their advantage lives)
- **Proprietary LOS** (in-house, not Encompass).
- **Lightning Docs API** (May 2026) — generates DSCR doc package "in seconds" from LOS data; same vendor used by AAPL members. Quote from Nema Daghbandan (Lightning Docs CEO) frames it as the scaling lever.
- **IDENTI-FI AUS** powered by LoanScorecard's Portfolio Underwriter, surfaced inside Encompass / Calyx / web for correspondents.
- **Scenario calculator + Smart Conditions** with LoanScorecard.

The implication for pricing: Deephaven's marginal ops cost per DSCR file is
falling fast. They will be willing to clip price (or accept thinner gain-on-sale)
to defend share, because their fixed-cost dilution is improving every month.

### Funding / secondary execution
- Most recent securitization indexed: **DRMT 2026-INV2**, ~$296.2M, KBRA-rated, all NOO investor 1st liens.
- Credit enhancement on A1 notes: **33.45%** (A1A: 43.45%) — mainstream non-QM execution.
- Pool documentation: 2.6% full-doc, balance DSCR + 12–23mo bank statements.
- Implication: their AAA cost is roughly market for non-QM. They're not getting an exotic funding edge — their edge is operational. **A scaled, low-ops competitor that securitizes onto the same curve can match them on coupon and beat them on points.**

## Program parameters (as best as can be reconstructed)

| Lever | Deephaven (apparent) | Notes |
|---|---|---|
| Min FICO | 620 | Best pricing 740+. |
| Max LTV (purchase, 1.0+ DSCR) | ~80% | Some marketing pages cite 90%, most secondary sources land at 80% — confirm. |
| Max loan amount | $3.5M | |
| DSCR floors | < 1.00x permitted | Sub-ratio carries minimum loan floor + LTV haircut. |
| Declining-market haircut | −5% LTV | Triggered by appraiser flag. |
| Unleased property | Max 70% LTV refi, no haircut on purchase | |
| First-time investor | Max 75% LTV | Standard borrower needs 12mo investment-property history. |
| PPP options | 5/4/3/2/1, 3/2/1, 2/1, 1-year, **buyout available** | Buyout = pricing lever. |
| Foreign National | Yes, dedicated program | Higher rate band. |
| Vesting | Individual + LLC | |
| STR | Permitted | |
| Geography | 47+ states | |
| Time to close | 14–21 days | Marketed; not validated. |
| Origination fee | 1–2% market norm | DSCR Direct shows Deephaven within band. |
| 3rd-party / legal | ~$1,995 underwriting/legal typical for category | |

## Market price benchmarks (May 2026)

Indicative scenario: **30yr fixed, SFR, NOO, purchase, 740 FICO, 75% LTV, DSCR 1.20+, 5/4/3/2/1 PPP.**

| Source / Lender | Par rate | Notes |
|---|---|---|
| HomeAbroad baseline (domestic) | **6.12%** | Cross-lender average. |
| HomeAbroad foreign-national | 6.875% | +75 bps spread to domestic. |
| Defy | **6.125%** | At 1.0 DSCR; 1.20+ likely 6.00. |
| Market range (Defy / Griffin / Honest Casa surveys) | 6.00 – 8.50% | Whole curve, all FICO/LTV. |
| Kiavi | starts 7.25% top tier | Promo "from 5.75%" is teaser. |
| Angel Oak | 7.25%+ | Runs +25–50 bps to Visio/Kiavi. |
| CoreVest | tier-leader | -50 to -75 bps vs. peers at 740 / 1.4 / 70 LTV. |
| Lima One / Visio | tier-leaders | Best for portfolio repeat clients. |

**Therefore the implied par-curve consensus at the canonical scenario is roughly 6.00–6.25%.** Deephaven sits in the middle of that pack — probably 6.125–6.375% par, +25–50 bps for foreign national, +25–50 bps for STR, +50–150 bps stepping down to sub-1.0 DSCR or sub-700 FICO.

### Common LLPA structure across the market
- LTV: 65 best, 70–75 +12.5 to 25 bps, 80 +25 to 50 bps.
- DSCR: 1.25+ best; 1.00–1.24 +12.5 to 37.5 bps; <1.00 +50 to 150 bps.
- FICO: 740+ best; 700–739 ~+12.5 to 25 bps; 680–699 +25 to 50; 620–679 +50 to 150 with LTV cap.
- PPP: 5yr declining = par; shorter PPP = +12.5 to +50 bps per year removed.
- Property type: 2–4 unit +12.5 to 25 bps; STR +25 to 50; condotel/non-warrantable +50+; 5–8 unit +50 to 100.

## How to lower our curve vs. Deephaven

Concrete levers, ordered by leverage-per-effort:

1. **Match or beat their PPP buyout grid.** Deephaven offers a PPP buyout, but it is a margin product — borrowers feel it. Publishing a tighter buyout (e.g., 50 bps to drop from 5yr to 3yr instead of 75–100) is a visible price cut without touching the headline rate.
2. **Eliminate or cap the $1,995 legal/UW fee.** A $300k loan at 6.125% with $1,995 in fees prices to ~6.32% APR. Killing or capping that fee at $995 buys ~10 bps APR optically without a coupon move.
3. **Compress the 700–739 / 70–75 LTV / 1.10–1.24 DSCR cell.** This is the volume-weighted middle of the market. Most matrices stack 25 + 25 + 25 = 75 bps of add-ons here. Cutting that to 50 bps gets you visibly underneath Deephaven on the scenarios that brokers actually run.
4. **Price STR at par.** Deephaven and most peers add 25–50 bps. STR is a growing share of investor purchases; pricing it flat is a bid-magnet for brokers without changing your blended risk profile materially.
5. **Document automation parity.** Their Lightning Docs integration is the operational story behind the 16→300 ramp. If we use the same vendor (or Snapdocs / DocMagic) at launch, our marginal ops cost matches them, and we can fund coupon parity from day one rather than relying on volume to dilute fixed costs.
6. **AUS at the broker.** Their IDENTI-FI in Encompass is a stickiness moat. Even a thin POS-based scenario tool that returns a price + fit decision in <60s captures the broker workflow before Deephaven sees the file.
7. **Foreign national tighter spread.** They run +75 bps. With a Cayman/Delaware vesting workflow plus a tight ITIN/passport doc list, +50 bps is defensible and undercuts them by 25 bps in a high-margin segment.
8. **Securitization cadence.** DRMT 2026-INV2 cleared at standard non-QM credit support. We don't need a funding advantage to compete — but if we lock a forward purchase line with an insurance buyer (the disclosed primary buyer base for DSCR), we can run with thinner gain-on-sale and pass 12–25 bps to coupon.

## Open questions / things to confirm before pricing committee

- Pull a current Deephaven Wholesale and Correspondent matrix PDF through a real
  browser session (or via a broker partner). The 12.01.23 / 02.20.24 PDFs indexed
  by Google are 18+ months stale.
- Confirm whether they price LLC vesting flat or with an add-on.
- Get a live rate from DSCR Direct's Deephaven page at our canonical scenario —
  index updates hourly.
- Pull the KBRA presale on DRMT 2026-INV2 to read off WAC and senior spread —
  that's the single best proxy for their all-in funding cost.
- Confirm Foreign National pricing band; sources cite +75 bps to domestic but
  matrices may show wider.

## Lightning Docs — what's actually behind the "API integration"

Verdict up front: the Deephaven press release leans hard on PR optics. The
*integration itself* is a routine data push from one system into another. But
the *vendor on the other end* is the de-facto standard for business-purpose
loan docs and is genuinely worth understanding — because anything we build
should plug into it from day one rather than try to compete with it.

### What Lightning Docs is

- **Ownership:** Lightning Docs LLC, a software arm of **Fortra Law**
  (rebranded from **Geraci LLP**, the largest private-lending law firm in the
  US). CEO and co-founder **Nema Daghbandan** is also a Fortra Law partner.
- **Origin:** built initially to automate Geraci's own internal doc prep, then
  commercialized as a SaaS.
- **Product:** cloud-based generator that produces **90+ page attorney-prepared
  loan packages** for business-purpose loans — bridge, fix/flip, ground-up
  construction, **DSCR rental**, portfolio rental, commercial. All 50 states,
  with state-specific usury, prepay, licensing, and notary blocks baked in.
- **Pricing:** **$500/loan flat**, no re-draw fees (you can edit and re-export
  the same package as much as you want), volume discounts available.
- **Distribution:** "Official Loan Docs of AAPL" — note this is a sponsorship
  relationship, not an independent endorsement. Used by **60%+ of top-50
  national private lenders**.
- **Scale:** **>4,000 transactions/month**, **>$2B/month** in originations
  flowing through it as of mid-2025; **>$50B cumulative since 2018**. Their
  doc set has been used in rated and unrated DSCR/non-QM securitizations.

### What "the API" actually is

- Released **Oct 22, 2024** as part of **Lightning Docs 2.0**, marketed as an
  "open-ended API."
- Functionally: an HTTP endpoint that accepts loan/borrower/property data
  from an LOS and returns a generated doc package, eliminating manual rekey.
  Not a developer platform — there are **no public docs, no public reference,
  no SDK, no GitHub presence, no published JSON schema**. Access is gated on
  being a customer.
- **Pre-built integrations with:** Salesforce, Encompass (ICE Mortgage Tech),
  The Mortgage Office, LendingWise, Liquid Logics, Mortgage Automator, Elphi,
  ABS.
- **Deephaven's "custom" integration (May 5, 2026)** is meaningful only because
  Deephaven runs a *proprietary in-house LOS* — i.e., not on the prebuilt list.
  All they did was wire their LOS to the same endpoint everyone else uses. Time
  saved per file is on the order of **5–15 minutes of ops labor**, not a step
  change.

### So is the press release pomp?

**Yes, mostly — for the integration claim.** Eliminating manual data rekey
between an LOS and a doc engine is plumbing every serious lender does
eventually. The PR's framing ("seconds, scalable, exponential") oversells what
is, technically, an HTTP POST with a JSON body.

**But the volume claim is real.** 16 → 199 → 300+ DSCR loans/month tracks
across multiple independent sources (PR Newswire, NMP, HousingWire). That
ramp is mostly **sales-and-channel work** at Deephaven, not the API. The API
press release is timed to take credit for a curve that was already bending up.

**And the underlying vendor is not pomp.** Lightning Docs is the closest thing
to a monopoly in business-purpose loan documents, backed by the law firm that
litigates the case law. Switching costs are high; their docs have a track
record in securitization. Any DSCR program we launch should integrate with
Lightning Docs out of the gate at $500/loan rather than burn 6–12 months of
legal eng to build (or hire outside counsel at $1,500–2,500 per file).

### Pricing-curve implications

- The doc-cost line in our DSCR cost stack is roughly **$500/loan with Lightning
  Docs**. Many smaller competitors carry $1,500–2,500/file in outside-counsel
  fees. That's **100–200 bps of one-time cost, equivalent to ~15–30 bps of
  spread amortized over a 5-year expected life**. We can pass that to coupon.
- We have **no technical disadvantage** to Deephaven on doc generation. The
  same vendor will sell us the same product. Their "API moat" is non-existent.
- Their **real moat** is the proprietary LOS + IDENTI-FI AUS in Encompass.
  That's what a competitor needs to build or rent (Encompass + LoanScorecard
  is the off-the-shelf stack to match it).
- If we adopt Lightning Docs day one, our marginal doc-prep cost is *lower than
  Deephaven's* until they renegotiate volume pricing. That's a legitimate
  pricing lever, not pomp.

## Sources

- [Deephaven Scales DSCR Lending Nationwide with Lightning Docs API Integration — PR Newswire](https://www.prnewswire.com/news-releases/deephaven-scales-dscr-lending-nationwide-with-lightning-docs-api-integration-302761932.html)
- [Deephaven Scales DSCR Lending Nationwide With API Integration, Surpasses 300 Loans Per Month — NMP](https://nationalmortgageprofessional.com/news/deephaven-scales-dscr-lending-nationwide-api-integration-surpasses-300-loans-month)
- [Deephaven goes deep with DSCR lending — MPA](https://www.mpamag.com/us/specialty/non-prime/deephaven-goes-deep-with-dscr-lending/462729)
- [Deephaven's Tom Davis on non-QM lending opportunities — HousingWire](https://www.housingwire.com/articles/deephaven-tom-davis-on-non-qm-lending-opportunities-in-2025/)
- [DSCR Wholesale Lender — Deephaven Mortgage](https://deephavenmortgage.com/dscr-wholesale-lender/)
- [The DSCR Cash Flow Loan Opportunity for Originators — Deephaven Mortgage](https://deephavenmortgage.com/dscr-loans-requirements/)
- [Correspondent Partnerships with 200+ Lenders — Deephaven Mortgage](https://deephavenmortgage.com/correspondent/)
- [Corr DSCR Product Matrix 12.01.23 (PDF)](https://deephavenmortgage.com/wp-content/uploads/Corr_DSCR_Product_Matrices_12.01.23.pdf)
- [Wholesale Product Matrix 02.20.24 (PDF)](https://deephavenmortgage.com/wp-content/uploads/WHSL-Product-Matrices_02.20.24.pdf)
- [Deephaven Mortgage and LoanScorecard Launch IDENTI-FI AUS — GlobeNewswire](https://www.globenewswire.com/news-release/2018/09/24/1574999/0/en/Deephaven-Mortgage-and-LoanScorecard-Launch-IDENTI-FI-AUS.html)
- [Deephaven Mortgage Expands Partnership with LoanScorecard — GlobeNewswire](https://www.globenewswire.com/news-release/2019/04/17/1805457/0/en/Deephaven-Mortgage-Expands-Partnership-with-LoanScorecard.html)
- [Deephaven DSCR vs OfferMarket Loans — OfferMarket](https://www.offermarket.us/blog/deephaven-dscr)
- [Deephaven Mortgage DSCR Loan Rates — DSCR Direct](https://dscrdirect.net/lenders/deephaven-mortgage)
- [DSCR Loan Rates Today (May 2026) — Defy Mortgage](https://defymortgage.com/dscr-loan-rates/)
- [DSCR Loan Rates Today [May, 2026] — HomeAbroad](https://homeabroadinc.com/mortgages/dscr-loan-interest-rates/)
- [Best DSCR Loan Rates 2026 — HonestCasa](https://honestcasa.com/blog/best-dscr-loan-rates-march-2026-update)
- [DSCR Investor Loan Guide 2026 — Stacking Capital](https://www.stacking.capital/articles/dscr-investor-loan-real-estate-property-types-2026.html)
- [Mortgage pool attached to Deephaven secures $296.2 million in RMBS — National Mortgage News](https://www.nationalmortgagenews.com/news/mortgage-pool-attached-to-deephaven-secures-296-2-million-in-rmbs)
- [KBRA Assigns Preliminary Ratings to DRMT 2026-INV2 — The AI Journal](https://aijourn.com/kbra-assigns-preliminary-ratings-to-deephaven-residential-mortgage-trust-2026-inv2-drmt-2026-inv2/)
- [DRMT 2026-INV2 Pre-Sale Report (PDF) — KBRA](https://www.kbra.com/publications/rVDGGNWT/deephaven-residential-mortgage-trust-2026-inv2-drmt-2026-inv2-pre-sale-report?format=file)
- [RMBS Deephaven non-QM (DRMT 2026-INV2) Premarketing — IFR](https://www.ifre.com/securitisation/2400665/rmbs-deephaven-non-qm-drmt-2026-inv2-us289m-premarketing)
- [State of the Industry: Bridge Loan, DSCR Tradeoffs — AAPL](https://aaplonline.com/articles/market-trends/state-of-the-industry-bridge-loan-dscr-tradeoffs/)
- [Why DSCR demand ramped up in 2025 — HousingWire](https://www.housingwire.com/articles/dscr-loans-demand-2025/)
- [Best DSCR Lenders 2026: Griffin vs Angel Oak vs Kiavi vs Visio vs Lima One — Griffin Funding](https://griffinfunding.com/blog/mortgage/best-dscr-lenders-griffin-funding-vs-angel-oak-vs-kiavi-vs-visio-vs-lima-one/)

### Lightning Docs sources

- [Lightning Docs — Loan Document Software for Private Lenders](https://lightningdocs.ai/)
- [Lightning Docs — About Us](https://lightningdocs.ai/about/)
- [Lightning Docs — FAQ (pricing, billing, re-draw policy)](https://lightningdocs.ai/faq/)
- [Why Lightning Docs](https://lightningdocs.ai/why-lightning-docs/)
- [Lightning Docs Named Official Loan Docs of AAPL](https://lightningdocs.ai/lightning-docs-named-official-loan-docs-of-the-american-association-of-private-lenders-aapl/)
- [Private Lending Software with Open-Ended API; Lightning Docs 2.0 Released — PR Newswire](https://www.prnewswire.com/news-releases/private-lending-software-with-open-ended-api-lightning-docs-2-0-released-302282061.html)
- [Lightning Docs and The Mortgage Office Announce Seamless API Integration](https://www.themortgageoffice.com/lightning-docs-and-the-mortgage-office-announce-seamless-api-integration/)
- [Lightning Docs and LendingWise Partner to Deliver Seamless API Integration](https://www.prnewswire.com/news-releases/lightning-docs-and-lendingwise-partner-to-deliver-seamless-api-integration-for-private-lenders-302503676.html)
- [Lightning Docs and Mortgage Automator Announce API Integration](https://www.prnewswire.com/news-releases/lightning-docs-and-mortgage-automator-announce-api-integration-302296267.html)
- [Liquid Logics Integration With Lightning Docs](https://www.liquidlogics.com/integration-with-lightning-docs/)
- [ABS Announces integration with Lightning Docs / Geraci LLP — PR Newswire](https://www.prnewswire.com/news-releases/abs-announces-integration-with-lightning-docs-geraci-llps-national-loan-document-solution-301422200.html)
- [Lightning Docs Surpasses $3B Monthly BP Loan Originations](https://lightningdocs.ai/lightning-docs-surpasses-3-billion-in-monthly-business-purpose-loan-originations-with-record-july/)
- [Geraci LLP Rebrands As Fortra Law](https://fortralaw.com/geraci-llp-rebrands-fortra-law/)
- [Nema Daghbandan — Lightning Docs CEO bio](https://lightningdocs.ai/our-professional-team/nema-daghbandan/)
- [Private Lender Link — Lightning Docs profile](https://privatelenderlink.com/profile/lightning-docs/)
- [AAPL Directory — Lightning Docs](https://aaplonline.com/directory/lightning-docs/)
