/**
 * Authored study content for the STOP&SCAN expert panel.
 *
 * v4 changes from v3-pilot:
 *  - Two-level outcome model: an EVIDENCE STATE produced by the framework
 *    (confirmed / contradicted / unresolved), plus an ACTION selected by the
 *    ENCOUNTER TYPE (information / request / alert).
 *  - Runs are told from the point of view of a named fictional observer.
 *    Each step carries the character's thought, the actions they took, and a
 *    neutral narrator note. Real public figures keep their real names; the
 *    observer is invented in every case.
 *  - STOP is folded into step 1 alongside Source (four pages, five elements).
 *  - Every case is frozen to a stated date. Some have since developed further;
 *    this is disclosed once in orientation and again at debrief.
 *  - Presentation order is case2 -> case3 -> case4 -> case1. Component ids are
 *    unchanged so analysis scripts and the IRB packet still resolve.
 */

export type ActionCategory =
  | 'pause'
  | 'check-source'
  | 'inspect-content'
  | 'search'
  | 'tool'
  | 'contact'
  | 'read-replies';

export const ACTION_CATEGORY_LABEL: Record<ActionCategory, string> = {
  pause: 'Paused',
  'check-source': 'Checked the source',
  'inspect-content': 'Inspected the content',
  search: 'Searched',
  tool: 'Used a tool',
  contact: 'Contacted someone',
  'read-replies': 'Read what others said',
};

export interface CaseAction {
  category: ActionCategory;
  /** What the character did. */
  did: string;
  /** What that action returned. Stated neutrally — no verdict. */
  returned: string;
  /**
   * Whether this action ended up supporting or undermining the claim.
   * Rendered ONLY in the after-case recap, never on the step page, so that
   * per-step judgments are not anchored by a direction label.
   */
  support: 'toward' | 'against' | 'neither';
}

export interface CaseStepContent {
  key: 'source' | 'content' | 'alignment' | 'reflect';
  label: string;
  stepIndex: number;
  /** The character's inner voice at this step. */
  thought: string;
  actions: CaseAction[];
  /** Neutral framing. Never states the outcome. */
  narrator: string;
}

export type EncounterType = 'information' | 'request' | 'alert';
export type EvidenceState = 'confirmed' | 'contradicted' | 'unresolved';

export interface CaseContent {
  id: string;
  /** Presentation position, 1-based. */
  order: number;
  title: string;
  shortLabel: string;
  character: { name: string; blurb: string };
  encounterType: EncounterType;
  /** Evidence is frozen to this date. */
  asOf: string;
  encounter: string;
  /** The character's pre-commitment, shown inside step 1. */
  stopReaction: string;
  steps: CaseStepContent[];
  outcome: {
    state: EvidenceState;
    /** Short action label, drawn from the encounter-type action set. */
    action: string;
    rationale: string;
  };
}

/* ------------------------------------------------------------------ */
/* Framework overview                                                  */
/* ------------------------------------------------------------------ */

export const STOPSCAN_OVERVIEW = {
  intro:
    'STOP&SCAN is a five-step habit for working out how far you can rely on something you have seen or heard online. It does not tell you whether something is true or false. It helps you slow down, check what can be checked, and say what your judgment rests on.',
  elements: [
    {
      id: 'stop',
      title: 'STOP',
      body: 'Before reacting or searching, pause. What do you already believe about this? What are you feeling, and what are you hoping is true?',
      examples: '',
    },
    {
      id: 'source',
      title: 'Source',
      body: 'Who made this, rather than who sent it to you? Is the origin identifiable? What does knowing it tell you, and what does it not tell you?',
      examples:
        'For example: the posting account and its history, a forwarded message chain, a caller’s number, or a provenance record such as a Content Credential (C2PA) or an embedded watermark where one exists.',
    },
    {
      id: 'content',
      title: 'Content',
      body: 'What is this asking you to believe, feel, or do? Is there anything inside the content itself that you can check?',
      examples:
        'For example: a date, a place name, a headline or sign visible in the frame, a reflection or a shadow — and, with care, AI-detection tools. Detection tools are one kind of check, not a verdict.',
    },
    {
      id: 'alignment',
      title: 'Alignment',
      body: 'Look for evidence that does not depend on the original source. Does anything independent point the same way?',
      examples:
        'For example: a search, a news archive, a wire-service or agency photograph, a reverse image search, or reaching a person through a route the sender does not control.',
    },
    {
      id: 'reflect',
      title: 'Now Reflect',
      body: 'Return to your first reaction. Has your judgment moved? If it has, what moved it — evidence, or a search that carried on until something agreeable turned up?',
      examples: '',
    },
  ],
  orderExplanation: [
    'STOP and Now Reflect work as a pair. STOP captures the starting point. Now Reflect asks whether the judgment moved and why.',
    'Source and Content come before Alignment because they shape what is worth checking. Searching with the original post’s own wording tends to lead back to copies of the same claim rather than to independent evidence.',
    'Each step is a short question, not a specialist investigation. Sometimes a step returns nothing useful. Knowing that is still worth something.',
  ],

  /* --- Two-level outcome model --- */
  outcomeIntro:
    'STOP&SCAN produces two separate things: what the checks found (the evidence state), and what to do next (the action). The action depends on the kind of situation you are in.',

  evidenceStates: [
    {
      id: 'confirmed',
      title: 'Confirmed',
      body: 'Two or more independent kinds of evidence point the same way, and they support what the content represents.',
    },
    {
      id: 'contradicted',
      title: 'Contradicted',
      body: 'Two or more independent kinds of evidence point the same way, and they run against what the content represents.',
    },
    {
      id: 'unresolved',
      title: 'Unresolved',
      body: 'Only one useful kind of evidence is available, or the evidence conflicts. That is a complete result, not a failure. It still applies even if one signal felt convincing.',
    },
  ],

  encounterTypes: [
    {
      id: 'information',
      title: 'Information',
      body: 'Nothing is being asked of you. Waiting costs little, and you can change your mind later.',
      actions: {
        confirmed: 'Rely on it. Pass it on.',
        unresolved: 'Hold. Do not pass it on, and do not dismiss it either.',
        contradicted: 'Do not pass it on. Correct it if you are placed to. Report it if someone could be harmed.',
      },
    },
    {
      id: 'request',
      title: 'A request',
      body: 'Someone is asking you to do something — send money, log in, or take an action. Doing it is costly and often cannot be undone.',
      actions: {
        confirmed: 'Go ahead.',
        unresolved: 'Check through a route the person asking does not control, before doing anything.',
        contradicted: 'Refuse. Report it.',
      },
    },
    {
      id: 'alert',
      title: 'An alert',
      body: 'You may need to protect yourself or someone else now. Acting and not acting both have a cost.',
      actions: {
        confirmed: 'Act as directed.',
        unresolved: 'Take the protective step you can undo, and go to the official channel.',
        contradicted: 'Stand down. Report it.',
      },
    },
  ],

  actionRule:
    'If the evidence is unresolved, that does not mean ignore it. Choose the action you can still reverse. For information, that action is to wait. For a request or an alert, waiting is not enough — check another way before you commit.',

  coverageRule: {
    title: 'How much evidence is enough?',
    paragraphs: [
      'STOP&SCAN asks first whether there is enough coverage, and only then which way the evidence points. A signal that feels decisive cannot produce a resolved state on its own.',
      'The framework looks for at least two independent kinds of evidence pointing the same way. Independent means one is not simply repeating or relying on the other. Several websites carrying the same claim are not several independent kinds of evidence.',
      'Checks of the same kind count once together. Running an image through several AI-detection tools is one check, not several. If those tools disagree with each other, that check has returned nothing usable.',
    ],
  },

  reporting:
    'Reporting is an action, not a separate verdict. It is available under any evidence state and is driven by possible harm to other people rather than by what the evidence showed.',

  progressive:
    'We show each case one step at a time. You rate each step before you see how the case ends. Once you submit a step you cannot edit it, but it stays visible.',

  freezeNote:
    'Each case uses only the evidence that was public on the date at the top. Some stories moved on after that. We tell you what happened at the end.',

  roleplayNote:
    'These cases are real and publicly documented. The named person in each case is fictional. We added them so you can see an ordinary person using the method, not so you can judge that person. Real public figures and organisations are named as they were reported.',
};

/* ------------------------------------------------------------------ */
/* Cases                                                               */
/* ------------------------------------------------------------------ */

export const CASES: CaseContent[] = [
  /* ---------------------------------------------------------------- */
  {
    id: 'case2',
    order: 1,
    title: 'A wind forecast map',
    shortLabel: 'Case 1',
    character: {
      name: 'Dana',
      blurb: 'follows a few weather accounts and reshares the interesting ones',
    },
    encounterType: 'information',
    asOf: '5 January 2026',
    encounter:
      'On 3 January 2026 the US National Weather Service office in Missoula posted a wind forecast map for Camas Prairie, Idaho, captioned “Hold onto your hats!” Dana sees it two days later, reshared into her feed with people in the replies laughing at some of the place names on it.',
    stopReaction:
      'Dana’s first thought is that it is the Weather Service, so the map is fine, and that the odd names must be small places she has never heard of. She notices a flicker of not wanting to look ignorant about somewhere she has never been.',
    steps: [
      {
        key: 'source',
        label: 'STOP and Source',
        stepIndex: 1,
        thought:
          'It is a government forecast office. That is about as solid as a source gets. So why are people in the replies laughing?',
        actions: [
          {
            category: 'pause',
            did: 'Noted her first reaction before checking anything: this is official, so it is probably fine.',
            returned:
              'A starting point she can compare against later. Nothing about the map itself.',
            support: 'neither',
          },
          {
            category: 'check-source',
            did: 'Tapped through to the posting account and looked at its history.',
            returned:
              'It is the genuine National Weather Service office for that region, posting forecasts as it does every day.',
            support: 'neither',
          },
        ],
        narrator:
          'The account is genuine. That does not mean the map is. A trustworthy organisation can still post something wrong.',
      },
      {
        key: 'content',
        label: 'Content',
        stepIndex: 2,
        thought:
          'The two names people keep quoting are “Orangeotild” and “Whata Bod”. Those do not look like place names in any language.',
        actions: [
          {
            category: 'inspect-content',
            did: 'Typed both names into a maps app, then into a plain search.',
            returned:
              'No match in the maps app, no gazetteer entry, no result of any kind for either name.',
            support: 'against',
          },
          {
            category: 'read-replies',
            did: 'Read down the replies on the reshare.',
            returned:
              'Mostly jokes. One reply says the office has started using generative AI to build its base maps. No source given for that.',
            support: 'neither',
          },
        ],
        narrator:
          'The check that mattered used only what was already in the image. A reply with no source is not evidence yet.',
      },
      {
        key: 'alignment',
        label: 'Alignment',
        stepIndex: 3,
        thought:
          'If a national forecast office published invented towns, someone other than a reply guy will have written about it.',
        actions: [
          {
            category: 'search',
            did: 'Searched for the place names alongside “National Weather Service”.',
            returned:
              'Several technology and news outlets reporting the same thing independently, quoting a Weather Service spokesperson confirming a local office had used AI to generate a base map and that the map was corrected.',
            support: 'against',
          },
          {
            category: 'check-source',
            did: 'Went back to the original post.',
            returned: 'The post is gone.',
            support: 'neither',
          },
        ],
        narrator:
          'A deleted post can mean many things. The second kind of evidence here is the outside reporting plus the agency confirming the error.',
      },
      {
        key: 'reflect',
        label: 'Now Reflect',
        stepIndex: 4,
        thought:
          'I started out treating “the Weather Service posted it” as the end of the question. It was not even the beginning of it.',
        actions: [
          {
            category: 'pause',
            did: 'Compared where she started against where she ended, and asked what actually moved her.',
            returned:
              'Two independent kinds of evidence: the place names checked from inside the image, and the outside reporting with the agency’s correction. The source check moved her not at all, though it had felt like the strongest thing she had.',
            support: 'neither',
          },
        ],
        narrator:
          'Nobody is asking Dana to act. Not resharing costs her nothing. This is an information encounter.',
      },
    ],
    outcome: {
      state: 'contradicted',
      action: 'Do not pass it on. Correct it if placed to.',
      rationale:
        'Two independent kinds of evidence — the place-name check inside the image, and independent reporting carrying the agency’s own correction — both run against the map. The Weather Service remains a source Dana can rely on. This particular map is not.',
    },
  },

  /* ---------------------------------------------------------------- */
  {
    id: 'case3',
    order: 2,
    title: 'A photograph of a campaign crowd',
    shortLabel: 'Case 2',
    character: {
      name: 'Marcus',
      blurb: 'reads political news on his phone and argues about it in the replies',
    },
    encounterType: 'information',
    asOf: '12 August 2024',
    encounter:
      'A photograph taken on 7 August 2024 shows a large crowd greeting a presidential campaign at Detroit Metro Airport, with an aircraft behind them. On 11 August, Donald Trump posted on Truth Social that the crowd “DIDN’T EXIST” and that the image was AI-generated. By the next morning Marcus’s feed is full of reposts. The one with the most traction is from a commentator with a large following, captioned “FAKE crowd photo”, with red circles drawn on the side of the aircraft.',
    stopReaction:
      'Marcus does not like the candidate in the photograph, and he notices — with some discomfort — that he would prefer the fake claim to be true. He writes that down before doing anything else.',
    steps: [
      {
        key: 'source',
        label: 'STOP and Source',
        stepIndex: 1,
        thought:
          'I want this to be fake. That is exactly when I am worst at this. Where did the picture come from in the first place?',
        actions: [
          {
            category: 'pause',
            did: 'Noted his starting position: he wants the allegation to be true.',
            returned:
              'A starting point. He will check his conclusion against it at the end.',
            support: 'neither',
          },
          {
            category: 'check-source',
            did: 'Scrolled back to find the earliest posting of the photograph he could.',
            returned:
              'The earliest sharer he can identify is a political strategist who was not at the event and cannot say where she got the image.',
            support: 'neither',
          },
          {
            category: 'search',
            did: 'Ran a reverse image search.',
            returned: 'Copies of copies. No original, no photographer, no first publication.',
            support: 'neither',
          },
        ],
        narrator:
          'The trail runs out. Not finding an original is not evidence either way — it is missing evidence. Source is exhausted here, not disproved.',
      },
      {
        key: 'content',
        label: 'Content',
        stepIndex: 2,
        thought:
          'The viral post circles the reflections on the plane. There is also a strange outline around people’s heads. Let me actually look instead of taking their word for what I am seeing.',
        actions: [
          {
            category: 'inspect-content',
            did: 'Zoomed into the areas the annotated posts circle — the aircraft’s body and the crowd’s edges.',
            returned:
              'There is a halo-like outline, but it is around every person in the frame, not just some. A selective paste-in would not be expected to behave that evenly.',
            support: 'toward',
          },
          {
            category: 'inspect-content',
            did: 'Noticed that several people in the crowd are holding phones up, and zoomed into their screens.',
            returned:
              'The phone screens show the same aircraft and the same crowd from where their owners are standing.',
            support: 'toward',
          },
          {
            category: 'tool',
            did: 'Ran the image through a free AI-detection site.',
            returned: 'It reports the image is likely human-made, with high confidence.',
            support: 'toward',
          },
        ],
        narrator:
          'The phone screens are in the picture itself. Anyone who zooms in can see them. The detector result is a separate kind of check, and Marcus has no way to know how reliable it is.',
      },
      {
        key: 'alignment',
        label: 'Alignment',
        stepIndex: 3,
        thought:
          'A rally at an airport with press there. If thousands of people were actually in that hangar, other cameras were too.',
        actions: [
          {
            category: 'search',
            did: 'Searched news archives for the event.',
            returned:
              'Wire-service photographs of the same scene taken by other photographers at a different angle, and video from a local newspaper showing the hangar before, during and after.',
            support: 'toward',
          },
          {
            category: 'search',
            did: 'Looked for a statement from the campaign.',
            returned:
              'The campaign told reporters a staff member took the photograph and that it was not AI-generated.',
            support: 'toward',
          },
          {
            category: 'tool',
            did: 'Ran the image through a second AI-detection site to see whether it agreed with the first.',
            returned:
              'It also leans toward human-made, but only barely — close enough to a coin flip that Marcus cannot tell what it is telling him.',
            support: 'neither',
          },
        ],
        narrator:
          'The wire photos and the video do not depend on the original poster, or on each other. The campaign statement does — it comes from an interested party. The two detectors count as one check. They disagree enough that the check is weak.',
      },
      {
        key: 'reflect',
        label: 'Now Reflect',
        stepIndex: 4,
        thought:
          'I wanted it to be fake. It is not. And the thing I would have leaned on first — the detector — is the thing I should trust least here.',
        actions: [
          {
            category: 'pause',
            did: 'Compared his conclusion against the starting position he noted.',
            returned:
              'His judgment moved against what he wanted, which is some reassurance he followed the evidence. The strongest evidence was the independent photographs and video, not the tools.',
            support: 'neither',
          },
        ],
        narrator:
          'Three questions get mixed together here: whether the photograph is authentic, whether this copy has been altered, and whether the AI allegation is true. They are not the same question.',
      },
    ],
    outcome: {
      state: 'confirmed',
      action: 'Rely on it. Pass it on, with the correction.',
      rationale:
        'Independent wire-service photographs and independent video of the same scene both support the photograph, and neither depends on the account that shared it. Separately, the copy circulating has been cropped and its colour pushed — true, and a different matter from the claim that it was generated by AI.',
    },
  },

  /* ---------------------------------------------------------------- */
  {
    id: 'case4',
    order: 3,
    title: 'A photograph shared by a senator’s office',
    shortLabel: 'Case 3',
    character: {
      name: 'Ellen',
      blurb: 'checks the news on X most evenings and rarely posts',
    },
    encounterType: 'information',
    asOf: '13 July 2026',
    encounter:
      'In early July 2026 speculation spread online that US Senator Mitch McConnell was seriously ill or had died. On 12 July his office released a photograph of him with his wife, Elaine Chao. Ellen sees it that evening — not on the office’s own page, but as a screenshot someone has re-uploaded to X, under a thread of replies insisting it is AI-generated.',
    stopReaction:
      'Ellen thought the death rumours were overblown from the start, and she notices she is inclined to take the photograph as settling the matter. She writes that down: she wants this to be the end of it.',
    steps: [
      {
        key: 'source',
        label: 'STOP and Source',
        stepIndex: 1,
        thought:
          'This is a screenshot of a screenshot. Where did the actual picture come from?',
        actions: [
          {
            category: 'pause',
            did: 'Noted her starting position: she expects the photograph to be real and wants the story closed.',
            returned: 'A starting point to check her conclusion against.',
            support: 'neither',
          },
          {
            category: 'check-source',
            did: 'Went looking for the original posting rather than the reshare.',
            returned:
              'The photograph is on the senator’s official Senate website and his official Facebook page, alongside a statement about a fall, a hospital stay and a mild case of pneumonia.',
            support: 'neither',
          },
        ],
        narrator:
          'The accounts are genuine. The office is also the subject of the rumour, so its own post cannot independently confirm itself. Ellen also does not have the file the office posted — she has a screenshot re-uploaded to X.',
      },
      {
        key: 'content',
        label: 'Content',
        stepIndex: 2,
        thought:
          'He is holding a newspaper. That is a date, right there in his hand. And people keep saying the shirt proves it is old.',
        actions: [
          {
            category: 'inspect-content',
            did: 'Enlarged the newspaper in his hand and read what she could of the masthead, the date and the front-page headline.',
            returned:
              'Legible enough to identify the paper, a date of 12 July 2026, and a front-page sports headline.',
            support: 'toward',
          },
          {
            category: 'read-replies',
            did: 'Followed the most-quoted argument in the thread — that he is wearing the same red-checked shirt as in a 2023 photograph — and compared the two images.',
            returned:
              'The shirt does look like the same shirt. It establishes that he owns the shirt.',
            support: 'neither',
          },
          {
            category: 'tool',
            did: 'Ran the copy she has — the re-uploaded screenshot from X — through three free AI-detection sites.',
            returned:
              'Two report no sign of AI. One reports that AI was likely used. Ellen has no way to reconcile them.',
            support: 'neither',
          },
        ],
        narrator:
          'The matching shirt fits both “this is real” and “this is an old photo.” It does not decide anything. The detectors were run on a compressed screenshot, not the office’s file. Nothing in the tools tells her whether that matters.',
      },
      {
        key: 'alignment',
        label: 'Alignment',
        stepIndex: 3,
        thought:
          'The newspaper is checkable against the actual newspaper. And there is an AI assistant right here in the app.',
        actions: [
          {
            category: 'search',
            did: 'Looked up that newspaper’s edition for 12 July 2026 and compared the front page against what is visible in his hand.',
            returned:
              'The date, the section and the front-page headline match the published edition.',
            support: 'toward',
          },
          {
            category: 'tool',
            did: 'Asked Grok, the AI assistant built into X, what it made of the image.',
            returned:
              'Grok states four things: that the image is AI-generated; that it carries a SynthID watermark from Gemini or OpenAI; that the office released only a text statement and no photograph; and that a named newspaper has already debunked it.',
            support: 'against',
          },
          {
            category: 'search',
            did: 'Checked Grok’s claims one at a time.',
            returned:
              'The office did publish the photograph, on two official channels. The named newspaper was covering a different fake image entirely. The remaining two claims she cannot check at all.',
            support: 'neither',
          },
          {
            category: 'search',
            did: 'Looked into a senator’s public remark that “a source” had told him the photograph was old.',
            returned: 'No source named, nothing to examine.',
            support: 'neither',
          },
          {
            category: 'search',
            did: 'Searched for independent video of the senator from the same period.',
            returned: 'None available.',
            support: 'neither',
          },
        ],
        narrator:
          'Two of Grok’s four claims fell apart as soon as Ellen checked. The other two could not be checked at all. It is easy to confirm that a cited source exists. It is much harder to confirm that a claimed debunk does not exist, because absence leaves nothing to inspect.',
      },
      {
        key: 'reflect',
        label: 'Now Reflect',
        stepIndex: 4,
        thought:
          'I came in expecting to close this. I cannot close it. I also cannot say it is fake.',
        actions: [
          {
            category: 'pause',
            did: 'Counted what she actually has, by kind rather than by number of things she did.',
            returned:
              'The newspaper is one usable independent kind of evidence. The official post is not independent of the subject. The detectors disagreed with each other, so that check returned nothing. There is no independent video.',
            support: 'neither',
          },
        ],
        narrator:
          'One usable independent kind of evidence is not two. There is a pull to close this anyway — either to kill the rumour, or to trust the assistant that called the photo fake.',
      },
    ],
    outcome: {
      state: 'unresolved',
      action: 'Hold. Do not pass it on, and do not dismiss it either.',
      rationale:
        'Only one independent kind of evidence returned anything usable. Ellen does not post the reply calling it fake, and she does not post that it is confirmed real. This is a complete result: with what she can reach, the question is open.',
    },
  },

  /* ---------------------------------------------------------------- */
  {
    id: 'case1',
    order: 4,
    title: 'An urgent phone call',
    shortLabel: 'Case 4',
    character: {
      name: 'Rekha',
      blurb: 'runs a small play school in Indore',
    },
    encounterType: 'request',
    asOf: 'the afternoon of the call',
    encounter:
      'Rekha’s phone rings in the middle of the afternoon. The caller sounds exactly like her cousin Manoj, who works for the police in another state. He says a friend of his needs urgent heart surgery, that the hospital will not start without a deposit, and that she should send the money now using a QR code he is about to share. He stays on the line while he explains.',
    stopReaction:
      'It is Manoj’s voice. Rekha’s chest tightens and she is already reaching for her other phone. She makes herself stop and name what is happening: she is frightened, she is being hurried, and she has not checked anything.',
    steps: [
      {
        key: 'source',
        label: 'STOP and Source',
        stepIndex: 1,
        thought:
          'It is his voice and it is his number. What else do I actually know?',
        actions: [
          {
            category: 'pause',
            did: 'Stopped before acting and named her state: frightened, hurried, not yet checking.',
            returned:
              'Enough of a gap to ask a question. Nothing about who is calling.',
            support: 'neither',
          },
          {
            category: 'check-source',
            did: 'Looked at the number on the screen and listened again to the voice.',
            returned:
              'Both appear to be her cousin’s. Both reached her through the call itself.',
            support: 'neither',
          },
        ],
        narrator:
          'There is no account, article, or file to check. Everything Rekha knows about the caller came from the call. A voice can be copied. A displayed number can be faked.',
      },
      {
        key: 'content',
        label: 'Content',
        stepIndex: 2,
        thought:
          'Why can I not speak to the person who is ill? Why does it have to be right now?',
        actions: [
          {
            category: 'inspect-content',
            did: 'Listened to what was actually being asked, rather than to who seemed to be asking.',
            returned:
              'Money, immediately, by a method that will be difficult to reverse. The emergency belongs to a third party she cannot speak to. The caller is keeping her on the line.',
            support: 'against',
          },
        ],
        narrator:
          'This does not prove the voice is cloned. It shows the shape of the request: urgency, a payment that is hard to reverse, and a story that cannot be checked without leaving the call. Someone is asking Rekha to act, and going along cannot be undone. This is a request, not information.',
      },
      {
        key: 'alignment',
        label: 'Alignment',
        stepIndex: 3,
        thought:
          'I do not have to work out whether the voice is real. I just have to reach Manoj some other way.',
        actions: [
          {
            category: 'contact',
            did: 'Said she would call straight back, ended the call, and dialled the number already saved in her phone.',
            returned: 'Manoj answers. He is at work. There is no friend in surgery.',
            support: 'against',
          },
        ],
        narrator:
          'There is nothing to search and no image to inspect. The useful move is to reach Manoj through a route the caller does not control. Rekha can do that without sending money.',
      },
      {
        key: 'reflect',
        label: 'Now Reflect',
        stepIndex: 4,
        thought:
          'Before I called back I did not know. But not knowing did not mean doing nothing — it meant not sending the money yet.',
        actions: [
          {
            category: 'pause',
            did: 'Looked back at the point just before the callback and asked what the right move had been then.',
            returned:
              'At that point the evidence was unresolved: everything she had came from the caller. The callback was the step she could take without committing anything, and it produced the independent evidence she was missing.',
            support: 'neither',
          },
        ],
        narrator:
          'Before the callback the evidence was unresolved. Waiting on the line was not the safe option — staying on a hurried call was itself the risk.',
      },
    ],
    outcome: {
      state: 'contradicted',
      action:
        'Before the callback: check through a route the caller does not control. After it: refuse, and report.',
      rationale:
        'Up to the callback the evidence was unresolved. For a request, unresolved means take the step you can reverse — not sit still. The callback was that step, and it ran against the claim. Rekha sends nothing and reports the number to the cybercrime helpline.',
    },
  },
];

/** Cases in the order participants see them. */
export const CASE_ORDER = ['case2', 'case3', 'case4', 'case1'] as const;

export const CASES_IN_ORDER: CaseContent[] = CASE_ORDER.map((id) => {
  const found = CASES.find((c) => c.id === id);
  if (!found) {
    throw new Error(`Unknown case id: ${id}`);
  }
  return found;
});

/* ------------------------------------------------------------------ */
/* Reference cards                                                     */
/* ------------------------------------------------------------------ */

export const REFERENCE_CARDS = {
  sift: {
    id: 'sift',
    title: 'SIFT summary',
    body: 'SIFT is a flexible approach for checking online information, developed by Mike Caulfield (2019) and set out with Sam Wineburg in “Verified” (University of Chicago Press, 2023). Its four moves are: Stop; Investigate the source; Find better coverage; and Trace claims, quotes and media back to the original context. These are moves rather than a required sequence. A person may use them in any order, and one move may sometimes be enough. Later guidance from Caulfield (2025) also discusses using language models as research tools while checking the sources and claims they provide.',
  },
  detector: {
    id: 'detector',
    title: 'Detection and provenance tools',
    body: 'In practice this is where many people start: run the image through an AI detector, or look for a watermark or Content Credential, and take the answer. Each of these tools is promoted on its own terms, and none of them is presented to the public alongside the others or alongside its own error rate. They can return useful information. They also frequently return nothing conclusive: a missing watermark does not show that something is authentic, and two detectors run on the same image may disagree.',
  },
};

/* ------------------------------------------------------------------ */
/* SIFT route exhibits — two routes for the same person on each case   */
/* ------------------------------------------------------------------ */

export interface SiftRoute {
  id: string;
  label: string;
  body: string;
  moves: string[];
  /** Researcher-only. Never rendered to participants. */
  fails: boolean;
}

export interface SiftCaseBlock {
  caseId: string;
  title: string;
  encounter: string;
  routes: SiftRoute[];
}

const case2Content = CASES.find((c) => c.id === 'case2');
if (!case2Content) {
  throw new Error('Unknown case id: case2');
}
const case4Content = CASES.find((c) => c.id === 'case4');
if (!case4Content) {
  throw new Error('Unknown case id: case4');
}

export const SIFT_BLOCKS: SiftCaseBlock[] = [
  {
    caseId: 'case2',
    title: 'The wind forecast map — if Dana had used SIFT',
    encounter: case2Content.encounter,
    routes: [
      {
        id: 'routeA',
        label: 'Route A',
        body: 'Dana stops on the odd place names and traces them: she puts “Orangeotild” and “Whata Bod” into a maps app and a search, and neither exists anywhere. She concludes the map is not reliable and stops there. She gets to the same place faster than working through every STOP&SCAN step.',
        moves: ['Trace claims, quotes, and media to the original context'],
        fails: false,
      },
      {
        id: 'routeB',
        label: 'Route B',
        body: 'Dana investigates the source. The account is the genuine National Weather Service office for that region, posting forecasts as it does every day. Satisfied that the source is what it appears to be, she stops without looking at the place names, and reshares the map.',
        moves: ['Investigate the source'],
        fails: true,
      },
    ],
  },
  {
    caseId: 'case4',
    title: 'The senator’s photograph — if Ellen had used SIFT',
    encounter: case4Content.encounter,
    routes: [
      {
        id: 'routeA',
        label: 'Route A',
        body: 'Ellen goes looking for better coverage without leaving the app, and asks Grok. It tells her the image is AI-generated, that it carries a SynthID watermark, and that a named newspaper has already debunked it. That reads like coverage from elsewhere, so she accepts it and concludes the photograph is fake. Every one of those claims is false or refers to a different image.',
        moves: ['Find better coverage'],
        fails: true,
      },
      {
        id: 'routeB',
        label: 'Route B',
        body: 'Ellen traces the newspaper in the senator’s hand back to its original: the date, the section and the front-page headline all match the published edition for 12 July 2026. That is real evidence, honestly obtained. She concludes the photograph is probably authentic and stops. SIFT does not tell her how many independent kinds of evidence she needed before stopping.',
        moves: ['Trace claims, quotes, and media to the original context'],
        fails: true,
      },
    ],
  },
];

export const SIFT_INTRO =
  'SIFT does not require a fixed order. Someone may use only the moves that look useful, and may stop after one. The two routes below are examples we wrote for this study: two different ways the same person might have used SIFT on this case. They are not the only ways SIFT could go. Tell us if a route seems unrealistic or unfair.';

export const SIFT_CRITIQUE = {
  intro:
    'Below are five concerns we hold about using SIFT with synthetic media. Tell us where you agree, where a concern is overstated, and where it is wrong.',
  positions: [
    {
      id: 'stop',
      title: 'On Stop',
      body: 'SIFT asks people to pause and notice their reaction, but not to note where they started. Without a starting point, it is hard to tell afterwards whether evidence changed someone’s mind or whether they gathered support for what they already thought.',
    },
    {
      id: 'investigate',
      title: 'On Investigate the source',
      body: 'This move works best when there is a source to identify and research. Some synthetic content has no original source at all. In other cases a genuine organisation publishes something incorrect or AI-generated under its own name, and confirming the source then gives false reassurance.',
    },
    {
      id: 'coverage',
      title: 'On Find better coverage',
      body: 'Searching for other coverage assumes the search results are reliable. Results, copied claims, and AI-generated summaries can repeat a false claim, so looking elsewhere sometimes makes a judgment worse.',
    },
    {
      id: 'trace',
      title: 'On Trace to the original context',
      body: 'Some synthetic media has no authentic original to find. Authentic media may have an original that cannot be reached. The move also does not address provenance systems such as Content Credentials or watermarks, which did not exist when it was written.',
    },
    {
      id: 'ai',
      title: 'On the 2025 AI guidance',
      body: 'In 2025, Caulfield added guidance on using language models as research tools and checking the sources they supply. Our concern is an asymmetry: it is easy to check that a cited source exists, and much harder to check that a claimed article or debunk does not exist, because absence leaves nothing to inspect. A model can also steer the search before any checking begins.',
    },
  ],
};

/* ------------------------------------------------------------------ */
/* Debrief                                                             */
/* ------------------------------------------------------------------ */

export const DEBRIEF = {
  thankYou: 'Thank you. Your responses are recorded and cannot be edited.',
  intro:
    'Each case was frozen to the date shown at the top of it. Here is where each stands in the public record, including what happened afterwards.',
  resolutions: [
    {
      caseId: 'case2',
      label: 'The wind forecast map (frozen to 5 January 2026)',
      body: 'As recorded. The National Weather Service office in Missoula used a generative AI tool to build the base map, which invented the place names. The post was removed and the map corrected. The Washington Post’s enquiry to the agency is what prompted the removal — Dana would not have known that at the time.',
      links: [
        { label: 'AI Incident Database, Incident 1332', url: 'https://incidentdatabase.ai/cite/1332/' },
        { label: 'The Washington Post, 6 January 2026', url: 'https://www.washingtonpost.com/weather/2026/01/06/nws-ai-map-fake-names/' },
      ],
    },
    {
      caseId: 'case3',
      label: 'The campaign crowd photograph (frozen to 12 August 2024)',
      body: 'Rated True by Snopes: the photograph is authentic and the crowd was there. PolitiFact rated the AI claim Pants on Fire. A digital forensics researcher who examined it found no doubt that the photograph was real, and attributed the halo effect around people to the unusual lighting in the hangar.',
      links: [
        { label: 'Snopes fact check', url: 'https://www.snopes.com/fact-check/harris-walz-crowd/' },
        { label: 'PolitiFact, 12 August 2024', url: 'https://www.politifact.com/factchecks/2024/aug/12/donald-trump/why-trumps-claim-that-the-harris-campaign-used-ai' },
      ],
    },
    {
      caseId: 'case4',
      label: 'The senator’s photograph (frozen to 13 July 2026)',
      body: 'Two professional fact-checkers reached different endings on the same day. Snopes left the claim UNRATED, pending a response from the senator’s office and video footage, on the grounds that the image quality made lesser forms of alteration impossible to rule out. PolitiFact rated the claim False. One point worth flagging, because it is the reason our walkthrough differs from theirs: Snopes worked from the published file and ran four detection tools, all four of which pointed away from AI — two confidently, two at low probability. Ellen was working from a screenshot re-uploaded to X, and got a split. We wrote it that way deliberately. The artifact an ordinary person can reach is often not the artifact a fact-checker reaches, and nothing in the tools tells them so.',
      links: [
        { label: 'Snopes, 13 July 2026 (left unrated)', url: 'https://www.snopes.com/news/2026/07/13/mitch-mcconnell-photo/' },
        { label: 'PolitiFact, 13 July 2026 (rated False)', url: 'https://politifact.com/factchecks/2026/jul/13/tweets/mitch-mcconnell-rehabilitation-photo-ai-reused/' },
      ],
    },
    {
      caseId: 'case1',
      label: 'The urgent phone call',
      body: 'As recorded in the AI Incident Database. In the documented incident the money was sent before any callback was made. Our walkthrough is a counterfactual: what the framework would have surfaced, not what happened.',
      links: [
        { label: 'AI Incident Database, Incident 1339', url: 'https://incidentdatabase.ai/cite/1339/' },
      ],
    },
  ],
  notes: [
    'The walkthroughs you read were written by our research team as demonstrations. They are not authoritative analyses of these incidents. They are published alongside this study so that readers can judge for themselves whether they were fair.',
    'The people walking through each case are fictional. The public figures and organisations in them are named as they were reported.',
    'The positions we stated about SIFT are our arguments and they are contested. Nothing you said was scored, and no individual’s responses will be reported.',
  ],
  contacts: {
    pi: 'Saniat Javid Sohrawardi, Principal Investigator — john.sohrawardi@rit.edu, Rochester Institute of Technology',
    team: [
      'Y. Kelly Wu — kellywu@mail.rit.edu, Rochester Institute of Technology',
      'Fatma Aksu — fatma.aksu2@unibo.it, University of Bologna',
      'Alessandra Sala — alessandra.sala@outlook.ie, AI Office of Ireland',
      'Luca Pietrantoni — luca.pietrantoni@unibo.it, University of Bologna',
    ],
    hsro: 'RIT Human Subjects Research Office — hsro@rit.edu — 585-475-7673',
  },
};

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

export function getCase(caseId: string): CaseContent {
  const found = CASES.find((c) => c.id === caseId);
  if (!found) {
    throw new Error(`Unknown case id: ${caseId}`);
  }
  return found;
}

export function getStep(caseId: string, stepKey: string): CaseStepContent {
  const caseContent = getCase(caseId);
  const step = caseContent.steps.find((s) => s.key === stepKey);
  if (!step) {
    throw new Error(`Unknown step ${stepKey} for ${caseId}`);
  }
  return step;
}

export function getSiftBlock(caseId: string): SiftCaseBlock {
  const found = SIFT_BLOCKS.find((b) => b.caseId === caseId);
  if (!found) {
    throw new Error(`Unknown SIFT block for ${caseId}`);
  }
  return found;
}
