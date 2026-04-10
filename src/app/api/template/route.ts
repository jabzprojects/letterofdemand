import { NextResponse } from 'next/server'

const TEMPLATE = `LETTER OF DEMAND - INFORMATION TEMPLATE
Fill in each field below. Leave any field blank if it does not apply to your situation.
Do not change the field labels. Save the file and upload it when prompted.

========================================
YOUR DETAILS
========================================

Full name:

Street address:

Email:

Phone (optional):

========================================
THEIR DETAILS
========================================

Full name or business name:

Their address or email:

Are they an individual or a business (write: individual / business / not sure):

========================================
THE DISPUTE
========================================

What is this dispute about (write one: unpaid debt / faulty goods / bad services / building work / property damage / unpaid rent / other):

When did the agreement or relationship begin (approximate month and year is fine):

========================================
WHAT HAPPENED
========================================

What was agreed between you (be as specific as you can including any amounts timeframes or key terms):

What went wrong (describe what they did or failed to do, include dates where possible):

Have you already contacted them about this (write: yes / no):

If yes, what happened when you raised it:

========================================
WHAT YOU WANT
========================================

Are you seeking money, action or both (write: money / action / both):

If claiming money - total amount claimed in dollars (numbers only e.g. 5000):

If claiming money - how is this amount made up (e.g. unpaid invoice for $4500 and repair costs of $500):

If seeking action - what specifically do you want them to do:

Do you have supporting documents such as receipts invoices or quotes (write: yes / no):

========================================
THE DEADLINE
========================================

How many days are you giving them to respond (write: 7 / 14 / 21 / 28):

If they ignore this letter what will you do (write one: tribunal / court / regulator / unsure):

========================================
PAYMENT DETAILS (complete only if claiming money)
========================================

Bank name:

BSB:

Account number:

Account name:

========================================
END OF TEMPLATE
========================================
`

export async function GET() {
  return new NextResponse(TEMPLATE, {
    headers: {
      'Content-Type': 'text/plain',
      'Content-Disposition': 'attachment; filename="letter-of-demand-template.txt"',
    },
  })
}
