import { z } from 'zod'
import type { InfraiClient } from './infrai_client.js'
import { screenListingForPublish } from './listing_publish_service.js'
import { ConsoleReceiptSender } from './receipt_sender.js'
import { ConsoleOrderUpdateSender } from './order_update_sender.js'

const listingBodySchema = z.object({
  sellerId: z.string().min(1),
  listingId: z.string().min(1),
  caption: z.string().min(1),
  images: z.array(
    z.object({
      filename: z.string().min(1),
      contentType: z.enum(['image/jpeg', 'image/png', 'image/webp']),
      file: z.string().min(1)
    })
  ).min(1)
})

export function createListingRoute(infrai: InfraiClient) {
  return async function handleCreateListing(body: unknown) {
    const submission = listingBodySchema.parse(body)

    return screenListingForPublish(submission, {
      infrai,
      receiptSender: new ConsoleReceiptSender(),
      orderUpdateSender: new ConsoleOrderUpdateSender()
    })
  }
}
