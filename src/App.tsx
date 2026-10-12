import { useEffect, useState } from 'react'
import { Model } from 'survey-core'
import { Survey } from 'survey-react-ui'
import { SURVEY_SUBTITLE, SURVEY_TITLE, surveyJson, toRow } from './survey/surveyJson'
import { saveResponse } from './supabase'
import { theme } from './theme'

const DRAFT_KEY = 'questionnaire-draft'

// Draft storage is a convenience only: if the browser blocks it, the survey still works.
function loadDraft() {
  try {
    return JSON.parse(localStorage.getItem(DRAFT_KEY) ?? 'null')
  } catch {
    return null
  }
}
function storeDraft(value: unknown) {
  try {
    if (value === null) localStorage.removeItem(DRAFT_KEY)
    else localStorage.setItem(DRAFT_KEY, JSON.stringify(value))
  } catch {
    /* ignore */
  }
}

function createSurvey() {
  const survey = new Model(surveyJson)
  survey.applyTheme(theme)

  const draft = loadDraft()
  if (draft) {
    survey.data = draft.data
    survey.currentPageNo = draft.pageNo
  }
  const startedAt = draft?.startedAt ?? Date.now()

  const save = () => storeDraft({ data: survey.data, pageNo: survey.currentPageNo, startedAt })
  survey.onValueChanged.add(save)
  survey.onCurrentPageChanged.add(save)

  survey.onComplete.add(async (sender, options) => {
    options.showSaveInProgress('Submitting your responses…')
    const row = toRow(sender.data, Math.round((Date.now() - startedAt) / 1000))
    try {
      await saveResponse(row)
      storeDraft(null)
      options.showSaveSuccess('')
    } catch (err) {
      console.error(err)
      // Keep the draft so nothing is lost; the respondent can retry.
      options.showSaveError('Your responses could not be submitted. Please check your connection and try again.')
    }
  })

  return survey
}

type Progress = { step: number; steps: number; section: string; name: string; done: boolean }

// Page titles look like "Section B: Source credibility"; the progress strip shows the two parts separately.
function readProgress(survey: Model, done = false): Progress {
  const title = survey.currentPage?.title ?? ''
  const match = /^(Section \w+):\s*(.*)$/.exec(title)
  return {
    step: survey.currentPageNo + 1,
    steps: survey.visiblePageCount,
    section: match?.[1] ?? '',
    name: match?.[2] ?? title,
    done,
  }
}

function useProgress(survey: Model) {
  const [progress, setProgress] = useState(() => readProgress(survey))
  useEffect(() => {
    const onPage = () => setProgress(readProgress(survey))
    const onDone = () => setProgress(readProgress(survey, true))
    survey.onCurrentPageChanged.add(onPage)
    survey.onComplete.add(onDone)
    return () => {
      survey.onCurrentPageChanged.remove(onPage)
      survey.onComplete.remove(onDone)
    }
  }, [survey])
  return progress
}

const icon = { width: 16, height: 16, viewBox: '0 0 24 24', 'aria-hidden': true } as const

function Hero({ compact }: { compact: boolean }) {
  return (
    <header className={compact ? 'hero hero--compact' : 'hero'}>
      <div className="hero__inner">
        <p className="hero__eyebrow">{SURVEY_SUBTITLE}</p>
        <h1 className="hero__title">{SURVEY_TITLE}</h1>
        {!compact && (
          <ul className="hero__facts">
            <li>
              <svg {...icon}>
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5l3 2" />
              </svg>
              8–10 minutes
            </li>
            <li>
              <svg {...icon}>
                <rect x="5" y="11" width="14" height="10" rx="2" />
                <path d="M8 11V8a4 4 0 0 1 8 0v3" />
              </svg>
              Confidential
            </li>
            <li>
              <svg {...icon}>
                <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" />
              </svg>
              Voluntary
            </li>
          </ul>
        )}
      </div>
    </header>
  )
}

function ProgressStrip({ progress }: { progress: Progress }) {
  return (
    <div
      className="progress"
      role="progressbar"
      aria-valuemin={1}
      aria-valuemax={progress.steps}
      aria-valuenow={progress.step}
      aria-valuetext={`Step ${progress.step} of ${progress.steps}: ${progress.name}`}
    >
      <div className="progress__inner">
        <div className="progress__text">
          <span className="progress__name">
            {progress.section && <span className="progress__section">{progress.section}</span>}
            {progress.name}
          </span>
          <span className="progress__step">
            {progress.step} of {progress.steps}
          </span>
        </div>
        <div className="progress__track">
          <div className="progress__fill" style={{ width: `${(progress.step / progress.steps) * 100}%` }} />
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const [survey] = useState(createSurvey)
  const progress = useProgress(survey)
  return (
    <>
      <Hero compact={progress.step > 1 || progress.done} />
      {!progress.done && <ProgressStrip progress={progress} />}
      <main className="content">
        <Survey model={survey} />
      </main>
      <footer className="footer">
        <p>Your responses are confidential and used solely for academic purposes.</p>
        <p>Researcher: Maledjadji Angy Mabogoane · {SURVEY_SUBTITLE}</p>
      </footer>
    </>
  )
}
