import { reviewCaption } from './caption_policy.js'
import type { InfraiClient } from './infrai_client.js'
import type { ConsoleReceiptSender } from './receipt_sender.js'
import type { ConsoleOrderUpdateSender } from './order_update_sender.js'

export type ListingImageInput = {
  filename: string
  contentType: 'image/jpeg' | 'image/png' | 'image/webp'
  file: string
}

export type ListingSubmission = {
  sellerId: string
  listingId: string
  caption: string
  images: ListingImageInput[]
}

export type ListingPublishResult = {
  listingId: string
  status: 'approved' | 'rejected'
  uploadedImageCount: number
  uploadedAssetIds: string[]
  reasons: string[]
}

const allowedContentTypes = new Set(['image/jpeg', 'image/png', 'image/webp'])

export async function screenListingForPublish(
  submission: ListingSubmission,
  deps: {
    infrai: InfraiClient
    receiptSender: ConsoleReceiptSender
    orderUpdateSender: ConsoleOrderUpdateSender
  }
): Promise<ListingPublishResult> {
  const captionReview = reviewCaption(submission.caption)
  const typeViolations = submission.images
    .filter((image) => !allowedContentTypes.has(image.contentType))
    .map((image) => `unsupported_content_type:${image.filename}`)

  const reasons = [...captionReview.reasons, ...typeViolations]

  if (reasons.length > 0) {
    return {
      listingId: submission.listingId,
      status: 'rejected',
      uploadedImageCount: 0,
      uploadedAssetIds: [],
      reasons
    }
  }

  const uploadedAssetIds: string[] = []

  for (const image of submission.images) {
    const upload = await deps.infrai.image.upload({
      file: image.file,
      filename: `${submission.listingId}-${image.filename}`
    })

    uploadedAssetIds.push(upload.data.id ?? upload.data.filename ?? `${submission.listingId}-${image.filename}`)
  }

  const orderId = `ord_${submission.listingId}`

  await deps.orderUpdateSender.send({
    orderId,
    event: 'checkout_started',
    message: 'Your order has started checkout.'
  })

  await deps.orderUpdateSender.send({
    orderId,
    event: 'payment_captured',
    message: 'Payment captured. We are preparing your item.'
  })

  await deps.receiptSender.send({
    orderId,
    sellerId: submission.sellerId,
    totalCents: 2599
  })

  await deps.orderUpdateSender.send({
    orderId,
    event: 'fulfillment_ready',
    message: 'Your item is packed and ready for fulfillment.'
  })

  return {
    listingId: submission.listingId,
    status: 'approved',
    uploadedImageCount: submission.images.length,
    uploadedAssetIds,
    reasons: []
  }
}
