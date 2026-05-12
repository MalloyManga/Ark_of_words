# PRTS API and Nuxt Serverless Notes

No external research was completed in this session because the delegated research thread stalled and was interrupted by the user. For this documentation-only change, use conservative wording:

- Prefer Nuxt Server API as the application-owned boundary for fetching voice data.
- Present PRTS MediaWiki API as a candidate to investigate first, because wiki sites commonly expose structured MediaWiki endpoints but the exact PRTS voice-data shape still needs verification.
- Present HTML parsing with browser-like APIs such as `DOMParser`, or server-compatible parsers such as `linkedom`, as fallback options when structured API data is incomplete.
- Avoid committing to Cheerio, Puppeteer, or a persistent crawler until implementation research proves they are necessary.
