import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

function today() {
  return new Date().toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })
}

function deadlineDate(days: number) {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })
}

function conseqText(consequence: string) {
  if (consequence === 'tribunal') return 'lodge a formal application with the relevant tribunal seeking orders against you including for the full amount of my claim and costs'
  if (consequence === 'court') return 'commence legal proceedings against you in a court of competent jurisdiction without further notice and will seek judgment for the full amount of my claim together with interest and costs'
  if (consequence === 'regulator') return 'lodge a formal complaint with the relevant regulator or ombudsman and pursue all remedies available to me under that process'
  return 'pursue all legal remedies available to me including commencing formal proceedings without further notice to you'
}

function disputeContext(disputeType: string) {
  if (disputeType === 'debt') return 'an unpaid debt'
  if (disputeType === 'goods') return 'faulty goods supplied to me'
  if (disputeType === 'services') return 'unsatisfactory services rendered'
  if (disputeType === 'building') return 'defective building and renovation work'
  if (disputeType === 'property') return 'damage caused to my property'
  if (disputeType === 'rent') return 'an unpaid rent and bond dispute'
  return 'a dispute arising from our dealings'
}

export async function POST(req: NextRequest) {
  try {
    const d = await req.json()

    const deadline = parseInt(d.deadline || '14')
    const deadlineD = deadlineDate(deadline)
    const dt = d.demandType
    const amt = d.amountClaimed
      ? '$' + parseFloat(d.amountClaimed).toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      : ''

    let paymentBlock = ''
    if ((dt === 'money' || dt === 'both') && d.bsb) {
      paymentBlock = `Payment bank details to include in the letter are as follows. Bank is ${d.bankName || ''}, account name is ${d.accountName || d.senderName || ''}, BSB is ${d.bsb} and account number is ${d.accountNumber || ''}.`
    }

    const salutation = d.recipientType === 'individual' ? `Dear ${d.recipientName}` : 'Dear Sir / Madam'

    const demandInstructions =
      dt === 'money'
        ? `The sender is claiming payment of ${amt}. This amount must be received by ${deadlineD} being ${deadline} days from the date of this letter. The breakdown of this amount is ${d.amountBreakdown || 'not specified'}.`
        : dt === 'action'
        ? `The sender requires the following action to be completed by ${deadlineD} being ${deadline} days from the date of this letter. The required action is ${d.actionDemand || 'not specified'}.`
        : `The sender requires both payment of ${amt} and completion of the following action, both by ${deadlineD} being ${deadline} days from the date of this letter. The breakdown of the amo
