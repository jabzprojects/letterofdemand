'use client'

import { useState, useRef } from 'react'

type Screen = 'landing' | 'disclaimer' | 'choose' | 'questions' | 'review' | 'upload' | 'generating' | 'output'

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
  backBtn: { background: 'none', border: '0.5px solid rgba(0,0,0,0.2)', borderRadius: 8, padding: '8px 14px', fontSize: 14, color: '#666' },
  nextBtn: { background: '#111', color: '#fff', border: 'none', borderRadius: 8, padding: '11px 22px', fontSize: 14, fontWeight: 500 },
  homeBtn: { background: 'none', border: '0.5px solid rgba(0,0,0,0.2)', borderRadius: 8, padding: '8px 14px', fontSize: 13, color: '#666' },
  sc: { fontSize: 13, color: '#999' },
  letterBox: { background: '#fff', border: '0.5px solid rgba(0,0,0,0.12)', borderRadius: 12, padding: '2rem', fontSize: 14, lineHeight: 2, color: '#111', whiteSpace: 'pre-wrap' as const, fontFamily: 'Georgia, serif', marginTop: '1rem', overflowX: 'auto' as const },
  sumCard: { background: '#f6f6f4', borderRadius: 8, padding: '1rem', marginBottom: '1rem', fontSize: 13 },
  sumRow: { display: 'flex', justifyContent: 'space-between', padding: '3px 0', gap: 12 },
  copyBtn: { background: '#f6f6f4', border: '0.5px solid rgba(0,0,0,0.15)', borderRadius: 8, padding: '10px 18px', fontSize: 13, color: '#111' },
  restartBtn: { background: 'none', border: '0.5px solid rgba(0,0,0,0.2)', borderRadius: 8, padding: '10px 18px', fontSize: 13, color: '#666' },
  centered: { display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center', padding: '3rem 0', gap: 16 },
  spinner: { width: 32, height: 32, border: '2px solid rgba(0,0,0,0.1)', borderTopColor: '#111', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
  overlay: { position: 'fixed' as const, inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', zIndex: 100 },
  modal: { background: '#fff', borderRadius: 16, padding: '2rem', maxWidth: 480, width: '100%' },
  choiceBtn: { width: '100%', background: '#fff', border: '0.5px solid rgba(0,0,0,0.18)', borderRadius: 12, padding: '1.25rem 1.5rem', textAlign: 'left' as const, marginBottom: 12, cursor: 'pointer' },
  choiceTitle: { fontSize: 16, fontWeight: 500, color: '#111', marginBottom: 4 },
  choiceDesc: { fontSize: 13, color: '#666', lineHeight: 1.5 },
  uploadArea: { border: '1.5px dashed rgba(0,0,0,0.2)', borderRadius: 12, padding: '2rem', textAlign: 'center' as const, marginBottom: 16 },
  fileInput: { display: 'none' },
  reviewRow: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '12px 0', borderBottom: '0.5px solid rgba(0,0,0,0.06)', gap: 12 },
  reviewLabel: { fontSize: 13, color: '#999', minWidth: 140, paddingTop: 1 },
  reviewValue: { fontSize: 14, color: '#111', flex: 1, lineHeight: 1.5, whiteSpace: 'pre-wrap' as const },
  reviewEditBtn: { background: 'none', border: 'none', fontSize: 13, color: '#0066cc', padding: '0 0 0 8px', flexShrink: 0, cursor: 'pointer' },
}

// SUB-COMPONENTS DEFINED OUTSIDE App() TO PREVENT INPUT FOCUS LOSS

function Field({ value, onChange, label, ph, type }: {
  value: string; onChange: (v: string) => void; label?: string; ph?: string; type?: string
}) {
  return (
    <div>
      {label && <label style={S.lbl}>{label}</label>}
      <input style={S.inp} type={type || 'text'} value={value} onChange={e => onChange(e.target.value)} placeholder={ph} />
    </div>
  )
}

function TA({ value, onChange, label, ph }: {
  value: string; onChange: (v: string) => void; label?: string; ph?: string
}) {
  return (
    <div>
      {label && <label style={S.lbl}>{label}</label>}
      <textarea style={S.ta} value={value} onChange={e => onChange(e.target.value)} placeholder={ph} rows={4} />
    </div>
  )
}

function Opts({ value, onPick, options }: {
  value: string; onPick: (v: string) => void; options: { v: string; l: string }[]
}) {
  return (
    <div style={{ marginBottom: 4 }}>
      {options.map(o => (
        <button key={o.v} className="btn-opt" style={{ ...S.optBtn, ...(value === o.v ? S.optBtnSel : {}) }} onClick={() => onPick(o.v)}>
          <span style={{ ...S.dot, ...(value === o.v ? S.dotSel : {}) }} />
          {o.l}
        </button>
      ))}
    </div>
  )
}

function YN({ value, onChange, yl, nl, label }: {
  value: string; onChange: (v: string) => void; yl: string; nl: string; label?: string
}) {
  return (
    <div>
      {label && <label style={S.lbl}>{label}</label>}
      <div style={S.yn}>
        <button className="btn-secondary" style={{ ...S.ynBtn, ...(value === 'yes' ? S.ynBtnSel : {}) }} onClick={() => onChange('yes')}>{yl}</button>
        <button className="btn-secondary" style={{ ...S.ynBtn, ...(value === 'no' ? S.ynBtnSel : {}) }} onClick={() => onChange('no')}>{nl}</button>
      </div>
    </div>
  )
}

function Nav({ step, total, onBack, onNext, onHome, hideBack }: {
  step: number; total: number; onBack: () => void; onNext: () => void; onHome: () => void; hideBack?: boolean
}) {
  return (
    <div style={S.navRow}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        {!hideBack && <button className="btn-secondary" style={S.backBtn} onClick={onBack}>Back</button>}
        <button className="btn-secondary" style={S.homeBtn} onClick={onHome}>Home</button>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <span style={S.sc}>{step + 1} of {total}</span>
        <button className="btn-primary" style={S.nextBtn} onClick={onNext}>
          {step === total ? 'Review answers' : 'Continue'}
        </button>
      </div>
    </div>
  )
}

// TEMPLATE BUILDER — assembles a completed txt file from form data

function buildTemplateText(d: FormData): string {
  const line = (label: string, value: string) => label + '\n' + (value || '(not answered)') + '\n\n'
  return 'LETTER OF DEMAND - COMPLETED TEMPLATE\n' +
    'Generated ' + new Date().toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' }) + '\n\n' +
    '========================================\n' +
    'YOUR DETAILS\n' +
    '========================================\n\n' +
    line('Full name:', d.senderName) +
    line('Street address:', d.senderAddress) +
    line('Email:', d.senderEmail) +
    line('Phone:', d.senderPhone) +
    '========================================\n' +
    'THEIR DETAILS\n' +
    '========================================\n\n' +
    line('Full name or business name:', d.recipientName) +
    line('Their address or email:', d.recipientAddress) +
    line('Are they an individual or a business:', d.recipientType) +
    '========================================\n' +
    'THE DISPUTE\n' +
    '========================================\n\n' +
    line('What is this dispute about:', d.disputeType) +
    line('When did the agreement or relationship begin:', d.startDate) +
    '========================================\n' +
    'WHAT HAPPENED\n' +
    '========================================\n\n' +
    line('What was agreed between you:', d.agreement) +
    line('What went wrong:', d.whatWentWrong) +
    line('Have you already contacted them:', d.priorContact) +
    line('What happened when you raised it:', d.priorContactDetail) +
    '========================================\n' +
    'WHAT YOU WANT\n' +
    '========================================\n\n' +
    line('Are you seeking money, action or both:', d.demandType) +
    line('Total amount claimed ($):', d.amountClaimed) +
    line('How is this amount made up:', d.amountBreakdown) +
    line('What specifically do you want them to do:', d.actionDemand) +
    line('Do you have supporting documents:', d.hasEvidence) +
    '========================================\n' +
    'THE DEADLINE\n' +
    '========================================\n\n' +
    line('How many days are you giving them:', d.deadline) +
    line('If ignored what will you do:', d.consequence) +
    '========================================\n' +
    'PAYMENT DETAILS\n' +
    '========================================\n\n' +
    line('Bank name:', d.bankName) +
    line('BSB:', d.bsb) +
    line('Account number:', d.accountNumber) +
    line('Account name:', d.accountName) +
    '========================================\n' +
    'END OF TEMPLATE\n' +
    '========================================\n'
}

function downloadTemplate(d: FormData) {
  const text = buildTemplateText(d)
  const blob = new Blob([text], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'letter-of-demand-answers.txt'
  a.click()
  URL.revokeObjectURL(url)
}

// REVIEW SCREEN ROWS CONFIG

interface ReviewItem {
  label: string
  key: keyof FormData
  goToStep: number
  showIf?: (d: FormData) => boolean
}

const REVIEW_ITEMS: ReviewItem[] = [
  { label: 'Your name', key: 'senderName', goToStep: 0 },
  { label: 'Your address', key: 'senderAddress', goToStep: 1 },
  { label: 'Your email', key: 'senderEmail', goToStep: 1 },
  { label: 'Your phone', key: 'senderPhone', goToStep: 1 },
  { label: 'Recipient name', key: 'recipientName', goToStep: 2 },
  { label: 'Recipient address', key: 'recipientAddress', goToStep: 2 },
  { label: 'Recipient type', key: 'recipientType', goToStep: 3 },
  { label: 'Dispute type', key: 'disputeType', goToStep: 4 },
  { label: 'Agreement began', key: 'startDate', goToStep: 5 },
  { label: 'What was agreed', key: 'agreement', goToStep: 6 },
  { label: 'What went wrong', key: 'whatWentWrong', goToStep: 7 },
  { label: 'Prior contact', key: 'priorContact', goToStep: 8 },
  { label: 'Prior contact detail', key: 'priorContactDetail', goToStep: 8, showIf: d => d.priorContact === 'yes' },
  { label: 'Seeking', key: 'demandType', goToStep: 9 },
  { label: 'Amount claimed', key: 'amountClaimed', goToStep: 10, showIf: d => d.demandType === 'money' || d.demandType === 'both' },
  { label: 'Amount breakdown', key: 'amountBreakdown', goToStep: 10, showIf: d => d.demandType === 'money' || d.demandType === 'both' },
  { label: 'Action required', key: 'actionDemand', goToStep: 10, showIf: d => d.demandType === 'action' || d.demandType === 'both' },
  { label: 'Has evidence', key: 'hasEvidence', goToStep: 10 },
  { label: 'Deadline (days)', key: 'deadline', goToStep: 11 },
  { label: 'If ignored', key: 'consequence', goToStep: 12 },
  { label: 'Bank name', key: 'bankName', goToStep: 13, showIf: d => d.demandType === 'money' || d.demandType === 'both' },
  { label: 'BSB', key: 'bsb', goToStep: 13, showIf: d => d.demandType === 'money' || d.demandType === 'both' },
  { label: 'Account number', key: 'accountNumber', goToStep: 13, showIf: d => d.demandType === 'money' || d.demandType === 'both' },
  { label: 'Account name', key: 'accountName', goToStep: 13, showIf: d => d.demandType === 'money' || d.demandType === 'both' },
]

// MAIN APP

export default function App() {
  const [screen, setScreen] = useState<Screen>('landing')
  const [step, setStep] = useState(0)
  const [data, setData] = useState<FormData>({ ...EMPTY })
  const [letter, setLetter] = useState('')
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [uploadedFile, setUploadedFile] = useState('')
  const [uploadFileName, setUploadFileName] = useState('')
  const [dlConfirm, setDlConfirm] = useState(false)
  const [dragOver, setDragOver] = useState(false)
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

  async function generate() {
    setScreen('generating')
    setError('')
    try {
      const res = await fetch('/api/generate-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, fromFile: false }),
      })
      const json = await res.json()
      if (json.error) { setError(json.error); setScreen('output'); return }
      setLetter(buildHeader() + json.letter)
      setScreen('output')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
      setScreen('output')
    }
  }

  async function generateFromFile() {
    if (!uploadedFile) return
    setScreen('generating')
    setError('')
    try {
      const res = await fetch('/api/generate-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawFile: uploadedFile, fromFile: true }),
      })
      const json = await res.json()
      if (json.error) { setError(json.error); setScreen('output'); return }
      setLetter(json.letter)
      setScreen('output')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
      setScreen('output')
    }
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    readFile(file)
  }

  function readFile(file: File) {
    if (!file.name.endsWith('.txt')) return
    setUploadFileName(file.name)
    const reader = new FileReader()
    reader.onload = ev => setUploadedFile(ev.target?.result as string)
    reader.readAsText(file)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) readFile(file)
  }

  function pickOption(key: keyof FormData, val: string) {
    setData(prev => ({ ...prev, [key]: val }))
    setTimeout(() => setStep(s => s + 1), 220)
  }

  function goBack() {
    if (step > 0) setStep(s => s - 1)
    else setScreen('choose')
  }

  function goNext() {
    if (step < TOTAL_STEPS) setStep(s => s + 1)
    else setScreen('review')
  }

  function goHome() {
    setScreen('choose')
  }

  function goToStep(n: number) {
    setStep(n)
    setScreen('questions')
  }

  function restart() {
    setStep(0)
    setData({ ...EMPTY })
    setLetter('')
    setError('')
    setUploadedFile('')
    setUploadFileName('')
    setDlConfirm(false)
    setDragOver(false)
    setScreen('landing')
  }

  // LANDING
  if (screen === 'landing') {
    return (
      <div style={S.page}>
        <div style={{ ...S.card, padding: '3rem 2rem' }}>
          <h1 style={{ fontSize: 28, fontWeight: 600, color: '#111', lineHeight: 1.3, marginBottom: 16 }}>Letter of Demand</h1>
          <p style={{ fontSize: 16, color: '#444', lineHeight: 1.7, marginBottom: 12 }}>
            This tool helps you prepare a formal letter of demand to send to someone who owes you money, has failed to deliver on an agreement or has caused you loss.
          </p>
          <p style={{ fontSize: 16, color: '#444', lineHeight: 1.7, marginBottom: 32 }}>
            Answer a series of questions or upload a completed template and the tool will generate a firm professional letter ready to send.
          </p>
          <button style={{ ...S.nextBtn, padding: '14px 32px', fontSize: 15 }} onClick={() => setScreen('disclaimer')}>
            Get started
          </button>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    )
  }

  // DISCLAIMER
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
          <button className="btn-secondary" style={S.choiceBtn} onClick={() => { setStep(0); setScreen('questions') }}>
            <div style={S.choiceTitle}>Answer questions</div>
            <div style={S.choiceDesc}>We walk you through a series of questions one at a time and generate the letter at the end. Best for most people.</div>
          </button>
          <button className="btn-secondary" style={S.choiceBtn} onClick={() => setScreen('upload')}>
            <div style={S.choiceTitle}>Upload a completed template</div>
            <div style={S.choiceDesc}>Download our template, fill it in and upload it. Best for bulk use or if you prefer to prepare your information in advance.</div>
          </button>
        </div>
      </div>
    )
  }

  // UPLOAD PATH
  if (screen === 'upload') {
    const dropAreaStyle: React.CSSProperties = {
      border: dragOver ? '2px solid #111' : '1.5px dashed rgba(0,0,0,0.2)',
      borderRadius: 12,
      padding: '2rem',
      textAlign: 'center',
      marginBottom: 16,
      background: dragOver ? '#f0f0ee' : '#fff',
      transition: 'all 0.15s',
    }
    return (
      <div style={S.page}>
        <div style={S.card}>
          <p style={S.phase}>Upload template</p>
          <p style={S.q}>Upload your completed template</p>
          <p style={S.hint}>Download the template below, fill in your details and upload the completed file. Leave blank anything that does not apply.</p>
          <a href="/api/template" style={{ display: 'inline-block', textDecoration: 'none', marginBottom: 24, fontSize: 14, padding: '10px 18px', background: '#f6f6f4', color: '#111', border: '0.5px solid rgba(0,0,0,0.2)', borderRadius: 8 }}>
            Download template
          </a>
          <div
            style={dropAreaStyle}
            onDragOver={e => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
          >
            {uploadFileName ? (
              <div>
                <p style={{ fontSize: 14, color: '#111', fontWeight: 500, marginBottom: 4 }}>{uploadFileName}</p>
                <p style={{ fontSize: 13, color: '#666', marginBottom: 12 }}>File ready. Click generate when you are ready to proceed.</p>
                <button style={{ ...S.restartBtn, border: 'none', padding: 0, fontSize: 13 }} onClick={() => { setUploadedFile(''); setUploadFileName('') }}>Remove file</button>
              </div>
            ) : (
              <div>
                <p style={{ fontSize: 14, color: '#666', marginBottom: 4 }}>Drag and drop your completed template here</p>
                <p style={{ fontSize: 13, color: '#999', marginBottom: 12 }}>or</p>
                <button style={{ ...S.copyBtn, fontSize: 14 }} onClick={() => fileRef.current?.click()}>Select file</button>
              </div>
            )}
            <input ref={fileRef} type="file" accept=".txt" style={S.fileInput} onChange={handleFileUpload} />
          </div>
          {uploadFileName && (
            <button style={{ ...S.nextBtn, width: '100%', padding: 13, marginBottom: 12 }} onClick={generateFromFile}>Generate letter</button>
          )}
          <div style={S.navRow}>
            <button className="btn-secondary" style={S.backBtn} onClick={() => setScreen('choose')}>Back</button>
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
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    )
  }

  // REVIEW SCREEN
  if (screen === 'review') {
    const visibleItems = REVIEW_ITEMS.filter(item => !item.showIf || item.showIf(data))
    return (
      <div style={S.page}>
        <div style={S.card}>
          <p style={S.phase}>Review your answers</p>
          <p style={S.q}>Check everything before generating</p>
          <p style={S.hint}>Click any answer to go back and change it. Once you are happy with everything click Generate letter.</p>
          <div style={{ marginBottom: 24 }}>
            {visibleItems.map(item => (
              <div key={item.key} style={S.reviewRow}>
                <span style={S.reviewLabel}>{item.label}</span>
                <span style={S.reviewValue}>{data[item.key] || <span style={{ color: '#bbb', fontStyle: 'italic' }}>not answered</span>}</span>
                <button className="btn-secondary" style={S.reviewEditBtn} onClick={() => goToStep(item.goToStep)}>Edit</button>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' as const, marginBottom: 8 }}>
            <button className="btn-primary" style={S.nextBtn} onClick={generate}>Generate letter</button>
            <button
              style={{ ...S.copyBtn, fontSize: 14 }}
              onClick={() => { downloadTemplate(data); setDlConfirm(true); setTimeout(() => setDlConfirm(false), 3000) }}
            >
              Download answers as template
            </button>
          </div>
          {dlConfirm && <p style={{ fontSize: 13, color: '#666', marginTop: 6 }}>Downloaded. You can upload this file next time to skip the questions.</p>}
          <div style={{ ...S.navRow, marginTop: 12 }}>
            <button className="btn-secondary" style={S.backBtn} onClick={() => goToStep(TOTAL_STEPS)}>Back</button>
            <button className="btn-secondary" style={S.homeBtn} onClick={goHome}>Home</button>
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
              <button className="btn-primary" style={S.nextBtn} onClick={restart}>Start over</button>
            </div>
          ) : (
            <div>
              <p style={S.phase}>Your letter</p>
              <p style={S.q}>Ready to review</p>
              <p style={S.hint}>Review the letter carefully. Any section marked with double square brackets needs your attention before sending.</p>
              <pre style={S.letterBox}>{letter}</pre>
              <div style={{ display: 'flex', gap: 10, marginTop: '1rem', alignItems: 'center', flexWrap: 'wrap' as const }}>
                <button className="btn-secondary" style={S.copyBtn} onClick={async () => { await navigator.clipboard.writeText(letter); setCopied(true); setTimeout(() => setCopied(false), 2500) }}>
                  {copied ? 'Copied!' : 'Copy letter text'}
                </button>
                <button className="btn-secondary" style={S.copyBtn} onClick={() => { setScreen('review') }}>Back to answers</button>
                <button className="btn-secondary" style={S.restartBtn} onClick={restart}>Start over</button>
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

  const steps: React.ReactNode[] = [
    <div key={0}>
      <p style={S.phase}>About you</p><p style={S.q}>What is your full name?</p><p style={S.hint}>This appears as the sender on the letter.</p>
      <Field value={data.senderName} onChange={v => set('senderName', v)} label="Full name" ph="e.g. Sarah Johnson" />
      <Nav step={step} total={TOTAL_STEPS} onBack={goBack} onNext={goNext} onHome={goHome} hideBack />
    </div>,
    <div key={1}>
      <p style={S.phase}>About you</p><p style={S.q}>What is your address and contact details?</p><p style={S.hint}>Used in the letter header.</p>
      <Field value={data.senderAddress} onChange={v => set('senderAddress', v)} label="Street address" ph="e.g. 12 Smith Street Sydney NSW 2000" />
      <div style={S.g2}>
        <Field value={data.senderEmail} onChange={v => set('senderEmail', v)} label="Email" ph="e.g. sarah@email.com" />
        <Field value={data.senderPhone} onChange={v => set('senderPhone', v)} label="Phone (optional)" ph="e.g. 0400 000 000" />
      </div>
      <Nav step={step} total={TOTAL_STEPS} onBack={goBack} onNext={goNext} onHome={goHome} />
    </div>,
    <div key={2}>
      <p style={S.phase}>The other party</p><p style={S.q}>Who are you writing to?</p><p style={S.hint}>Use the full legal name of the person or company.</p>
      <Field value={data.recipientName} onChange={v => set('recipientName', v)} label="Their full name or business name" ph="e.g. ABC Plumbing Pty Ltd" />
      <Field value={data.recipientAddress} onChange={v => set('recipientAddress', v)} label="Their address or email" ph="e.g. 50 Builder Lane Melbourne VIC 3000" />
      <Nav step={step} total={TOTAL_STEPS} onBack={goBack} onNext={goNext} onHome={goHome} />
    </div>,
    <div key={3}>
      <p style={S.phase}>The other party</p><p style={S.q}>Are they an individual or a business?</p>
      <Opts value={data.recipientType} onPick={v => pickOption('recipientType', v)} options={[{ v: 'individual', l: 'An individual person' }, { v: 'business', l: 'A business or company' }, { v: 'unsure', l: 'Not sure' }]} />
      <Nav step={step} total={TOTAL_STEPS} onBack={goBack} onNext={goNext} onHome={goHome} />
    </div>,
    <div key={4}>
      <p style={S.phase}>The dispute</p><p style={S.q}>What is this dispute about?</p><p style={S.hint}>Choose the closest match.</p>
      <Opts value={data.disputeType} onPick={v => pickOption('disputeType', v)} options={[
        { v: 'debt', l: 'Money owed to me (unpaid invoice or loan)' },
        { v: 'goods', l: 'Faulty goods or products' },
        { v: 'services', l: 'Unsatisfactory services or work done' },
        { v: 'building', l: 'Building or renovation work gone wrong' },
        { v: 'property', l: 'Damage to my property' },
        { v: 'rent', l: 'Unpaid rent or bond dispute' },
        { v: 'other', l: 'Something else' },
      ]} />
      <Nav step={step} total={TOTAL_STEPS} onBack={goBack} onNext={goNext} onHome={goHome} />
    </div>,
    <div key={5}>
      <p style={S.phase}>What happened</p><p style={S.q}>When did the agreement or relationship begin?</p><p style={S.hint}>An approximate month and year is fine.</p>
      <Field value={data.startDate} onChange={v => set('startDate', v)} label="Date or period" ph="e.g. March 2023 or about mid 2022" />
      <Nav step={step} total={TOTAL_STEPS} onBack={goBack} onNext={goNext} onHome={goHome} />
    </div>,
    <div key={6}>
      <p style={S.phase}>What happened</p><p style={S.q}>What was agreed between you?</p><p style={S.hint}>Describe what they were supposed to do, pay or provide. Be as specific as you can including any amounts, timeframes or key terms.</p>
      <TA value={data.agreement} onChange={v => set('agreement', v)} ph="e.g. They agreed to renovate my kitchen for $15,000 and complete the work by June 2023." />
      <Nav step={step} total={TOTAL_STEPS} onBack={goBack} onNext={goNext} onHome={goHome} />
    </div>,
    <div key={7}>
      <p style={S.phase}>What happened</p><p style={S.q}>What went wrong?</p><p style={S.hint}>Describe what they did or failed to do. Include dates where you can.</p>
      <TA value={data.whatWentWrong} onChange={v => set('whatWentWrong', v)} ph="e.g. The contractor stopped attending site in July 2023 and has not returned calls or emails since." />
      <Nav step={step} total={TOTAL_STEPS} onBack={goBack} onNext={goNext} onHome={goHome} />
    </div>,
    <div key={8}>
      <p style={S.phase}>What happened</p><p style={S.q}>Have you already raised this with them?</p>
      <YN value={data.priorContact} onChange={v => set('priorContact', v)} yl="Yes I have contacted them" nl="No this is first contact" />
      {data.priorContact === 'yes' && <TA value={data.priorContactDetail} onChange={v => set('priorContactDetail', v)} label="What happened when you raised it?" ph="e.g. I emailed them on 1 August 2023. They promised to fix it but nothing has happened since." />}
      <Nav step={step} total={TOTAL_STEPS} onBack={goBack} onNext={goNext} onHome={goHome} />
    </div>,
    <div key={9}>
      <p style={S.phase}>What you want</p><p style={S.q}>What outcome are you seeking?</p>
      <Opts value={data.demandType} onPick={v => pickOption('demandType', v)} options={[
        { v: 'money', l: 'Payment of a sum of money' },
        { v: 'action', l: 'I want them to fix replace or do something' },
        { v: 'both', l: 'Both money and action' },
      ]} />
      <Nav step={step} total={TOTAL_STEPS} onBack={goBack} onNext={goNext} onHome={goHome} />
    </div>,
    <div key={10}>
      <p style={S.phase}>What you want</p><p style={S.q}>Details of your demand</p>
      {needsPayment && <>
        <Field value={data.amountClaimed} onChange={v => set('amountClaimed', v)} label="Total amount claimed ($)" ph="e.g. 5000" type="number" />
        <TA value={data.amountBreakdown} onChange={v => set('amountBreakdown', v)} label="How is this amount made up?" ph="e.g. Unpaid invoice 001 for $4,500 and out of pocket repair costs of $500." />
      </>}
      {(data.demandType === 'action' || data.demandType === 'both') && (
        <TA value={data.actionDemand} onChange={v => set('actionDemand', v)} label="What specifically do you want them to do?" ph="e.g. Return and complete the kitchen renovation to the agreed standard." />
      )}
      <YN value={data.hasEvidence} onChange={v => set('hasEvidence', v)} label="Do you have supporting documents such as receipts invoices or quotes?" yl="Yes" nl="No" />
      <Nav step={step} total={TOTAL_STEPS} onBack={goBack} onNext={goNext} onHome={goHome} />
    </div>,
    <div key={11}>
      <p style={S.phase}>The deadline</p><p style={S.q}>How many days are you giving them to respond?</p><p style={S.hint}>14 days is standard for most disputes.</p>
      <Opts value={data.deadline} onPick={v => pickOption('deadline', v)} options={[
        { v: '7', l: '7 days (urgent matter)' },
        { v: '14', l: '14 days (recommended)' },
        { v: '21', l: '21 days' },
        { v: '28', l: '28 days' },
      ]} />
      <Nav step={step} total={TOTAL_STEPS} onBack={goBack} onNext={goNext} onHome={goHome} />
    </div>,
    <div key={12}>
      <p style={S.phase}>The deadline</p><p style={S.q}>If they ignore this letter what will you do?</p><p style={S.hint}>Be honest as this makes the letter more credible.</p>
      <Opts value={data.consequence} onPick={v => pickOption('consequence', v)} options={[
        { v: 'tribunal', l: 'Lodge an application with a tribunal such as NCAT VCAT or Fair Trading' },
        { v: 'court', l: 'Commence court proceedings' },
        { v: 'regulator', l: 'Complain to a regulator or ombudsman' },
        { v: 'unsure', l: 'Consider all available options' },
      ]} />
      <Nav step={step} total={TOTAL_STEPS} onBack={goBack} onNext={goNext} onHome={goHome} />
    </div>,
    <div key={13}>
      <p style={S.phase}>Payment details</p>
      <p style={S.q}>How should payment be made to you?</p>
      <p style={S.hint}>{needsPayment ? 'Providing your bank details makes it easier for them to comply immediately.' : 'As you are not claiming money you can skip this step and click Review answers.'}</p>
      {needsPayment && <>
        <Field value={data.bankName} onChange={v => set('bankName', v)} label="Bank name" ph="e.g. Commonwealth Bank" />
        <div style={S.g2}>
          <Field value={data.bsb} onChange={v => set('bsb', v)} label="BSB" ph="e.g. 062-204" />
          <Field value={data.accountNumber} onChange={v => set('accountNumber', v)} label="Account number" ph="e.g. 1234 5678" />
        </div>
        <Field value={data.accountName} onChange={v => set('accountName', v)} label="Account name" ph="e.g. Sarah Johnson" />
      </>}
      <Nav step={step} total={TOTAL_STEPS} onBack={goBack} onNext={goNext} onHome={goHome} />
    </div>,
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
