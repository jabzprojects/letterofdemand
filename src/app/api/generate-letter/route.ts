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
  if (c === 'court') return 'commence legal proceedings against you in a court of competent jurisdiction without further notice and seek judgment for the full amount of my claim together with interest and costs'
  if (c === 'regulator') return 'lodge a formal complaint with the relevant regulator or ombudsman and pursue all remedies available to me under that process'
  return 'pursue all legal remedies available to me including commencing formal proceedings without further notice to you'
}

function disputeContext(t: string) {
  if (t === 'debt' || t === 'unpaid debt') return 'an unpaid debt'
  if (t === 'goods' || t === 'faulty goods') return 'faulty goods supplied to me'
  if (t === 'services' || t === 'bad services') return 'unsatisfactory services'
  if (t === 'building' || t === 'building work') return 'defective building and renovation work'
  if (t === 'property' || t === 'property damage') return 'damage caused to my property'
  if (t === 'rent' || t === 'unpaid rent') return 'an unpaid rent and bond dispute'
  return 'a dispute arising from our dealings'
}

const SYSTEM = 'You are drafting a formal letter of demand written directly by the sender in their own name with no legal representation involved. Write in first person throughout using "I" and "me" not "my client". Write in Australian English. Never use em dashes or hyphens. Never use Oxford commas meaning no comma before "and", "but" or "or" in a list. Write in plain English with a firm assertive tone. Every sentence must flow naturally. No section headings anywhere in the letter. No dot points except where bank account details are listed.'

function buildPrompt(d: Record<string, string>, fromFile: boolean) {
  const deadline = parseInt(d.deadline || '14')
  const deadlineD = deadlineDate(deadline)
  const dt = (d.demandType || d.demand_type || '').toLowerCase()
  const amt = d.amountClaimed ? '$' + parseFloat(d.amountClaimed).toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : ''
  const salutation = (d.recipientType || '').toLowerCase() === 'individual' ? 'Dear ' + d.recipientName : 'Dear Sir or Madam'
  const recipDesc = (d.recipientType || '').toLowerCase() === 'individual' ? d.recipientName : 'the business or company known as ' + d.recipientName

  let demandAmount = ''
  if (dt === 'money' || dt === 'both') {
    demandAmount = 'I require full payment of ' + amt + (d.amountBreakdown ? ' comprising ' + d.amountBreakdown : '') + ' and I require that payment to be made by ' + deadlineD + ' being ' + String(deadline) + ' days from the date of this letter.'
  }

  let demandAction = ''
  if (dt === 'action' || dt === 'both') {
    demandAction = 'I require the following action to be completed by ' + deadlineD + ' being ' + String(deadline) + ' days from the date of this letter: ' + (d.actionDemand || '')
  }

  let paymentBlock = ''
  if ((dt === 'money' || dt === 'both') && d.bsb) {
    paymentBlock = 'Payment must be made by direct bank transfer to my account held with ' + (d.bankName || 'my bank') + '. The account details are as follows:\n- Name: ' + (d.accountName || d.senderName || '') + '\n- BSB: ' + d.bsb + '\n- Account number: ' + (d.accountNumber || '')
  }

  const evidenceNote = (d.hasEvidence || '').toLowerCase() === 'yes' ? 'I have supporting documents evidencing both the agreement and the amounts outstanding and I am fully prepared to rely on them in any proceedings.' : ''
  const priorNote = (d.priorContact || '').toLowerCase() === 'yes' && d.priorContactDetail ? 'Prior contact details: ' + d.priorContactDetail : ''

  const rawInfo = fromFile
    ? 'The following is the completed information template uploaded by the user. Extract all relevant details from it:\n\n' + d.rawFile
    : 'Agreement: ' + d.agreement + '\n\nWhat went wrong: ' + d.whatWentWrong + '\n\n' + priorNote

  return 'Draft a formal letter of demand written by ' + d.senderName + ' addressed to ' + recipDesc + '. The dispute concerns ' + disputeContext(d.disputeType || dt) + '. The letter is written by the sender personally with no solicitor or legal representative involved.\n\n' +
    'Write the complete letter body only starting from the salutation and ending with the sign-off. Do not include any address block or date. Do not use any section headings anywhere in the letter.\n\n' +
    'The letter must follow this exact paragraph structure. Each item below is a separate paragraph separated by a blank line.\n\n' +
    'Paragraph 1: Salutation line only: ' + salutation + '\n\n' +
    'Paragraph 2: One firm opening sentence in first person that puts the recipient on immediate notice of the subject of the letter without announcing it blandly.\n\n' +
    'Paragraph 3: Describes the agreement or arrangement in flowing first person prose. Draw from the raw information provided.\n\n' +
    'Paragraph 4: Describes what went wrong and builds directly on paragraph 3. If prior contact was made and ignored weave this in assertively at the end of this paragraph. If the information is vague or insufficient insert a placeholder such as [[insert further detail]] so the sender knows what to add.\n\n' +
    'Paragraph 5: ' + (demandAmount || demandAction) + '\n\n' +
    (paymentBlock ? 'Paragraph 6: ' + paymentBlock + '\n\n' : '') +
    (evidenceNote ? 'Paragraph ' + (paymentBlock ? '7' : '6') + ': ' + evidenceNote + '\n\n' : '') +
    'Second to last paragraph: States that if the demand is not met in full by ' + deadlineD + ' I will ' + conseqText(d.consequence || 'unsure') + '. I will also seek to recover all legal costs and expenses incurred as a result of your failure to comply with this demand.\n\n' +
    'Second to last paragraph continued: Any silence or inaction on your part from this point forward will be treated as an outright refusal to comply.\n\n' +
    'Last paragraph before sign-off: I expressly reserve all of my rights in this matter.\n\n' +
    'Sign-off: Yours faithfully followed by four blank lines then ' + d.senderName + '.\n\n' +
    'Raw information from the sender:\n\n' + rawInfo + '\n\n' +
    'Writing rules to follow without exception. Write in Australian English. Use "honour" not "honor" and similar Australian spellings throughout. Do not use em dashes or hyphens anywhere. Do not use Oxford commas. Write in plain English with a firm assertive tone. Every sentence must flow naturally. No section headings anywhere. The only dot points permitted are the three bank account detail lines (Name, BSB, Account number) in the payment paragraph. Write entirely in first person as the sender themselves.'
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const prompt = buildPrompt(body, body.fromFile === true)

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1500,
      system: SYSTEM,
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
