-- Quick summary report. In Supabase: SQL Editor → New query → paste this whole file.
-- Then highlight ONE of the numbered queries and click Run (Ctrl+Enter) to see its table.
-- Each result table can be downloaded with the Export / Download CSV button above the results.

-- 1. How many people took part
select status, count(*) as respondents
from public.responses
group by status
order by respondents desc;

-- 2. Profile of respondents (Section A), completed responses only
select question, answer, count(*) as respondents,
  round(100.0 * count(*) / sum(count(*)) over (partition by question), 1) as percent
from public.responses
cross join lateral (values
  ('A1. Age', "A1"),
  ('A2. Gender', coalesce("A2" || ': ' || "A2_other", "A2")),
  ('A3. Education', coalesce("A3" || ': ' || "A3_other", "A3")),
  ('A4. Employment', coalesce("A4" || ': ' || "A4_other", "A4")),
  ('A5. Social media use', "A5"),
  ('A6. Main platform', coalesce("A6" || ': ' || "A6_other", "A6"))
) as a(question, answer)
where status = 'completed'
group by question, answer
order by question, respondents desc;

-- 3. Average scores, influencers vs celebrities (1 = strongly disagree … 5 = strongly agree)
with scores as (
  select
    ("B1" + "B2" + "B3" + "B4" + "B5" + "B6" + "B7" + "B8") / 8.0 as b_smi,
    ("B9" + "B10" + "B11" + "B12" + "B13" + "B14" + "B15" + "B16") / 8.0 as b_tc,
    ("C1" + "C2" + "C3" + "C4" + "C5" + "C6") / 6.0 as c_smi,
    ("C7" + "C8" + "C9" + "C10" + "C11" + "C12") / 6.0 as c_tc,
    ("D1" + "D2" + "D3" + "D4" + "D5" + "D6") / 6.0 as d_smi,
    ("D7" + "D8" + "D9" + "D10" + "D11" + "D12") / 6.0 as d_tc,
    ("E1" + "E2" + "E3" + "E4" + "E5" + "E6" + "E7") / 7.0 as e_smi,
    ("E8" + "E9" + "E10" + "E11" + "E12" + "E13" + "E14") / 7.0 as e_tc,
    ("F1" + "F2" + "F3" + "F4" + "F5") / 5.0 as f_smi,
    ("F6" + "F7" + "F8" + "F9" + "F10") / 5.0 as f_tc
  from public.responses
  where status = 'completed'
)
select construct, count(*) as respondents,
  round(avg(smi), 2) as influencers_mean,
  round(stddev(smi), 2) as influencers_sd,
  round(avg(tc), 2) as celebrities_mean,
  round(stddev(tc), 2) as celebrities_sd,
  round(avg(smi - tc), 2) as difference
from scores
cross join lateral (values
  (1, 'B. Source credibility', b_smi, b_tc),
  (2, 'C. Perceived authenticity', c_smi, c_tc),
  (3, 'D. Parasocial relationships', d_smi, d_tc),
  (4, 'E. Perceptions of beauty products', e_smi, e_tc),
  (5, 'F. Purchase intention', f_smi, f_tc)
) as c(ord, construct, smi, tc)
group by ord, construct
order by ord;

-- 4. Direct comparison questions (Section G), completed responses only
select question, answer, count(*) as respondents,
  round(100.0 * count(*) / sum(count(*)) over (partition by question), 1) as percent
from public.responses
cross join lateral (values
  ('G1. More credible', "G1"),
  ('G2. More authentic', "G2"),
  ('G3. Feel more connected to', "G3"),
  ('G4. Greater influence on perception', "G4"),
  ('G5. Greater influence on purchase intention', "G5"),
  ('G6. More effective overall', "G6")
) as g(question, answer)
where status = 'completed'
group by question, answer
order by question, respondents desc;
