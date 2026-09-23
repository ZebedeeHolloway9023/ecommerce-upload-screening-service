import { describe, expect, it } from 'vitest'
import { screenListingForPublish } from '../src/listing_publish_service.js'
import { ConsoleReceiptSender } from '../src/receipt_sender.js'
import { ConsoleOrderUpdateSender } from '../src/order_update_sender.js'

describe('screenListingForPublish', () => {
  it('approves a clean listing and records receipt plus customer updates', async () => {
    const infrai = {
      image: {
        upload: async ({ filename }: { file: string; filename?: string }) => ({
          data: { id: `asset:${filename}` },
          metadata: undefined
        })
      }
    }

    const receiptSender = new ConsoleReceiptSender()
    const orderUpdateSender = new ConsoleOrderUpdateSender()

    const result = await screenListingForPublish(
      {
        sellerId: 'seller_42',
        listingId: 'listing_1001',
        caption: 'Fresh summer shirt',
        images: [
          { filename: 'front.jpg', contentType: 'image/jpeg', file: 'front-base64' },
          { filename: 'detail.png', contentType: 'image/png', file: 'detail-base64' }
        ]
      },
      {
        infrai: infrai as never,
        receiptSender,
        orderUpdateSender
      }
    )

    expect(result.status).toBe('approved')
    expect(result.uploadedImageCount).toBe(2)
    expect(receiptSender.sent).toEqual([
      { orderId: 'ord_listing_1001', sellerId: 'seller_42', totalCents: 2599 }
    ])
    expect(orderUpdateSender.sent.map((item) => item.event)).toEqual([
      'checkout_started',
      'payment_captured',
      'fulfillment_ready'
    ])
  })
})
