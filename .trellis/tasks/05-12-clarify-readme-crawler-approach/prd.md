# Clarify README Crawler Approach

## Goal

Update README planning text so the data-fetching approach matches the intended low-cost workflow: users open the web app, a Nuxt Server API fetches required PRTS voice data on demand, and no persistent crawler service is kept running after the request.

## Requirements

- Describe the preferred approach as Nuxt Server API / serverless on-demand fetching.
- Treat PRTS MediaWiki API as the first thing to investigate, not a guaranteed dependency.
- Mention lightweight HTML parsing options only as fallbacks when API access is not enough.
- Move the current UI work into stage 1 so the next development phase is UI-first.
- Document cache, request politeness, anti-abuse, audio bandwidth, and free-tier cost boundaries.
- Keep this change documentation-only.

## Acceptance Criteria

- [ ] README no longer presents Cheerio/Puppeteer pre-crawling as the primary plan.
- [ ] README explains the serverless on-demand request lifecycle in plain language.
- [ ] README roadmap and technology stack are consistent with each other.
- [ ] README documents that `defineCachedEventHandler` helps, but platform cache persistence still depends on deployment configuration.
- [ ] README makes clear that the project targets low/zero cost for small personal usage, not unlimited free operation.

## Definition of Done

- README updated.
- Diff reviewed.

## Technical Approach

Edit README sections for roadmap, data/cost strategy, deployment notes, and technical stack. Do not add dependencies or implementation files.

## Out of Scope

- Implementing `server/api/voice.ts`.
- Verifying the live PRTS API contract.
- Adding crawler/parser dependencies.

## Technical Notes

- User prefers a free deployment model where opening the page triggers a short-lived serverless fetch.
- Current README mentions Nuxt Server API in roadmap but Cheerio/Puppeteer pre-crawling in the stack, which is inconsistent.
