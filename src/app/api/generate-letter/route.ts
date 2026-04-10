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

const SYSTEM = 'You are drafting a formal letter of demand written directly by the sender in their own name with no legal representation involved. Write in first person throughout using "I" and "me" not "my client". Write in Australian English. Never use em dashes or hyphens. Never use Oxford commas meaning no comma before "and", "but" or "or" in a list. Never use a colon followed immediately by a list or requirement, instead reword into a full emphatic sentence. Write in plain English with a firm assertive tone. Every sentence must flow naturally. No dot points or numbered lists anywhere in the letter body.'

function buildPrompt(d: Record<string, string>, fromFile: boolean) {
  const deadline = parseInt(d.deadline || '14')
  const deadlineD = deadlineDate(deadline)
  const dt = (d.demandType || d.demand_type || '').toLowerCase()
  const amt = d.amountClaimed ? '$' + parseFloat(d.amountClaimed).toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : ''
  const salutation = (d.recipientType || '').toLowerCase() === 'individual' ? 'Dear ' + d.recipientName : 'Dear Sir or Madam'
  const recipDesc = (d.recipientType || '').toLowerCase() === 'individual' ? d.recipientName : 'the business or company known as ' + d.recipientName

  let demandInstructions = ''
  if (dt === 'money') {
    demandInstructions = 'I am claiming payment of ' + amt + '. This amount must be received by ' + deadlineD + ' being ' + String(deadline) + ' days from the date of this letter. The breakdown of this amount is ' + (d.amountBreakdown || 'as described above') + '.'
  } else if (dt === 'action') {
    demandInstructions = 'I require the following action to be completed by ' + deadlineD + ' being ' + String(deadline) + ' days from the date of this letter. The required action is ' + (d.actionDemand || 'as described above') + '.'
  } else {
    demandInstructions = 'I require both payment of ' + amt + ' and completion of the following action, both by ' + deadlineD + ' being ' + String(deadline) + ' days from the date of this letter. The breakdown of the amount is ' + (d.amountBreakdown || 'as described above') + '. The required action is ' + (d.actionDemand || 'as described above') + '.'
  }

  let paymentBlock = ''
  if ((dt === 'money' || dt === 'both') && d.bsb) {
    paymentBlock = 'Payment is to be made by direct bank transfer to ' + (d.bankName || 'my bank') + ', account name ' + (d.accountName || d.senderName || '') + ', BSB ' + d.bsb + ' and account number ' + (d.accountNumber || '') + '.'
  }

  const evidenceNote = (d.hasEvidence || '').toLowerCase() === 'yes' ? 'I hold supporting documentation including receipts invoices and quotes and am fully prepared to produce each of those documents in any proceedings that may follow.' : ''
  const priorNote = (d.priorContact || '').toLowerCase() === 'yes' && d.priorContactDetail ? 'Prior contact details: ' + d.priorContactDetail : ''

  const rawInfo = fromFile
    ? 'The following is the completed information template uploaded by the user. Extract all relevant details from it:\n\n' + d.rawFile
    : 'Agreement: ' + d.agreement + '\n\nWhat went wrong: ' + d.whatWentWrong + '\n\n' + priorNote

  return 'Draft a formal letter of demand written by ' + d.senderName + ' addressed to ' + recipDesc + '. The dispute concerns ' + disputeContext(d.disputeType || dt) + '. The letter is written by the sender personally with no solicitor or legal representative involved.\n\n' +
    'Write the complete letter body only starting from the salutation and ending with the sign-off. Do not include any address block or date.\n\n' +
    'Use this exact structure with section headings in capitals on their own line.\n\n' +
    'Salutation: ' + salutation + '\n\n' +
    'Opening sentence: One firm sentence written in first person that puts the recipient on notice and states the subject of the letter without announcing it blandly.\n\n' +
    'Section heading BACKGROUND\n\n' +
    'Two paragraphs written in first person. Paragraph one describes the agreement or arrangement in flowing prose. Paragraph two describes what went wrong and builds directly on paragraph one. If prior contact was made and ignored weave this into paragraph two assertively. If the information is vague or insufficient insert a placeholder such as [[insert further detail about the agreement]] so the sender knows what to add.\n\n' +
    'Section heading FORMAL DEMAND\n\n' +
    'Write the demand in firm assertive first person prose. ' + demandInstructions + ' ' + paymentBlock + ' ' + evidenceNote + '\n\n' +
    'Section heading CONSEQUENCES OF NON-COMPLIANCE\n\n' +
    'One firm paragraph in first person. If the demand is not met in full by ' + deadlineD + ' I will ' + conseqText(d.consequence || d.consequence_text || 'unsure') + '. I will also seek to recover all legal costs and expenses incurred as a result of your failure to comply. State that silence or inaction will be treated as a refusal to comply. End with a sentence reserving all rights.\n\n' +
    'Sign-off: Yours faithfully followed by four blank lines then ' + d.senderName + '.\n\n' +
    'Raw information from the sender:\n\n' + rawInfo + '\n\n' +
    'Writing rules to follow without exception. Write in Australian English. Use "honour" not "honor", "organisation" not "organization" and similar Australian spellings throughout. Do not use em dashes or hyphens anywhere. Do not use Oxford commas. Do not follow a colon with a requirement or list, instead reword into a full emphatic sentence. Write in plain English with a firm assertive tone. Every sentence must flow naturally. No dot points or numbered lists anywhere in the letter body. Write entirely in first person as the sender themselves.'
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
