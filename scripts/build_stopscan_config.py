#!/usr/bin/env python3
"""Generates public/stopscan-expert-panel/config.json for the STOP&SCAN expert panel (v4)."""
import json
import collections
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "public" / "stopscan-expert-panel" / "config.json"

LOG = {
    "id": "interactionLog",
    "prompt": "Interaction log",
    "location": "sidebar",
    "type": "reactive",
    "required": False,
    "hidden": True,
}

CASES = [
    ("case2", "Dana", "Case 1", "information"),
    ("case3", "Marcus", "Case 2", "information"),
    ("case4", "Ellen", "Case 3", "information"),
    ("case1", "Rekha", "Case 4", "request"),
]

STEPS = [
    ("source", "STOP and Source", 1),
    ("content", "Content", 2),
    ("alignment", "Alignment", 3),
    ("reflect", "Now Reflect", 4),
]

USEFUL_OPTS = [
    "This step was useful",
    "This step applied, but added nothing useful",
    "This step did not apply to this case",
    "This step led the reasoning in the wrong direction",
]

FIDELITY_OPTS = [
    "Yes, as described",
    "Partly",
    "No",
    "I cannot tell",
]

ELEMENTS = ["STOP", "Source", "Content", "Alignment", "Now Reflect"]
RANK_DEFAULT = {el: str(i) for i, el in enumerate(ELEMENTS)}

# The act STOP is meant to interrupt in each case — not “going further” in general.
STOP_BEFORE = {
    "case2": "resharing this or treating it as a real forecast",
    "case3": "repeating or sharing the claim that the crowd was fake",
    "case4": "treating this photograph as settling the rumours",
    "case1": "sending the money",
}

STOP_VALUE_OPTS = [
    "Yes — there was a good reason to pause here",
    "Only slightly — the situation did not strongly call for it",
    "No — pausing here did not make much sense",
    "I cannot tell",
]


def step_component(cid, name, label_short, step_key, step_label, _step_idx):
    resp = []

    if step_key == "source":
        resp.append({
            "id": "stop_value",
            "prompt": (
                f"Before {STOP_BEFORE[cid]}, was there a good reason to pause?"
            ),
            "secondaryText": (
                "This is the STOP step, not the source check on this page."
            ),
            "location": "sidebar",
            "type": "radio",
            "required": False,
            "options": STOP_VALUE_OPTS,
        })

    resp.append({
        "id": "useful",
        "prompt": "How useful was this step in this case?",
        "secondaryText": (
            f"Judge this step, not {name}. If only part helped, say which part below."
        ),
        "location": "sidebar",
        "type": "radio",
        "required": False,
        "options": USEFUL_OPTS,
    })

    resp.append({
        "id": "fidelity",
        "prompt": "Was this step carried out as STOP&SCAN describes it?",
        "secondaryText": f"How we applied the step, not a score of {name}.",
        "location": "sidebar",
        "type": "radio",
        "required": False,
        "options": FIDELITY_OPTS,
    })

    if step_key in ("content", "alignment"):
        resp.append({
            "id": "enough",
            "prompt": "Given what has been shown so far, is there already enough to stop and decide?",
            "secondaryText": (
                "Whether STOP&SCAN could have stopped here — not whether "
                f"{name} personally should have."
            ),
            "location": "sidebar",
            "type": "radio",
            "required": False,
            "options": ["Yes", "No", "I cannot tell"],
        })
        resp.append({
            "id": "enough_conclude",
            "prompt": "If yes, what should the conclusion have been?",
            "secondaryText": "Only if you answered yes above.",
            "location": "sidebar",
            "type": "longText",
            "required": False,
        })

    resp.append({
        "id": "note",
        "prompt": "Anything wrong in how we applied this step?",
        "secondaryText": "Mistakes in this step’s write-up.",
        "location": "sidebar",
        "type": "longText",
        "required": False,
    })
    resp.append(LOG)

    return f"{cid}-{step_key}", {
        "baseComponent": "case-step",
        "previousButton": False,
        "parameters": {"caseId": cid, "stepKey": step_key, "mode": "step"},
        "meta": {"caseId": cid, "stepKey": step_key},
        "instruction": (
            f"**{label_short} — {step_label}.** Judge this STOP&SCAN step, not {name}."
        ),
        "response": resp,
    }


def after_component(cid, _name, label_short):
    return f"{cid}-after", {
        "baseComponent": "case-after",
        "previousButton": False,
        "parameters": {"caseId": cid, "mode": "after"},
        "meta": {"caseId": cid},
        "instruction": (
            f"**{label_short} — after the case.** Rank the five elements, then answer in the sidebar."
        ),
        "response": [
            {
                "id": "contribution",
                "prompt": "Rank the five elements by how much each contributed in this case.",
                "secondaryText": "Drag to reorder. Most contribution at the top.",
                "location": "belowStimulus",
                "type": "ranking-sublist",
                "required": False,
                "options": ELEMENTS,
                "numItems": 5,
                "default": RANK_DEFAULT,
            },
            {
                "id": "direction",
                "prompt": "What did the evidence support at the end of this case?",
                "secondaryText": "Compare with the evidence state shown in the recap.",
                "location": "sidebar",
                "type": "radio",
                "required": False,
                "options": [
                    "It supported the claim the content makes",
                    "It undermined the claim the content makes",
                    "No resolution was reached",
                ],
            },
            {
                "id": "narrow",
                "prompt": (
                    "If this case had used only a source check, or only a detection "
                    "or provenance tool, what would the conclusion have been?"
                ),
                "secondaryText": "What a narrower check would have produced, compared with the full sequence.",
                "location": "sidebar",
                "type": "longText",
                "required": False,
            },
            {
                "id": "other_checks",
                "prompt": "Would any other check have changed the conclusion?",
                "secondaryText": "A check the example missed.",
                "location": "sidebar",
                "type": "longText",
                "required": False,
            },
            LOG,
        ],
    }


def sift_component(cid, title):
    routes = []
    for r in ("routeA", "routeB"):
        label = "Route A" if r == "routeA" else "Route B"
        routes += [
            {
                "id": f"{r}_plausible",
                "prompt": f"**{label}.** Could a competent non-expert reasonably follow this route?",
                "secondaryText": "A fair picture of how a non-expert would use SIFT here?",
                "location": "sidebar",
                "type": "radio",
                "required": False,
                "options": ["Yes", "Yes but unlikely", "No, this is not how it would go"],
            },
            {
                "id": f"{r}_note",
                "prompt": "If yes or yes-but-unlikely, why? If no, what would a more realistic route look like?",
                "secondaryText": "Why this route is or is not realistic.",
                "location": "sidebar",
                "type": "longText",
                "required": False,
            },
        ]
    return f"sift-{cid}", {
        "type": "react-component",
        "path": "stopscan-expert-panel/assets/SiftRoutes.tsx",
        "nextButtonLocation": "sidebar",
        "instructionLocation": "sidebar",
        "sidebarWidth": 400,
        "previousButton": False,
        "parameters": {"caseId": cid},
        "instruction": f"**{title}** Open each route when you are ready to review it, then answer in the sidebar.",
        "response": routes + [
            {
                "id": "prevent",
                "prompt": "Where either route reaches a wrong conclusion, what additional check would have prevented it?",
                "secondaryText": "Only if a route ended wrongly.",
                "location": "sidebar",
                "type": "longText",
                "required": False,
            },
            LOG,
        ],
    }


AGREE5 = ["Strongly disagree", "Disagree", "Neither", "Agree", "Strongly agree"]

components = collections.OrderedDict()

components["consent"] = {
    "type": "website",
    "path": "stopscan-expert-panel/assets/consent.html",
    "nextButtonLocation": "sidebar",
    "previousButton": False,
    "instruction": "Please read the consent document, then confirm in the sidebar.",
    "instructionLocation": "sidebar",
    "response": [
        {
            "id": "consent_confirm",
            "prompt": (
                "I have read this document and had the chance to ask questions. I am 18 "
                "or older. I understand that taking part is voluntary, that I may skip "
                "any question and stop at any time, that my responses are recorded under "
                "a code and cannot be edited once submitted, and that de-identified "
                "quotations may be published."
            ),
            "location": "sidebar",
            "type": "checkbox",
            "required": True,
            "options": ["I confirm"],
        },
        {
            "id": "consent_eu_transfer",
            "prompt": (
                "(Participants in the EEA, UK, or Switzerland) I explicitly consent to my "
                "data being processed as described and transferred to the United States."
            ),
            "location": "sidebar",
            "type": "checkbox",
            "required": False,
            "options": ["I consent to transfer"],
        },
        {
            "id": "consent_participate",
            "prompt": "I consent to take part in this study.",
            "location": "sidebar",
            "type": "radio",
            "required": True,
            "options": ["I consent", "I do not consent"],
        },
    ],
}

PROFESSIONAL_AREAS = [
    "Digital media forensics",
    "Computer science",
    "Misinformation or disinformation research",
    "Media literacy education",
    "Fact-checking or verification journalism",
]

components["about-you"] = {
    "type": "markdown",
    "path": "stopscan-expert-panel/assets/about-you.md",
    "nextButtonLocation": "sidebar",
    "instructionLocation": "sidebar",
    "previousButton": False,
    "instruction": "Please answer the four short questions in the sidebar.",
    "withSidebar": True,
    "response": [
        {
            "id": "B1",
            "prompt": "Which area best describes most of your professional work?",
            "location": "sidebar",
            "type": "radio",
            "required": False,
            "options": PROFESSIONAL_AREAS,
            "withOther": True,
        },
        {
            "id": "B2",
            "prompt": "Do you also work regularly in any of these other areas?",
            "location": "sidebar",
            "type": "checkbox",
            "required": False,
            "options": PROFESSIONAL_AREAS,
        },
        {
            "id": "B3",
            "prompt": "About how long have you worked in this field?",
            "location": "sidebar",
            "type": "radio",
            "required": False,
            "options": ["Under 3 years", "3–7 years", "8–15 years", "More than 15 years"],
        },
        {
            "id": "B4",
            "prompt": "How familiar are you with SIFT, the Four Moves, or lateral reading?",
            "location": "sidebar",
            "type": "radio",
            "required": False,
            "options": [
                "I am not familiar with them",
                "I have heard of them but have not used them",
                "I have used or taught them occasionally",
                "I use or teach them regularly",
                "I have contributed to work on them",
            ],
        },
    ],
}

components["orientation"] = {
    "type": "react-component",
    "path": "stopscan-expert-panel/assets/Orientation.tsx",
    "nextButtonLocation": "sidebar",
    "previousButton": False,
    "instruction": "Please read this introduction to STOP&SCAN. The summaries at the end stay available for reference throughout.",
    "instructionLocation": "sidebar",
    "response": [LOG],
}

for cid, name, short, _enc in CASES:
    for skey, slabel, sidx in STEPS:
        key, val = step_component(cid, name, short, skey, slabel, sidx)
        components[key] = val
    key, val = after_component(cid, name, short)
    components[key] = val

key, val = sift_component("case2", "The wind forecast map — if Dana had used SIFT.")
components[key] = val
key, val = sift_component("case4", "The senator’s photograph — if Ellen had used SIFT.")
components[key] = val

components["ratings-stopscan"] = {
    "type": "react-component",
    "path": "stopscan-expert-panel/assets/RatingStimulus.tsx",
    "nextButtonLocation": "sidebar",
    "instructionLocation": "sidebar",
    "sidebarWidth": 460,
    "previousButton": False,
    "parameters": {"section": "stopscan"},
    "instruction": "Rate STOP&SCAN on the statements below. Comments are in the sidebar.",
    "response": [
        {
            "id": "R_stopscan",
            "prompt": "How far do you agree with each statement about STOP&SCAN?",
            "secondaryText": "About STOP&SCAN as a method, not the person in any case.",
            "location": "belowStimulus",
            "type": "matrix-radio",
            "required": False,
            "answerOptions": AGREE5,
            "questionOptions": [
                "R1. The framework includes the right elements and leaves out nothing essential.",
                "R2. It is useful to distinguish the number of steps completed from the number of independent kinds of evidence found.",
                "R3. Requiring two independent kinds of evidence before a resolved conclusion is an appropriate threshold.",
                "R4. A non-expert could tell whether two kinds of evidence are genuinely independent.",
                "R5. “Unresolved” is a realistic result that people would be willing to accept.",
                "R6. STOP&SCAN works as well when real content is called fake as when the content itself is fake.",
                "R7. Separating the evidence state from the action that follows is a useful distinction for non-experts.",
                "R8. A non-expert could tell which kind of situation they are in — information, a request, or an alert.",
            ],
        },
        {
            "id": "R_stopscan_note",
            "prompt": "Comments on any of these statements. Name which one if you can.",
            "secondaryText": "Name the statement if you can.",
            "location": "sidebar",
            "type": "longText",
            "required": False,
        },
        LOG,
    ],
}

components["ratings-sift"] = {
    "type": "react-component",
    "path": "stopscan-expert-panel/assets/RatingStimulus.tsx",
    "nextButtonLocation": "sidebar",
    "instructionLocation": "sidebar",
    "sidebarWidth": 460,
    "previousButton": False,
    "parameters": {"section": "sift"},
    "instruction": "Rate SIFT on the statements below. We have not yet told you what we think. Comments are in the sidebar.",
    "response": [
        {
            "id": "R_sift",
            "prompt": "How far do you agree with each statement about SIFT?",
            "secondaryText": "About SIFT as a method. We have not yet given our own view.",
            "location": "belowStimulus",
            "type": "matrix-radio",
            "required": False,
            "answerOptions": AGREE5,
            "questionOptions": [
                "R9. SIFT remains useful for evaluating content that may be AI-generated or manipulated.",
                "R10. Allowing someone to stop after one SIFT move is appropriate.",
                "R11. SIFT gives enough guidance when a trustworthy source publishes incorrect or fabricated content.",
                "R12. SIFT gives enough guidance when authentic content is wrongly described as AI-generated.",
                "R13. Caulfield’s 2025 SIFT update — using language models as research tools, then checking their sources — is enough for content that may itself have been generated by AI.",
            ],
        },
        {
            "id": "R_sift_note",
            "prompt": "Comments on any of these statements. Name which one if you can.",
            "secondaryText": "Name the statement if you can.",
            "location": "sidebar",
            "type": "longText",
            "required": False,
        },
        LOG,
    ],
}

components["ratings-open"] = {
    "type": "react-component",
    "path": "stopscan-expert-panel/assets/RatingStimulus.tsx",
    "nextButtonLocation": "sidebar",
    "instructionLocation": "sidebar",
    "sidebarWidth": 460,
    "previousButton": False,
    "parameters": {"section": "open"},
    "instruction": "Open critique, before we state our own positions on SIFT.",
    "response": [
        {"id": "O1", "prompt": "Where is STOP&SCAN most likely to fail in everyday use?", "secondaryText": "Including outside these four cases.", "location": "sidebar", "type": "longText", "required": False},
        {"id": "O2", "prompt": "Which element is weakest? How would you change it?", "secondaryText": "The element you would change first, and how.", "location": "sidebar", "type": "longText", "required": False},
        {"id": "O3", "prompt": "STOP&SCAN asks people to visit every element, even when an earlier one seems to settle the case. Is that right?", "secondaryText": "The framework currently requires visiting every element.", "location": "sidebar", "type": "longText", "required": False},
        {"id": "O4", "prompt": "What, if anything, does STOP&SCAN add that SIFT or lateral reading does not already provide?", "secondaryText": "What is new, if anything, compared with SIFT or lateral reading.", "location": "sidebar", "type": "longText", "required": False},
        {"id": "O5", "prompt": "What evidence would you need before recommending STOP&SCAN to non-experts?", "secondaryText": "What would make a recommendation responsible.", "location": "sidebar", "type": "longText", "required": False},
        {"id": "O6", "prompt": "Is there an approach from your own work that neither framework captures?", "secondaryText": "A practice from your field that neither method covers.", "location": "sidebar", "type": "longText", "required": False},
        {"id": "O7", "prompt": "Did our worked examples represent STOP&SCAN fairly, or did they make it look better or worse than it is?", "secondaryText": "Whether our four cases were a fair test.", "location": "sidebar", "type": "longText", "required": False},
        LOG,
    ],
}

components["ratings-critique"] = {
    "type": "react-component",
    "path": "stopscan-expert-panel/assets/RatingStimulus.tsx",
    "nextButtonLocation": "sidebar",
    "instructionLocation": "sidebar",
    "sidebarWidth": 460,
    "previousButton": False,
    "parameters": {"section": "critique"},
    "instruction": "Read our positions in the main pane, respond to the five concerns below, then use the sidebar for the remaining questions.",
    "response": [
        {
            "id": "Q1",
            "prompt": "Where do you stand on each of our five concerns about SIFT?",
            "secondaryText": "Where you agree, where we overstated, and where we are wrong.",
            "location": "belowStimulus",
            "type": "matrix-radio",
            "required": False,
            "answerOptions": ["Agree", "Agree but overstated", "Disagree", "No view"],
            "questionOptions": [
                "On Stop",
                "On Investigate the source",
                "On Find better coverage",
                "On Trace to the original context",
                "On the 2025 AI guidance",
            ],
        },
        {
            "id": "Q1_note",
            "prompt": "Anything you want to say about those five concerns.",
            "secondaryText": "Use this if a single agree/disagree rating is not enough.",
            "location": "sidebar",
            "type": "longText",
            "required": False,
        },
        {
            "id": "Q3",
            "prompt": "What concerns or weaknesses in SIFT have we missed?",
            "secondaryText": "Concerns we missed.",
            "location": "sidebar",
            "type": "longText",
            "required": False,
        },
        {
            "id": "Q4",
            "prompt": "Which of these concerns do you think is mistaken, and why?",
            "secondaryText": "If none is mistaken, say so.",
            "location": "sidebar",
            "type": "longText",
            "required": False,
        },
        LOG,
    ],
}

compare_items = [
    ("R14", "Which approach is more likely to produce an appropriately cautious judgment?"),
    ("R15", "Which approach would be easier to teach?"),
    ("R16", "Which approach is more reliable when search results contain misleading or AI-generated information?"),
    ("R17", "Which would you recommend to someone with no training in verification?"),
    ("R18", "Which would you recommend to a professional?"),
    ("R19", "Which better matches the range of cases you meet in your own work?"),
]
COMPARE_OPTS = [
    "SIFT",
    "No preference",
    "STOP&SCAN",
    "I cannot make this comparison",
]
compare_resp = []
for rid, prompt in compare_items:
    compare_resp.append({
        "id": rid,
        "prompt": prompt,
        "secondaryText": "Skip if you cannot make this comparison.",
        "location": "sidebar",
        "type": "radio",
        "required": False,
        "options": COMPARE_OPTS,
    })
compare_resp.append({
    "id": "compare_note",
        "prompt": "Anything you want to add about these comparisons.",
        "secondaryText": "Name which comparison if you can.",
    "location": "sidebar",
    "type": "longText",
    "required": False,
})
compare_resp.append(LOG)
components["ratings-compare"] = {
    "type": "react-component",
    "path": "stopscan-expert-panel/assets/RatingStimulus.tsx",
    "nextButtonLocation": "sidebar",
    "instructionLocation": "sidebar",
    "sidebarWidth": 460,
    "previousButton": False,
    "parameters": {"section": "compare"},
    "instruction": "Comparative judgments between SIFT and STOP&SCAN.",
    "response": compare_resp,
}

components["debrief"] = {
    "type": "website",
    "path": "stopscan-expert-panel/assets/debrief.html",
    "nextButtonLocation": "sidebar",
    "previousButton": False,
    "instruction": "Thank you. Please read the debrief, then submit.",
    "instructionLocation": "sidebar",
    "response": [],
}

order = ["consent", "about-you", "orientation"]
for cid, *_ in CASES:
    order += [f"{cid}-{s[0]}" for s in STEPS] + [f"{cid}-after"]
order += [
    "sift-case2", "sift-case4", "ratings-stopscan", "ratings-sift",
    "ratings-open", "ratings-critique", "ratings-compare", "debrief",
]

config = {
    "$schema": "https://raw.githubusercontent.com/revisit-studies/study/v2.4.3/src/parser/StudyConfigSchema.json",
    "studyMetadata": {
        "title": "STOP&SCAN Expert Panel",
        "version": "v4",
        "authors": [
            "Saniat Javid Sohrawardi",
            "Fatma Aksu",
            "Y. Kelly Wu",
            "Alessandra Sala",
            "Luca Pietrantoni",
        ],
        "date": "2026-08-26",
        "description": "Review how STOP&SCAN is used in four documented cases and compare it with SIFT and with detection and provenance tools.",
        "organizations": [
            "Rochester Institute of Technology",
            "University of Bologna",
            "AI and Multimedia Authenticity Collaboration",
        ],
    },
    "uiConfig": {
        "contactEmail": "john.sohrawardi@rit.edu",
        "helpTextPath": "stopscan-expert-panel/assets/help.md",
        "logoPath": "revisitAssets/revisitLogoSquare.svg",
        "withProgressBar": True,
        "autoDownloadStudy": False,
        "withSidebar": True,
        "sidebarWidth": 400,
        "enumerateQuestions": True,
        "studyEndMsg": "Thank you for completing the STOP&SCAN expert panel. You may close this window.",
    },
    "baseComponents": {
        "case-step": {
            "type": "react-component",
            "path": "stopscan-expert-panel/assets/CaseStimulus.tsx",
            "nextButtonLocation": "sidebar",
            "instructionLocation": "sidebar",
            "sidebarWidth": 420,
        },
        "case-after": {
            "type": "react-component",
            "path": "stopscan-expert-panel/assets/CaseStimulus.tsx",
            "nextButtonLocation": "sidebar",
            "instructionLocation": "sidebar",
            "sidebarWidth": 420,
        },
    },
    "components": components,
    "sequence": {
        "order": "fixed",
        "components": order,
        "skip": [{
            "name": "consent",
            "check": "response",
            "responseId": "consent_participate",
            "value": "I do not consent",
            "comparison": "equal",
            "to": "end",
        }],
    },
}

OUT.write_text(json.dumps(config, indent=2, ensure_ascii=False) + "\n", encoding="utf8")
n = sum(1 for c in components.values() for r in c.get("response", []) if r["id"] != "interactionLog")
print(f"wrote {OUT}")
print(f"components: {len(components)}  ordered: {len(order)}  participant-facing fields: {n}")
print("missing from components:", [c for c in order if c not in components])
print("not in order:", [c for c in components if c not in order])
