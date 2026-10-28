# NowDMC website

Static HTML, compiled CSS and browser JavaScript for GitHub Pages at https://nowdmc.com/. No runtime CSS compiler is required. Keep `CNAME` unchanged.

## Local development

Serve the repository root with a static HTTP server. Installing development dependencies and running `npm run build:css` rebuilds `assets/site.css` after markup or utility-class changes. `npm test` checks submission acceptance, error states, duplicate-submit prevention and analytics boundaries without sending requests to Formspree.

The real form endpoint remains `https://formspree.io/f/mzzknwkd`. Do not submit local test enquiries to that endpoint without the site owner's explicit approval. Analytics only loads on nowdmc.com or www.nowdmc.com after acceptance, so localhost testing does not enter the live analytics property. Vimeo loads after the visitor selects Play.

## Content and measurement

The homepage's original case-study bookmarks are preserved. Standalone destination and case-study pages have canonical URLs and are listed in the sitemap. Original photos remain in `images/`; the HTML uses smaller derivatives in `images/optimized/`.

`generate_lead` means Formspree accepted an enquiry. It does not prove mailbox delivery, sales qualification or a sale. Email and WhatsApp clicks are tracked separately. Names, contact details and event briefs are not sent as analytics event parameters. Optional analytics consent means reporting will not count all visitors; use mailbox receipts and qualified opportunities alongside analytics.

New client names, dates, attendance figures, outcome metrics and photographs must be verified and approved before publication. Historical figures retained from the original site should not be interpreted as newly verified results.

## Release and rollback

Review the changes, then publish through the verified repository owner or authorised collaborator account. Before release, check that main has not changed since the patch's recorded base revision. Merge/release and live form tests require the site owner's authority. After deployment, verify the live pages, share image, icons, sitemap, mobile navigation and one clearly labelled, authorised test enquiry through to the destination inbox. A successful local simulation does not verify live delivery.

Rollback the release commit if the live enquiry path fails; preserve unrelated concurrent changes. No domain, DNS, mailbox-recipient, Formspree-account or permission change is required for this update.
