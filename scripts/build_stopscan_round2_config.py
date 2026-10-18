#!/usr/bin/env python3
"""Generates public/stopscan-expert-panel-round2/config.json."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "public" / "stopscan-expert-panel-round2" / "config.json"

TOOK_PART_YES = "Yes — I completed the first-round questionnaire"
TOOK_PART_NO = "No — I did not take part in the first round"

PROFESSIONAL_AREAS = [
    "Digital media forensics",
    "Computer science",
    "Human factors, user experience, or social sciences",
    "Misinformation or disinformation research",
    "Media literacy education",
    "Fact-checking or verification journalism",
]

RATING_PATH = "stopscan-expert-panel-round2/assets/AgreementRating.tsx"

# Prompts match the round 2 questionnaire guide. Order is the page order.
PAGES = [
    ("intro", "Read the summary, then select Next. There is nothing to rate on this page.", []),
    ("stop", "Rate each change below. If you choose 1, 2, or 3, you must add a comment.", [
        ("stop_entry", "The two entry questions, and scrolling on when both answers are no"),
        ("stop_questions", "The three questions, and how they set the effort level"),
    ]),
    ("source", "Rate the change below. If you choose 1, 2, or 3, you must add a comment.", [
        ("source", "The new Source, with a check for each effort level"),
    ]),
    ("content", "Rate the change below. If you choose 1, 2, or 3, you must add a comment.", [
        ("content", "The new Content, opening with checks which need no special skill"),
    ]),
    ("alignment", "Rate each change below. If you choose 1, 2, or 3, you must add a comment.", [
        ("align_indep", "The three-part independence test"),
        ("align_ai", "The rule that AI answers and tool results are clues to check, not evidence by themselves"),
        ("align_callback", "Optional rule: For a request, one confirmation through a contact method the requester cannot control is enough. For example, call a saved number."),
    ]),
    ("reflect", "Rate each change below. If you choose 1, 2, or 3, you must add a comment.", [
        ("reflect_questions", "The two questions and the undo rule"),
        ("reflect_table", "The table of actions"),
    ]),
    ("run", "Rate each change below. If you choose 1, 2, or 3, you must add a comment.", [
        ("run_order", "A fixed order with effort set by STOP"),
        ("run_modes", "The two modes"),
    ]),
]


def rating(response_id, prompt):
    return {
        "id": response_id,
        "prompt": prompt,
        "location": "belowStimulus",
        "type": "custom",
        "path": RATING_PATH,
        "required": True,
    }


def reading_page(page_id, instruction, responses, next_text=None):
    component = {
        "type": "react-component",
        "path": "stopscan-expert-panel-round2/assets/RoundPage.tsx",
        "parameters": {"pageId": page_id},
        "instruction": instruction,
        "instructionLocation": "aboveStimulus",
        "nextButtonLocation": "belowStimulus",
        "previousButton": True,
        "withSidebar": False,
        "response": responses,
    }
    if next_text:
        component["nextButtonText"] = next_text
    return component


components = {}

components["consent"] = {
    "type": "website",
    "path": "stopscan-expert-panel-round2/assets/consent.html",
    "nextButtonLocation": "sidebar",
    "previousButton": False,
    "instruction": "Read the consent form. Then use the checkboxes below.",
    "instructionLocation": "sidebar",
    "sidebarWidth": 440,
    "response": [
        {
            "id": "consent_eu_transfer",
            "prompt": "If I am in the EEA, the UK, or Switzerland, I agree that my data may be used as described and transferred to the United States.",
            "secondaryText": "If you are not in one of these places, leave this box unchecked.",
            "location": "sidebar",
            "type": "checkbox",
            "required": False,
            "options": ["I consent to transfer"],
        },
        {
            "id": "consent_participate",
            "prompt": "I am 18 or older, and I agree to take part in this round of the study.",
            "secondaryText": "Checking this box records your agreement.",
            "location": "sidebar",
            "type": "checkbox",
            "required": True,
            "options": ["I consent"],
            "requiredValue": ["I consent"],
        },
    ],
}

components["participation"] = {
    "type": "markdown",
    "path": "stopscan-expert-panel-round2/assets/participation.md",
    "nextButtonLocation": "sidebar",
    "instructionLocation": "sidebar",
    "previousButton": True,
    "withSidebar": True,
    "instruction": "Tell us whether you completed the Round 1 questionnaire.",
    "response": [
        {
            "id": "took_part",
            "prompt": "Did you complete the first-round STOP&SCAN questionnaire?",
            "secondaryText": "If you completed it, we will skip the background questions and the original framework.",
            "location": "sidebar",
            "type": "radio",
            "required": True,
            "options": [TOOK_PART_YES, TOOK_PART_NO],
        },
    ],
}

components["about-you"] = {
    "type": "react-component",
    "path": "stopscan-expert-panel-round2/assets/AboutYou.tsx",
    "nextButtonLocation": "sidebar",
    "instructionLocation": "sidebar",
    "previousButton": True,
    "withSidebar": True,
    "instruction": "These questions are for people who did not complete Round 1. You may skip any question.",
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

components["original-framework"] = {
    "type": "react-component",
    "path": "stopscan-expert-panel-round2/assets/OriginalFramework.tsx",
    "instruction": "This is the STOP&SCAN version reviewed in Round 1. Read it, then select Next.",
    "instructionLocation": "aboveStimulus",
    "nextButtonLocation": "belowStimulus",
    "previousButton": True,
    "withSidebar": False,
    "response": [],
}

for page_id, instruction, ratings in PAGES:
    components[page_id] = reading_page(page_id, instruction, [rating(rid, prompt) for rid, prompt in ratings])

components["kept"] = reading_page(
    "kept",
    "The comment below is optional.",
    [{
        "id": "open_final",
        "prompt": "Is there anything else you would like to tell us?",
        "secondaryText": "Optional.",
        "location": "belowStimulus",
        "type": "longText",
        "required": False,
    }],
)

components["acknowledgment"] = {
    "type": "react-component",
    "path": "stopscan-expert-panel-round2/assets/AcknowledgmentPage.tsx",
    "instruction": "Being named is optional. You may leave this blank.",
    "instructionLocation": "aboveStimulus",
    "nextButtonLocation": "belowStimulus",
    "previousButton": True,
    "withSidebar": False,
    "response": [
        {
            "id": "acknowledgment",
            "prompt": "Acknowledgment",
            "location": "belowStimulus",
            "type": "custom",
            "path": "stopscan-expert-panel-round2/assets/AcknowledgmentChoice.tsx",
            "required": False,
        },
    ],
}

components["review"] = {
    "type": "react-component",
    "path": "stopscan-expert-panel-round2/assets/ReviewAnswers.tsx",
    "instruction": "Check your answers. Use Back if you want to change them. Then submit.",
    "instructionLocation": "aboveStimulus",
    "nextButtonLocation": "belowStimulus",
    "nextButtonText": "Submit answers",
    "previousButton": True,
    "withSidebar": False,
    "response": [],
}

config = {
    "$schema": "https://raw.githubusercontent.com/revisit-studies/study/v2.4.3/src/parser/StudyConfigSchema.json",
    "studyMetadata": {
        "title": "STOP&SCAN Expert Panel, Round 2",
        "version": "round2",
        "authors": [
            "Saniat Javid Sohrawardi",
            "Kelly Wu",
            "Fatma Aksu",
        ],
        "date": "2026-10-18",
        "description": "Delphi round 2. Experts rate revisions to STOP&SCAN. Participants who did not complete round 1 answer the round 1 background questions and read the original framework first.",
        "organizations": [
            "Rochester Institute of Technology",
            "University of Bologna",
        ],
    },
    "uiConfig": {
        "contactEmail": "john.sohrawardi@rit.edu",
        "helpTextPath": "stopscan-expert-panel-round2/assets/help.md",
        "logoPath": "revisitAssets/revisitLogoSquare.svg",
        "stylesheetPath": "stopscan-expert-panel-round2/assets/study.css",
        "withProgressBar": True,
        "autoDownloadStudy": False,
        "withSidebar": True,
        "sidebarWidth": 400,
        "enumerateQuestions": True,
        "previousButtonText": "Back",
        "nextButtonText": "Next",
        "studyEndMsg": "Thank you. We recorded your answers. You may now close this window.",
    },
    "components": components,
    "sequence": {
        "order": "fixed",
        "components": [
            {
                "id": "opening",
                "order": "fixed",
                "components": [
                    "consent",
                    "participation",
                    "about-you",
                    "original-framework",
                ],
                # Skip targets have to sit after this block. `intro` is the next component.
                "skip": [
                    {
                        "name": "participation",
                        "check": "response",
                        "responseId": "took_part",
                        "value": TOOK_PART_YES,
                        "comparison": "equal",
                        "to": "intro",
                    },
                ],
            },
            "intro",
            "stop",
            "source",
            "content",
            "alignment",
            "reflect",
            "run",
            "kept",
            "acknowledgment",
            "review",
        ],
    },
}

OUT.write_text(json.dumps(config, indent=2, ensure_ascii=False) + "\n", encoding="utf8")
print(f"wrote {OUT}")
print(f"components: {len(components)}")
