# Things to replace before going live

Search all files for `[` to find every placeholder.

## 1. Business details (find and replace in all files)

| Find | Replace with | Where |
|---|---|---|
| `[BRAND NAME]` | your brand name | all files, and `brandName` in main.js |
| `94XXXXXXXXX` | WhatsApp number, digits only (e.g. 94771234567) | all files, and `whatsappNumber` in main.js |
| `+94 XX XXX XXXX` | the same number, written for people | index.html, route.html |
| `[EMAIL]` | your email | index.html, route.html |
| `[STREET ADDRESS, TOWN]`, `[STREET ADDRESS]`, `[TOWN]` | your address | footers and the schema in index.html |
| `[NUMBER]` | your SLTDA registration number | hero facts, footers |
| `[YOUR-DOMAIN]` | your domain, e.g. example.lk | canonical, Open Graph and schema tags |
| `G-XXXXXXX` | your GA4 ID (then remove the comment marks around the tag) | index.html head, and paste it in route.html |

## 2. Prices and routes (main.js, top of the file)

- Replace every `car: null, van: null` with real USD prices.
- Check every travel time in `[brackets]`, e.g. `[~3h]`, and remove the brackets.
- Check `people` and `bags` in VEHICLES (now 3 / 3 and 8 / 8).
- Edit `includedLine` ([60] minutes).
- New route: add a line to ROUTES, copy route.html to its `page` name, and add the link to both footers.

## 3. Policies (index.html and route.html)

- Free waiting time: `[60]` minutes at the airport, `[15]` at hotels.
- Cancellation: `[24]` hours, and what happens after that.
- Payment: cash / card / deposit (FAQ "How do I pay?").
- Stops: which are free, and `[$X per extra hour]`.
- Night pickups price (route page FAQ).
- Google rating `[4.9]/5` and review count `[XX]`, with the link to your Google reviews.

## 4. Photos (save as WebP in the /img folder)

Each photo slot has the ready `<img>` line in a comment above it. Replace the `<div class="photo-slot">` with that line.

- `img/airport-pickup.webp` (1200 × 675): driver holding a name board at Colombo Airport arrivals
- `img/car.webp` (800 × 600): your car at the airport, daylight
- `img/van.webp` (800 × 600): your van, side door open, seats and bag space
- `img/driver-1.webp`, `driver-2.webp`, `driver-3.webp` (600 × 600): each driver, face clearly visible
- `img/og-image.jpg` and `img/og-galle.jpg` (1200 × 630): shown when the link is shared

Also fill each driver's first name, languages and years, and the car and van model.

## 5. WhatsApp icon

Download the official WhatsApp glyph from WhatsApp's brand resources and save it as `img/whatsapp-icon.svg` (white version). Until then, the buttons show text only.

## 6. Reviews

Paste real reviews only, word for word, with first name, country, month and year, and the link to each review. Add your Google and TripAdvisor review page links.

## 7. Route pages

route.html is filled in for Colombo Airport → Galle. Rename it `colombo-airport-to-galle-taxi.html`, check the distance `[~150 km]` and the stop times (`+[1h]` etc.). Then copy it for each other route in ROUTES.

## 8. Tracking (Google Analytics 4 and Google Ads)

Every WhatsApp and Book button sends the event `whatsapp_click` with `button_location`, `route`, `vehicle` and `value`. In GA4, mark `whatsapp_click` as a key event, then import it into Google Ads as a conversion. Test it in GA4 DebugView before you start ads.
