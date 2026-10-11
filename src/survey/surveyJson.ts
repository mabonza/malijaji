import { COLUMNS, COMPARISON, DEMOGRAPHICS, LIKERT, LIKERT_SECTIONS, SCREENING, type Choice } from './questions'

const INTRO_HTML = `
<p>Dear Respondent,</p>
<p>My name is Maledjadji Angy Mabogoane, a Master's student in Marketing Management at the Vaal University of
Technology. I am conducting a research study entitled <strong>“A Comparative Study of the Effectiveness of Social Media
Influencers and Traditional Celebrities in Beauty Product Endorsements.”</strong></p>
<p>The purpose of this study is to compare the influence of social media influencers and traditional celebrities on
consumer perceptions and purchase intentions towards beauty products in South Africa.</p>
<p>Your participation is voluntary. The information you provide will be treated as confidential and used solely for
academic purposes. You are not required to provide your name or any information that directly identifies you.</p>
<p>The questionnaire will take approximately 8–10 minutes to complete. There are no right or wrong answers. Please
answer each question honestly based on your own experiences and opinions.</p>
<p>Thank you for participating in this study.</p>
`

const LIKERT_INSTRUCTIONS_HTML = `
<p>The following sections ask about your perceptions of beauty products endorsed by social media influencers and
traditional celebrities. For each statement, please indicate the extent to which you agree or disagree.</p>
<p>Where the questionnaire refers to a <strong>social media influencer</strong>, think of an influencer you have seen
endorsing a beauty product.</p>
<p>Where the questionnaire refers to a <strong>traditional celebrity</strong>, think of an actor, musician, television
personality, athlete, model, or other well-known public figure you have seen endorsing a beauty product.</p>
`

const radio = (q: Choice) => ({
  type: 'radiogroup',
  name: q.code,
  title: `${q.code}. ${q.title}`,
  isRequired: true,
  choices: q.choices,
  ...(q.hasOther ? { showOtherItem: true, otherText: 'Other (please specify)' } : {}),
})

const SCREENED_OUT = SCREENING.map((q) => `{${q.code}} = 'No'`).join(' or ')

export const surveyJson = {
  title: 'Social Media Influencers vs Traditional Celebrities in Beauty Product Endorsements',
  description: 'Vaal University of Technology · Master of Marketing Management research questionnaire',
  showProgressBar: true,
  progressBarLocation: 'aboveheader',
  progressBarType: 'pages',
  showQuestionNumbers: 'off',
  questionErrorLocation: 'bottom',
  completeText: 'Submit',
  pages: [
    {
      name: 'intro',
      title: 'Introduction',
      elements: [
        { type: 'html', name: 'intro_text', html: INTRO_HTML },
        {
          type: 'radiogroup',
          name: 'consent',
          title: 'Do you agree to take part in this study?',
          isRequired: true,
          choices: ['Yes, I agree to participate', 'No, I do not wish to participate'],
        },
      ],
    },
    {
      name: 'screening',
      title: 'Section 0: Screening questions',
      // Show each screening question only once all earlier ones are "Yes", so a "No" ends the survey straight away.
      elements: SCREENING.map((q, i) => ({
        ...radio(q),
        ...(i > 0 && {
          visibleIf: SCREENING.slice(0, i)
            .map((prev) => `{${prev.code}} = 'Yes'`)
            .join(' and '),
        }),
      })),
    },
    { name: 'A', title: 'Section A: Demographic information', elements: DEMOGRAPHICS.map(radio) },
    ...LIKERT_SECTIONS.map((section, i) => ({
      name: section.name,
      title: section.title,
      description: section.description,
      elements: [
        ...(i === 0 ? [{ type: 'html', name: 'likert_instructions', html: LIKERT_INSTRUCTIONS_HTML }] : []),
        ...section.blocks.map((block) => ({
          type: 'matrix',
          name: block.name,
          title: block.title,
          isRequired: true,
          eachRowRequired: true,
          alternateRows: true,
          columns: LIKERT,
          rows: block.items.map(([code, text]) => ({ value: code, text: `${code}. ${text}` })),
        })),
      ],
    })),
    {
      name: 'G',
      title: 'Section G: Comparison between social media influencers and traditional celebrities',
      elements: COMPARISON.map(radio),
    },
  ],
  triggers: [
    { type: 'complete', expression: "{consent} = 'No, I do not wish to participate'" },
    { type: 'complete', expression: SCREENED_OUT },
  ],
  completedHtml: `
    <h3>Thank you</h3>
    <p>Thank you for taking the time to complete this questionnaire. Your responses will contribute to understanding
    the comparative effectiveness of social media influencers and traditional celebrities in beauty product
    endorsements in South Africa.</p>`,
  completedHtmlOnCondition: [
    {
      expression: "{consent} = 'No, I do not wish to participate'",
      html: '<h3>Thank you</h3><p>You have chosen not to participate. You may now close this page.</p>',
    },
    {
      expression: SCREENED_OUT,
      html: `<h3>Thank you for your interest</h3>
        <p>Unfortunately you do not meet the criteria for this study, so the questionnaire ends here.
        We appreciate your time.</p>`,
    },
  ],
}

export type ResponseStatus = 'completed' | 'screened_out' | 'declined'

/** Flattens SurveyJS data into one database row: one column per questionnaire item. */
export function toRow(data: Record<string, any>, durationSeconds: number) {
  const status: ResponseStatus = data.consent?.startsWith('No')
    ? 'declined'
    : SCREENING.some((q) => data[q.code] === 'No')
      ? 'screened_out'
      : 'completed'

  const likert: Record<string, number> = Object.assign(
    {},
    ...LIKERT_SECTIONS.flatMap((s) => s.blocks.map((b) => data[b.name] ?? {})),
  )

  const row: Record<string, string | number | null> = {
    status,
    duration_seconds: durationSeconds,
    consent: data.consent ?? null,
  }
  for (const col of COLUMNS) {
    if (col.kind === 'likert') {
      row[col.name] = likert[col.name] ?? null
    } else if (col.name.endsWith('_other')) {
      row[col.name] = data[`${col.name.replace('_other', '')}-Comment`] ?? null
    } else {
      row[col.name] = data[col.name] === 'other' ? 'Other' : (data[col.name] ?? null)
    }
  }
  return row
}
