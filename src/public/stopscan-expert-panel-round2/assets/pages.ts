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
      'Thank you for your Round 1 answers. Sixteen of you took part, from media literacy education, fact-checking, human factors, misinformation research and digital forensics. Your comments agreed with each other more often than we expected.',
      'You backed the core of STOP&SCAN. **14 of 15** agreed the five elements are the right ones. Against SIFT, **13 of 14** picked STOP&SCAN as more reliable when search results mislead, and **11 of 14** as more likely to lead to a cautious judgement.',
      'You also found the full process too heavy for daily life. Twelve of you said so in your comments, and 9 said the pause fails when people are rushed or upset. A pause made sense to all **16** of you for Rekha\'s scam call and to **5 of 15** for Dana\'s weather map.',
      'So every change follows one idea. STOP decides how much effort the rest of the check gets. Each letter keeps its place and gets one focused change.',
      '**How each page works.** The tinted box holds the new text, in the words the public will see. Two closed panels above the box hold why we changed the element (your Round 1 results) and how we justify the change (the research, with full references). Panels below hold the teaching tables and the research still needed. Open any panel you want.',
      '**How to rate.** Rate each change from 1 (strongly disagree) to 5 (strongly agree). For a 1, 2 or 3, tell us what you would change. Some of your feedback shapes the framework on the pages ahead. The rest goes into the paper, mainly the discussion and future research.',
      'The questionnaire takes about **10 minutes**. Figures refer to the 16 experts on the panel. Where fewer answered an item, the figure shows how many did. Counts from comments are out of the 15 of you who wrote comments.',
    ],
    ratings: [],
  },
  {
    id: 'stop',
    eyebrow: 'Page 2 of 8',
    big: 'STOP',
    title: 'Pause, and set the effort',
    tone: 'stop',
    lead: 'STOP now asks whether you need to check at all. If you do, three questions set how much effort each SCAN letter gets.',
    why: {
      summary: '16 of 16 saw a reason to pause for the scam call, 5 of 15 for the weather map',
      paragraphs: [
        'People pause least when they most need to. Rushed, scared or angry people skip the pause, and 9 of you made this point. All **16** of you saw a reason to pause before Rekha sent money. Only **5 of 15** saw one before Dana reshared a weather map.',
        'Twelve of you said running every step on everything is unrealistic, and several asked for effort to follow the stakes. Four of you asked for the claim being checked to be named, and two more answers showed the confusion. Without a named claim, your reading of Marcus\'s photo split **8 to 8**.',
      ],
    },
    how: {
      summary: '7 sources',
      paragraphs: [
        'The entry question has two parts because content reaches you in two ways. Some content you act on, by liking, sharing, replying or paying. Other content you scroll past, and the content still shapes what you believe. One earlier exposure made a false headline seem more accurate a week later, even with a warning label (Pennycook, Cannon and Rand, 2018). Judging accuracy the first time you see a claim wiped out this later effect, for claims people knew enough to question (Brashier, Eliseev and Marsh, 2020). So the second part asks at first sight.',
        'Both parts act as a filter. People stop noticing warnings they see over and over, and the drop shows in brain activity within one session and across days (Anderson et al., 2015, Vance et al., 2017). A pause which fires on every post would wear out the same way.',
        'The three questions set the effort before any evidence comes in. How hard people think follows a feeling of being right, and this feeling tracks how familiar and fluent something seems more than whether the content is accurate (Ackerman and Thompson, 2017). Stakes give a steadier signal. Each question also works as an if-then cue, and specific if-then plans turn intentions into action far more often than broad goals (Gollwitzer, 1999).',
        'Pressure gets its own question because scams run on pressure. Urgency, authority and a plea to help someone push victims to act before they think (Stajano and Wilson, 2011).',
      ],
      references: ['pennycook2018', 'brashier2020', 'anderson2015', 'vance2017', 'ackerman2017', 'gollwitzer1999', 'stajano2011'],
    },
    userbox: {
      caption: 'The new STOP, in the words people will see',
      pieces: [
        { kind: 'paragraph', text: 'Pause when you want to like, share, reply to or act on something. Pause too when a post changes what you think about a person, a group or a place. Ask yourself two things.' },
        { kind: 'questions', items: ['Do I care to engage with this?', 'Does this change what I think about someone or something?'] },
        { kind: 'rule', text: 'Two no\'s, scroll on. A yes to either, ask three more.' },
        {
          kind: 'steps',
          items: [
            'What is my first reaction, and is anything rushing me?',
            'What is this telling me, asking me to do, or warning me about?',
            'What happens if I\'m wrong, and how hard is the damage to undo?',
          ],
        },
        {
          kind: 'levels',
          rows: [
            { tone: LIGHT, name: 'Light check', text: 'Little at stake, easy to undo, nothing rushing you.' },
            { tone: MODERATE, name: 'Moderate check', text: 'Something at stake, but a mistake is fixable.' },
            { tone: DEEP, name: 'Deep check', text: 'A lot at stake, no way to undo, or many people reached.' },
            { tone: EVERY, name: 'Rushed or unsure', text: 'Go one level deeper.' },
          ],
        },
        { kind: 'paragraph', text: 'If the message asks you to pay, sign in or send a code, send nothing until you finish the check. If the message warns you, go to the official source yourself and skip its links and numbers.' },
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
    lead: 'Source now grows with the effort level, from a glance at who posted the content to tracing where the claim started. The deep check asks what the source gains.',
    why: {
      summary: '15 of 16 found Dana\'s reshare plausible because the account was real',
      paragraphs: [
        'A real account is where most checks stopped. **15 of 16** found Dana\'s reshare plausible, since the weather service account was genuine. Thirteen of the 15 of you who wrote comments said a source-only or tool-only check would have misled someone or left a case open.',
        '**12 of 16** disagreed SIFT gives enough guidance when a trusted source publishes a fake (R11), a consensus. Six of you said neither framework asks who gains from a claim.',
      ],
    },
    how: {
      summary: '5 sources',
      paragraphs: [
        'Professional fact-checkers judge a source by leaving the page and reading what others say about the source. Historians and students who stayed on the page were fooled more often (Wineburg and McGrew, 2019). The moderate and deep checks look outside the post for this reason. "Who is behind the information?" opens civic online reasoning (McGrew et al., 2018). We add what they gain.',
        'The first account you see is often not where a claim started. Disinformation spreads through networks where a few accounts seed a claim and many others, some coordinated and some sincere, pass the claim on (Starbird, Arif and Wilson, 2019). So the deep check covers who started a claim and who spreads the claim.',
        'A real source tells you who posted something. Whether the content is true is a separate question. Missing provenance settles nothing either. When provenance data was incomplete, people in one study came to disbelieve honest media (Feng et al., 2023). And "this is fake" has a source of its own, since calling real evidence fake is a known escape route (Chesney and Citron, 2019).',
      ],
      references: ['wineburg2019', 'mcgrew2018', 'starbird2019', 'feng2023', 'chesney2019'],
    },
    userbox: {
      caption: 'The new Source, in the words people will see',
      pieces: [
        {
          kind: 'levels',
          rows: [
            { tone: LIGHT, name: 'Light check', text: 'Look at the account which posted what you see. If a friend reshared the post, look past your friend to the account they got the post from.' },
            { tone: MODERATE, name: 'Moderate check', text: 'Look at the account\'s record. Is the account real? How old is the account, and what else has the owner posted?' },
            { tone: DEEP, name: 'Deep check', text: 'Find the first poster, and look at who is spreading the claim. What do they gain if you believe or share the post?' },
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
    lead: 'Content now opens with checks which need no special skill, names the common pressure tricks, and puts visual signs and tools last.',
    why: {
      summary: 'Useful in 52 of 62 step ratings, lowest for Ellen at 11 of 15',
      paragraphs: [
        'Spotting fakes by eye is expert work, and AI keeps raising the bar. You rated Content useful in **52 of 62** step ratings. Ellen\'s case scored lowest, **11 of 15**, where the step leaned on image inspection and detectors. Rekha\'s case needed no forensic skill at all.',
        'Four of you asked Content to start with what the content shows and asks of you, ahead of the pixels. Six of you said neither framework asks who gains from a claim, and one of you called the missing manipulation tricks a serious gap.',
      ],
    },
    how: {
      summary: '3 sources',
      paragraphs: [
        'People cannot tell AI-generated faces from real ones by eye. In one study accuracy sat at 48%, near chance, and training lifted accuracy only to 59% (Nightingale and Farid, 2022). Eye checks come last for this reason.',
        'Naming the tricks works better. Short videos which taught common manipulation techniques improved people\'s ability to spot those techniques in new posts, in the lab and in a field test on YouTube (Roozenbeek et al., 2022). Scams lean on a short list of levers, including urgency, authority, and a plea to help someone in need (Stajano and Wilson, 2011). Content names these.',
        'The one-sentence claim from STOP gives Content a fixed target. Your split on Marcus\'s photo came from two claims sharing one post.',
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
            { tone: DEEP, name: 'Deep check', text: 'Look for pressure, such as a rush, strong emotion, or someone posing as a person you trust. Then look at the image or sound itself. Treat anything odd as a lead for Alignment, since eyes and single tools miss good fakes.' },
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
    lead: 'Alignment gets a plain question, a three-part test for independent evidence, and fixed rules for AI answers and tools.',
    why: {
      summary: '2 of 16 agreed a non-expert would be able to judge independence',
      paragraphs: [
        'Independence was the weakest point of Round 1. **2 of 16** agreed a non-expert would be able to tell whether two pieces of evidence are independent (R4), and 7 disagreed. The two-kinds threshold reached **10 of 15** (R3), short of consensus. Ten of you named independence as the weak point, and 3 proposed a test.',
        'Eleven of you warned people treat AI assistants as evidence, and 9 said the same of detectors. **14 of 16** found the route where Ellen relies on a platform AI assistant plausible. Eight of you singled out calling Manoj back as the decisive step in Rekha\'s case.',
      ],
    },
    how: {
      summary: '5 sources',
      paragraphs: [
        'People treat repeats of one source as separate confirmations. A claim backed by several people who all cited one original source persuaded about as much as a claim backed by independent sources (Yousif, Aboody and Keil, 2019). The test asks where each piece came from for this reason.',
        'Searching online does not fix this alone. People who searched to check false news became more likely to believe the story, because search returned low-quality pages repeating the claim (Aslett et al., 2024).',
        'Automated advice gets more trust than its accuracy earns. People over-rely on automation they cannot inspect (Parasuraman and Riley, 1997), and trust in a tool should follow how reliable the tool is in the case at hand (Lee and See, 2004). Asking people to form their own view before they see an AI answer cut over-reliance in a CSCW study (Buçinca, Malaya and Gajos, 2021). So an AI answer or a detector result is a lead to check, never a piece of evidence alone.',
        'Different methods look at different things. A reverse image search finds earlier copies, and a metadata viewer reads the file\'s history. A change of method counts best for this reason.',
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
            '**What two things point the same way?** Anything counts, such as who posted the content, what the content shows, what others report, or what a person says when you reach them yourself.',
            '**Do they come from different places?** Two count once if one copied the other, if both quote the same spokesperson, or if both come from someone with a stake in the answer.',
            '**If you used tools, are they different?** The same tool twice counts once. A different method, such as a reverse image search and a detector, counts best.',
          ],
        },
        { kind: 'paragraph', text: 'Two pass, and the question is settled. Otherwise the answer is "not sure yet", and "not sure yet" is a fine answer. An AI assistant\'s answer, detectors which disagree, and finding nothing never count alone. Check what they point to.' },
        {
          kind: 'levels',
          rows: [
            { tone: LIGHT, name: 'Light check', text: 'One thing outside this source which agrees. Your Source check counts as the other piece.' },
            { tone: MODERATE, name: 'Moderate check', text: 'One independent source, or a check through a channel you control, such as calling back a number you already have.' },
            { tone: DEEP, name: 'Deep check', text: 'Independent evidence which rules out the most likely other explanation, and a channel you control for any request.' },
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
      { id: 'align_ai', prompt: 'The rule for AI answers and tools' },
      { id: 'align_callback', prompt: 'Option. For a request, one confirmation through a channel the requester cannot control, such as calling back a saved number, settles the case alone' },
    ],
  },
  {
    id: 'reflect',
    eyebrow: 'Page 6 of 8',
    big: 'N',
    title: 'Now Reflect',
    tone: 'default',
    lead: 'Now Reflect becomes two short questions, and "not sure yet" always comes with an action.',
    why: {
      summary: 'Useful in 49 of 63 step ratings, the lowest of the four checking steps',
      paragraphs: [
        'Now Reflect scored lowest of the four checking steps, useful in **49 of 63** step ratings and **11 of 16** for both Ellen\'s and Rekha\'s cases. Six of you said the step repeats earlier findings and arrives after the decision which mattered.',
        'On "not sure yet" the panel split. Seven of you valued the result, and 6 doubted people would accept one. Whether people would accept an unresolved result (R5) drew **8 of 16** in agreement, the widest spread among the STOP&SCAN statements. **4 of 16** would have closed Ellen\'s case, which the design leaves open.',
      ],
    },
    how: {
      summary: '6 sources',
      paragraphs: [
        'Good reasoning ends with two moves. First you check where you stand, then you make one control decision, to answer, to hold back or to keep going (Nelson and Narens, 1990, Ackerman and Thompson, 2017). Now Reflect takes this shape and drops the recount of earlier steps.',
        'The comparison uses the reaction you noted at STOP. Memory is a poor record here, since people misremember what they believed once they know the outcome (Fischhoff, 1975).',
        'Holding back an answer raises accuracy when the judgement behind the hold is sound (Koriat and Goldsmith, 1996). People also answer at a broader level they are sure of, in place of no answer at all (Goldsmith, Koriat and Weinberg-Eliezer, 2002). The extra line for "not sure yet" rests on both findings.',
        'A short judgement at the moment of sharing changes behaviour. Asking people to rate accuracy before sharing cut intended sharing of false headlines by 37% and of true ones by 18% (Jahanbakhsh et al., 2021). These were stated intentions in an online study.',
      ],
      references: ['nelson1990', 'ackerman2017', 'fischhoff1975', 'koriat1996', 'goldsmith2002', 'jahanbakhsh2021'],
    },
    userbox: {
      caption: 'The new Now Reflect, in the words people will see',
      pieces: [
        {
          kind: 'steps',
          items: [
            'Where did I land, compared with my first reaction? Supported, contradicted, or not sure yet.',
            'What do I do now?',
          ],
        },
        { kind: 'paragraph', text: '"Not sure yet" never means doing nothing. Take the step which leaves a way back, such as not sharing or not paying. Then add one line on what you are sure of and what would settle the rest.' },
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
    lead: 'The order of the letters stays fixed, and STOP sets the effort for each one.',
    why: {
      summary: '12 of you found the full sequence too heavy, 7 wanted the order kept',
      paragraphs: [
        'You split on running every letter every time. Twelve of you found the full sequence too heavy for everyday use. Seven of you wanted the fixed order kept, because the order builds the habit. **7 of 14** judged SIFT easier to teach, against **3** for STOP&SCAN (R15), and **8 of 15** would recommend STOP&SCAN to someone with no training (R17).',
        'One of you warned a shortcut turns into stopping after one check. In Rekha\'s case, **6 of 16** judged the evidence enough after Content.',
      ],
    },
    how: {
      summary: '4 sources',
      paragraphs: [
        'Scaffolding means support which fades as skill grows (Wood, Bruner and Ross, 1976). Learners do best when they study worked examples first and the steps fade one at a time (Renkl and Atkinson, 2003). Learning mode follows this pattern.',
        'Habits form when the same steps repeat in the same order. In one study, simple daily habits took a median of 66 days to become automatic (Lally et al., 2010). A path which changes from case to case would not settle into a habit.',
        'The path stays fixed because people judge poorly when they have checked enough. The feeling of being done follows fluency more than accuracy (Ackerman and Thompson, 2017). A fixed end at Now Reflect takes this call away from the person.',
        'Effort levels say what each letter does, with no time limit. The same check takes one person seconds and another several minutes, and a clock would add the pressure STOP treats as a warning sign.',
      ],
      references: ['wood1976', 'renkl2003', 'lally2010', 'ackerman2017'],
    },
    userbox: {
      caption: 'In the words people will see',
      pieces: [
        { kind: 'paragraph', text: 'Every letter, every time. STOP sets how much effort each letter gets. If you find something which raises the stakes, put more effort into the letters left, never less. Every check ends at Now Reflect.' },
      ],
    },
    example: 'For a meme, each letter is a glance. For a request for money, each letter gets a deep check, and one call to a number you already know still settles the request in a minute.',
    teaching: {
      summary: 'The two modes, and each letter at each effort level',
      tables: [
        {
          caption: 'The two modes.',
          columns: ['Mode', 'What the mode means'],
          rows: [
            ['Learning', 'All five elements in full, in order, practised on worked cases'],
            ['Everyday', 'The entry questions and the three STOP questions, then all four SCAN letters in order at the effort STOP sets, usually light. For a request, Alignment is the call-back. For information, Alignment is the decisive detail or one independent source'],
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
      'We kept the five elements and their order. **14 of 15** agreed they are the right ones (R1). We kept the line between what the evidence shows and what you do about the evidence, which **14 of 16** agreed with (R7). We kept counting independent evidence found, rather than steps completed, also **14 of 16** (R2).',
      'Some of you raised platform design, workplace procedures such as call-back rules and family code words, and media literacy campaigns. These work alongside STOP&SCAN as other layers of protection, and the paper discusses them.',
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
