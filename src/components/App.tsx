'use client'

import { useState, useRef } from 'react'

type Screen = 'landing' | 'disclaimer' | 'choose' | 'questions' | 'upload' | 'generating' | 'output'

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

const S: Record<string, React.CSSProperties> = {
  page: { minHeight: '100vh', background: '#f6f6f4', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '2rem 1rem' },
  card: { width: '100%', maxWidth: 620, background: '#fff', borderRadius: 16, border: '0.5px solid rgba(0,0,0,0.1)', padding: '2rem 2rem 1.5rem' },
  prog: { height: 3, background: 'rgba(0,0,0,0.08)', borderRadius: 2, marginBottom: '2rem', overflow: 'hidden' },
  progFill: { height: '100%', background: '#111', borderRadius: 2, transition: 'width 0.3s ease' },
  phase: { fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: '#999', marginBottom: 6 },
  q: { fontSize: 20, fontWeight: 500, color: '#111', lineHeight: 1.4, marginBottom: 6 },
  hint: { fontSize: 14, color: '#666', lineHeight: 1.6, marginBottom: 16 },
  lbl: { display: 'block', fontSize: 13, color: '#666', marginBottom: 5 },
  inp: { width: '100%', border: '0.5px solid rgba(0,0,0,0.2)', borderRadius: 8, padding: '11px 13px', fontSize: 14, color: '#111', background: '#fff', outline: 'none', marginBottom: 10 },
  ta: { width: '100%', border: '0.5px solid rgba(0,0,0,0.2)', borderRadius: 8, padding: '11px 13px', fontSize: 14, color: '#111', background: '#fff', outline: 'none', resize: 'vertical' as const, lineHeight: 1.6, marginBottom: 10 },
  g2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 },
  optBtn: { width: '100%', background: '#fff', border: '0.5px solid rgba(0,0,0,0.18)', borderRadius: 8, padding: '13px 16px', textAlign: 'left' as const, fontSize: 14, color: '#111', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 },
  optBtnSel: { border: '1.5px solid #111', background: '#f6f6f4', fontWeight: 500 },
  dot: { width: 18, height: 18, borderRadius: '50%', border: '1.5px solid rgba(0,0,0,0.2)', flexShrink: 0 },
  dotSel: { background: '#111', border: '1.5px solid #111' },
  yn: { display: 'flex', gap: 8, marginBottom: 10 },
  ynBtn: { flex: 1, background: '#fff', border: '0.5px solid rgba(0,0,0,0.18)', borderRadius: 8, padding: 11, textAlign: 'center' as const, fontSize: 14, color: '#111' },
  ynBtnSel: { border: '1.5px solid #111', background: '#f6f6f4', fontWeight: 500 },
  navRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 20, paddingTop: 20, borderTop: '0.5px solid rgba(0,0,0,0.08)' },
  backBtn: { background: 'none', border: 'none', fontSize: 14, color: '#666', padding: 0 },
  nextBtn: { background: '#111', color: '#fff', border: 'none', borderRadius: 8, padding: '11px 22px', fontSize: 14, fontWeight: 500 },
  sc: { fontSize: 13, color: '#999' },
  letterBox: { background: '#fff', border: '0.5px solid rgba(0,0,0,0.12)', borderRadius: 12, padding: '2rem', fontSize: 14, lineHeight: 2, color: '#111', whiteSpace: 'pre-wrap' as const, fontFamily: 'Georgia, serif', marginTop: '1rem', overflowX: 'auto' as const },
  sumCard: { background: '#f6f6f4', borderRadius: 8, padding: '1rem', marginBottom: '1rem', fontSize: 13 },
  sumRow: { display: 'flex', justifyContent: 'space-between', padding: '3px 0', gap: 12 },
  copyBtn: { background: '#f6f6f4', border: '0.5px solid rgba(0,0,0,0.15)', borderRadius: 8, padding: '10px 18px', fontSize: 13, color: '#111' },
  restartBtn: { background: 'none', border: 'none', fontSize: 13, color: '#666', padding: '10px 0' },
  centered: { display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center', padding: '3rem 0', gap: 16 },
  spinner: { width: 32, height: 32, border: '2px solid rgba(0,0,0,0.1)', borderTopColor: '#111', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
  overlay: { position: 'fixed' as const, inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', zIndex: 100 },
  modal: { background: '#fff', borderRadius: 16, padding: '2rem', maxWidth: 480, width: '100%' },
  choiceBtn: { width: '100%', background: '#fff', border: '0.5px solid rgba(0,0,0,0.18)', borderRadius: 12, padding: '1.25rem 1.5rem', textAlign: 'left' as const, marginBottom: 12, cursor: 'pointer' },
  choiceTitle: { fontSize: 16, fontWeight: 500, color: '#111', marginBottom: 4 },
  choiceDesc: { fontSize: 13, color: '#666', lineHeight: 1.5 },
  uploadArea: { border: '1.5px dashed rgba(0,0,0,0.2)', borderRadius: 12, padding: '2rem', textAlign: 'center' as const, marginBottom: 16 },
  fileInput: { display: 'none' },
  dlBtn: { background: 'none', border: '0.5px solid rgba(0,0,0,0.2)', borderRadius: 8, padding: '10px 18px', fontSize: 13, color: '#111', marginBottom: 16, display: 'inline-block' },
}

export default function App() {
  const [screen, setScreen] = useState<Screen>('landing')
  const [step, setStep] = useState(0)
  const [data, setData] = useState<FormData>({ ...EMPTY })
  const [letter, setLetter] = useState('')
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<string>('')
  const [uploadFileName, setUploadFileName] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  function set(key: keyof FormData, val: string) {
    setData(prev => ({ ...prev, [key]: val }))
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
    let s = data.senderName
    if (data.senderAddress) s += '\n' + data.senderAddress
    if (data.senderEmail) s += '\n' + data.senderEmail
    if (data.senderPhone) s += '\n' + data.senderPhone
    let r = data.recipientName
    if (data.recipientAddress) r += '\n' + data.recipientAddress
    return s + '\n\n' + today() + '\n\n' + r + '\n\n'
  }

  async function generate(payload: Record<string, string>, fromFile: boolean) {
    setScreen('generating')
    setError('')
    try {
      const res = await fetch('/api/generate-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, fromFile }),
      })
      const json = await res.json()
      if (json.error) { setError(json.error); setScreen('output'); return }
      const header = fromFile ? '' : buildHeader()
      setLetter(header + json.letter)
      setScreen('output')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
      setScreen('output')
    }
  }

  function generateFromQuestions() {
    generate({ ...data as unknown as Record<string, string> }, false)
  }

  function generateFromFile() {
    if (!uploadedFile) return
    generate({ rawFile: uploadedFile, fromFile: 'true' as unknown as string } as Record<string, string>, true)
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadFileName(file.name)
    const reader = new FileReader()
    reader.onload = (ev) => {
      setUploadedFile(ev.target?.result as string)
    }
    reader.readAsText(file)
  }

  function pickOption(key: keyof FormData, val: string) {
    setData(prev => ({ ...prev, [key]: val }))
    setTimeout(() => setStep(s => s + 1), 220)
  }

  function restart() {
    setStep(0)
    setData({ ...EMPTY })
    setLetter('')
    setError('')
    setUploadedFile('')
    setUploadFileName('')
    setScreen('landing')
  }

  // LANDING
  if (screen === 'landing') {
    return (
      <div style={S.page}>
        <div style={{ ...S.card, padding: '3rem 2rem' }}>
          <p style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#999', marginBottom: 12 }}>Free tool</p>
          <h1 style={{ fontSize: 28, fontWeight: 600, color: '#111', lineHeight: 1.3, marginBottom: 16 }}>Letter of Demand</h1>
          <p style={{ fontSize: 16, color: '#444', lineHeight: 1.7, marginBottom: 12 }}>
            This tool helps you prepare a formal letter of demand to send to someone who owes you money, has failed to deliver on an agreement or has caused you loss.
          </p>
          <p style={{ fontSize: 16, color: '#444', lineHeight: 1.7, marginBottom: 32 }}>
            Answer a series of questions or upload a completed template and the tool will generate a firm professional letter ready to send.
          </p>
          <div style={{ background: '#f6f6f4', borderRadius: 10, padding: '1rem 1.25rem', marginBottom: 32, fontSize: 14, color: '#555', lineHeight: 1.6 }}>
            <strong style={{ color: '#111', display: 'block', marginBottom: 6 }}>Before you begin</strong>
            This tool uses AI to generate your letter. While it is designed to produce accurate and appropriate output, it may make mistakes. All output should be reviewed carefully before sending. This tool does not provide legal advice and no liability is accepted for any letter generated.
          </div>
          <button style={{ ...S.nextBtn, padding: '14px 32px', fontSize: 15 }} onClick={() => setScreen('disclaimer')}>
            Get started
          </button>
        </div>
      </div>
    )
  }

  // DISCLAIMER MODAL
  if (screen === 'disclaimer') {
    return (
      <div style={S.overlay}>
        <div style={S.modal}>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: '#111', marginBottom: 12 }}>Important notice</h2>
          <p style={{ fontSize: 14, color: '#444', lineHeight: 1.7, marginBottom: 12 }}>
            This tool is AI assisted. The letter it generates is based entirely on the information you provide. The output may contain errors, omissions or language that is not appropriate for your specific circumstances.
          </p>
          <p style={{ fontSize: 14, color: '#444', lineHeight: 1.7, marginBottom: 12 }}>
            You must review the letter carefully before sending it. Do not send a letter you have not read and understood in full.
          </p>
          <p style={{ fontSize: 14, color: '#444', lineHeight: 1.7, marginBottom: 24 }}>
            This tool does not provide legal advice. No liability is accepted for any outcome arising from the use of this tool or the sending of any letter generated by it. If you are unsure about your legal position you should seek independent legal advice before proceeding.
          </p>
          <button style={{ ...S.nextBtn, width: '100%', padding: '13px', fontSize: 15 }} onClick={() => setScreen('choose')}>
            I understand and wish to proceed
          </button>
        </div>
      </div>
    )
  }

  // CHOOSE PATH
  if (screen === 'choose') {
    return (
      <div style={S.page}>
        <div style={S.card}>
          <p style={S.phase}>Get started</p>
          <p style={S.q}>How would you like to proceed?</p>
          <p style={S.hint}>Choose the option that suits you best.</p>
          <button style={S.choiceBtn} onClick={() => setScreen('questions')}>
            <div style={S.choiceTitle}>Answer questions</div>
            <div style={S.choiceDesc}>We walk you through a series of questions one at a time and generate the letter at the end. Best for most people.</div>
          </button>
          <button style={S.choiceBtn} onClick={() => setScreen('upload')}>
            <div style={S.choiceTitle}>Upload a completed template</div>
            <div style={S.choiceDesc}>Download our template, fill it in and upload it. Best for bulk use or if you prefer to prepare your information in advance.</div>
          </button>
        </div>
      </div>
    )
  }

  // UPLOAD PATH
  if (screen === 'upload') {
    return (
      <div style={S.page}>
        <div style={S.card}>
          <p style={S.phase}>Upload template</p>
          <p style={S.q}>Upload your completed template</p>
          <p style={S.hint}>Download the template below, fill in your details and upload the completed file. You do not need to fill in every field — leave blank anything that does not apply.</p>
          <a href="/api/template" style={{ ...S.nextBtn, display: 'inline-block', textDecoration: 'none', marginBottom: 24, fontSize: 14, padding: '10px 18px', background: '#f6f6f4', color: '#111', border: '0.5px solid rgba(0,0,0,0.2)', borderRadius: 8 }}>
            Download template
          </a>
          <div style={S.uploadArea}>
            {uploadFileName ? (
              <div>
                <p style={{ fontSize: 14, color: '#111', fontWeight: 500, marginBottom: 4 }}>{uploadFileName}</p>
                <p style={{ fontSize: 13, color: '#666' }}>File ready. Click generate when you are ready to proceed.</p>
              </div>
            ) : (
              <div>
                <p style={{ fontSize: 14, color: '#666', marginBottom: 12 }}>Click to select your completed template file</p>
                <button style={{ ...S.nextBtn, fontSize: 14 }} onClick={() => fileRef.current?.click()}>Select file</button>
              </div>
            )}
            <input ref={fileRef} type="file" accept=".txt" style={S.fileInput} onChange={handleFileUpload} />
          </div>
          {uploadFileName && (
            <button style={{ ...S.nextBtn, width: '100%', padding: 13 }} onClick={generateFromFile}>
              Generate letter
            </button>
          )}
          <div style={S.navRow}>
            <button style={S.backBtn} onClick={() => setScreen('choose')}>Back</button>
            <span />
          </div>
        </div>
      </div>
    )
  }

  // GENERATING
  if (screen === 'generating') {
    return (
      <div style={S.page}>
        <div style={S.card}>
          <div style={S.centered}>
            <div style={S.spinner} />
            <p style={{ fontSize: 14, color: '#666' }}>Drafting your letter...</p>
          </div>
        </div>
      </div>
    )
  }

  // OUTPUT
  if (screen === 'output') {
    return (
      <div style={S.page}>
        <div style={S.card}>
          {error ? (
            <div>
              <p style={S.phase}>Error</p>
              <p style={S.q}>Something went wrong</p>
              <p style={{ fontSize: 14, color: '#c00', marginBottom: 24 }}>{error}</p>
              <button style={S.nextBtn} onClick={restart}>Start over</button>
            </div>
          ) : (
            <div>
              <p style={S.phase}>Your letter</p>
              <p style={S.q}>Ready to review</p>
              <p style={S.hint}>Review the letter carefully. Any section marked with double square brackets needs your attention before sending.</p>
              {data.senderName && (
                <div style={S.sumCard}>
                  {[
                    ['Sender', data.senderName],
                    ['Recipient', data.recipientName],
                    ['Dispute', data.disputeType],
                    ['Deadline', data.deadline + ' days, by ' + deadlineDate()],
                    ...(data.amountClaimed ? [['Amount claimed', '$' + parseFloat(data.amountClaimed).toLocaleString('en-AU', { minimumFractionDigits: 2 })]] : []),
                  ].filter(r => r[1]).map(([k, v]) => (
                    <div key={k} style={S.sumRow}>
                      <span style={{ color: '#666' }}>{k}</span>
                      <span style={{ color: '#111', fontWeight: 500, textAlign: 'right', flex: 1 }}>{v}</span>
                    </div>
                  ))}
                </div>
              )}
              <pre style={S.letterBox}>{letter}</pre>
              <div style={{ display: 'flex', gap: 10, marginTop: '1rem', alignItems: 'center' }}>
                <button style={S.copyBtn} onClick={async () => { await navigator.clipboard.writeText(letter); setCopied(true); setTimeout(() => setCopied(false), 2500) }}>
                  {copied ? 'Copied!' : 'Copy letter text'}
                </button>
                <button style={S.restartBtn} onClick={restart}>Start over</button>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  // QUESTION FLOW
  const needsPayment = data.demandType === 'money' || data.demandType === 'both'
  const pct = Math.round(((step + 1) / (TOTAL_STEPS + 2)) * 100)

  function Field({ k, label, ph, type }: { k: keyof FormData; label?: string; ph?: string; type?: string }) {
    return (
      <div>
        {label && <label style={S.lbl}>{label}</label>}
        <input style={S.inp} type={type || 'text'} value={data[k]} onChange={e => set(k, e.target.value)} placeholder={ph} />
      </div>
    )
  }

  function TA({ k, label, ph }: { k: keyof FormData; label?: string; ph?: string }) {
    return (
      <div>
        {label && <label style={S.lbl}>{label}</label>}
        <textarea style={S.ta} value={data[k]} onChange={e => set(k, e.target.value)} placeholder={ph} rows={4} />
      </div>
    )
  }

  function Opts({ k, options }: { k: keyof FormData; options: { v: string; l: string }[] }) {
    return (
      <div style={{ marginBottom: 4 }}>
        {options.map(o => (
          <button key={o.v} style={{ ...S.optBtn, ...(data[k] === o.v ? S.optBtnSel : {}) }} onClick={() => pickOption(k, o.v)}>
            <span style={{ ...S.dot, ...(data[k] === o.v ? S.dotSel : {}) }} />
            {o.l}
          </button>
        ))}
      </div>
    )
  }

  function YN({ k, yl, nl, label }: { k: keyof FormData; yl: string; nl: string; label?: string }) {
    return (
      <div>
        {label && <label style={S.lbl}>{label}</label>}
        <div style={S.yn}>
          <button style={{ ...S.ynBtn, ...(data[k] === 'yes' ? S.ynBtnSel : {}) }} onClick={() => set(k, 'yes')}>{yl}</button>
          <button style={{ ...S.ynBtn, ...(data[k] === 'no' ? S.ynBtnSel : {}) }} onClick={() => set(k, 'no')}>{nl}</button>
        </div>
      </div>
    )
  }

  function Nav({ hideBack }: { hideBack?: boolean }) {
    return (
      <div style={S.navRow}>
        <button style={S.backBtn} onClick={() => { if (step > 0) setStep(s => s - 1); else setScreen('choose') }} disabled={hideBack}>
          {hideBack ? '' : 'Back'}
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={S.sc}>{step + 1} of {TOTAL_STEPS}</span>
          <button style={S.nextBtn} onClick={() => { if (step < TOTAL_STEPS) setStep(s => s + 1); else generateFromQuestions() }}>
            {step === TOTAL_STEPS ? 'Generate letter' : 'Continue'}
          </button>
        </div>
      </div>
    )
  }

  const steps: React.ReactNode[] = [
    <div key={0}><p style={S.phase}>About you</p><p style={S.q}>What is your full name?</p><p style={S.hint}>This appears as the sender on the letter.</p><Field k="senderName" label="Full name" ph="e.g. Sarah Johnson" /><Nav hideBack /></div>,
    <div key={1}><p style={S.phase}>About you</p><p style={S.q}>What is your address and contact details?</p><p style={S.hint}>Used in the letter header.</p><Field k="senderAddress" label="Street address" ph="e.g. 12 Smith Street Sydney NSW 2000" /><div style={S.g2}><Field k="senderEmail" label="Email" ph="e.g. sarah@email.com" /><Field k="senderPhone" label="Phone (optional)" ph="e.g. 0400 000 000" /></div><Nav /></div>,
    <div key={2}><p style={S.phase}>The other party</p><p style={S.q}>Who are you writing to?</p><p style={S.hint}>Use the full legal name of the person or company.</p><Field k="recipientName" label="Their full name or business name" ph="e.g. ABC Plumbing Pty Ltd" /><Field k="recipientAddress" label="Their address or email" ph="e.g. 50 Builder Lane Melbourne VIC 3000" /><Nav /></div>,
    <div key={3}><p style={S.phase}>The other party</p><p style={S.q}>Are they an individual or a business?</p><Opts k="recipientType" options={[{ v: 'individual', l: 'An individual person' }, { v: 'business', l: 'A business or company' }, { v: 'unsure', l: 'Not sure' }]} /><Nav /></div>,
    <div key={4}><p style={S.phase}>The dispute</p><p style={S.q}>What is this dispute about?</p><p style={S.hint}>Choose the closest match.</p><Opts k="disputeType" options={[{ v: 'debt', l: 'Money owed to me (unpaid invoice or loan)' }, { v: 'goods', l: 'Faulty goods or products' }, { v: 'services', l: 'Unsatisfactory services or work done' }, { v: 'building', l: 'Building or renovation work gone wrong' }, { v: 'property', l: 'Damage to my property' }, { v: 'rent', l: 'Unpaid rent or bond dispute' }, { v: 'other', l: 'Something else' }]} /><Nav /></div>,
    <div key={5}><p style={S.phase}>What happened</p><p style={S.q}>When did the agreement or relationship begin?</p><p style={S.hint}>An approximate month and year is fine.</p><Field k="startDate" label="Date or period" ph="e.g. March 2023 or about mid 2022" /><Nav /></div>,
    <div key={6}><p style={S.phase}>What happened</p><p style={S.q}>What was agreed between you?</p><p style={S.hint}>Describe what they were supposed to do, pay or provide. Be as specific as you can including any amounts, timeframes or key terms.</p><TA k="agreement" ph="e.g. They agreed to renovate my kitchen for $15,000 and complete the work by June 2023." /><Nav /></div>,
    <div key={7}><p style={S.phase}>What happened</p><p style={S.q}>What went wrong?</p><p style={S.hint}>Describe what they did or failed to do. Include dates where you can.</p><TA k="whatWentWrong" ph="e.g. The contractor stopped attending site in July 2023 and has not returned calls or emails since." /><Nav /></div>,
    <div key={8}><p style={S.phase}>What happened</p><p style={S.q}>Have you already raised this with them?</p><YN k="priorContact" yl="Yes I have contacted them" nl="No this is first contact" />{data.priorContact === 'yes' && <TA k="priorContactDetail" label="What happened when you raised it?" ph="e.g. I emailed them on 1 August 2023. They promised to fix it but nothing has happened since." />}<Nav /></div>,
    <div key={9}><p style={S.phase}>What you want</p><p style={S.q}>What outcome are you seeking?</p><Opts k="demandType" options={[{ v: 'money', l: 'Payment of a sum of money' }, { v: 'action', l: 'I want them to fix replace or do something' }, { v: 'both', l: 'Both money and action' }]} /><Nav /></div>,
    <div key={10}><p style={S.phase}>What you want</p><p style={S.q}>Details of your demand</p>{needsPayment && <><Field k="amountClaimed" label="Total amount claimed ($)" ph="e.g. 5000" type="number" /><TA k="amountBreakdown" label="How is this amount made up?" ph="e.g. Unpaid invoice 001 for $4,500 and out of pocket repair costs of $500." /></>}{(data.demandType === 'action' || data.demandType === 'both') && <TA k="actionDemand" label="What specifically do you want them to do?" ph="e.g. Return and complete the kitchen renovation to the agreed standard." />}<YN k="hasEvidence" label="Do you have supporting documents such as receipts invoices or quotes?" yl="Yes" nl="No" /><Nav /></div>,
    <div key={11}><p style={S.phase}>The deadline</p><p style={S.q}>How many days are you giving them to respond?</p><p style={S.hint}>14 days is standard for most disputes.</p><Opts k="deadline" options={[{ v: '7', l: '7 days (urgent matter)' }, { v: '14', l: '14 days (recommended)' }, { v: '21', l: '21 days' }, { v: '28', l: '28 days' }]} /><Nav /></div>,
    <div key={12}><p style={S.phase}>The deadline</p><p style={S.q}>If they ignore this letter what will you do?</p><p style={S.hint}>Be honest as this makes the letter more credible.</p><Opts k="consequence" options={[{ v: 'tribunal', l: 'Lodge an application with a tribunal such as NCAT VCAT or Fair Trading' }, { v: 'court', l: 'Commence court proceedings' }, { v: 'regulator', l: 'Complain to a regulator or ombudsman' }, { v: 'unsure', l: 'Consider all available options' }]} /><Nav /></div>,
    <div key={13}><p style={S.phase}>Payment details</p><p style={S.q}>How should payment be made to you?</p><p style={S.hint}>{needsPayment ? 'Providing your bank details makes it easier for them to comply immediately.' : 'As you are not claiming money you can skip this step and generate your letter.'}</p>{needsPayment && <><Field k="bankName" label="Bank name" ph="e.g. Commonwealth Bank" /><div style={S.g2}><Field k="bsb" label="BSB" ph="e.g. 062-204" /><Field k="accountNumber" label="Account number" ph="e.g. 1234 5678" /></div><Field k="accountName" label="Account name" ph="e.g. Sarah Johnson" /></>}<Nav /></div>,
  ]

  return (
    <div style={S.page}>
      <div style={S.card}>
        <div style={S.prog}><div style={{ ...S.progFill, width: pct + '%' }} /></div>
        {steps[step]}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}
