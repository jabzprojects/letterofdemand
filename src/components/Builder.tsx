'use client'

import { useState } from 'react'

interface FormData {
  senderName: string
  senderAddress: string
  senderEmail: string
  senderPhone: string
  recipientName: string
  recipientAddress: string
  recipientType: string
  disputeType: string
  startDate: string
  agreement: string
  whatWentWrong: string
  priorContact: string
  priorContactDetail: string
  demandType: string
  amountClaimed: string
  amountBreakdown: string
  actionDemand: string
  hasEvidence: string
  deadline: string
  consequence: string
  bankName: string
  bsb: string
  accountNumber: string
  accountName: string
}

const EMPTY: FormData = {
  senderName: '', senderAddress: '', senderEmail: '', senderPhone: '',
  recipientName: '', recipientAddress: '', recipientType: '',
  disputeType: '', startDate: '', agreement: '', whatWentWrong: '',
  priorContact: '', priorContactDetail: '', demandType: '',
  amountClaimed: '', amountBreakdown: '', actionDemand: '',
  hasEvidence: '', deadline: '', consequence: '',
  bankName: '', bsb: '', accountNumber: '', accountName: '',
}

const TOTAL_STEPS = 13

export default function Builder() {
  const [step, setStep] = useState(0)
  const [data, setData] = useState<FormData>({ ...EMPTY })
  const [letter, setLetter] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  function set(key: keyof FormData, val: string) {
    setData(prev => ({ ...prev, [key]: val }))
  }

  function progress() {
    return Math.round(((step + 1) / (TOTAL_STEPS + 2)) * 100)
  }

  function next() {
    if (step < TOTAL_STEPS) { setStep(s => s + 1) }
    else { generate() }
  }

  function back() {
    if (step > 0) setStep(s => s - 1)
  }

  function pickOption(key: keyof FormData, val: string) {
    setData(prev => ({ ...prev, [key]: val }))
    setTimeout(() => setStep(s => s + 1), 220)
  }

  function today() {
    return new Date().toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  function deadlineDate() {
    const days = parseInt(data.deadline || '14')
    const d = new Date()
    d.setDate(d.getDate() + days)
    return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  function buildHeader() {
    let sender = data.senderName
    if (data.senderAddress) sender += '\n' + data.senderAddress
    if (data.senderEmail) sender += '\n' + data.senderEmail
    if (data.senderPhone) sender += '\n' + data.senderPhone
    let recip = data.recipientName
    if (data.recipientAddress) recip += '\n' + data.recipientAddress
    return sender + '\n\n' + today() + '\n\n' + recip + '\n\n'
  }

  async function generate() {
    setLoading(true)
    setError('')
    setStep(TOTAL_STEPS + 1)
    try {
      const res = await fetch('/api/generate-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (json.error) { setError(json.error); setLoading(false); return }
      setLetter(buildHeader() + json.letter)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
    }
    setLoading(false)
  }

  async function copyLetter() {
    await navigator.clipboard.writeText(letter)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  function restart() {
    setStep(0)
    setData({ ...EMPTY })
    setLetter('')
    setError('')
  }

  const s = styles

  if (step === TOTAL_STEPS + 1) {
    return (
      <div style={s.page}>
        <div style={s.card}>
          <div style={s.progressBar}><div style={{ ...s.progressFill, width: '100%' }} /></div>
          {loading ? (
            <div style={s.centered}>
              <div style={s.spinner} />
              <p style={s.genMsg}>Drafting your letter...</p>
            </div>
          ) : error ? (
            <div>
              <p style={s.phase}>Error</p>
              <p style={s.question}>Something went wrong</p>
              <p style={{ ...s.hint, color: '#c00', marginBottom: '1.5rem' }}>{error}</p>
              <button style={s.nextBtn} onClick={restart}>Start over</button>
            </div>
          ) : (
            <div>
              <p style={s.phase}>Your letter</p>
              <p style={s.question}>Ready to review</p>
              <p style={s.hint}>Review the letter carefully. Any section marked with double square brackets needs your attention before sending.</p>
              <div style={s.summaryCard}>
                {[
                  ['Sender', data.senderName],
                  ['Recipient', data.recipientName],
                  ['Dispute', data.disputeType],
                  ['Deadline', `${data.deadline || '14'} days, by ${deadlineDate()}`],
                  ...(data.amountClaimed ? [['Amount claimed', '$' + parseFloat(data.amountClaimed).toLocaleString('en-AU', { minimumFractionDigits: 2 })]] : []),
                ].map(([k, v]) => (
                  <div key={k} style={s.summaryRow}>
                    <span style={s.summaryKey}>{k}</span>
                    <span style={s.summaryVal}>{v}</span>
                  </div>
                ))}
              </div>
              <pre style={s.letterBox}>{letter}</pre>
              <div style={s.actions}>
                <button style={s.copyBtn} onClick={copyLetter}>{copied ? 'Copied!' : 'Copy letter text'}</button>
                <button style={s.restartBtn} onClick={restart}>Start over</button>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  const needsPayment = data.demandType === 'money' || data.demandType === 'both'

  const steps: React.ReactNode[] = [
    <Step key={0} phase="About you" question="What is your full name?" hint="This appears as the sender on the letter.">
      <Field label="Full name" value={data.senderName} onChange={v => set('senderName', v)} placeholder="e.g. Sarah Johnson" />
    </Step>,
    <Step key={1} phase="About you" question="What is your address and contact details?" hint="Used in the letter header.">
      <Field label="Street address" value={data.senderAddress} onChange={v => set('senderAddress', v)} placeholder="e.g. 12 Smith Street Sydney NSW 2000" />
      <div style={s.grid2}>
        <Field label="Email" value={data.senderEmail} onChange={v => set('senderEmail', v)} placeholder="e.g. sarah@email.com" />
        <Field label="Phone (optional)" value={data.senderPhone} onChange={v => set('senderPhone', v)} placeholder="e.g. 0400 000 000" />
      </div>
    </Step>,
    <Step key={2} phase="The other party" question="Who are you writing to?" hint="Use the full legal name of the person or company.">
      <Field label="Their full name or business name" value={data.recipientName} onChange={v => set('recipientName', v)} placeholder="e.g. ABC Plumbing Pty Ltd" />
      <Field label="Their address or email" value={data.recipientAddress} onChange={v => set('recipientAddress', v)} placeholder="e.g. 50 Builder Lane Melbourne VIC 3000" />
    </Step>,
    <Step key={3} phase="The other party" question="Are they an individual or a business?">
      <Options keyName="recipientType" value={data.recipientType} onPick={pickOption} options={[
        { v: 'individual', l: 'An individual person' },
        { v: 'business', l: 'A business or company' },
        { v: 'unsure', l: 'Not sure' },
      ]} />
    </Step>,
    <Step key={4} phase="The dispute" question="What is this dispute about?" hint="Choose the closest match.">
      <Options keyName="disputeType" value={data.disputeType} onPick={pickOption} options={[
        { v: 'debt', l: 'Money owed to me (unpaid invoice or loan)' },
        { v: 'goods', l: 'Faulty goods or products' },
        { v: 'services', l: 'Unsatisfactory services or work done' },
        { v: 'building', l: 'Building or renovation work gone wrong' },
        { v: 'property', l: 'Damage to my property' },
        { v: 'rent', l: 'Unpaid rent or bond dispute' },
        { v: 'other', l: 'Something else' },
      ]} />
    </Step>,
    <Step key={5} phase="What happened" question="When did the agreement or relationship begin?" hint="An approximate month and year is fine.">
      <Field label="Date or period" value={data.startDate} onChange={v => set('startDate', v)} placeholder="e.g. March 2023 or about mid 2022" />
    </Step>,
    <Step key={6} phase="What happened" question="What was agreed between you?" hint="Describe what they were supposed to do, pay or provide. Be as specific as you can including any amounts, timeframes or key terms.">
      <TextArea value={data.agreement} onChange={v => set('agreement', v)} placeholder="e.g. They agreed to renovate my kitchen for $15,000 and complete the work by June 2023." />
    </Step>,
    <Step key={7} phase="What happened" question="What went wrong?" hint="Describe what they did or failed to do. Include dates where you can.">
      <TextArea value={data.whatWentWrong} onChange={v => set('whatWentWrong', v)} placeholder="e.g. The contractor stopped attending site in July 2023 and has not returned calls or emails since." />
    </Step>,
    <Step key={8} phase="What happened" question="Have you already raised this with them?">
      <YesNo keyName="priorContact" value={data.priorContact} onChange={v => set('priorContact', v)}
        yesLabel="Yes I have contacted them" noLabel="No this is first contact" />
      {data.priorContact === 'yes' && (
        <TextArea label="What happened when you raised it?" value={data.priorContactDetail} onChange={v => set('priorContactDetail', v)}
          placeholder="e.g. I emailed them on 1 August 2023. They promised to fix it but nothing has happened since." />
      )}
    </Step>,
    <Step key={9} phase="What you want" question="What outcome are you seeking?">
      <Options keyName="demandType" value={data.demandType} onPick={pickOption} options={[
        { v: 'money', l: 'Payment of a sum of money' },
        { v: 'action', l: 'I want them to fix replace or do something' },
        { v: 'both', l: 'Both money and action' },
      ]} />
    </Step>,
    <Step key={10} phase="What you want" question="Details of your demand">
      {needsPayment && <>
        <Field label="Total amount claimed ($)" value={data.amountClaimed} onChange={v => set('amountClaimed', v)} placeholder="e.g. 5000" type="number" />
        <TextArea label="How is this amount made up?" value={data.amountBreakdown} onChange={v => set('amountBreakdown', v)}
          placeholder="e.g. Unpaid invoice 001 for $4,500 and out of pocket repair costs of $500." />
      </>}
      {(data.demandType === 'action' || data.demandType === 'both') && (
        <TextArea label="What specifically do you want them to do?" value={data.actionDemand} onChange={v => set('actionDemand', v)}
          placeholder="e.g. Return and complete the kitchen renovation to the agreed standard including tiling and installation of the rangehood." />
      )}
      <YesNo keyName="hasEvidence" value={data.hasEvidence} onChange={v => set('hasEvidence', v)}
        label="Do you have supporting documents such as receipts invoices or quotes?"
        yesLabel="Yes" noLabel="No" />
    </Step>,
    <Step key={11} phase="The deadline" question="How many days are you giving them to respond?" hint="14 days is standard for most disputes.">
      <Options keyName="deadline" value={data.deadline} onPick={pickOption} options={[
        { v: '7', l: '7 days (urgent matter)' },
        { v: '14', l: '14 days (recommended)' },
        { v: '21', l: '21 days' },
        { v: '28', l: '28 days' },
      ]} />
    </Step>,
    <Step key={12} phase="The deadline" question="If they ignore this letter what will you do?" hint="Be honest as this makes the letter more credible.">
      <Options keyName="consequence" value={data.consequence} onPick={pickOption} options={[
        { v: 'tribunal', l: 'Lodge an application with a tribunal such as NCAT VCAT or Fair Trading' },
        { v: 'court', l: 'Commence court proceedings' },
        { v: 'regulator', l: 'Complain to a regulator or ombudsman' },
        { v: 'unsure', l: 'Consider all available options' },
      ]} />
    </Step>,
    <Step key={13} phase="Payment details"
      question="How should payment be made to you?"
      hint={needsPayment ? 'Providing your bank details makes it easier for them to comply immediately.' : 'As you are not claiming money you can skip this step and generate your letter.'}>
      {needsPayment && <>
        <Field label="Bank name" value={data.bankName} onChange={v => set('bankName', v)} placeholder="e.g. Commonwealth Bank" />
        <div style={s.grid2}>
          <Field label="BSB" value={data.bsb} onChange={v => set('bsb', v)} placeholder="e.g. 062-204" />
          <Field label="Account number" value={data.accountNumber} onChange={v => set('accountNumber', v)} placeholder="e.g. 1234 5678" />
        </div>
        <Field label="Account name" value={data.accountName} onChange={v => set('accountName', v)} placeholder="e.g. Sarah Johnson" />
      </>}
    </Step>,
  ]

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.progressBar}><div style={{ ...s.progressFill, width: progress() + '%' }} /></div>
        {steps[step]}
        <div style={s.navRow}>
          <button style={s.backBtn} onClick={back} disabled={step === 0}>Back</button>
          <div style={s.navRight}>
            <span style={s.stepCount}>{step + 1} of {TOTAL_STEPS}</span>
            <button style={s.nextBtn} onClick={next}>
              {step === TOTAL_STEPS ? 'Generate letter' : 'Continue'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function Step({ phase, question, hint, children }: { phase: string; question: string; hint?: string; children?: React.ReactNode }) {
  return (
    <div>
      <p style={styles.phase}>{phase}</p>
      <p style={styles.question}>{question}</p>
      {hint && <p style={styles.hint}>{hint}</p>}
      {children}
    </div>
  )
}

function Field({ label, value, onChange, placeholder, type }: { label?: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <div style={{ marginBottom: 10 }}>
      {label && <label style={styles.label}>{label}</label>}
      <input style={styles.input} type={type || 'text'} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
    </div>
  )
}

function TextArea({ label, value, onChange, placeholder }: { label?: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div style={{ marginBottom: 10 }}>
      {label && <label style={styles.label}>{label}</label>}
      <textarea style={styles.textarea} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={4} />
    </div>
  )
}

function Options({ keyName, value, onPick, options }: { keyName: keyof FormData; value: string; onPick: (k: keyof FormData, v: string) => void; options: { v: string; l: string }[] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
      {options.map(o => (
        <button key={o.v} style={{ ...styles.optBtn, ...(value === o.v ? styles.optBtnSel : {}) }}
          onClick={() => onPick(keyName, o.v)}>
          <span style={{ ...styles.dot, ...(value === o.v ? styles.dotSel : {}) }} />
          {o.l}
        </button>
      ))}
    </div>
  )
}

function YesNo({ keyName, value, onChange, yesLabel, noLabel, label }: { keyName: keyof FormData; value: string; onChange: (v: string) => void; yesLabel: string; noLabel: string; label?: string }) {
  return (
    <div style={{ marginBottom: 10 }}>
      {label && <label style={styles.label}>{label}</label>}
      <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
        <button style={{ ...styles.ynBtn, ...(value === 'yes' ? styles.ynBtnSel : {}) }} onClick={() => onChange('yes')}>{yesLabel}</button>
        <button style={{ ...styles.ynBtn, ...(value === 'no' ? styles.ynBtnSel : {}) }} onClick={() => onChange('no')}>{noLabel}</button>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  page: { minHeight: '100vh', background: '#f6f6f4', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '2rem 1rem' },
  card: { width: '100%', maxWidth: 600, background: '#ffffff', borderRadius: 16, border: '0.5px solid rgba(0,0,0,0.1)', padding: '2rem 2rem 1.5rem' },
  progressBar: { height: 3, background: 'rgba(0,0,0,0.08)', borderRadius: 2, marginBottom: '2rem', overflow: 'hidden' },
  progressFill: { height: '100%', background: '#111', borderRadius: 2, transition: 'width 0.3s ease' },
  phase: { fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: '#999', marginBottom: 6 },
  question: { fontSize: 20, fontWeight: 500, color: '#111', lineHeight: 1.4, marginBottom: 6 },
  hint: { fontSize: 14, color: '#666', lineHeight: 1.6, marginBottom: 16 },
  label: { display: 'block', fontSize: 13, color: '#666', marginBottom: 5 },
  input: { width: '100%', border: '0.5px solid rgba(0,0,0,0.2)', borderRadius: 8, padding: '11px 13px', fontSize: 14, color: '#111', background: '#fff', outline: 'none' },
  textarea: { width: '100%', border: '0.5px solid rgba(0,0,0,0.2)', borderRadius: 8, padding: '11px 13px', fontSize: 14, color: '#111', background: '#fff', outline: 'none', resize: 'vertical' as const, lineHeight: 1.6 },
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 },
  optBtn: { background: '#fff', border: '0.5px solid rgba(0,0,0,0.18)', borderRadius: 8, padding: '13px 16px', textAlign: 'left' as const, fontSize: 14, color: '#111', display: 'flex', alignItems: 'center', gap: 10, transition: 'background 0.15s' },
  optBtnSel: { border: '1.5px solid #111', background: '#f6f6f4', fontWeight: 500 },
  dot: { width: 18, height: 18, borderRadius: '50%', border: '1.5px solid rgba(0,0,0,0.2)', flexShrink: 0 },
  dotSel: { background: '#111', border: '1.5px solid #111' },
  ynBtn: { flex: 1, background: '#fff', border: '0.5px solid rgba(0,0,0,0.18)', borderRadius: 8, padding: '11px', textAlign: 'center' as const, fontSize: 14, color: '#111', transition: 'all 0.15s' },
  ynBtnSel: { border: '1.5px solid #111', background: '#f6f6f4', fontWeight: 500 },
  navRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 20, paddingTop: 20, borderTop: '0.5px solid rgba(0,0,0,0.08)' },
  navRight: { display: 'flex', alignItems: 'center', gap: 14 },
  backBtn: { background: 'none', border: 'none', fontSize: 14, color: '#666', padding: 0 },
  nextBtn: { background: '#111', color: '#fff', border: 'none', borderRadius: 8, padding: '11px 22px', fontSize: 14, fontWeight: 500 },
  stepCount: { fontSize: 13, color: '#999' },
  centered: { display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center', padding: '3rem 0', gap: 16 },
  spinner: { width: 32, height: 32, border: '2px solid rgba(0,0,0,0.1)', borderTopColor: '#111', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
  genMsg: { fontSize: 14, color: '#666' },
  summaryCard: { background: '#f6f6f4', borderRadius: 8, padding: '1rem', marginBottom: '1rem', fontSize: 13 },
  summaryRow: { display: 'flex', justifyContent: 'space-between', padding: '3px 0', gap: 12 },
  summaryKey: { color: '#666' },
  summaryVal: { color: '#111', fontWeight: 500, textAlign: 'right' as const, flex: 1 },
  letterBox: { background: '#fff', border: '0.5px solid rgba(0,0,0,0.12)', borderRadius: 12, padding: '2rem', fontSize: 14, lineHeight: 2, color: '#111', whiteSpace: 'pre-wrap' as const, fontFamily: 'Georgia, serif', marginTop: '1rem', overflowX: 'auto' as const },
  actions: { display: 'flex', gap: 10, marginTop: '1rem', flexWrap: 'wrap' as const, alignItems: 'center' },
  copyBtn: { background: '#f6f6f4', border: '0.5px solid rgba(0,0,0,0.15)', borderRadius: 8, padding: '10px 18px', fontSize: 13, color: '#111' },
  restartBtn: { background: 'none', border: 'none', fontSize: 13, color: '#666', padding: '10px 0' },
}
