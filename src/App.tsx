import { useState } from 'react'
import { Model } from 'survey-core'
import { Survey } from 'survey-react-ui'
import DefaultLight from 'survey-core/themes/default-light'
import 'survey-core/survey-core.css'
import { surveyJson, toRow } from './survey/surveyJson'
import { saveResponse } from './supabase'

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
  survey.applyTheme(DefaultLight)

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

export default function App() {
  const [survey] = useState(createSurvey)
  return <Survey model={survey} />
}
