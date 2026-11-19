# Clearview Coaching Group: website preview

A multi-page static website for Clearview Coaching Group (Jane Downes, Dublin 2). It has no framework or CMS, loads fast, and runs on any host: Netlify, Vercel, GitHub Pages, cPanel, or alongside the current WordPress site.

All content (services, fees, awards, reviews, coach bios and photos) comes from clearviewcoachgroup.com.

## Pages
| Page | File |
| --- | --- |
| Home (hero lens, 60-second Clearview Lens diagnostic, awards, stories) | `index.html` |
| Executive coaching (fees, 1st 90 Days, "Get it funded" letter generator, FAQ) | `executive.html` |
| Career coaching ("Name the feeling" explorer, 9 programmes, FAQ) | `career.html` |
| Interview coaching (interview countdown planner, power sessions) | `interview.html` |
| For organisations (in-house offers, Lunch & Learn builder) | `organisations.html` |
| About (story, timeline, Jane & Susan, why Clearview) | `about.html` |
| Client stories (25 stories, filterable) | `stories.html` |
| Insights & The Career Book | `insights.html` |
| Gift vouchers (live voucher designer) | `gift.html` |
| Enquiry brief (4-step, pre-filled from every tool on the site) | `contact.html` |
| Not found | `404.html` |

## Editing
The pages in this folder are **generated**. Edit the source and rebuild:

```bash
python3 _src/build.py
```

- `_src/pages/*.html`: the body of each page (the meta block at the top sets the title and description)
- `_src/partials/*.html`: shared header, footer, final call to action, press marquee
- `assets/css/main.css`: design tokens (colours, type scale, spacing) at the top, then the components
- `assets/js/site.js`: motion, menu, hero lens, Clearview Lens, planner, funding letter, builder, filters, voucher designer and enquiry form. The programme catalogue (names, fees, formats) sits at the top in `P`.

## Connecting the automations
Everything is set in **`assets/js/config.js`**:

- `formEndpoint`: any endpoint that accepts a JSON POST (Formspree, Make.com or Zapier webhook, HubSpot …). Enquiries, Lens results, voucher requests and Lunch & Learn proposals all arrive tagged (level, funding, timeline) with a priority flag for urgent ones. When it's empty, the visitor's email app opens with everything pre-filled.
- `bookingUrl`: optional Calendly / Acuity / Microsoft Bookings link, offered after an enquiry is sent.
- `replyPromise`: the response time shown to visitors.

## Preview locally
```bash
python3 -m http.server 8080
```
Then open http://localhost:8080 from inside this folder.
