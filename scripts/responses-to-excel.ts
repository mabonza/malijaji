// Turns the CSV downloaded from Supabase (Table Editor → responses → Export) into an easy-to-read Excel file.
//   npm run excel                          uses the newest responses_rows*.csv in your Downloads folder
//   npm run excel -- "C:\path\to\file.csv"  uses that file instead
// The Excel file is saved in the same folder as the CSV.

import ExcelJS from 'exceljs'
import type { Fill, Row as SheetRow } from 'exceljs'
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { homedir } from 'node:os'
import { dirname, join } from 'node:path'
import { COLUMNS, COMPARISON, DEMOGRAPHICS, LIKERT, LIKERT_SECTIONS, SCREENING } from '../src/survey/questions.ts'
import type { Choice } from '../src/survey/questions.ts'

type Response = Record<string, string>
type Item = { code: string; question: string; answers: string; likert: boolean; hasOther: boolean }

const LIKERT_ANSWERS = LIKERT.map((o) => `${o.value} = ${o.text}`).join(', ')
const LIKERT_LABELS = new Map(LIKERT.map((o) => [String(o.value), `${o.value} – ${o.text}`]))
const STATUS_LABELS: Record<string, string> = { completed: 'Completed', screened_out: 'Screened out', declined: 'Declined' }

const choiceItem = (q: Choice): Item => ({
  code: q.code,
  question: q.title,
  answers: [...q.choices, ...(q.hasOther ? ['Other (please specify)'] : [])].join('; '),
  likert: false,
  hasOther: !!q.hasOther,
})

// Questionnaire sections in order, each split into its influencer and celebrity blocks.
const GROUPS: { title: string; items: Item[] }[] = [
  { title: 'Section 0: Screening questions', items: SCREENING.map(choiceItem) },
  { title: 'Section A: Demographic information', items: DEMOGRAPHICS.map(choiceItem) },
  ...LIKERT_SECTIONS.flatMap((section) =>
    section.blocks.map((block) => ({
      title: `${section.title} — ${block.title}`,
      items: block.items.map(([code, question]) => ({ code, question, answers: LIKERT_ANSWERS, likert: true, hasOther: false })),
    })),
  ),
  {
    title: 'Section G: Comparison between social media influencers and traditional celebrities',
    items: COMPARISON.map(choiceItem),
  },
]

const DATE_FORMAT = 'd mmm yyyy hh:mm'
const solid = (argb: string): Fill => ({ type: 'pattern', pattern: 'solid', fgColor: { argb } })
const HEADER_FILL = solid('FFD9E1F2')
const SECTION_FILL = solid('FFEDEDED')
// Lighter = disagree, darker = agree, so patterns stand out when scrolling down a respondent's column.
const LIKERT_FILLS = ['FFF5F8FC', 'FFE1E9F5', 'FFC9D8EE', 'FFADC4E5', 'FF8FAEDA'].map(solid)

function parseCsv(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let quoted = false
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') {
        field += '"'
        i++
      } else if (ch === '"') quoted = false
      else field += ch
    } else if (ch === '"') quoted = true
    else if (ch === ',') {
      row.push(field)
      field = ''
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i++
      row.push(field)
      rows.push(row)
      row = []
      field = ''
    } else field += ch
  }
  if (field || row.length) rows.push([...row, field])
  return rows.filter((r) => r.some((f) => f !== ''))
}

function readResponses(file: string): Response[] {
  const [header, ...lines] = parseCsv(readFileSync(file, 'utf8').replace(/^\uFEFF/, ''))
  return lines
    .map((fields) => {
      // Supabase's export sometimes wraps a whole row in one pair of quotes.
      if (fields.length === 1 && header.length > 1) fields = parseCsv(fields[0])[0]
      return Object.fromEntries(header.map((name, i) => [name, fields[i] ?? '']))
    })
    .sort((a, b) => a.created_at.localeCompare(b.created_at))
}

function newestDownload(): string {
  const dir = join(homedir(), 'Downloads')
  const files = readdirSync(dir)
    .filter((f) => /^responses_rows.*\.csv$/i.test(f))
    .map((f) => join(dir, f))
    .sort((a, b) => statSync(b).mtimeMs - statSync(a).mtimeMs)
  if (!files.length) {
    console.error(`No responses_rows*.csv found in ${dir}.\nDownload it from Supabase first, or run: npm run excel -- "path\\to\\file.csv"`)
    process.exit(1)
  }
  return files[0]
}

// Supabase stores UTC times like "2026-10-12 05:22:35.527414+00". Excel has no time zones, so keep this computer's local time.
function localTime(value: string): Date | null {
  if (!value) return null
  const utc = new Date(value.replace(' ', 'T').replace(/(\.\d{3})\d*/, '$1').replace(/([+-]\d\d)$/, '$1:00'))
  return new Date(utc.getTime() - utc.getTimezoneOffset() * 60_000)
}

const minutes = (r: Response) => (r.duration_seconds ? Math.round(Number(r.duration_seconds) / 6) / 10 : null)

function answer(r: Response, item: Item): string | null {
  const value = r[item.code]
  if (!value) return null
  if (item.likert) return LIKERT_LABELS.get(value) ?? value
  if (item.hasOther && value === 'Other' && r[`${item.code}_other`]) return `Other: ${r[`${item.code}_other`]}`
  return value
}

// Bold and shade a whole row across the sheet's width, not just the cells that have text.
function fillRow(row: SheetRow, fill: Fill, width: number) {
  row.font = { bold: true }
  for (let c = 1; c <= width; c++) row.getCell(c).fill = fill
}

const file = process.argv[2] ?? newestDownload()
const responses = readResponses(file)
if (!responses.length) {
  console.error(`${file} has no responses in it yet.`)
  process.exit(1)
}

const workbook = new ExcelJS.Workbook()

// Sheet 1: one column per respondent, with the full question text and answer labels.
const answers = workbook.addWorksheet('Answers', { views: [{ state: 'frozen', xSplit: 2, ySplit: 1 }] })
answers.columns = [
  { header: 'Code', width: 9 },
  { header: 'Question', width: 70 },
  ...responses.map((_, i) => ({ header: `Respondent ${i + 1}`, width: 26 })),
]
answers.addRow(['', 'Submitted', ...responses.map((r) => localTime(r.created_at))]).eachCell((c) => (c.numFmt = DATE_FORMAT))
answers.addRow(['', 'Status', ...responses.map((r) => STATUS_LABELS[r.status] ?? r.status)])
answers.addRow(['', 'Time taken (minutes)', ...responses.map(minutes)])
answers.addRow(['', 'Consent', ...responses.map((r) => r.consent || null)])
for (const group of GROUPS) {
  fillRow(answers.addRow(['', group.title]), SECTION_FILL, answers.columnCount)
  for (const item of group.items) {
    const row = answers.addRow([item.code, item.question, ...responses.map((r) => answer(r, item))])
    if (item.likert) {
      responses.forEach((r, i) => {
        const fill = LIKERT_FILLS[Number(r[item.code]) - 1]
        if (fill) row.getCell(i + 3).fill = fill
      })
    }
  }
}
answers.eachRow((row) => (row.alignment = { vertical: 'top', wrapText: true }))
fillRow(answers.getRow(1), HEADER_FILL, answers.columnCount)

// Sheet 2: one row per respondent with plain values (Likert as 1–5), ready for Excel formulas, SPSS or R.
const data = workbook.addWorksheet('Data', { views: [{ state: 'frozen', xSplit: 1, ySplit: 1 }] })
data.columns = [
  { header: 'Respondent', key: 'respondent', width: 12 },
  { header: 'Submitted', key: 'submitted', width: 18, style: { numFmt: DATE_FORMAT } },
  { header: 'status', key: 'status', width: 14 },
  { header: 'Minutes', key: 'minutes', width: 9 },
  { header: 'consent', key: 'consent', width: 28 },
  ...COLUMNS.map((c) => ({ header: c.name, key: c.name, width: c.kind === 'likert' ? 6 : 18 })),
  { header: 'id', key: 'id', width: 38 },
]
responses.forEach((r, i) =>
  data.addRow({
    respondent: i + 1,
    submitted: localTime(r.created_at),
    status: r.status,
    minutes: minutes(r),
    consent: r.consent || null,
    ...Object.fromEntries(
      COLUMNS.map((c) => [c.name, !r[c.name] ? null : c.kind === 'likert' ? Number(r[c.name]) : r[c.name]]),
    ),
    id: r.id,
  }),
)
fillRow(data.getRow(1), HEADER_FILL, data.columnCount)
for (const group of GROUPS) for (const item of group.items) data.getRow(1).getCell(item.code).note = item.question
data.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: data.columnCount } }

// Sheet 3: what each column code means, e.g. for a methodology appendix.
const codebook = workbook.addWorksheet('Codebook', { views: [{ state: 'frozen', ySplit: 1 }] })
codebook.columns = [
  { header: 'Code', width: 10 },
  { header: 'Section', width: 45 },
  { header: 'Question', width: 70 },
  { header: 'Possible answers', width: 60 },
]
for (const group of GROUPS) {
  for (const item of group.items) {
    codebook.addRow([item.code, group.title, item.question, item.answers])
    if (item.hasOther) codebook.addRow([`${item.code}_other`, group.title, `${item.question} (other)`, 'Text typed when "Other" was chosen'])
  }
}
codebook.eachRow((row) => (row.alignment = { vertical: 'top', wrapText: true }))
fillRow(codebook.getRow(1), HEADER_FILL, codebook.columnCount)

const out = join(dirname(file), `Survey responses ${new Date().toLocaleDateString('en-CA')}.xlsx`)
try {
  await workbook.xlsx.writeFile(out)
} catch (error) {
  if ((error as NodeJS.ErrnoException).code === 'EBUSY') {
    console.error(`${out} is open in Excel. Close it and run this again.`)
    process.exit(1)
  }
  throw error
}
console.log(`Saved ${responses.length} response(s) from ${file}\n  → ${out}`)
