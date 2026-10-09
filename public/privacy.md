# ClashConverter — Privacy

Summary of the ClashConverter privacy policy for AI agents. The authoritative, full version lives at https://clashconverter.com/en/privacy (last updated October 9, 2026).

## The short version

The proxy links and configuration files you convert **never leave your browser**. ClashConverter deliberately collects as little data as possible.

## Configuration data never leaves the browser

All parsing, validation, and conversion run entirely inside your web browser as client-side JavaScript:

- Proxy share links, server addresses, ports, UUIDs, passwords, subscription URLs, and generated configurations are never transmitted to, stored on, or logged by ClashConverter servers.
- There is no upload step and no server-side processing — this is verifiable in the open-source code (https://github.com/sunway910/clashconverter).
- Closing the browser tab discards everything you entered.

## Cookies and third-party services

Like most websites, ClashConverter uses a small number of cookies and optional third-party services:

- **Locale preference** (`NEXT_LOCALE` cookie): remembers whether you prefer the English or Chinese interface. Stored for one year.
- **Google Analytics** (optional, enabled by site configuration only): standard, page analytics.
- **Google AdSense** (optional, enabled by site configuration only): advertising; Google may set its own cookies per its policies.

These services see ordinary page-request metadata (IP address, user agent) as with any web visit — but never your proxy configurations, because those are never sent anywhere.

## Who we are

ClashConverter is a free, open-source, client-side web tool maintained in the open at https://github.com/sunway910/clashconverter. Privacy or policy questions can be sent to clashconverter@gmail.com or via the contact page (https://clashconverter.com/en/contact).

## Related documents

- [Index](index.md) — site overview and privacy model summary
- [About](about.md) — project background
- [Advertise](advertise.md) — advertising inquiries
- [llms.txt](llms.txt) — documentation index
