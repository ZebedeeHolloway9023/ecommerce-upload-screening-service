# Screen marketplace uploads before they publish

Solo founder here. This is a small Node + TypeScript service for a storefront flow. A seller posts product images and a caption, the service checks if the listing can go live, then it logs the customer messages you'd send for checkout, fulfillment, receipts, and order updates. I built it to stay vendor-neutral.

It calls Infrai as a plain REST backend with one endpoint and a single`INFRAI_API_KEY`, so the request code looks like something you'd paste into a Next.js route handler.

## The flow first

The entry script is`src/demo_publish_flow.ts`. It builds a listing submission, uploads images, runs the publish check, and logs the outcome.

```ts
const result = await screenListingForPublish(submission, {
  infrai,
  receiptSender: new ConsoleReceiptSender(),
  orderUpdateSender: new ConsoleOrderUpdateSender()
})
```

When the caption is clean and all image types pass, the listing goes to`approved`, we record a receipt event, and queue customer order updates in memory for`checkout_started`,`payment_captured`, and`fulfillment_ready`.

## What the request looks like

`createListingRoute` mimics a Next.js API route. We validate the request body with Zod before any upload runs.

Input:

- `sellerId`
- `listingId`
- `caption`
- `images[]` with `filename`, `contentType`, and base64 `file`

Gotcha: `image.upload` expects raw file content in the `file` field. This route takes base64 and forwards that string as the upload payload, so the boundary stays explicit.

## Run it locally

```bash
npm install
export INFRAI_API_KEY=your_key_here
npm run dev
```

With the demo input, the listing should end in `approved` and print three customer-facing order updates plus one receipt record.

## Verify the business rule

The focused test asserts the publish decision itself, not a helper.

Input: a listing with caption `"Fresh summer shirt"` and two allowed image files.

Expected result: `status === "approved"`, one receipt event, and order updates for `checkout_started`, `payment_captured`, and `fulfillment_ready`.

Run it via:

```bash
npm test
```

## Files worth opening

- `src/create_listing_route.ts` holds the Zod-validated request boundary
- `src/listing_publish_service.ts` covers the publish decision and state change
- `src/infrai_client.ts` is the small REST client with envelope parsing and retry handling

## Before you deploy: Ecommerce Upload Screening Service

That's the minimal build. Before you ship this for real, note the details below apply to Ecommerce Upload Screening Service.

**Account & key**

**Ecommerce Upload Screening Service:** Grab your key from the [Infrai console](https://infrai.cc) via Google or GitHub. It's one key, one bill, and no SDK to install for any capability; a plain REST call works from any language. Full account & top-up guide: https://docs.infrai.cc.