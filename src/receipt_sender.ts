export type ReceiptRecord = {
  orderId: string
  sellerId: string
  totalCents: number
}

export class ConsoleReceiptSender {
  sent: ReceiptRecord[] = []

  async send(record: ReceiptRecord) {
    this.sent.push(record)
    console.log(`[receipt] ${record.orderId} total=${record.totalCents}`)
  }
}
