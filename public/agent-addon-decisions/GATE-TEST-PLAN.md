# Gate click-through

Use a fresh participant for each row. The automated checks in `src/public/agent-addon-decisions/assets/surveyFlow.spec.ts` cover arm contents, listing balance, required flags, and item order. The rows below are the clicks those checks cannot make. Advance is blocked, with a validation message, if a required question is empty.

Entry URLs, with the dev server on port 8080:

- Prolific: `/agent-addon-decisions?PROLIFIC_PID=gate-test`
- RIT: `/agent-addon-decisions?arm=RIT`
- Northeastern: `/agent-addon-decisions?arm=NORTHEASTERN`
- UTEP: `/agent-addon-decisions?arm=UTEP`

Answer E1 and E3 "Yes", and fill E4 through E9, unless the row says otherwise. On Prolific, agree to both consents unless the row says otherwise.

## Gates

| Case | Where | Answer | Next screen | Must not appear |
|---|---|---|---|---|
| G1 | Item 3 | Yes, let us use that one | Item 6 | Items 4 and 5 |
| G2 | Item 3 | I would rather describe a different one — including one I decided against, or one I removed | Item 4 | |
| G3 | Item 10 | Yes, I looked into it first | Item 10 checklist | |
| G4 | Item 10 | No, I did not look into it beforehand | Item 11 | Item 10 checklist |
| G5 | Item 10 | I do not remember | Item 11 | Item 10 checklist |
| G6 | Item 12 | Yes | What happened at that point | |
| G7 | Item 12 | No | Items 13 and 14 | The item 12 follow-up |
| G8 | Item 12 | I do not remember | Items 13 and 14 | The item 12 follow-up |
| G9 | Item 17 | Yes | The access checklist | |
| G10 | Item 17 | No, none of them | Item 18 | The access checklist |
| G11 | Item 17 | I do not know | Item 18 | The access checklist |
| G12 | Item 18 | Yes | What happened | |
| G13 | Item 18 | No | Item 19 | The item 18 follow-up |
| G14 | Item 18 | Not sure | Item 19 | The item 18 follow-up |
| G15 | Item 19 | Yes | Briefly, why | |
| G16 | Item 19 | No | Items 20 and 21 | The item 19 follow-up |
| G17 | Item 19 | Not sure | Items 20 and 21 | The item 19 follow-up |
| G18 | Item 28 | Yes | The contact question | |
| G19 | Item 28 | No | Item 30 | The contact question |

Item 11 is 11a after "I set it up and used it", "I changed the settings on one I already had", or "Something else". It is 11b after either removal answer or "I looked at it and decided not to use it". The Other write-in on item 6 also shows 11a.

## Required, with nothing selected

Click Next with the question empty. Next stays blocked and a validation message shows.

Item 3, item 6, item 10, item 12, item 17, item 18, item 19, item 22, item 23, item 25, item 27, item 28. Also E1 through E9 and both consent agreements.

Items 24, 26, 29, and 30, and the Yes follow-ups, still advance when left blank.

## Arms

| Case | Entry | Path |
|---|---|---|
| A1 | Prolific id | Screener consent, E1, E2 with E3, E4 through E9, main consent, items 1 to 30, Prolific debrief, return to Prolific |
| A2 | `arm=RIT` | University consent, E1, E2 with E3, E4 through E9, items 1 to 30, campus debrief, gift card, thank-you |
| A3 | `arm=NORTHEASTERN` | Same as RIT |
| A4 | `arm=UTEP` | Same as RIT |

On A2, A3, and A4, confirm E8 (background) is on the E4 through E9 page and can be answered.

## Screen-out and decline

| Case | Entry | Answer | Lands on | Must not reach |
|---|---|---|---|---|
| S1 | Prolific | E1 = No | Paid screen-out | Debrief, any later item |
| S2 | Prolific | E3 = No | Paid screen-out | Debrief |
| S3 | Prolific | Screener = I do not agree. | Return to Prolific, not the completion payment | Any item |
| S4 | Any campus | E1 = Not sure | Unpaid closing page | Gift card, debrief |
| S5 | Any campus | Consent = I do not agree. | Close page | Any item |

E3 has no "None of these" answer. No and Not sure are the answers that end the survey. Repeat S1 and S4 with E3 = Not sure as well as E1.

## Listings

Across the twenty arm passes, InboxLane's detailed card and its one-line card should each appear about half the time. DocPolish-first and DocPolish Plus-first should do the same. One person sees one InboxLane card, never both.
