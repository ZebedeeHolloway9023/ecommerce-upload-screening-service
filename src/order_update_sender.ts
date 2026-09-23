export type OrderEvent = 'checkout_started' | 'payment_captured' | 'fulfillment_ready'

export type OrderUpdateRecord = {
  orderId: string
  event: OrderEvent
  message: string
}

export class ConsoleOrderUpdateSender {
  sent: OrderUpdateRecord[] = []

  async send(record: OrderUpdateRecord) {
    this.sent.push(record)
    console.log(`[order-update] ${record.orderId} ${record.event}: ${record.message}`)
  }
}
