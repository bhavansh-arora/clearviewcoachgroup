# Reply to Jane

**Subject:** Clearview: a few ideas, built out so you can see them

---

Hi Jane,

Thanks for saying yes. Rather than send a list of ideas, we built them out using Clearview's own content, photos, fees and reviews, so you can click through and see how they'd work for a senior professional landing on your site.

**Here's the preview:** https://clearviewcoachgroup.codebunny.net

It works on phones, tablets and desktop. Here's what we added and how each piece helps:

**1. Your authority is visible straight away.** 22 years, 23,000+ coaching hours, 4.8★ on Google, MSN Top 10 Trailblazing Women 2026 and all six awards now appear on the first screen and in a dedicated awards section, with The Irish Times, RTÉ and Newstalk scrolling underneath. A director deciding who to trust can see you're the real thing within seconds.

**2. The Clearview Lens, a 60-second diagnostic.** Five questions (level, what's pulling at them, urgency, who's paying, what success looks like) recommend a programme, the fee and the coach. One click carries the answers into the enquiry form, so people arrive knowing what they want and your first calls start further along.

**3. Fees on every service page.** Your published prices currently sit lower down each page. We've turned them into clear programme menus, from Leadership & Executive Coaching (from €745) to Graduate sessions (€195), so senior buyers can qualify themselves and you get fewer "how much is it?" calls.

**4. "Get it funded", for employer-paid coaching.** Many executives would ask their company to pay but don't know how to frame it. On the Executive page they fill in four details and get a short, business-focused request to their manager or HR, covering the programme, the reason, the return and the fee, ready to copy or email. More of your executive work can come from corporate budgets.

**5. An enquiry form that sorts enquiries for you.** It's four short steps, and each enquiry reaches you with level, funding, timing and format already filled in. Urgent ones are flagged in the subject line (for example "PRIORITY · Interview in 3 days" or Career Crisis Clinic), so you can see at a glance who to call first. It can connect to the tools you already use for an automatic reply, CRM entry and a booking link.

**6. Tools that bring people back, and convert.**
- *Interview countdown planner:* visitors enter their interview date and get a day-by-day prep plan built on your method (the "Why ME" list, competency stories, the awkward questions, grounding). Day −3 is "Power session with your Clearview coach", and interviews under four days away get a fast-track prompt.
- *Lunch & Learn builder:* HR and L&D leads tick the sessions they want from your eleven topics and request a proposal in one click.
- *Christmas voucher designer:* "Forget the socks. Give a career glow-up." Buyers choose the coaching, personalise the voucher and see it update live, just in time for December.

**7. Every client story in one place.** We've gathered 25 stories (your Google reviews, Susan's clients and the book endorsements from Claire Byrne, Edward de Bono and others) onto one page that visitors can filter: leaders & board, career change, interviews, job search, performance. A C-suite leader and a graduate can each find someone like them.

None of this replaces what you have. It can sit on your current domain, and the Insights links still point to your existing articles.

Would you be open to a 15-minute call this week? I can walk you through it and hear what you'd change.

Best,
Bhavansh Arora
Code Bunny

---

### Before sending, check (or adjust on the site)
- **Preview link:** the email points to https://clearviewcoachgroup.codebunny.net (the repo's CNAME). Open it once before sending to check the GitHub Pages deploy has finished.
- **Career Crisis Clinic fee:** Clearview's Executive page lists it at €395 and the Career page at €545. The preview shows "from €395" everywhere; confirm with Jane.
- **Interview page listing:** Clearview's "Presentation Skills Coaching" entry on the Interview page repeats the Crisis Clinic text and €545, which looks like a copy error. We left it off the Interview page; Presentation Skills (from €495) appears on the Executive page.
- **"Signature" badges:** we tagged Leadership & Executive Coaching and Interview Coaching for Leaders as signature programmes. Remove the `prog--featured` class if Jane prefers otherwise.
- **In-person sessions:** the site says "online or in person in Dublin" and doesn't promise meetings at the Upper Pembroke Street address (Suite 11247 may be a mail address). Confirm where in-person sessions happen.
- **Reply time:** the site says Clearview replies "within one working day". Change `replyPromise` in `assets/js/config.js` if that isn't right.
- **Vouchers:** the site says the team replies with payment details and the finished voucher. Confirm that's how Jane wants to fulfil them.
- **Automation:** add a form endpoint (`formEndpoint`) and, optionally, a booking link (`bookingUrl`) in `assets/js/config.js`. Until then, every form opens a pre-filled email to jane@clearviewcoachgroup.com.
