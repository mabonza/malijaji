// Questionnaire content, transcribed from "QUESTIONNAIRE LONG.pdf".
// Each item code (S1, A1, B1, ...) becomes one column in the responses table.

export const LIKERT = [
  { value: 1, text: 'Strongly disagree' },
  { value: 2, text: 'Disagree' },
  { value: 3, text: 'Neutral' },
  { value: 4, text: 'Agree' },
  { value: 5, text: 'Strongly agree' },
]

export type Choice = {
  code: string
  title: string
  choices: string[]
  hasOther?: boolean
}

export type LikertBlock = {
  name: string
  title: string
  items: [code: string, text: string][]
}

export type LikertSection = {
  name: string
  title: string
  description: string
  blocks: LikertBlock[]
}

export const SCREENING: Choice[] = [
  { code: 'S1', title: 'Are you 18 years or older?', choices: ['Yes', 'No'] },
  { code: 'S2', title: 'Do you currently reside in South Africa?', choices: ['Yes', 'No'] },
  { code: 'S3', title: 'Have you purchased a beauty product within the past 12 months?', choices: ['Yes', 'No'] },
  { code: 'S4', title: 'Do you use at least one social media platform?', choices: ['Yes', 'No'] },
  {
    code: 'S5',
    title: 'Have you seen beauty products endorsed by both social media influencers and traditional celebrities?',
    choices: ['Yes', 'No'],
  },
]

export const DEMOGRAPHICS: Choice[] = [
  { code: 'A1', title: 'What is your age?', choices: ['18–24', '25–34', '35–44', '45–54', '55 or older'] },
  {
    code: 'A2',
    title: 'What is your gender?',
    choices: ['Male', 'Female', 'Non-binary', 'Prefer not to say'],
    hasOther: true,
  },
  {
    code: 'A3',
    title: 'What is your highest level of education?',
    choices: [
      'Secondary school',
      'Certificate',
      'Diploma',
      "Bachelor's degree",
      'Honours degree',
      "Master's degree",
      'Doctoral degree',
    ],
    hasOther: true,
  },
  {
    code: 'A4',
    title: 'What is your employment status?',
    choices: ['Employed full-time', 'Employed part-time', 'Self-employed', 'Student', 'Unemployed', 'Retired'],
    hasOther: true,
  },
  {
    code: 'A5',
    title: 'How often do you use social media?',
    choices: ['Less than once a week', 'A few times a week', 'Once a day', 'Several times a day', 'Almost continuously'],
  },
  {
    code: 'A6',
    title: 'Which social media platform do you use most frequently?',
    choices: ['Instagram', 'TikTok', 'Facebook', 'YouTube', 'X', 'WhatsApp'],
    hasOther: true,
  },
]

const SMI = 'Social media influencer'
const TC = 'Traditional celebrity'

export const LIKERT_SECTIONS: LikertSection[] = [
  {
    name: 'B',
    title: 'Section B: Source credibility',
    description:
      'This section measures the perceived credibility of social media influencers and traditional celebrities when endorsing beauty products (expertise, trustworthiness and attractiveness).',
    blocks: [
      {
        name: 'B_SMI',
        title: SMI,
        items: [
          ['B1', 'The social media influencer I have seen endorsing beauty products is knowledgeable about beauty products.'],
          ['B2', 'The social media influencer has sufficient expertise to recommend beauty products.'],
          ['B3', "I consider the social media influencer's beauty product recommendations to be reliable."],
          ['B4', 'I consider the social media influencer to be honest when discussing beauty products.'],
          ['B5', "I trust the social media influencer's opinions about beauty products."],
          ['B6', 'The social media influencer is attractive.'],
          ['B7', 'The social media influencer is likeable.'],
          ['B8', 'Overall, I consider the social media influencer to be a credible source of information about beauty products.'],
        ],
      },
      {
        name: 'B_TC',
        title: TC,
        items: [
          ['B9', 'The traditional celebrity I have seen endorsing beauty products is knowledgeable about beauty products.'],
          ['B10', 'The traditional celebrity has sufficient expertise to recommend beauty products.'],
          ['B11', "I consider the traditional celebrity's beauty product recommendations to be reliable."],
          ['B12', 'I consider the traditional celebrity to be honest when discussing beauty products.'],
          ['B13', "I trust the traditional celebrity's opinions about beauty products."],
          ['B14', 'The traditional celebrity is attractive.'],
          ['B15', 'The traditional celebrity is likeable.'],
          ['B16', 'Overall, I consider the traditional celebrity to be a credible source of information about beauty products.'],
        ],
      },
    ],
  },
  {
    name: 'C',
    title: 'Section C: Perceived authenticity',
    description:
      'This section measures how genuine, sincere, relatable and believable you perceive the endorsement to be.',
    blocks: [
      {
        name: 'C_SMI',
        title: SMI,
        items: [
          ['C1', 'The social media influencer appears genuine when endorsing beauty products.'],
          ['C2', 'The social media influencer appears sincere when recommending beauty products.'],
          ['C3', "The social media influencer's endorsement appears authentic rather than purely commercial."],
          ['C4', "The social media influencer's recommendations seem consistent with their usual content."],
          ['C5', 'The social media influencer appears relatable when discussing beauty products.'],
          ['C6', 'I believe the social media influencer genuinely uses or supports the beauty products they endorse.'],
        ],
      },
      {
        name: 'C_TC',
        title: TC,
        items: [
          ['C7', 'The traditional celebrity appears genuine when endorsing beauty products.'],
          ['C8', 'The traditional celebrity appears sincere when recommending beauty products.'],
          ['C9', "The traditional celebrity's endorsement appears authentic rather than purely commercial."],
          ['C10', "The traditional celebrity's endorsement is consistent with their public image."],
          ['C11', 'The traditional celebrity appears relatable when discussing beauty products.'],
          ['C12', 'I believe the traditional celebrity genuinely uses or supports the beauty products they endorse.'],
        ],
      },
    ],
  },
  {
    name: 'D',
    title: 'Section D: Parasocial relationships',
    description:
      'This section measures the extent to which you feel familiar, emotionally connected or socially connected to the endorser.',
    blocks: [
      {
        name: 'D_SMI',
        title: SMI,
        items: [
          ['D1', 'I feel familiar with the social media influencer.'],
          ['D2', 'I feel that I know the social media influencer personally.'],
          ['D3', 'I feel emotionally connected to the social media influencer.'],
          ['D4', 'I would miss seeing content from this social media influencer if they stopped posting.'],
          ['D5', 'I feel that the social media influencer understands people like me.'],
          ['D6', 'I enjoy following the social media influencer even when they are not promoting a product.'],
        ],
      },
      {
        name: 'D_TC',
        title: TC,
        items: [
          ['D7', 'I feel familiar with the traditional celebrity.'],
          ['D8', 'I feel that I know the traditional celebrity personally.'],
          ['D9', 'I feel emotionally connected to the traditional celebrity.'],
          ['D10', 'I would miss seeing the traditional celebrity if they were no longer visible in the media.'],
          ['D11', 'I feel that the traditional celebrity understands people like me.'],
          ['D12', 'I enjoy following or watching the traditional celebrity even when they are not promoting a product.'],
        ],
      },
    ],
  },
  {
    name: 'E',
    title: 'Section E: Consumer perceptions of beauty products',
    description:
      'This section measures your overall perceptions of beauty products endorsed by social media influencers and traditional celebrities.',
    blocks: [
      {
        name: 'E_SMI',
        title: 'Social media influencer-endorsed beauty products',
        items: [
          ['E1', 'I have a favourable perception of beauty products endorsed by social media influencers.'],
          ['E2', 'Beauty products endorsed by social media influencers appear trustworthy to me.'],
          ['E3', 'Beauty products endorsed by social media influencers appear to be of good quality.'],
          ['E4', 'Social media influencer endorsements improve my perception of the endorsed beauty product.'],
          ['E5', 'Social media influencer endorsements make beauty products more appealing to me.'],
          ['E6', 'I have a positive attitude towards beauty products endorsed by social media influencers.'],
          ['E7', 'I am more likely to consider a beauty product positively when it is endorsed by a social media influencer I trust.'],
        ],
      },
      {
        name: 'E_TC',
        title: 'Traditional celebrity-endorsed beauty products',
        items: [
          ['E8', 'I have a favourable perception of beauty products endorsed by traditional celebrities.'],
          ['E9', 'Beauty products endorsed by traditional celebrities appear trustworthy to me.'],
          ['E10', 'Beauty products endorsed by traditional celebrities appear to be of good quality.'],
          ['E11', 'Traditional celebrity endorsements improve my perception of the endorsed beauty product.'],
          ['E12', 'Traditional celebrity endorsements make beauty products more appealing to me.'],
          ['E13', 'I have a positive attitude towards beauty products endorsed by traditional celebrities.'],
          ['E14', 'I am more likely to consider a beauty product positively when it is endorsed by a traditional celebrity I trust.'],
        ],
      },
    ],
  },
  {
    name: 'F',
    title: 'Section F: Purchase intention towards beauty products',
    description:
      'This section measures your intention to purchase beauty products endorsed by social media influencers and traditional celebrities.',
    blocks: [
      {
        name: 'F_SMI',
        title: 'Social media influencer-endorsed beauty products',
        items: [
          ['F1', 'I would consider purchasing a beauty product endorsed by a social media influencer I trust.'],
          ['F2', 'I am likely to purchase a beauty product recommended by a social media influencer.'],
          ['F3', 'I would consider trying a beauty product endorsed by a social media influencer.'],
          ['F4', "A social media influencer's endorsement can increase my intention to purchase a beauty product."],
          ['F5', 'If I needed a beauty product, I would consider one endorsed by a social media influencer.'],
        ],
      },
      {
        name: 'F_TC',
        title: 'Traditional celebrity-endorsed beauty products',
        items: [
          ['F6', 'I would consider purchasing a beauty product endorsed by a traditional celebrity I trust.'],
          ['F7', 'I am likely to purchase a beauty product recommended by a traditional celebrity.'],
          ['F8', 'I would consider trying a beauty product endorsed by a traditional celebrity.'],
          ['F9', "A traditional celebrity's endorsement can increase my intention to purchase a beauty product."],
          ['F10', 'If I needed a beauty product, I would consider one endorsed by a traditional celebrity.'],
        ],
      },
    ],
  },
]

const COMPARE = ['Social media influencers', 'Traditional celebrities', 'Both equally', 'Neither']

export const COMPARISON: Choice[] = [
  { code: 'G1', title: 'Which type of endorser do you generally find more credible when endorsing beauty products?', choices: COMPARE },
  { code: 'G2', title: 'Which type of endorser do you perceive as more authentic when endorsing beauty products?', choices: COMPARE },
  { code: 'G3', title: 'Which type of endorser do you feel more connected to?', choices: COMPARE },
  { code: 'G4', title: 'Which type of endorser has a greater influence on your perception of beauty products?', choices: COMPARE },
  { code: 'G5', title: 'Which type of endorser has a greater influence on your intention to purchase beauty products?', choices: COMPARE },
  {
    code: 'G6',
    title: 'Overall, which endorsement type do you consider more effective for beauty products?',
    choices: ['Social media influencers', 'Traditional celebrities', 'Both are equally effective', 'Neither is effective'],
  },
]

// Database columns in questionnaire order. "Other" answers get an extra _other text column.
export const COLUMNS: { name: string; kind: 'text' | 'likert' }[] = [
  ...[...SCREENING, ...DEMOGRAPHICS].flatMap((q) => [
    { name: q.code, kind: 'text' as const },
    ...(q.hasOther ? [{ name: `${q.code}_other`, kind: 'text' as const }] : []),
  ]),
  ...LIKERT_SECTIONS.flatMap((s) => s.blocks.flatMap((b) => b.items.map(([code]) => ({ name: code, kind: 'likert' as const })))),
  ...COMPARISON.map((q) => ({ name: q.code, kind: 'text' as const })),
]
