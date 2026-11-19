/* ==========================================================================
   Site configuration: the only file Clearview (or we) need to touch to
   connect the automations. Leave a value empty and the site falls back
   gracefully.
   ========================================================================== */
window.SITE_CONFIG = {
  name: "Clearview Coaching Group",
  email: "jane@clearviewcoachgroup.com",
  phone: "01 234 3766",
  phoneHref: "tel:+35312343766",

  /* Form endpoint that accepts a JSON POST (Formspree, Make.com or Zapier
     webhook, HubSpot, Basin …). Every enquiry, Clearview Lens result,
     voucher request and Lunch & Learn proposal is sent here, already
     tagged and prioritised, ready for an auto-reply, CRM entry and
     booking link. When empty, the visitor's email app opens pre-filled. */
  formEndpoint: "",

  /* Optional booking link (Calendly, Acuity, Microsoft Bookings …).
     When set, the enquiry confirmation offers it as the next step. */
  bookingUrl: "",

  /* Promise shown to visitors after they enquire. */
  replyPromise: "within one working day"
};
