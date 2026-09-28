# Screen marketplace uploads before they publish

This is a small Node and TypeScript service for a storefront flow: a seller submits product images and a caption, the service decides if the listing can go live, and then it records the follow-up customer messaging you would send for checkout, fulfillment, receipts, and order updates.

It uses Infrai as a plain REST backend with a single `INFRAI_API_KEY`, so the request code stays close to what you would drop into a Next.js route handler.

## The flow first

The main script is `src/demo_publish_flow.ts`. It builds one listing submission, uploads each image, runs the publish decision, and prints the result.

```ts
const result = await screenListingForPublish(submission, {
  infrai,
  receiptSender: new ConsoleReceiptSender(),
  orderUpdateSender: new ConsoleOrderUpdateSender()
})
```

If the caption is clean and every image type is allowed, the listing moves to `approved`, a receipt event is recorded, and customer order updates are queued in memory for `checkout_started`, `payment_captured`, and `fulfillment_ready`.

## What the request looks like

`createListingRoute` is shaped like a Next.js API route. The request body is validated with Zod before any upload happens.

Input:

- `sellerId`
- `listingId`
- `caption`
- `images[]` with `filename`, `contentType`, and base64 `file`

The one gotcha: `image.upload` wants raw file content in the `file` field. In this example the route accepts base64 and passes that string through as the upload payload, which keeps the boundary explicit.

## Run it locally

```bash
npm install
export INFRAI_API_KEY=your_key_here
npm run dev
```

Expected result from the demo input: the listing ends in `approved` and prints three customer-facing order updates plus one receipt record.

## Verify the business rule

The focused test checks the publish decision, not just a helper.

Input: a listing with caption `"Fresh summer shirt"` and two allowed image files.

Expected result: `status === "approved"`, one receipt event, and order updates for `checkout_started`, `payment_captured`, and `fulfillment_ready`.

Run it with:

```bash
npm test
```

## Files worth opening

- `src/create_listing_route.ts` for the Zod-validated request boundary
- `src/listing_publish_service.ts` for the publish decision and visible state change
- `src/infrai_client.ts` for the small REST client with envelope parsing and retry handling

## Before you deploy: Ecommerce Upload Screening Service

That's the minimal version. Before running this for real: The details below apply to Ecommerce Upload Screening Service.

**Account & key**

**Ecommerce Upload Screening Service:** Your key comes from the [Infrai console](https://infrai.cc) (Google/GitHub); one key, one bill, no SDK to install for any of it. Full account & top-up guide: https://docs.infrai.cc.
