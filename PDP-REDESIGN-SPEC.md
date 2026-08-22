# BHIMA — Product Detail Page

The PDP rebuilt to the approved design screenshot, on the `product.luxury`
template. Every existing section, data source, integration and script contract
is carried over; the layout, hierarchy and styling are new, and two features are
new: the **pincode delivery check** and the **reusable campaign banner**.

`nov-product-template.liquid`, every `product-single-*` snippet,
`templates/product.json` and all other product templates are untouched and keep
working exactly as before.

---

## 1. Page order

Current order, after both client review rounds (§9a, §9b):

```
HEADER
  ↓
PRODUCT HERO            gallery  |  information panel:
                                    eyebrow · title · rating · price
                                    description · availability / SKU / size guide
                                    PINCODE DELIVERY CHECK  (+ dispatch note)
                                    Add to Bag · Buy It Now · wishlist
                                    assistance actions
  ↓
CERTIFICATION           "WE ARE CERTIFIED BY" + logo strip, full-width band
  ↓
INFORMATION GRID        Specifications | Price Breakup | Campaign banner
  ↓
POLICIES                Delivery Policy  +  Care Instructions
  ↓
LIVE VIDEO CALL         full-width banner, copy overlaid
  ↓
TRUST BENEFITS          Free Delivery | Purity Guaranteed | Certified Jewellery
  ↓
RELATED PRODUCTS
  ↓
RECENTLY VIEWED PRODUCTS
  ↓
PRODUCT FAQ
  ↓
FOOTER

+ sticky purchase bar, from the point the hero CTA scrolls away
```

Removed on the client's instruction: the customer-review section, the quantity
stepper, the standalone shipping strip, Complete the Look, and the Warranty /
Assurance and Shipping & Return accordions. Each is one setting or one template
block away from returning — see §9a and §9b.

Mobile follows the same DOM order — no `order` overrides are needed, because the
markup is already authored in the required sequence. Verified at 375px: the flow
is strictly top-to-bottom and nothing overflows horizontally.

---

## 2. Files

### Sections
| File | Renders |
|---|---|
| `bhima-pdp-main.liquid` | hero → shipping strip → pincode check → information grid → policies → sticky bar |
| `bhima-pdp-videocall.liquid` | Live Video Call card + trust benefits strip |
| `bhima-pdp-rails.liquid` | Related Products, then Complete the Look |
| `bhima-pdp-recent.liquid` | Recently Viewed Products |
| `bhima-pdp-reviews.liquid` | review summary, hosts the reviews app block |
| `bhima-pdp-faq.liquid` | product FAQ accordion + FAQPage schema |

### Snippets
`pdp-icon` · `pdp-gallery` · `pdp-info-panel` · `pdp-price` · `pdp-variants` ·
`pdp-purchase` · **`pdp-assistance-bar`** · **`pdp-certified`** ·
**`pdp-shipping-strip`** · **`pdp-delivery-check`** · **`pdp-specifications`** ·
`pdp-price-breakdown` (now the Price Breakup card) · **`pdp-promo-banner`** ·
**`pdp-policies`** · `pdp-sticky-bar` · `pdp-product-card` · `pdp-rail-inner` ·
`pdp-story-details` (optional, off by default)

### Assets
| File | Purpose |
|---|---|
| `bhima-pdp.css` | design system + every component, scoped under `.bhima-pdp` |
| `bhima-pdp.js` | gallery, accordions, bottom sheet, quantity, wishlist proxies, rails, sticky bar, Buy-It-Now proxy, scroll reveal |
| `bhima-delivery.js` | pincode delivery check, provider registry |

### Template
`templates/product.luxury.json` wires it together and carries the existing
policy copy verbatim.

### Removed
`pdp-assurance`, `pdp-service-strip`, `pdp-help-card` and `pdp-trust-strip` are
gone — every piece of content they rendered now lives in `pdp-certified`,
`pdp-policies`, `pdp-assistance-bar`, `pdp-delivery-check` and the video-call
section. Nothing they carried was dropped; see §9.

---

## 3. Where each existing thing went

| Existing | Now |
|---|---|
| Product media, zoom, fullscreen, video | `pdp-gallery` — unchanged, vertical rail + stage + counter |
| Collection / title / rating / price / description | hero panel, in the drawn order |
| SKU + availability | label/value rows under the description |
| Variants, quantity, Add to Bag, Buy It Now, wishlist | one horizontal action row; wishlist is no longer hidden |
| Share · Ask a Question · Video Call · FAQ | `pdp-assistance-bar`, one row under the buttons |
| "WE ARE CERTIFIED BY" + `Certified_By.jpg` | `pdp-certified`, boxed under the assistance row |
| Dispatch + free-shipping lines | `pdp-shipping-strip`, full-width strip under the hero |
| Jewellery details (metal, purity, weights, stones) | Specifications card, column 1 |
| Price break-up | Price Breakup card, column 2 |
| Delivery policy / Shipping & Return / Warranty / Care | `pdp-policies`, two accordions per row |
| Live Video Call banner | `bhima-pdp-videocall` — same three CTA actions |
| Free Delivery / Purity / Certified promises | video-call card columns + trust strip |
| Related products | `Related Products` rail (native `related` intent) |
| Complete the Look | second rail, same four-step source order as before |
| Recently viewed | same engine, new cards with name + price |
| Sticky add-to-cart | sticky bar, now with Buy It Now |

---

## 4. Script contracts

The theme's scripts find PDP elements by exact id and class. Every hook is
reproduced:

| Contract | Owner | Lives in |
|---|---|---|
| `#variant_id`, `#productSelect` (`data-sku`, `data-inventory_policy`, `data-inventory_management`) | `nov-product-variants.js` | `pdp-variants` |
| `product-variant-swatch` / `-dropdown` + `data-product-id` / `data-product-url` | same | `pdp-variants` |
| `#ProductPrice-{section.id}` | same (`renderProductInfo`) | `pdp-price` |
| `#variantSku` | same | `pdp-info-panel` |
| `.proFeaturedImage .item[data-media-id]` + `.act` | same (`updateMedia`) | `pdp-gallery` |
| `#product-form-{id}`, `.product-form__item--submit`, `[name=add] > #AddToCartText`, `.product-form__item--checkout` | same (`toggleAddButton`) | `pdp-info-panel` / `pdp-purchase` |
| `#product-form-sticky-{id}`, `#variant_id-stick`, `#ProductPriceStick-{id}`, `#productSelectStick`, `product-variant-selects-stick` | same | `pdp-sticky-bar` |
| `.product-form__cart-submit` | `nuranium.js` AJAX add-to-cart | `pdp-purchase`, `pdp-sticky-bar`, `pdp-product-card` |
| `.product-single__wishlist a[data-icon-wishlist]` inside `.product-single[data-wishlist-img]` with `.product-single__title` | `nuranium.js` wishlist | `pdp-purchase` + hero wrapper + panel title |
| `.item-product [data-icon-wishlist]` with `.product__title` / `.product__thumbnail` | `nuranium.js` card wishlist | `pdp-product-card` |
| `#proFeaturedImageZoom` + `.item_img[data-pswp-*]` | PhotoSwipe | `pdp-gallery` |
| `#Shopshare`, `#Shopask`, `#ShopVideoCall` | existing modals | `pdp-assistance-bar` + unchanged modal snippets |
| `product-single-deal` (countdown + stock bar) | existing snippet | rendered inside the panel |
| `{{ form | payment_button }}` | Shopify dynamic checkout | `pdp-purchase`, same nesting as the original |
| Air Reviews metafields + app block | Air Reviews | `bhima-pdp-reviews` |
| `Shopify.Products` recently-viewed cookie | `jquery.products.min.js` | `bhima-pdp-recent` |
| Native recommendations API | Shopify | `bhima-pdp-rails` |
| GTM / analytics | layout | untouched |

**The wishlist heart is now the real control.** It used to be visually hidden
with proxies clicking it. The heart in the action row *is* the anchor
`nuranium.js` binds; the gallery and sticky hearts still proxy to it, so the
three cannot diverge.

**Buy It Now exists once.** The sticky bar's Buy It Now forwards a click to the
dynamic-checkout button in the hero form rather than posting a checkout of its
own, and hides itself when that button is absent or disabled — payment button
switched off, variant sold out, or a wallet button that lives in a shadow root.

---

## 5. Pincode delivery check (new)

`snippets/pdp-delivery-check.liquid` renders the UI and hands
`assets/bhima-delivery.js` a JSON config. The JS owns a **provider registry**;
nothing in it hardcodes a verdict for any PIN code.

| Provider | Source of truth |
|---|---|
| `zones` | Shopify **metaobject** entries (type from a section setting, default `delivery_zone`), server-rendered into the page |
| `rules` | PIN-prefix lists + working-day estimates from the section settings |
| `endpoint` | any HTTP API — the live-rate backend, a 3PL, Shiprocket/Delhivery behind a proxy |
| `auto` (default) | endpoint if a URL is set → zones if entries exist → rules |

Swapping provider is a section setting. Adding one is a single call, from
anywhere on the page:

```js
BhimaDelivery.registerProvider('shiprocket', function (pincode, config) {
  return fetch('/apps/shiprocket/serviceability?pin=' + pincode)
    .then(function (r) { return r.json(); })
    .then(BhimaDelivery.normalise);
});
```

**Response contract** — a provider returns (or resolves to) this shape; only
`serviceable` is required. `null` means "I have nothing to say", and the next
provider is tried.

```js
{ serviceable, minDays, maxDays, freeDelivery, insured, cod, label, message }
```

`BhimaDelivery.normalise()` maps the aliases a third-party API is likely to use
— `min_days` / `eta_min` / `days`, `free_delivery`, `is_serviceable`,
`available`, and a `{ success, data }` wrapper.

### Metaobject zones

Create a metaobject definition (default type handle `delivery_zone`) with:

| Field | Type | Notes |
|---|---|---|
| `pincode_prefixes` | list of single-line text, or comma-separated text | also accepts `pincodes` / `prefixes` |
| `min_days` / `max_days` | integer | also accepts `delivery_days_min` / `_max`, or a single `days` |
| `serviceable` | boolean | absent or true = serviceable |
| `cod` | boolean | optional |
| `label` | single-line text | optional, shown under the verdict |

### States

Idle shows the merchant-managed **Delivery promise** blocks (Free Delivery /
Secure & Insured / 5-10 Business Days). Then:

- **loading** — spinner in the button, button disabled, `aria-busy` on the input
- **invalid** — Indian format enforced (`^[1-9][0-9]{5}$`; a leading zero is not
  a PIN code), field turns red, message under the form
- **success** — ✓ Delivery Available · Estimated Delivery *5–10 Days* · Free
  Delivery · Secure / Insured Delivery (+ COD when the source says so)
- **unavailable** — the merchant's unavailable message
- **error** — "we couldn't check this pincode" and the idle promises come back

A dead endpoint reports as *"couldn't check"*, never as *"we don't deliver
there"*, and never leaves the previous PIN's verdict on screen next to an error.

**A verdict belongs to one pincode.** Editing the field clears the answer on
screen — otherwise "Delivery Available · 5–10 Days" sits under a half-typed code
and reads as if it applied to it. Retyping the exact pincode the verdict was for
leaves it alone, so there is no flicker from an incidental keystroke. The same
edit also abandons any reply still in flight, so a slow response for a pincode
the customer has moved on from cannot repaint the panel a moment later.

---

## 6. Campaign banner (new)

Column 3 of the information grid is a generic campaign slot — **not** a quality
or assurance panel. One definition serves the whole catalogue; nothing about it
is authored per product.

Source order, first match wins:

1. a metaobject entry referenced by the product metafield `custom.promo_banner`
   — a per-product or per-collection override
2. the `promo_banner` blocks on `bhima-pdp-main` — the campaign library the
   merchant maintains in the theme editor

Every candidate passes the same gate: **enabled**, inside its **validity
window**, and matching this product's **collections / tags / type**. If none
pass, the column does not render and the grid closes up to two columns.

Per campaign: enable/disable · eyebrow · heading · offer line · description ·
CTA label · CTA link · footnote · look (cream / ink / gold) · desktop artwork ·
mobile artwork · start date · end date · target collection handles · target tags
· target product types · excluded tags.

Suits flat discounts on making charges, festival offers, wedding-collection
campaigns, monthly plans, gold-coin offers, limited-time and seasonal pushes.

---

## 7. Price transparency

`pdp-price-breakdown.liquid` reproduces the arithmetic from
`product-single-tab.liquid` line for line. Nothing about how the numbers are
produced changed — the live-rate app's `jewelry_config` metafields remain the
only source, and this snippet does not calculate, round or re-derive anything
the app did not publish. Rows appear only when their metafield is present and
non-zero; if `jewelry_config.configured` is not true the card is skipped
entirely.

Presentation changes only: an icon per row, a highlighted total, and the applied
metal rate as a footnote. Every row label is a section setting.

**One deliberate wording deviation.** The design labels the first row *"Metal
Rate ₹3325.0"*, but that figure is the metal **cost** for this piece — the rate
is ₹/gram, and printing a cost under the word "rate" on a price-transparency
panel is the kind of thing a customer can reasonably call misleading. The row
therefore reads *"Gold value (0.35 gram)"* by default, with the actual applied
rate on the footnote line below the total. Set **Price breakup → Metal row
label** to `Metal Rate` if you want the screenshot's wording verbatim.

`jewelry_config` is product-level, not per-variant, so the breakup reflects the
product price — as it did before. Variant-level breakups would need the
live-rate app to publish per-variant metafields.

---

## 8. Design language

Taken from the theme's own tokens — no new palette.

| Token | Value | Origin |
|---|---|---|
| Canvas | `#FFFDF9` | brief; also the section's **Page background** setting |
| Ink | `#1c1c1c` | `color_schemes.background-1.title` |
| Body | `#6b6255` / `#9c9384` | theme text + subtitle |
| Lines | `#ece5d8` · `#f4efe5` · `#ddd2bd` | theme borders |
| Gold | `#c9a227` · `#b8912f` · `#e8d9ae` · `#fdf9ee` | existing price-breakdown UI |
| Cream | `#fdf7ec` · `#fdfaf3` | product-card and campaign surfaces |
| Accent | `#df9a7c` | theme-wide hover / wishlist accent |
| Type | Jost (`--font-family-primary` / `--font-family-default`) | theme settings |

Corners stay near-square (6px, 10px on cards), borders hairline, shadows only on
the sticky bar, motion on a single easing curve, and every animation is disabled
under `prefers-reduced-motion`.

Measured at a 1440px viewport against the comp:

| Element | Reference | Built |
|---|---|---|
| Content container | 1320 | 1320 |
| Gallery column | 720 | 710 |
| Information panel | 554 | 546 |
| Gallery stage | 600 × 662 | 605 × 653 |
| Action row | bag / buy / heart | 237 / 237 / 52 |
| Information grid | 3 × ~415 | 415 / 415 / 415 |
| Policy accordions | 2 × 634 | 634 / 634 |
| Delivery check | 43 / 57 % | 45 / 55 % |
| Related-products cards | 5 across | 5 × 242 |

---

## 9. Decisions worth knowing

Three pieces of existing content are not in the approved design. None were
deleted — each is one checkbox away, and the content stays in the template so
nothing is lost:

| Content | Setting | Default |
|---|---|---|
| Hero assurance badges (BIS Hallmarked / 100% Certified / Secure Payments) | **Product information → Show the assurance badge row in the hero** | off |
| Trust items (BIS Hallmark / Certified Jewellery / Lifetime Buyback / Easy Exchange) | **Certification → Show trust items in the certification box** | off |
| Editorial story card | **Story card → Show the story card** | off |

The product description is *not* one of these — it moved above the fold into the
hero panel, which is where the design puts it.

**EMI note** and **breadcrumb** are also off by default for the same reason; the
code and settings are intact.

**Reviews and the product FAQ are the one addition to the drawn flow.** The
design shows no reviews section, but the hero's "View all 24 reviews" and the
assistance row's FAQ both need targets, and both are on the must-preserve list.
They sit between the policies and the Live Video Call — after price and policy
detail, before the consultation CTA. Move or remove them in the theme editor if
you would rather the page ended at the video call.

**Two rails, not one.** The design draws a single Related Products carousel.
Complete the Look is preserved as a second full-width rail below it, because its
recommendation logic (metafield → fallback collection → complementary intent →
own collection) is existing functionality. Switch it off with **BHIMA product
rails → Show the Complete the Look rail**.

**Quick add on cards** is off by default — the design's cards show image, name
and price only. The AJAX hook is still in the markup behind the setting.

**Two video-call entry points**, as in the design: the assistance row and the
Live Video Call card. Both open `#ShopVideoCall`.

---

## 9a. Client review round

Seven changes from the client review, and what each one did:

| # | Asked for | Done |
|---|---|---|
| 1 | Remove the customer review section | `bhima-pdp-reviews` dropped from the template, along with the `apps` host that existed to carry the reviews app. The hero rating stays but is now plain text — a link needs somewhere to go. Set **Product information → Rating links to** if a reviews page comes back. `bhima-pdp-reviews.liquid` is still in the theme, so re-adding it is one section. |
| 2 | Remove quantity — one piece at a time | **Show quantity selector** off. The form still posts an explicit `quantity=1`, and the row is not rendered at all rather than left empty. The sticky-bar trigger moved from the quantity row onto the button row, which is why the bar still appears at the right scroll point. |
| 3 | Size chart per collection, from the backend | New `pdp-size-chart` snippet — a link beside the availability / SKU rows opening a dialog. Data comes from Shopify: see §3a. |
| 4 | Delivery availability where quantity was | The delivery check now renders inside the hero panel in a `compact` variant, immediately above the buttons. |
| 5 | Certification where delivery availability was | `pdp-certified` gained a `band` variant and now fills that full-width slot under the shipping strip. |
| 6 | Free-delivery icon and copy repeating; video call full width | Three places were saying the same thing. The compact delivery check drops the promise columns, the video-call card's benefit columns are off by default (which lets the card run full width, image 46% / copy 54%), and the reassurance strip is now the single home for Free Delivery / Purity Guaranteed / Certified Jewellery. The shipping strip's free-shipping line was also cleared — see §10. |
| 7 | FAQ last | Template order is now `main → video call → rails → recently viewed → faq`. The assistance row's FAQ link still resolves to the on-page `#faq` anchor. |

Panel order after the change: eyebrow → title → rating → price → description →
availability / SKU / size guide → **delivery check** → variants → Add to Bag /
Buy It Now / wishlist → assistance actions.

The `delivery_feature` blocks (Free Delivery / Secure & Insured / 5-10 Business
Days) are still on the section but no longer render, because only the band
variant shows them. They are kept so the band can be restored without
re-authoring the copy.

### 3a. Size chart — where the data comes from

One uploaded image, held **against the collection, never the product** — a
single chart covers a whole catalogue. Resolution order, first hit wins:

1. collection file metafield `custom.size_chart_image`
2. the section's fallback image — a brand-level catch-all for collections that
   carry none

**To set it up:** Settings → Custom data → Collections → add a definition with
namespace and key `custom.size_chart_image`, type *File* (accept images). Then
upload a chart to each collection that needs one. Nothing renders — no empty
link, no empty dialog — until a chart is found, so collections without one are
unaffected.

When a product sits in several collections, the first one carrying a chart wins
(`all` is skipped). The dialog heading combines that collection's name with the
section's title setting, e.g. *"Bangles — Size Guide"*.

Two things were built and then removed on the client's instruction, rather than
left dormant: a **product-level override** (per-product charts are not wanted)
and a **rich-text note** beside the image (upload only). Removing the note also
retired the metaobject path — it existed to carry a note and a title, and the
collection name already supplies the heading — so there is no metaobject
definition for the merchant to create.

### 3b. Product size

A plain text field per product, typed in the admin and shown on the page.

**To set it up:** Settings -> Custom data -> **Products** -> add a definition
with namespace and key `custom.size`, type *Single line text*. Free-form on
purpose, because jewellery sizing is not one unit: `12`, `16 inch`,
`2.4 cm`, `Free size` all read correctly.

It renders in two places, both driven by the same metafield:

1. the hero panel, beside Available / SKU and next to the Size Guide link — the
   measurement and the chart that explains it belong together, above the fold
2. the Specifications card, where a shopper scanning attributes expects it

That mirrors what the approved design already does with SKU (hero) and Product
Code (Specifications) — the same value in a summary and in the detail table.

Controlled by **Size -> Show the product size** (on) and **Size label** (blank
uses the translated default). Nothing renders when the metafield is empty.

**Leave it empty on products that sell size as a variant option.** The option
selector is the source of truth there, and a fixed product-level value would
contradict whatever the customer has selected. This catalogue is single-variant
made-to-order pieces, which is what the field is for.

---

**Mobile treatment.** The same node, presented differently: a centred modal from
768px up, and a bottom sheet below it (rounded top, drag grip, anchored to the
bottom edge, capped at 88vh with the body scrolling inside, safe-area padding).
The trigger also changes shape — a text link on desktop, a full-width 44px chip
on phones, because a 12px underlined link is a poor tap target next to the SKU.
A wide chart scrolls inside its own box rather than widening the dialog. Closes
on the X, the scrim and Escape; locks the page behind it; returns focus to the
trigger.

The theme's legacy `data-toggle="CanvasSizeGuide"` button pointed at an element
that exists nowhere in this theme — the old size guide opened nothing. This is a
new implementation, not a reuse.

---

## 9b. Client review — follow-up round

| Asked for | Done |
|---|---|
| The lone dispatch sentence in a full-width box looked odd | Folded into the delivery card as a footer note under the input, and the standalone band deleted. Dispatch time and delivery estimate are the same question, so they now answer it together above the buy button. `pdp-shipping-strip.liquid` still renders as a strip when the delivery check is switched off, so the copy can never be orphaned. |
| "WE ARE CERTIFIED BY" above the logos | The band is `flex-direction: column`, centred — heading, then the logo strip. |
| Remove Warranty / Assurance and Shipping & Return | Both `block_text` blocks dropped from the template. Two accordions remain: Delivery Policy and Care Instructions. **The returns terms are now nowhere on the page — see §10.** |
| Video call: full-width banner, too much empty space | New `banner` layout (default): the image fills the card via `object-fit: cover`, copy overlaid in a 560px column behind a directional scrim. Two settings — **Layout** (banner / split) and **Banner copy sits** (right / left). Phones get a 210px banner strip with the copy on white beneath, because a horizontal scrim cannot protect type at 375px. |
| Remove Complete the Look | **Show the Complete the Look rail** off. The rail, its four-step source order and the fallback `<template>` all remain in `bhima-pdp-rails.liquid`. |
| Add to cart missing on the rail cards | **Show quick add** on. The button spans the card rather than sitting as a stub under the price. |
| Wishlist icon alignment | A real bug in this stylesheet, not the theme's: `.pdp-pcard__media > a { display: block }` was written for the image link, but the wishlist anchor is also a direct child, so it overrode `inline-flex` and the 14px heart sat at the top-left of its 30px circle (measured offset −8/−8). Now excluded via `:not(.pdp-pcard__wish)`, with a higher-specificity `display: inline-flex` as insurance. |
| Disable the cart quantity updater | The −/+ controls are gone from the drawer and the cart page; quantity shows as a value and the remove button stays. |

### The cart quantity change

Both handlers are delegated — `.cart__mini-qty` in the drawer, `change keyup` on
`.cart__qty-input` on the cart page — so removing the controls is what disables
them: nothing is left to fire. The `<input>` deliberately stays in the DOM as
`type="hidden"`, because `nuranium.js` reads `.cart__mini-qty--input` when it
refreshes the drawer, and the cart update form needs its `updates[]` entry to
keep line order. Dropping one would shift the array and update the wrong line.

Governed by **Vinova Cart → One piece per line** (on by default). Styles live in
a new `assets/bhima-cart.css`, loaded globally from `nov-head-css.liquid` —
deliberately not appended to `css-novstyle.css`, so a theme update cannot wipe
them. The cart drawer is injected by AJAX on every page, which is why the sheet
is global rather than section-scoped.

**Hiding the stepper does not stop quantity 2.** `/cart/add.js` always
increments, so two clicks of Add to Bag still made it 2 — which is how the
screenshot got there — and with no stepper the customer could not reduce it.
The decision was to enforce it with **Shopify inventory** rather than theme code:

> Product → Inventory → *Track quantity* on, quantity 1, *Continue selling when
> out of stock* off.

Shopify then refuses the second add itself. That also prevents two customers
buying the same piece, which no amount of theme code can do.

### Add to cart now reports the real outcome

Enforcing inventory made an existing bug reachable: the button showed
"Added to bag" on a 700ms timer regardless of whether the add succeeded, so a
refused add told the customer their piece was in the bag. And `nuranium.js`'s own
error branch writes to `.add-to-cart-text`, which this markup does not use, so
its message went nowhere either.

`bhima-pdp.js` now waits for the actual reply. jQuery fires document-level
`ajaxSuccess` / `ajaxError` for every request it makes, so the outcome is
observable without touching `nuranium.js`:

- success → "Added to bag", green, reverts after 1.8s
- refused → "Unavailable", red, and Shopify's own `description` shown verbatim
  under the buttons (e.g. *"You can only add 1 of 14K Gold Locket to the cart."*)
- the reason stays readable after the button reverts, and clears on the next
  attempt so it never sits beside a spinner
- unrelated cart requests are ignored, and a 6s failsafe clears the button if no
  reply ever arrives, so the CTA cannot stick

Buttons without `.product-form__cart-submit` post normally and navigate, so they
keep the optimistic path. Rail cards have no room for a message line and show
the button state only.

---

## 10. Still for the merchant to reconcile

**The shipping promise contradicts itself, and did before this redesign.** Three
merchant-authored numbers now sit on one page:

- hero strip: orders ship within **5 to 10 business days**
- delivery check: **5–10 Days** (standard 10, range width 5)
- Delivery Policy accordion: allow **15-20 working days** for dispatch

The first two were set to agree. Pick one number and bring the policy copy in
line, rather than leaving the page arguing with itself.

**The free-shipping line was cleared to kill the repetition.** Point 6 of the
client review flagged the free-delivery icon and copy appearing several times.
The shipping strip's second line ("Hooray ! This item ships free to all over
India") was the last remaining duplicate of the reassurance strip's *Free
Delivery / Across India*, so **Shipping timeline → Free shipping line** is now
blank and the strip carries the dispatch promise alone. Restoring it is one
field — but the duplication comes back with it.

**The campaign CTA has no link yet.** `Shop Now` falls back to
`/collections/all`. Point **Promotional campaign → CTA link** at the campaign
collection.

**`templates/product.json` still points at the legacy `nov-product-template`.**
Nothing on the live storefront changed. To ship this design, either assign
products to the `luxury` template (Product → Theme template → `luxury`) or
change `product.json`'s `main` section type to `bhima-pdp-main`. That switch is
deliberately not made here.

**31 pre-existing `de.json` translation gaps** remain (reported by
`shopify theme check`). They predate this work; the six keys this rebuild added
are present in both locales.

---

## 11. Verification

`shopify theme check` — **no offenses of any severity** in any PDP file. The
theme's 34 errors / 60 warnings are unchanged from before this work and all sit
in unrelated files (`de.json` translations, `nov-video-call-banner` image
attributes, a missing section reference in `layout/theme.liquid`).

`shopify theme dev` could not be used: the CLI session for
`f0a486-rn.myshopify.com` returns 401 and re-authenticating needs an interactive
browser login. The layout and behaviour were instead verified against the real
`bhima-pdp.css`, `bhima-pdp.js` and `bhima-delivery.js` in a browser, using
stand-in markup matching what the snippets emit.

**Delivery check** — all five states behave: `123` and `012345` rejected with
the invalid message; `682024` → *Delivery Available · 5–10 Days · Free Delivery
· Secure / Insured Delivery*; an express prefix → *2–7 Days*; a blocked prefix →
unavailable. Endpoint provider: request URL built correctly
(`?pincode=…&product_id=…&variant_id=…&sku=…`), spinner and disabled button
during the request, aliases mapped on the way back, `free_delivery: false`
honoured, and both a rejected fetch and an HTTP 500 surfacing as "couldn't
check" with the idle promises restored.

**Layout** — 1440 / 768 / 375. No horizontal overflow at any width (375px:
`scrollWidth === 375`, zero elements outside the viewport apart from the
intentional horizontal scrollers). Mobile order is strictly monotonic through
all twenty required steps. Action row collapses to bag + heart with Buy It Now
full-width beneath. Information grid resolves to 3 / 2 / 1 columns and closes up
correctly when there is no campaign (2 cards) or no price breakup (1 card).
Single-image products keep a full-width stage.

**Behaviour** — gallery arrows, counter (01→02→03→02), thumbnail sync and
disabled state at the ends; quantity 1→3→2 flooring at 1; policy accordions
opening independently to the right content height and back to 0; wishlist proxy
forwarding to the canonical anchor and mirroring `whislist-added`; sticky Buy It
Now forwarding to the dynamic-checkout button. No console errors.

Two things could not be exercised in a headless pane, which produces no
animation frames: CSS transition end-states, and the sticky bar's
`requestAnimationFrame`-gated scroll handler. The sticky bar's inputs were
confirmed correct (anchor bottom `-1123` after scrolling past the CTA) — only
the frame-driven class toggle went unobserved.

### Local preview

A stand-in page is kept outside the theme, since Shopify rejects unknown
top-level directories:

```bash
node "$SCRATCH/serve.js" "C:/Freelance/BHIMA/bhima-shopify" "$SCRATCH/preview"
```

then open `http://127.0.0.1:4173`. It loads the real CSS and JS, so it is a
faithful check of layout and behaviour — but the data is hand-written, not
Liquid output.

### Left to test on a live store

- variant change → price, SKU, gallery position, button state, sticky mirror
- sold-out variant → Notify me + newsletter modal, sticky Buy It Now hiding
- Add to bag → cart drawer, button resetting afterwards
- Buy It Now → checkout with the selected variant
- wishlist persisting across reload
- Air Reviews summary matching the app widget
- recently viewed populating from the cookie and dropping the current product
- both rails populating, and removing themselves when Shopify returns nothing
- Product and FAQ JSON-LD in the Rich Results test
- a metaobject-backed delivery zone, and a real endpoint if one is wired up

---

## 12. Gotchas worth remembering

**Liquid comments inside `{% liquid %}`** must use `#`, not `{% comment %}` —
block-comment tags there are a syntax error. Every `{%- liquid -%}` preamble in
these snippets is affected.

**Filters are not allowed in `if` conditions.** `if tag | downcase == wanted`
does not parse; assign first. The campaign banner's tag targeting hit this.

**`| default: 'some.key' | t` is a trap.** The `t` filter applies to whatever
`default` returned, so a merchant-supplied label gets translated as if it were a
key and renders "translation missing". Resolve the fallback with an `if` block
instead. The price-breakup row labels hit this.

**jQuery.tmpl compiles the template body into a single-quoted JS string**, so a
single quote anywhere inside — including in translated copy — breaks the compile
with "Invalid or unexpected token". The recently-viewed card therefore uses
double quotes for `resizeImage(featured_image, "500x")` and carries no quoted
copy at all; `nuranium.js` fills the wishlist title itself.

**`nuranium` is not global** — it lives inside an IIFE, so injected markup can't
call `initNovWishListIcons()`. The recently-viewed section mirrors wishlist state
from the `wishListsArr` localStorage key instead. The click handler is delegated
on `document`, so it already covers injected hearts.

**The theme hides `.section-recently-viewed` in CSS and reveals it with jQuery
`.show()`.** Carrying that class means the engine and the section fight over
`display`. Visibility is the `hidden` attribute here, guarded by
`.pdp-recentwrap[hidden] { display: none !important }`.

**`intent=complementary` returns `[]` on this store** until products are linked
in Search & Discovery, which is why Complete the Look falls back through the
`custom.style_with` metafield, a chosen collection, and finally the product's own
collection rendered into a `<template>`.

**Prices render as `Rs. 4,003`, not `₹4,003`.** That is the store's currency
format (Settings → General → Currency formatting), not theme code.

**A headless browser pane produces no animation frames**, which makes
`getComputedStyle` return stale values for existing elements and stops CSS
transitions advancing. Create a fresh node to read styles reliably.

**`$$` inside `node -e "…"` expands to the shell's PID.** Bash substitutes it
inside double quotes, so a patch script containing `$$('[data-pdp-atc]')` wrote
`1262('[data-pdp-atc]')` into `bhima-pdp.js` — syntactically valid, so
`node --check` passed, and it only surfaced as a runtime `TypeError` that killed
every listener bound after it. Same family as the backtick trap above: keep
patch scripts in a file, or single-quote the `node -e` body. And when a change to
behaviour appears to do nothing, read the browser console before re-reading the
logic.

**`theme dev` wedges on atomic-write temp files.** Editors and tools that save
atomically write a sibling first — `pdp-specifications.liquid.tmp.24812.e7f129d0f225`
— and the watcher tries to upload it, fails with *"Must have a .liquid file
extension"*, and then serves that error page for every request until the server
is restarted. Touching a file does not clear it; the failed upload is sticky.
`.shopifyignore` now filters those patterns.

Note the temp patterns there are spelled out per real extension
(`*.liquid.tmp.*`, `*.json.tmp.*`, …) rather than a loose `*.tmp.*`, because
`assets/jquery.tmpl.min.js` is required by the recently-viewed section and a
broad pattern anywhere near it is not worth the risk. Verified: 0 of the 426
real theme files match, every temp form does.

---

## 13. Metafields

### Read, never written
`jewelry_config.configured` · `metal_type` · `metal_weight` · `gross_weight` ·
`metal_cost` · `metal_rate` · `making_charge` · `labour_charge` ·
`wastage_charge` · `stones` · `tax_amount` · `tax_percent` ·
`pricing.discount` · `sale.countdown` · `stock.initial` ·
`air_reviews_product.review_avg` / `review_count`

### Optional
| Key | Type | Used by |
|---|---|---|
| `custom.promo_banner` | metaobject reference | campaign banner override |
| `custom.dimensions` | single-line text | Specifications |
| `custom.certification` | single-line text | Specifications |
| `custom.style_with` | list of product references | Complete the Look |
| `custom.story_title` / `product_story` / `story_image` | text / rich text / file | story card, when enabled |

The Specifications stone table shows type, weight and cost. The story card's
stone accordion additionally renders `clarity`, `color`, `cut`, `shape` and
`setting` if the live-rate app ever adds those keys to `jewelry_config.stones`.
Until then those rows simply do not appear — no placeholder values are shown.
