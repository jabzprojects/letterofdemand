import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

function deadlineDate(days: number) {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })
}

function conseqText(c: string) {
  if (c === 'tribunal') return 'lodge a formal application with the relevant tribunal seeking orders against you including for the full amount of my claim and costs'
  if (c === 'court') return 'commence legal proceedings against you in a court of competent jurisdiction without further notice and will seek judgment for the full amount of my claim together with interest and costs'
  if (c === 'regulator') return 'lodge a formal complaint with the relevant regulator or ombudsman and pursue all remedies available to me under that process'
  return 'pursue all legal remedies available to me including commencing formal proceedings without further notice to you'
}

function disputeContext(t: string) {
  if (t === 'debt') return 'an unpaid debt'
  if (t === 'goods') return 'faulty goods supplied to me'
  if (t === 'services') return 'unsatisfactory services rendered'
  if (t === 'building') return 'defective building and renovation work'
  if (t === 'property') return 'damage caused to my property'
  if (t === 'rent') return 'an unpaid rent and bond dispute'
  return 'a dispute arising from our dealings'
}

export async function POST(req: NextRequest) {
  try {
    const d = await req.json()
    const deadline = parseInt(d.deadline || '14')
    const deadlineD = deadlineDate(deadline)
    const dt = d.demandType
    const amt = d.amountClaimed ? '$' + parseFloat(d.amountClaimed).toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : ''
    const salutation = d.recipientType === 'individual' ? 'Dear ' + d.recipientName : 'Dear Sir / Madam'
    const recipDesc = d.recipientType === 'individual' ? d.recipientName : 'the business or company known as ' + d.recipientName

    let demandInstructions = ''
    if (dt === 'money') {
      demandInstructions = 'The sender is claiming payment of ' + amt + '. This amount must be received by ' + deadlineD + ' being ' + String(deadline) + ' days from the date of this letter. The breakdown of this amount is ' + (d.amountBreakdown || 'not specified') + '.'
    } else if (dt === 'action') {
      demandInstructions = 'The sender requires the following action to be completed by ' + deadlineD + ' being ' + String(deadline) + ' days from the date of this letter. The required action is ' + (d.actionDemand || 'not specified') + '.'
    } else {
      demandInstructions = 'The sender requires both payment of ' + amt + ' and completion of the following action, both by ' + deadlineD + ' being ' + String(deadline) + ' days from the date of this letter. The breakdown of the amount is ' + (d.amountBreakdown || 'not specified') + '. The required action is ' + (d.actionDemand || 'not specified') + '.'
    }

    let paymentBlock = ''
    if ((dt === 'money' || dt === 'both') && d.bsb) {
      paymentBlock = 'Payment bank details to include in the letter are as follows. Bank is ' + (d.bankName || '') + ', account name is ' + (d.accountName || d.senderName || '') + ', BSB is ' + d.bsb + ' and account number is ' + (d.accountNumber || '') + '.'
    }

    const evidenceNote = d.hasEvidence === 'yes' ? 'State assertively that the sender holds supporting documents including receipts invoices and quotes and is prepared to produce them in any proceedings.' : ''
    const priorNote = d.priorContact === 'yes' && d.priorContactDetail ? 'Prior contact: ' + d.priorContactDetail : ''

    const prompt = 'You are drafting a formal letter of demand on behalf of ' + d.senderName + ' addressed to ' + recipDesc + '. The dispute concerns ' + disputeContext(d.disputeType) + '.\n\n' +
      'Write the complete letter body only, starting from the salutation and ending with the sign-off. Do not include any address block or date.\n\n' +
      'Use this exact structure with section headings in capitals on their own line.\n\n' +
      'Salutation: ' + salutation + '\n\n' +
      'Opening sentence: One firm sentence that puts the recipient on notice and states the subject of the letter without announcing it blandly.\n\n' +
      'Section heading BACKGROUND\n\n' +
      'Two paragraphs under this heading. Paragraph one describes the agreement or arrangement in flowing prose. Paragraph two describes what went wrong and builds directly on paragraph one. If prior contact was made and ignored weave this into paragraph two assertively. If the information is vague or insufficient insert a placeholder in square brackets such as [[insert further detail about the agreement]] so the sender knows what to add.\n\n' +
      'Section heading FORMAL DEMAND\n\n' +
      'Write the demand in firm assertive prose. ' + demandInstructions + ' ' + paymentBlock + ' ' + evidenceNote + '\n\n' +
      'Section heading CONSEQUENCES OF NON-COMPLIANCE\n\n' +
      'One firm paragraph. If the demand is not met in full by ' + deadlineD + ' the sender will ' + conseqText(d.consequence) + '. The sender will also seek to recover all legal costs and expenses incurred as a result of the failure to comply. State that silence or inaction will be treated as a refusal to comply. End with a sentence reserving all rights.\n\n' +
      'Sign-off: Yours faithfully followed by four blank lines then ' + d.senderName + '.\n\n' +
      'Raw information from the sender:\n\n' +
      'Agreement: ' + d.agreement + '\n\n' +
      'What went wrong: ' + d.whatWentWrong + '\n\n' +
      priorNote + '\n\n' +
      'Writing rules to follow without exception. Write in Australian English. Do not use em dashes or hyphens anywhere. Do not use Oxford commas. Do not follow a colon with a requirement or list, instead reword into a full emphatic sentence. Write in plain English with a firm assertive tone. Every sentence must flow naturally. No dot points or numbered lists anywhere in the letter body.'

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1500,
      system: 'You are a plain English legal letter drafting assistant. You write assertive formal letters of demand for members of the public in Australian English. You never use em dashes, hyphens, Oxford commas or colons followed immediately by a list or requirement. You always write in full flowing sentences. You never use dot points or numbered lists in a letter body.',
      messages: [{ role: 'user', content: prompt }],
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : ''
    return NextResponse.json({ letter: text })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('API error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
