import { createInfraiClient } from './infrai_client.js'
import { screenListingForPublish } from './listing_publish_service.js'
import { ConsoleReceiptSender } from './receipt_sender.js'
import { ConsoleOrderUpdateSender } from './order_update_sender.js'

const infrai = createInfraiClient()
const samplePng = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/lXcAAAAASUVORK5CYII='

const submission = {
  sellerId: 'seller_42',
  listingId: 'listing_1001',
  caption: 'Fresh summer shirt',
  images: [
    {
      filename: 'front.png',
      contentType: 'image/png' as const,
      file: samplePng
    },
    {
      filename: 'detail.png',
      contentType: 'image/png' as const,
      file: samplePng
    }
  ]
}

const receiptSender = new ConsoleReceiptSender()
const orderUpdateSender = new ConsoleOrderUpdateSender()

const result = await screenListingForPublish(submission, {
  infrai,
  receiptSender,
  orderUpdateSender
})

console.log(JSON.stringify({ result, receipts: receiptSender.sent, updates: orderUpdateSender.sent }, null, 2))
