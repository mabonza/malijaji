# Beauty Endorsements Questionnaire

Online version of *"A Comparative Study of the Effectiveness of Social Media Influencers and Traditional Celebrities
in Beauty Product Endorsements"* (Vaal University of Technology). Built with React, SurveyJS and Supabase.

## What it does

- Introduction and consent page, then sections 0 and A–G exactly as in the PDF.
- Screening: a "No" to any of S1–S5 ends the survey with a polite message.
- All questions are required; the Likert grids turn into one statement at a time on phones.
- Progress is saved in the browser, so a respondent who closes the tab can continue later.
- Every submission (including screened-out and declined ones) is stored as **one row with one column per item**
  (`S1`… `A6`, `B1`…`F10` as numbers 1–5, `G1`…`G6`), plus `status` and `duration_seconds`.

## 1. Create the database (once, ~5 minutes)

1. Sign up at <https://supabase.com> and create a new project (free tier is enough).
2. Open **SQL Editor → New query**, paste the contents of [`supabase/schema.sql`](supabase/schema.sql) and click **Run**.
3. Open **Project Settings → API** and copy the **Project URL** and the **anon public** key.
4. In this folder, copy `.env.example` to `.env.local` and paste both values in.

Respondents can only *add* responses — they can't see anyone else's answers.

## 2. Run it on your computer

```bash
npm install
npm run dev
```

Open the link it prints (usually <http://localhost:5173>) and fill in a test response.

## 3. Publish it on Cloudways so participants can answer

The Supabase keys are built into the files, so do step 1 (create `.env.local`) **before** building.

1. Build the site on your computer:
   ```bash
   npm run build
   ```
   This creates a `dist` folder containing `index.html` and an `assets` folder.
2. In Cloudways, add an application of type **Custom PHP** (no WordPress needed) and attach your domain.
3. Under **Access Details → Application Credentials**, create SFTP credentials, then connect with FileZilla
   (or any SFTP app).
4. Upload **the contents of** `dist` (not the folder itself) into the application's `public_html` folder.
   You can also upload into a subfolder such as `public_html/survey` to serve it at `yourdomain.com/survey/`.
5. In Cloudways, turn on the free **SSL certificate** (Let's Encrypt) so the link is `https://`.
6. Share the link with participants.

Whenever you change a question, run `npm run build` again and re-upload the `dist` contents.

Delete your test responses in Supabase (**Table Editor → responses**) before sharing the link.

## 4. Download the responses

Supabase → **Table Editor → responses → Export → CSV**. Opens directly in Excel, SPSS or R.
For analysis, filter to `status = completed`; the other rows let you report how many people were screened out.

## Changing questions

All wording lives in [`src/survey/questions.ts`](src/survey/questions.ts). If you add or rename an item,
also add/rename the matching column in Supabase.
