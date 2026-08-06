export function buildTransbankBuyOrder(paymentId: string) {
  return `ITGO${paymentId.replaceAll('-', '').slice(0, 22)}`
}
