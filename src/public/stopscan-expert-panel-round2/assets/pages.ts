import { referenceById } from './references';

export type LevelTone = 'light' | 'moderate' | 'deep' | 'every';

export type LevelRow = {
  tone: LevelTone;
  name: string;
  text: string;
};

export type UserPiece =
  | { kind: 'paragraph'; text: string }
  | { kind: 'questions'; items: string[] }
  | { kind: 'rule'; text: string }
  | { kind: 'steps'; items: string[] }
  | { kind: 'levels'; rows: LevelRow[] };

export type TableSpec = {
  caption?: string;
  columns: string[];
  rows: string[][];
};

export type RatingSpec = {
  id: string;
  prompt: string;
};

export type RoundPageContent = {
  id: string;
  eyebrow: string;
  big?: string;
  title: string;
  tone: 'default' | 'stop';
  lead?: string;
  paragraphs?: string[];
  why?: { summary: string; paragraphs: string[] };
  how?: { summary: string; paragraphs: string[]; references: string[] };
  userbox?: { caption: string; pieces: UserPiece[] };
  example?: string;
  teaching?: { summary: string; tables: TableSpec[]; startOpen?: boolean };
  research?: { items: string[]; references?: string[] };
  ratings: RatingSpec[];
  openPrompt?: string;
};

const LIGHT = 'light' as const;
const MODERATE = 'moderate' as const;
const DEEP = 'deep' as const;
const EVERY = 'every' as const;

export const ROUND_PAGES: RoundPageContent[] = [
  {
    id: 'intro',
    eyebrow: 'Page 1 of 8',
    title: 'What you told us',
    tone: 'default',
    paragraphs: [
      'Thank you for your Round 1 answers. Sixteen experts took part. They worked in media literacy education, fact-checking, human factors, misinformation research, and digital forensics. Their comments agreed more often than we expected.',
      'The panel supported the main parts of STOP&SCAN. **14 of 15** agreed that the five elements are the right ones. **13 of 14** said STOP&SCAN is more reliable than SIFT when search results are misleading. **11 of 14** said STOP&SCAN is more likely to lead to a careful judgement.',
      'The panel also said that the full process is too much work for daily use. Twelve experts said this in their comments. Nine said people may not pause when they feel rushed or upset. All **16** experts saw a reason to pause for Rekha\'s scam call. Only **5 of 15** saw a reason to pause for Dana\'s weather map.',
      'All changes follow one idea: STOP decides how much effort the rest of the check needs. Each letter stays in the same place. Each letter gets one main change.',
      '**How each page works.** The tinted box shows the new text that the public will see. The two closed panels above it explain why we made the change and what research supports it. The panels below show teaching material and questions for future research. You may open any panel.',
      '**How to rate.** Rate each change from 1 (strongly disagree) to 5 (strongly agree). If you choose 1, 2, or 3, tell us what you would change. Some of your feedback appears in the framework on later pages. We will discuss the rest in the research paper.',
      'The questionnaire takes about **10 minutes**. Most numbers refer to all 16 experts. If fewer people answered a question, we show that number. Comment counts refer to the 15 experts who wrote comments.',
    ],
    ratings: [],
  },
  {
    id: 'stop',
    eyebrow: 'Page 2 of 8',
    big: 'STOP',
    title: 'Pause, and set the effort',
    tone: 'stop',
    lead: 'STOP first asks whether you need to check the content. If you do, three questions decide how much effort each SCAN letter needs.',
    why: {
      summary: '16 of 16 saw a reason to pause for the scam call, 5 of 15 for the weather map',
      paragraphs: [
        'People may skip the pause when they feel rushed, scared, or angry. Nine experts made this point. All **16** experts saw a reason to pause before Rekha sent money. Only **5 of 15** saw a reason to pause before Dana shared a weather map.',
        'Twelve experts said it is not realistic to use every step on all content. Several said the effort should depend on what could go wrong. Four asked us to name the exact claim being checked. Without a clear claim, the panel split **8 to 8** on Marcus\'s photo.',
      ],
    },
    how: {
      summary: '7 sources',
      paragraphs: [
        'The first question has two parts because content affects you in two ways. You may act on content by liking, sharing, replying, or paying. Content may also change what you believe, even if you scroll past it. Seeing a false headline once made it seem more accurate one week later, even when it had a warning label (Pennycook, Cannon and Rand, 2018). Asking people to judge a claim when they first saw it removed this later effect for claims they knew enough to question (Brashier, Eliseev and Marsh, 2020).',
        'The two parts act as a filter. People stop noticing warnings when they see them too often (Anderson et al., 2015; Vance et al., 2017). A pause on every post may have the same problem.',
        'The three questions set the effort before you look at the evidence. A familiar or easy-to-read claim can feel correct even when it is not (Ackerman and Thompson, 2017). The possible harm gives a more stable guide. The questions also create clear if-then plans. These plans help people act on their goals (Gollwitzer, 1999).',
        'Pressure has its own question because scams often create pressure. Urgency, authority, and requests to help someone can make people act before they think (Stajano and Wilson, 2011).',
      ],
      references: ['pennycook2018', 'brashier2020', 'anderson2015', 'vance2017', 'ackerman2017', 'gollwitzer1999', 'stajano2011'],
    },
    userbox: {
      caption: 'The new STOP, in the words people will see',
      pieces: [
        { kind: 'paragraph', text: 'Pause before you like, share, reply to, or act on something. Also pause if a post changes what you think about a person, group, or place. Ask yourself two questions.' },
        { kind: 'questions', items: ['Do I care to engage with this?', 'Does this change what I think about someone or something?'] },
        { kind: 'rule', text: 'If both answers are no, keep scrolling. If either answer is yes, ask three more questions.' },
        {
          kind: 'steps',
          items: [
            'What is my first reaction, and is anything rushing me?',
            'What is this telling me, asking me to do, or warning me about?',
            'What could happen if I am wrong? How hard would it be to undo the harm?',
          ],
        },
        {
          kind: 'levels',
          rows: [
            { tone: LIGHT, name: 'Light check', text: 'Little at stake, easy to undo, nothing rushing you.' },
            { tone: MODERATE, name: 'Moderate check', text: 'Something at stake, but a mistake is fixable.' },
            { tone: DEEP, name: 'Deep check', text: 'A lot is at stake, the harm is hard to undo, or the content will reach many people.' },
            { tone: EVERY, name: 'Rushed or unsure', text: 'Go one level deeper.' },
          ],
        },
        { kind: 'paragraph', text: 'If a message asks you to pay, sign in, or send a code, do not send anything until you finish the check. If a message gives a warning, contact the official source yourself. Do not use the links or phone numbers in the message.' },
      ],
    },
    teaching: {
      summary: 'Entry questions, the three questions, and the same format at different effort',
      tables: [
        {
          caption: 'The entry questions. Each yes starts STOP, and the three questions decide the effort.',
          columns: ['Entry question', 'Yes, so STOP starts', 'No, so you scroll on'],
          rows: [
            ['Do I care to engage with this?', 'You want to share a story about a strike at your local hospital. Big news or small, the three questions set the effort', 'A trending clip you watch to the end and leave, with no wish to react'],
            ['Does this change what I think about someone or something?', 'A run of posts guessing which side a famous footballer backs in a foreign war. You never react, yet your view of him shifts', 'A post repeating a match result you watched live. Nothing new to believe'],
          ],
        },
        {
          caption: 'What each answer means. Each example and its counterfactual differ in one detail.',
          columns: ['Question', 'When you notice', 'What to do', 'Example', 'Counterfactual'],
          rows: [
            ['1. First reaction and pressure', 'A deadline, a countdown, a strong pull of anger, fear or excitement, or a strong wish for the story to be true', 'Note your reaction, to look back on at the end. Hold any action and go one level deeper', 'A message says your account closes in one hour unless you confirm your details', 'The same request with no deadline, asking you to confirm next time you sign in. Nothing rushes you, though question 2 still flags a request'],
            ['2. Telling me something', 'A claim about what happened, when, where or who, or a photo you take to show one of these', 'Put the claim in one sentence, including what you assume, such as when or where a photo was taken. SCAN checks this sentence', 'A post says the city council voted last night to close the library', 'A post says "I\'d hate to see the library close." A feeling, with nothing to check'],
            ['2. Asking me to do something', 'A request to pay, sign in, send a code or personal details, or forward the message', 'Hold the action. Confirm through a channel you control, such as a number you already have', 'A friend\'s account asks for the code sent to your phone a moment ago', 'The same account shares a joke. Nothing waits on you'],
            ['2. Warning me', 'A warning about your money, health, safety or family, through a channel you did not choose', 'Hold the action and skip its links and numbers. Go to the official source yourself', 'A forwarded group message says police are evacuating your street', 'The same alert in your local council\'s own app. Already the official source, so a light check, then act'],
            ['3. Cost of being wrong', 'How much is at stake, how hard the damage is to undo, and how many people the post reaches', 'Little at stake, light. Something at stake, moderate. A lot, no undo or wide reach, deep', 'Reposting a claim to thousands of followers needs a deep check', 'Sending the same post to one friend to ask their view needs a light check'],
          ],
        },
        {
          caption: 'Format does not set the effort. What you are about to do, and its cost, does.',
          columns: ['Format', 'Light check', 'Deep check', 'What changed'],
          rows: [
            ['A post', 'A joke you scroll past', 'A claim you are about to repost to thousands', 'How far the post would reach'],
            ['A call', 'A known number asking about dinner', 'A relative\'s voice asking for bail money now', 'Money you cannot recall, and a rush'],
            ['An email', 'Your usual newsletter', 'An overdue invoice asking you to pay a new account', 'Money sent to an account you do not know'],
            ['A video', 'A clip you watch for fun', 'A clip of a candidate you plan to share the day before a vote', 'A vote, wide reach and a deadline'],
            ['A claim', 'A fun fact about octopuses', 'A remedy you plan to take in place of a prescribed medicine', 'Your health'],
          ],
        },
      ],
    },
    research: {
      items: [
        'Whether people pause at all under pressure. An expert panel cannot show this. A user study with calm and urgent conditions would.',
        'Whether people notice a view shifting. The first-sight effect held for claims people knew enough to question (Brashier, Eliseev and Marsh, 2020). Claims about strangers or distant events lack this knowledge and risk slipping past the second entry question.',
        'How often the entry questions fire in a real feed, too often or too rarely.',
        'Whether people pick the right effort level for themselves, and where the line between levels sits.',
      ],
      references: ['brashier2020'],
    },
    ratings: [
      { id: 'stop_entry', prompt: 'The two entry questions, and scrolling on when both answers are no' },
      { id: 'stop_questions', prompt: 'The three questions, and how they set the effort level' },
    ],
  },
  {
    id: 'source',
    eyebrow: 'Page 3 of 8',
    big: 'S',
    title: 'Source',
    tone: 'default',
    lead: 'The Source check now changes with the effort level. A light check looks at who posted the content. A deep check finds where the claim started and asks what the source may gain.',
    why: {
      summary: '15 of 16 found Dana\'s reshare plausible because the account was real',
      paragraphs: [
        'Most checks stopped after finding a real account. **15 of 16** experts found Dana\'s shared post believable because the weather service account was real. Thirteen of the 15 experts who wrote comments said that checking only the source or a tool could mislead someone or leave the answer unclear.',
        '**12 of 16** disagreed that SIFT gives enough guidance when a trusted source publishes false content (R11). Six said that neither framework asks who gains from a claim.',
      ],
    },
    how: {
      summary: '5 sources',
      paragraphs: [
        'Professional fact-checkers leave the page and read what other sources say about it. Historians and students who stayed on the page were more often misled (Wineburg and McGrew, 2019). This is why moderate and deep checks look outside the post. Civic online reasoning starts with the question, "Who is behind the information?" (McGrew et al., 2018). We also ask what that source may gain.',
        'The first account you see may not be where the claim started. A few accounts may start a false claim. Many other accounts may then spread it, either together or without knowing it is false (Starbird, Arif and Wilson, 2019). The deep check therefore asks who started and spread the claim.',
        'A real account only tells you who posted the content. It does not tell you whether the content is true. Missing information about where content came from also proves nothing. In one study, incomplete source history made people doubt real media (Feng et al., 2023). A statement such as "this is fake" also has a source. People sometimes call real evidence fake to avoid it (Chesney and Citron, 2019).',
      ],
      references: ['wineburg2019', 'mcgrew2018', 'starbird2019', 'feng2023', 'chesney2019'],
    },
    userbox: {
      caption: 'The new Source, in the words people will see',
      pieces: [
        {
          kind: 'levels',
          rows: [
            { tone: LIGHT, name: 'Light check', text: 'Look at the account that posted the content. If a friend shared the post, find the account that your friend got it from.' },
            { tone: MODERATE, name: 'Moderate check', text: 'Look at the account\'s record. Is the account real? How old is the account, and what else has the owner posted?' },
            { tone: DEEP, name: 'Deep check', text: 'Find the first account that posted the claim. Look at who is spreading it. What might they gain if you believe or share it?' },
            { tone: EVERY, name: 'Every level', text: 'A real or official account tells you who posted something. Whether the content is true is a separate question. A claim like "this is fake" or "this is AI" has a source too.' },
          ],
        },
      ],
    },
    example: 'Ellen finds the senator\'s photo on his office\'s official page. A light check shows a real account. A deep check asks what the office gains, and the office gains if people believe the senator is well. So the photo still needs a second, independent piece of evidence at Alignment.',
    teaching: {
      summary: 'Source at each effort level, with counterfactuals',
      tables: [
        {
          caption: 'Each example and its counterfactual differ in one detail.',
          columns: ['Level', 'What you check', 'Example', 'Counterfactual'],
          rows: [
            ['Light', 'The account which posted what you see, past any resharer', 'Your cousin reshares a "breaking" post. Past your cousin sits an anonymous page created last month', 'Your cousin posts a photo from their own phone. Your cousin is the source'],
            ['Moderate', 'Whether the account is real, its age, and what else the account posts', 'A "news" account with a familiar logo, three weeks old, posting only about one election', 'The same logo on an account with twelve years of daily local reporting'],
            ['Deep', 'Who first posted the claim, who spreads the claim, and what they gain', 'A clip first posted by a campaign\'s media team, then pushed by dozens of new accounts with the same caption inside an hour', 'The same clip first posted by a local TV station and shared by viewers in their own words'],
          ],
        },
      ],
    },
    research: {
      items: [
        'How far non-experts trace a claim to where the claim started, when the trail runs through screenshots and deleted posts.',
        'Whether asking what a source gains tips people into doubting reliable sources. Across studies, people judge false news well, and their errors lean toward doubting true news (Pfänder and Altay, 2025).',
        'Which signs of coordinated spreading non-experts spot without tools.',
      ],
      references: ['pfander2025'],
    },
    ratings: [
      { id: 'source', prompt: 'The new Source, with a check for each effort level' },
    ],
  },
  {
    id: 'content',
    eyebrow: 'Page 4 of 8',
    big: 'C',
    title: 'Content',
    tone: 'default',
    lead: 'The Content step now starts with checks that need no special skill. It names common pressure tactics. Visual signs and tools come last.',
    why: {
      summary: 'Useful in 52 of 62 step ratings, lowest for Ellen at 11 of 15',
      paragraphs: [
        'Finding false content by sight takes expert skill, and AI makes this harder. The panel rated Content useful in **52 of 62** step ratings. Ellen\'s case had the lowest score: **11 of 15**. That case depended on looking at an image and using detectors. Rekha\'s case needed no forensic skill.',
        'Four experts asked us to start with what the content shows or asks you to do, before looking at pixels. Six said neither framework asks who gains from a claim. One said that missing manipulation tactics was a serious gap.',
      ],
    },
    how: {
      summary: '3 sources',
      paragraphs: [
        'People cannot reliably tell AI-generated faces from real faces by sight. In one study, people were correct 48% of the time. Training raised this to only 59% (Nightingale and Farid, 2022). This is why visual checks come last.',
        'It is more useful to name common tactics. Short teaching videos helped people find manipulation tactics in new posts. This worked in a lab and in a YouTube field test (Roozenbeek et al., 2022). Scams often use urgency, authority, or requests to help someone (Stajano and Wilson, 2011). Content names these tactics.',
        'STOP puts the claim into one sentence. This gives the Content step one clear target. The panel split on Marcus\'s photo because one post contained two different claims.',
      ],
      references: ['nightingale2022', 'roozenbeek2022', 'stajano2011'],
    },
    userbox: {
      caption: 'The new Content, in the words people will see',
      pieces: [
        {
          kind: 'levels',
          rows: [
            { tone: LIGHT, name: 'Light check', text: 'What exactly does the content say, or ask you to do? Keep the sentence from STOP in view.' },
            { tone: MODERATE, name: 'Moderate check', text: 'Find details worth checking, such as names, places and dates. Note what the content leaves out.' },
            { tone: DEEP, name: 'Deep check', text: 'Look for pressure. This may include urgency, strong emotion, or someone pretending to be a person you trust. Then check the image or sound. If something seems odd, check it in Alignment. Your eyes and one tool can both miss a good fake.' },
          ],
        },
      ],
    },
    example: 'Dana\'s weather map names towns which do not exist. She finds this by reading the labels, with no image analysis.',
    teaching: {
      summary: 'Content at each effort level, and the pressure tricks',
      tables: [
        {
          caption: 'Each example and its counterfactual differ in one detail.',
          columns: ['Level', 'What you check', 'Example', 'Counterfactual'],
          rows: [
            ['Light', 'The claim or request, in one line', 'A post says a new law bans cash payments from January. The claim is the ban and its date', 'A post asks which café in town still takes cash. A question, with no claim to check'],
            ['Moderate', 'Named details, and what the content leaves out', 'A photo captioned as last night\'s flood in your town shows a shop sign in another language', 'The same flood photo shows a street sign you recognise, and the caption gives a date. The details line up, and Alignment confirms them'],
            ['Deep', 'Pressure, imitation, then the image or sound itself', 'A voice message from your "boss" asks you to buy gift cards before a meeting ends in 20 minutes', 'Your boss asks in the usual team chat for printer paper by Friday. No rush and no odd payment'],
          ],
        },
        {
          caption: 'The pressure tricks Content names.',
          columns: ['Trick', 'What the trick sounds like', 'Example'],
          rows: [
            ['Urgency', 'Act now, within the hour, before the deadline', '"Your parcel will be returned tonight unless you pay the fee"'],
            ['Strong emotion', 'Outrage, fear, pity, or delight', 'A video framed to make you furious at a named group'],
            ['Posing as someone you trust', 'A relative\'s voice, your bank\'s logo, your boss\'s name', 'A cloned voice of your son asking for bail money'],
          ],
        },
      ],
    },
    research: {
      items: [
        'Which pressure tricks non-experts name in the moment, outside a training setting.',
        'How long named-detail checks stay useful as generators get better at text in images and at local detail.',
        'Whether naming tricks carries over across formats, such as from posts to phone calls.',
      ],
    },
    ratings: [
      { id: 'content', prompt: 'The new Content, opening with checks which need no special skill' },
    ],
  },
  {
    id: 'alignment',
    eyebrow: 'Page 5 of 8',
    big: 'A',
    title: 'Alignment',
    tone: 'default',
    lead: 'Alignment now starts with one clear question. It has a three-part test for independent evidence and clear rules for AI answers and tools.',
    why: {
      summary: '2 of 16 agreed a non-expert would be able to judge independence',
      paragraphs: [
        'Independent evidence was the weakest part of Round 1. Only **2 of 16** agreed that a non-expert could tell whether two pieces of evidence are independent (R4). Seven disagreed. **10 of 15** supported requiring two kinds of evidence (R3), which was below our consensus level. Ten experts named independence as a weak point. Three suggested a test.',
        'Eleven experts warned that people may treat AI assistant answers as evidence. Nine gave the same warning about detectors. **14 of 16** thought it was believable that Ellen would rely on a platform AI assistant. Eight said that calling Manoj back was the key step in Rekha\'s case.',
      ],
    },
    how: {
      summary: '5 sources',
      paragraphs: [
        'People may count copies of one source as separate confirmations. In one study, several people repeating one original source were almost as convincing as truly independent sources (Yousif, Aboody and Keil, 2019). The test therefore asks where each piece of evidence came from.',
        'An online search does not always solve this problem. Searching for false news sometimes made people more likely to believe it. This happened when search results showed poor-quality pages that repeated the claim (Aslett et al., 2024).',
        'People may trust automated advice too much, especially when they cannot inspect how it works (Parasuraman and Riley, 1997). Trust should depend on how reliable the tool is for the current case (Lee and See, 2004). In one study, people relied less on AI when they formed their own view before seeing the AI answer (Buçinca, Malaya and Gajos, 2021). An AI answer or detector result should therefore be a clue to check. It is not enough evidence by itself.',
        'Different tools check different things. A reverse image search finds older copies. A metadata viewer reads the file history. For this reason, using different methods gives stronger evidence.',
      ],
      references: ['yousif2019', 'aslett2024', 'parasuraman1997', 'lee2004', 'bucinca2021'],
    },
    userbox: {
      caption: 'The new Alignment, in the words people will see',
      pieces: [
        { kind: 'paragraph', text: '**Does anything which does not depend on this source point the same way?**' },
        {
          kind: 'steps',
          items: [
            '**What two things support the same answer?** This may include who posted the content, what the content shows, what other sources report, or what a person tells you when you contact them.',
            '**Do they come from different places?** Count them only once if one copied the other. Also count them once if both quote the same person or come from people who benefit from the same answer.',
            '**If you used tools, are they different?** Using the same tool twice counts as one check. Different methods are better, such as a reverse image search and a detector.',
          ],
        },
        { kind: 'paragraph', text: 'If two independent checks support the same answer, the question is settled. Otherwise, the answer is "not sure yet". That is a valid answer. An AI assistant answer is not enough by itself. Disagreeing detectors are not enough. Finding nothing is also not enough. Check the evidence that these tools point to.' },
        {
          kind: 'levels',
          rows: [
            { tone: LIGHT, name: 'Light check', text: 'One thing outside this source which agrees. Your Source check counts as the other piece.' },
            { tone: MODERATE, name: 'Moderate check', text: 'One independent source, or a check through a channel you control, such as calling back a number you already have.' },
            { tone: DEEP, name: 'Deep check', text: 'Find independent evidence that rules out the most likely other explanation. For a request, also use a contact method that you control.' },
          ],
        },
      ],
    },
    teaching: {
      summary: 'Counts as two, counts once',
      tables: [
        {
          caption: 'Each row pairs evidence which counts as two with a near miss which counts once.',
          columns: ['Counts as two', 'Counts once', 'Why'],
          rows: [
            ['Wire-service photos and a local station\'s video of the rally, shot by different crews (Marcus)', 'Three news sites which all quote the campaign\'s spokesperson', 'All three rest on one statement from a party to the claim'],
            ['The office\'s photo and a date-limited reverse image search with no older copy (Ellen)', 'The senator\'s website and his office\'s Facebook page', 'The office runs both channels'],
            ['Calling Manoj back on his saved number (Rekha)', 'Calling back the number which called you', 'The caller controls this number'],
            ['A viral video of a flooded road and the transport authority\'s own road-closure page', 'The same video reposted by fifty accounts', 'Reposts are copies of one report'],
            ['A detector result and an eyewitness video from someone unconnected', 'An AI assistant\'s verdict on the same image', 'An assistant\'s verdict never counts alone'],
            ['Two different detectors, or a reverse image search and a metadata viewer, on the same photo', 'The same detector run on two copies of the photo', 'One tool used twice is one check'],
            ['A CNN report and a BBC report, each from their own reporters', 'A CNN report and a BBC report which both run the same wire story', 'Both lead back to one report'],
          ],
        },
      ],
    },
    research: {
      items: [
        'Which news outlets are independent of each other. Two outlets sometimes run one wire story, and some outlets lean on a claim for political, geopolitical or money reasons. The website\'s supporting material will point to research on this.',
        'How to tell detection tools apart beyond their method. No such guide exists yet.',
        'Whether non-experts apply the three checks correctly, and how the strength of evidence should weigh against the count.',
      ],
    },
    ratings: [
      { id: 'align_indep', prompt: 'The three-part independence test' },
      { id: 'align_ai', prompt: 'The rule that AI answers and tool results are clues to check, not evidence by themselves' },
      { id: 'align_callback', prompt: 'Optional rule: For a request, one confirmation through a contact method the requester cannot control is enough. For example, call a saved number.' },
    ],
  },
  {
    id: 'reflect',
    eyebrow: 'Page 6 of 8',
    big: 'N',
    title: 'Now Reflect',
    tone: 'default',
    lead: 'Now Reflect now has two short questions. If the answer is "not sure yet", you still choose a safe action.',
    why: {
      summary: 'Useful in 49 of 63 step ratings, the lowest of the four checking steps',
      paragraphs: [
        'Now Reflect had the lowest score of the four checking steps. It was rated useful in **49 of 63** step ratings and by **11 of 16** experts for both Ellen\'s and Rekha\'s cases. Six experts said the step repeats earlier findings and comes after the important decision.',
        'The panel was divided about "not sure yet". Seven experts valued this result. Six were unsure that people would accept it. **8 of 16** agreed that people would accept an unresolved result (R5). This question had the widest range of answers among the STOP&SCAN statements. **4 of 16** would have closed Ellen\'s case, but the framework leaves it open.',
      ],
    },
    how: {
      summary: '6 sources',
      paragraphs: [
        'Good reasoning ends with two actions. First, you decide where you stand. Then, you decide whether to answer, wait, or keep checking (Nelson and Narens, 1990; Ackerman and Thompson, 2017). Now Reflect uses this structure. It no longer asks you to repeat the earlier steps.',
        'You compare the result with the reaction you recorded at STOP. Memory is not reliable for this task. Once people know the result, they may remember their earlier belief incorrectly (Fischhoff, 1975).',
        'Waiting to answer can improve accuracy when the decision to wait is sound (Koriat and Goldsmith, 1996). People may also give a broader answer that they are sure about instead of giving no answer (Goldsmith, Koriat and Weinberg-Eliezer, 2002). These findings support the extra line for "not sure yet".',
        'A short accuracy judgement before sharing can change behaviour. In one online study, it reduced planned sharing of false headlines by 37% and true headlines by 18% (Jahanbakhsh et al., 2021). The study measured what people said they planned to share, not what they actually shared.',
      ],
      references: ['nelson1990', 'ackerman2017', 'fischhoff1975', 'koriat1996', 'goldsmith2002', 'jahanbakhsh2021'],
    },
    userbox: {
      caption: 'The new Now Reflect, in the words people will see',
      pieces: [
        {
          kind: 'steps',
          items: [
            'What is my result compared with my first reaction? Supported, contradicted, or not sure yet.',
            'What do I do now?',
          ],
        },
        { kind: 'paragraph', text: '"Not sure yet" does not mean doing nothing. Choose an action that you can reverse, such as waiting before you share or pay. Then write one line about what you know and what evidence would answer the remaining question.' },
        {
          kind: 'levels',
          rows: [
            { tone: EVERY, name: 'Every level', text: 'The same two questions. The effort went into Source, Content and Alignment, and Now Reflect reads their result.' },
          ],
        },
      ],
    },
    example: 'Ellen writes "Not sure yet, so I\'m holding and not sharing. The photo is real, but the date isn\'t confirmed. A dated original would settle the rest."',
    teaching: {
      summary: 'The table of actions, and the extra line',
      startOpen: true,
      tables: [
        {
          caption: 'What to do with each result. Rated on its own.',
          columns: ['The content', 'Supported', 'Not sure yet', 'Contradicted'],
          rows: [
            ['Tells you something', 'Rely on the content, and share if you wish', 'Hold. Don\'t share and don\'t dismiss', 'Don\'t share. Correct the claim where you have standing, and report harmful content'],
            ['Asks you to do something', 'Go ahead', 'Check through a channel the requester does not control before doing anything', 'Refuse and report'],
            ['Warns you', 'Act as directed', 'Take a protective step which leaves a way back, and go to the official channel', 'Stand down and report'],
          ],
        },
        {
          caption: 'The extra line for "not sure yet". The example and counterfactual differ in one detail.',
          columns: ['Result', 'Example', 'Counterfactual'],
          rows: [
            ['Not sure yet', '"Not sure yet, so I hold. The photo is real, but the date isn\'t confirmed. A dated original would settle the rest."', '"Not sure yet." Nothing to stand behind and nothing to look for, so the next sighting starts from zero'],
          ],
        },
      ],
    },
    research: {
      items: [
        'Whether people accept "not sure yet" in daily use, and whether the extra line makes the result feel worth having.',
        'Whether the accuracy-prompt effect holds for real posts, beyond stated intentions.',
        'Whether people keep their STOP note, or answer the first question from memory.',
      ],
    },
    ratings: [
      { id: 'reflect_questions', prompt: 'The two questions and the undo rule' },
      { id: 'reflect_table', prompt: 'The table of actions' },
    ],
  },
  {
    id: 'run',
    eyebrow: 'Page 7 of 8',
    title: 'How the check runs',
    tone: 'default',
    lead: 'The letters always stay in the same order. STOP decides how much effort each letter needs.',
    why: {
      summary: '12 of you found the full sequence too heavy, 7 wanted the order kept',
      paragraphs: [
        'The panel was divided about using every letter every time. Twelve experts said the full sequence is too much work for daily use. Seven wanted to keep the fixed order because it helps build a habit. **7 of 14** said SIFT is easier to teach, compared with **3** for STOP&SCAN (R15). **8 of 15** would recommend STOP&SCAN to someone with no training (R17).',
        'One expert warned that a shortcut may cause people to stop after one check. In Rekha\'s case, **6 of 16** thought there was enough evidence after Content.',
      ],
    },
    how: {
      summary: '4 sources',
      paragraphs: [
        'Scaffolding is support that becomes smaller as a person gains skill (Wood, Bruner and Ross, 1976). Learners do well when they first study full examples. The support can then be removed one step at a time (Renkl and Atkinson, 2003). Learning mode follows this pattern.',
        'Habits form when people repeat the same steps in the same order. In one study, simple daily habits took a median of 66 days to become automatic (Lally et al., 2010). A different path for every case would be harder to turn into a habit.',
        'The path also stays fixed because people may stop checking too early. Feeling finished often depends more on how easy the task feels than on whether the answer is correct (Ackerman and Thompson, 2017). A fixed ending at Now Reflect removes this decision.',
        'Effort levels explain what to do at each letter. There is no time limit. The same check may take one person a few seconds and another person several minutes. A clock would also add pressure, which STOP treats as a warning sign.',
      ],
      references: ['wood1976', 'renkl2003', 'lally2010', 'ackerman2017'],
    },
    userbox: {
      caption: 'In the words people will see',
      pieces: [
        { kind: 'paragraph', text: 'Use every letter, every time. STOP decides how much effort each letter needs. If you find a new risk, use more effort for the letters that remain. Never reduce the effort. Every check ends with Now Reflect.' },
      ],
    },
    example: 'For a low-risk meme, each letter may take only a quick look. For a request for money, each letter needs a deep check. One call to a number you already know may still confirm the request in one minute.',
    teaching: {
      summary: 'The two modes, and each letter at each effort level',
      tables: [
        {
          caption: 'The two modes.',
          columns: ['Mode', 'What the mode means'],
          rows: [
            ['Learning', 'All five elements in full, in order, practised on worked cases'],
            ['Everyday', 'Answer the entry questions and the three STOP questions. Then use all four SCAN letters in order, at the effort level set by STOP. This will usually be a light check. For a request, Alignment means contacting the person through a method you control. For information, Alignment means finding a key detail or one independent source'],
          ],
        },
        {
          caption: 'Each letter at each effort level.',
          columns: ['Letter', 'Light check', 'Moderate check', 'Deep check'],
          rows: [
            ['Set by', 'Little at stake, easy to undo, nothing rushing you', 'Something at stake but fixable', 'A lot at stake, no undo, or wide reach. Rushed or unsure, one level up'],
            ['Source', 'Who posted what you see, past any resharer', 'Is the account real, how old, what else the account posts', 'Who first posted the claim, who spreads the claim, and what they gain'],
            ['Content', 'The claim or request in one line', 'Named details, and what the content leaves out', 'Pressure tricks, imitation, then the image or sound itself'],
            ['Alignment', 'One thing outside this source which agrees', 'One independent source, or a channel you control', 'Evidence which rules out the most likely other explanation, and a channel you control for any request'],
            ['Now Reflect', 'Where did I land? What do I do now?', 'The same two questions', 'The same two questions'],
          ],
        },
      ],
    },
    research: {
      items: [
        'Whether a light check is quick enough for people to use while scrolling.',
        'Whether people keep going once they feel sure, or stop early anyway.',
        'Whether learning mode carries over into everyday use, and how long the habit lasts.',
      ],
    },
    ratings: [
      { id: 'run_order', prompt: 'A fixed order with effort set by STOP' },
      { id: 'run_modes', prompt: 'The two modes' },
    ],
  },
  {
    id: 'kept',
    eyebrow: 'Page 8 of 8',
    title: 'What we kept',
    tone: 'default',
    paragraphs: [
      'We kept the five elements in the same order. **14 of 15** agreed that these are the right elements (R1). We also kept a clear difference between what the evidence shows and what you decide to do. **14 of 16** agreed with this difference (R7). Finally, we kept counting independent evidence instead of counting completed steps. **14 of 16** agreed with this approach (R2).',
      'Some experts also discussed platform design, workplace rules, family code words, and media literacy campaigns. These can work with STOP&SCAN as extra layers of protection. We discuss them in the research paper.',
    ],
    ratings: [],
    openPrompt: 'Is there anything else you would like to tell us?',
  },
];

export const RATING_ITEMS: RatingSpec[] = ROUND_PAGES.flatMap((page) => page.ratings);

export function pageById(id: string): RoundPageContent | undefined {
  return ROUND_PAGES.find((page) => page.id === id);
}

function usedReferenceIds(): string[] {
  const ids: string[] = [];
  ROUND_PAGES.forEach((page) => {
    page.how?.references.forEach((id) => ids.push(id));
    page.research?.references?.forEach((id) => ids.push(id));
  });
  return ids;
}

usedReferenceIds().forEach((id) => {
  referenceById(id);
});
