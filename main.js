/* =============================================================
   [BRAND NAME] — main.js
   -------------------------------------------------------------
   PART A (edit this):  settings, vehicles, routes and prices.
   PART B (no need to edit): the code that uses them.

   To change a price: find the route in ROUTES below and change
   the number after car: or van:. Save. Done — the price finder,
   the route board and the route pages all update.
   ============================================================= */


/* =============================================================
   PART A — EDIT HERE
   ============================================================= */

const SETTINGS = {
  brandName: "[BRAND NAME]",

  // WhatsApp number: country code + number, digits only.
  // No "+", no spaces, no leading 0. Example: 94771234567
  whatsappNumber: "94XXXXXXXXX",

  // Opening hours in Sri Lanka time (24-hour clock).
  openHour: 6,     // 6 AM
  closeHour: 23,   // 11 PM
  replyMinutes: 15,

  // Shown in the price finder under the price.
  includedLine: "Includes fuel, highway tolls, the driver, flight tracking and [60] minutes of free waiting at the airport.",
};

// Vehicles. "people" and "bags" are the maximum for each vehicle.
const VEHICLES = {
  car: { name: "Car", people: 3, bags: 3 },
  van: { name: "Van", people: 8, bags: 8 },
};

// ROUTES AND PRICES (US dollars, per car, not per person)
// -------------------------------------------------------------
// from / to  : place names exactly as they should appear on the site
// time       : typical driving time. Values in [brackets] are guesses — check them.
// car / van  : price in USD. null = not set yet (shows [$XX] on the site)
// page       : the route page file for this route (copy route.html to make it)
// board      : true = show in the "Popular routes" table
// Every route also works in the opposite direction at the same price
// (for example Galle → Colombo Airport). Add oneWay: true to stop that.
const ROUTES = [
  { from: "Colombo Airport (BIA)", to: "Galle",        time: "2h 30m", car: null, van: null, page: "colombo-airport-to-galle-taxi.html",    board: true },
  { from: "Colombo Airport (BIA)", to: "Kandy",        time: "[~3h]",  car: null, van: null, page: "colombo-airport-to-kandy-taxi.html",    board: true },
  { from: "Colombo Airport (BIA)", to: "Sigiriya",     time: "[~4h]",  car: null, van: null, page: "colombo-airport-to-sigiriya-taxi.html", board: true },
  { from: "Colombo Airport (BIA)", to: "Ella",         time: "[~6h]",  car: null, van: null, page: "colombo-airport-to-ella-taxi.html",     board: true },
  { from: "Colombo Airport (BIA)", to: "Mirissa",      time: "[~3h]",  car: null, van: null, page: "colombo-airport-to-mirissa-taxi.html",  board: true },
  { from: "Colombo Airport (BIA)", to: "Colombo city", time: "[~1h]",  car: null, van: null, page: "colombo-airport-to-colombo-taxi.html",  board: true },
  { from: "Kandy",                 to: "Ella",         time: "5h",     car: null, van: null, page: "kandy-to-ella-taxi.html",               board: true },
  { from: "Sigiriya",              to: "Kandy",        time: "[~3h]",  car: null, van: null, page: "sigiriya-to-kandy-taxi.html",           board: true },
  { from: "Ella",                  to: "Mirissa",      time: "[~4h]",  car: null, van: null, page: "ella-to-mirissa-taxi.html",             board: true },
];

// The route that is selected when the page opens.
const DEFAULT_ROUTE = { from: "Colombo Airport (BIA)", to: "Galle", vehicle: "car" };


/* =============================================================
   PART B — THE CODE (no need to edit below this line)
   ============================================================= */

(function () {
  "use strict";

  /* ---------- Helpers ---------- */

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  // "$45" — or "[$XX]" if the price is not set yet.
  function formatPrice(usd) {
    return typeof usd === "number" ? "$" + usd : "[$XX]";
  }

  // Every route in both directions (unless oneWay: true).
  const TRIPS = ROUTES.flatMap((r) =>
    r.oneWay ? [r] : [r, Object.assign({}, r, { from: r.to, to: r.from, reversed: true })]
  );

  function findTrip(from, to) {
    return TRIPS.find((t) => t.from === from && t.to === to) || null;
  }

  // Build a wa.me link. "lines" is an array of text lines.
  function whatsappUrl(lines) {
    const text = lines.join("\n");
    return "https://wa.me/" + SETTINGS.whatsappNumber + "?text=" + encodeURIComponent(text);
  }

  function greeting() {
    return "Hello " + SETTINGS.brandName + ", I'd like to book a transfer.";
  }

  // The message sent from the price finder and the route board.
  function bookingMessage(trip, vehicleKey) {
    const v = VEHICLES[vehicleKey];
    const price = typeof trip[vehicleKey] === "number" ? formatPrice(trip[vehicleKey]) + " per car" : "please confirm";
    return [
      greeting(),
      "",
      "Route: " + trip.from + " → " + trip.to,
      "Vehicle: " + v.name + " (up to " + v.people + " people, " + v.bags + " bags)",
      "Price on your website: " + price,
      "",
      "Date: ",
      "Time: ",
      "Flight number: ",
      "Name: ",
    ];
  }

  // The message for "Can't find your route?"
  function askPriceMessage() {
    return [
      "Hello " + SETTINGS.brandName + ", can you give me a price?",
      "",
      "From: ",
      "To: ",
      "Date: ",
      "People: ",
      "Bags: ",
    ];
  }

  // Sri Lanka time is UTC+5:30 all year (no summer time).
  function isOpenNow() {
    const now = new Date();
    const slMinutes = (now.getUTCHours() * 60 + now.getUTCMinutes() + 330) % 1440;
    return slMinutes >= SETTINGS.openHour * 60 && slMinutes < SETTINGS.closeHour * 60;
  }

  /* ---------- Click tracking for GA4 / Google Ads ---------- */
  // Every WhatsApp and Book button has data-track="whatsapp_click" (or similar)
  // and data-track-location="hero_finder" (where on the page it is).
  // If Google Analytics (gtag) or Google Tag Manager (dataLayer) is on the page,
  // each click is sent as an event. Mark "whatsapp_click" as a key event
  // (conversion) in GA4, then import it into Google Ads.
  function track(eventName, params) {
    if (typeof window.gtag === "function") {
      window.gtag("event", eventName, params);
    } else if (Array.isArray(window.dataLayer)) {
      window.dataLayer.push(Object.assign({ event: eventName }, params));
    }
  }

  document.addEventListener("click", function (e) {
    const el = e.target.closest("[data-track]");
    if (!el) return;
    const params = {
      button_location: el.dataset.trackLocation || "",
      route: el.dataset.route || "",
      vehicle: el.dataset.vehicle || "",
      currency: "USD",
    };
    if (el.dataset.value) params.value = Number(el.dataset.value);
    track(el.dataset.track, params);
  });

  /* ---------- Plain WhatsApp links ---------- */
  // Any link with data-wa="ask" or data-wa="hello" gets the right message.
  function wireWhatsappLinks() {
    $$("[data-wa]").forEach((a) => {
      const kind = a.dataset.wa;
      if (kind === "ask") a.href = whatsappUrl(askPriceMessage());
      if (kind === "hello") a.href = whatsappUrl(["Hello " + SETTINGS.brandName + ", I have a question about a transfer."]);
      a.target = "_blank";
      a.rel = "noopener";
    });
  }

  /* ---------- Price finder ---------- */
  // Works on the home page (with From/To dropdowns) and on route pages
  // (fixed route: data-from and data-to on the finder, no dropdowns).
  function setupFinder(finder) {
    const fromSel = $("[data-finder-from]", finder);
    const toSel = $("[data-finder-to]", finder);
    const fixedFrom = finder.dataset.from;
    const fixedTo = finder.dataset.to;
    const bookBtn = $("[data-finder-book]", finder);
    const routeOut = $("[data-finder-route]", finder);
    const priceCar = $("[data-price='car']", finder);
    const pricePerCar = $("[data-finder-percar]", finder);
    const priceVan = $("[data-price='van']", finder);
    const includedOut = $("[data-finder-included]", finder);
    const capCar = $("[data-cap='car']", finder);
    const capVan = $("[data-cap='van']", finder);

    if (capCar) capCar.textContent = VEHICLES.car.people + " people, " + VEHICLES.car.bags + " bags";
    if (capVan) capVan.textContent = VEHICLES.van.people + " people, " + VEHICLES.van.bags + " bags";
    if (includedOut) includedOut.textContent = SETTINGS.includedLine;

    // Fill the From list (airport first, then A–Z).
    if (fromSel) {
      const froms = Array.from(new Set(TRIPS.map((t) => t.from))).sort((a, b) =>
        a.includes("Airport") ? -1 : b.includes("Airport") ? 1 : a.localeCompare(b)
      );
      fromSel.innerHTML = froms.map((f) => `<option>${f}</option>`).join("");
      fromSel.value = DEFAULT_ROUTE.from;
    }

    // Fill the To list with the places you can reach from "From".
    function fillTo() {
      if (!toSel) return;
      const previous = toSel.value;
      const tos = TRIPS.filter((t) => t.from === fromSel.value).map((t) => t.to).sort();
      toSel.innerHTML = tos.map((t) => `<option>${t}</option>`).join("");
      if (tos.includes(previous)) toSel.value = previous;
      else if (tos.includes(DEFAULT_ROUTE.to)) toSel.value = DEFAULT_ROUTE.to;
    }

    function selectedVehicle() {
      const checked = $("input[name='vehicle']:checked", finder);
      return checked ? checked.value : "car";
    }

    function update() {
      const from = fromSel ? fromSel.value : fixedFrom;
      const to = toSel ? toSel.value : fixedTo;
      const trip = findTrip(from, to);
      if (!trip) return;
      const vehicle = selectedVehicle();

      if (routeOut) routeOut.textContent = trip.from + " to " + trip.to + ": car " + formatPrice(trip.car) + ", van " + formatPrice(trip.van) + ", per car.";
      // Route pages: show the travel time from ROUTES.
      if (fixedFrom) $$("[data-route-time]").forEach((el) => { el.textContent = trip.time; });
      if (priceCar) priceCar.textContent = formatPrice(trip.car);
      if (priceVan) priceVan.textContent = formatPrice(trip.van);
      if (pricePerCar) pricePerCar.textContent = formatPrice(trip[vehicle]);

      if (bookBtn) {
        bookBtn.href = whatsappUrl(bookingMessage(trip, vehicle));
        bookBtn.dataset.route = trip.from + " > " + trip.to;
        bookBtn.dataset.vehicle = vehicle;
        if (typeof trip[vehicle] === "number") bookBtn.dataset.value = trip[vehicle];
        else delete bookBtn.dataset.value;
      }
    }

    if (fromSel) fromSel.addEventListener("change", () => { fillTo(); update(); });
    if (toSel) toSel.addEventListener("change", update);
    $$("input[name='vehicle']", finder).forEach((r) => r.addEventListener("change", update));

    // Start with the default vehicle selected.
    const startRadio = $(`input[name='vehicle'][value='${DEFAULT_ROUTE.vehicle}']`, finder);
    if (startRadio) startRadio.checked = true;

    fillTo();
    update();

    // Let other parts of the page pick a route in the finder.
    finder.selectRoute = function (from, to) {
      if (!fromSel || !toSel) return;
      fromSel.value = from; fillTo(); toSel.value = to; update();
    };
  }

  /* ---------- Route board (popular routes table) ---------- */
  function setupBoard(tbody) {
    const rows = ROUTES.filter((r) => r.board);
    tbody.innerHTML = rows.map((r) => {
      const msg = [
        greeting(),
        "",
        "Route: " + r.from + " → " + r.to,
        "Vehicle: Car " + formatPrice(r.car) + " or Van " + formatPrice(r.van) + " (please choose)",
        "",
        "Date: ",
        "Time: ",
        "Flight number: ",
        "People: ",
        "Bags: ",
        "Name: ",
      ];
      return `
        <tr>
          <td class="board__route"><a href="${r.page}">${r.from}<span class="board__arrow" aria-hidden="true"> → </span><span class="visually-hidden"> to </span>${r.to}</a></td>
          <td class="board__time">${r.time}</td>
          <td class="board__car" data-label="Car"><span class="board__price">${formatPrice(r.car)}</span></td>
          <td class="board__van" data-label="Van"><span class="board__price">${formatPrice(r.van)}</span></td>
          <td class="board__book">
            <a class="btn btn--small btn--on-dark" href="${whatsappUrl(msg)}" target="_blank" rel="noopener"
               data-track="whatsapp_click" data-track-location="route_board" data-route="${r.from} > ${r.to}"
               aria-label="Book ${r.from} to ${r.to} on WhatsApp">Book</a>
          </td>
        </tr>`;
    }).join("");
  }

  /* ---------- Booking form → WhatsApp ---------- */
  function setupForm(form) {
    const list = $("#places");
    if (list) {
      const places = Array.from(new Set(TRIPS.map((t) => t.from))).sort();
      list.innerHTML = places.map((p) => `<option value="${p}"></option>`).join("");
    }
    const dateInput = form.elements.date;
    const today = new Date();
    const iso = (d) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
    if (dateInput) dateInput.min = iso(today);

    // Helpful error messages, one per field.
    const rules = {
      name: (v) => (v ? "" : "Please add your name. The driver writes it on the name board."),
      pickup: (v) => (v ? "" : "Where should we pick you up? For example: Colombo Airport, or your hotel."),
      dropoff: (v) => (v ? "" : "Where are you going? A town or a hotel name is fine."),
      date: (v) => (!v ? "Please choose the date of your ride." : v < iso(today) ? "This date is in the past. Please check it." : ""),
      time: (v) => (v ? "" : "Please add a pickup time. Flying in? Use your landing time."),
      passengers: (v) => {
        const n = Number(v);
        if (!v || n < 1) return "How many people are travelling?";
        if (n > VEHICLES.van.people) return "For more than " + VEHICLES.van.people + " people, message us. We can send two vehicles.";
        return "";
      },
      bags: (v) => (v === "" || Number(v) < 0 ? "How many big bags? Choose 0 if you have none." : ""),
    };

    function check(name) {
      const input = form.elements[name];
      const msg = rules[name](input.value.trim());
      const out = $("#err-" + name);
      input.setAttribute("aria-invalid", msg ? "true" : "false");
      if (out) out.textContent = msg;
      return !msg;
    }

    // Re-check a field as soon as the traveller fixes it.
    Object.keys(rules).forEach((name) => {
      const input = form.elements[name];
      if (!input) return;
      input.addEventListener("blur", () => { if (input.value) check(name); });
      input.addEventListener("input", () => { if (input.getAttribute("aria-invalid") === "true") check(name); });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      const bad = Object.keys(rules).filter((name) => !check(name));
      if (bad.length) {
        form.elements[bad[0]].focus();
        return;
      }
      const f = form.elements;
      const dateText = new Date(f.date.value + "T12:00:00").toLocaleDateString("en-GB", {
        weekday: "short", day: "numeric", month: "short", year: "numeric",
      });
      const people = Number(f.passengers.value);
      const bags = Number(f.bags.value);
      const vehicle = people > VEHICLES.car.people || bags > VEHICLES.car.bags ? "van" : "car";
      const trip = findTrip(f.pickup.value.trim(), f.dropoff.value.trim());

      const lines = [
        greeting(),
        "",
        "Name: " + f.name.value.trim(),
        "From: " + f.pickup.value.trim(),
        "To: " + f.dropoff.value.trim(),
        "Date: " + dateText,
        "Time: " + f.time.value,
        "Flight number: " + (f.flight.value.trim() || "-"),
        "Passengers: " + people,
        "Bags: " + bags,
        "Hotel: " + (f.hotel.value.trim() || "-"),
        "Vehicle: " + VEHICLES[vehicle].name,
      ];
      if (trip && typeof trip[vehicle] === "number") {
        lines.push("Price on your website: " + formatPrice(trip[vehicle]) + " per car");
      }

      track("whatsapp_click", {
        button_location: "booking_form",
        route: f.pickup.value.trim() + " > " + f.dropoff.value.trim(),
        vehicle: vehicle,
        currency: "USD",
      });

      const url = whatsappUrl(lines);
      const win = window.open(url, "_blank", "noopener");
      if (!win) window.location.href = url;
    });
  }

  /* ---------- "Open now" status ---------- */
  function setupStatus() {
    const open = isOpenNow();
    $$("[data-status]").forEach((el) => {
      el.dataset.open = open;
      const text = $(".status__text", el);
      if (!text) return;
      text.textContent = open
        ? "We're online now. Usual reply time: " + SETTINGS.replyMinutes + " minutes."
        : "We're offline now (open 6 AM – 11 PM Sri Lanka time). We reply first thing in the morning.";
    });
  }

  /* ---------- Sticky bar: hide it while the price finder is on screen ---------- */
  function setupStickyBar() {
    const bar = $(".sticky-bar");
    const finder = $("#price-finder");
    if (!bar || !finder || !("IntersectionObserver" in window)) return;
    new IntersectionObserver((entries) => {
      bar.classList.toggle("is-hidden", entries[0].isIntersecting);
    }).observe(finder);
  }

  /* ---------- Phone menu ---------- */
  function setupMenu() {
    const btn = $(".menu-btn");
    const nav = $("#site-nav");
    if (!btn || !nav) return;
    btn.addEventListener("click", () => {
      const open = nav.classList.toggle("is-open");
      btn.setAttribute("aria-expanded", open);
    });
    $$("a", nav).forEach((a) => a.addEventListener("click", () => {
      nav.classList.remove("is-open");
      btn.setAttribute("aria-expanded", "false");
    }));
  }

  /* ---------- FAQ schema for Google (built from the FAQ on the page) ---------- */
  // You only edit the FAQ text in the HTML. This copies it into FAQPage JSON-LD.
  function setupFaqSchema() {
    const items = $$(".faq details");
    if (!items.length) return;
    const data = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: items.map((d) => ({
        "@type": "Question",
        name: $("summary", d).textContent.trim(),
        acceptedAnswer: { "@type": "Answer", text: $(".faq__answer", d).textContent.trim().replace(/\s+/g, " ") },
      })),
    };
    const s = document.createElement("script");
    s.type = "application/ld+json";
    s.textContent = JSON.stringify(data);
    document.head.appendChild(s);
  }

  /* ---------- Start ---------- */
  document.addEventListener("DOMContentLoaded", function () {
    $$("[data-finder]").forEach(setupFinder);
    const board = $("[data-board]");
    if (board) setupBoard(board);
    const form = $("[data-booking-form]");
    if (form) setupForm(form);
    wireWhatsappLinks();
    setupStatus();
    setupMenu();
    setupStickyBar();
    setupFaqSchema();
    const year = $("[data-year]");
    if (year) year.textContent = new Date().getFullYear();
  });

  // Tiny API for the browser console, handy when testing prices.
  window.Taxi = { ROUTES, VEHICLES, SETTINGS, formatPrice, whatsappUrl, bookingMessage, findTrip };
})();
