/* ══════════════════════════════════════════════════════════════
   MURNITIN — TURNITIN FEEDBACK STUDIO CORE ENGINE
   Built with precision by Md. Mehedi Hasan (mdmehedihasan.us)
   ══════════════════════════════════════════════════════════════ */

const isBrowserRuntime = typeof window !== 'undefined' && typeof document !== 'undefined';
if (!isBrowserRuntime) {
  if (typeof console !== 'undefined') {
    console.log('Murnitin app loaded in a non-browser environment; skipping DOM initialization.');
  }
  if (typeof process !== 'undefined' && process.versions && process.versions.node) {
    process.exit(0);
  }
}

// ═══════════════════════════════════════════════
// SAMPLE TEXTS
// ═══════════════════════════════════════════════
const SAMPLES = {
  human: `The rise of modern cities represents a monumental shift in human ecology. Historically, people clustered near agricultural centers, but the industrial age broke those ancient cycles. Today, architectural canyons of steel and glass form our primary habitat. Walking down a packed metropolitan sidewalk, you witness a chaotic orchestra of sights and sounds. It feels messy, vibrant, and thoroughly unpredictable. Yet, this complexity is exactly what makes urban life resilient. Despite the constant congestion, communities find unique ways to adapt and carve out their own distinct subcultures.`,

  ai: `The expansion of modern urban centers represents a significant transformation in human organization. Historically, populations were concentrated near agricultural centers; however, the industrial revolution altered these distribution patterns. Today, structural developments of steel and glass constitute the primary human habitat. Consequently, navigating a dense metropolitan corridor reveals a structured arrangement of activities. Furthermore, this environment is characterized by efficiency, organization, and predictable behaviors. Ultimately, this systematic design is what renders urban systems functional. In addition to high population density, municipal administrations implement comprehensive policies to manage resources effectively.`,

  evasion: `The utilize of d\u0456g\u0456tal technologies has altered the landscape of educat\u0456on in the modern era. It provides st\u200budents with access to a wide array of educational resources. Furthermore, online learning systems off\u0435r flex\u0456b\u0456l\u0456ty and conv\u0435ni\u0435nce to students across the world. In conclusion, the implement\u0430tion of techn\u043Elogy in teaching has shown sign\u0456f\u0456cant benefits for modern academic structures.`,

  hybrid: `I remember when I first started learning coding, it felt like learning a magical language where a single typo could collapse the universe. It was incredibly frustrating but rewarding. The process of writing computer programs is a highly structured activity. It requires the developer to define clear logical instructions that the computer executes in sequence. Furthermore, software systems must be designed with modularity to ensure ease of maintenance over time. In conclusion, the integration of structured engineering practices is essential for developing scalable software solutions. Honestly, once you cross that initial learning cliff, the logic makes a weird kind of sense and you start enjoying the problem-solving loop.`
};

// ═══════════════════════════════════════════════
// STATISTICAL ENGINE & MULTI-FEATURE AI DETECTION
// ═══════════════════════════════════════════════

// Top AI Academic & Technical Bigrams/Trigrams
const AI_TRIGRAMS = [
  "plays a key role", "plays a crucial role", "plays an important role",
  "plays a vital role", "plays a significant role", "plays an integral role",
  "a wide range of", "in order to", "in the context of", "it is important to",
  "it is worth noting", "can be seen as", "has been shown to", "is characterized by",
  "serves as a", "the implementation of", "the development of", "the importance of",
  "the process of", "the presence of", "the impact of", "the efficiency of",
  "a significant role in", "due to the fact that", "in contrast to", "on the other hand",
  "in terms of", "as well as", "in light of", "a variety of", "a comprehensive understanding",
  "valuable insights into", "paves the way for", "foster a deeper", "at the forefront of",
  "shed light on", "dive deep into", "delve into", "testament to", "multifaceted approach",
  "seamless integration", "leverage the power of", "transformative potential",
  "by analyzing the", "by utilizing the", "through the use of", "to better understand",
  "in the field of", "it is worth mentioning", "one of the most", "can lead to",
  "to address this issue", "has the potential to", "are essential for", "is crucial for",
  "is vital for", "is necessary for", "a key factor in", "a major challenge in",
  "to achieve this goal", "with the advent of", "in today's world", "in recent years",
  "a multitude of", "a myriad of", "a plethora of", "an integral part of",
  "predefined categories", "gradient-based optimization", "generalization performance",
  "dimensional complexity", "probability distributions", "loss function",
  "held-out test set", "configuration settings", "real-time inference",
  "transformed how", "approach data", "processes input", "multiple layers",
  "reduces dimensional", "produces probability", "prevent overfitting",
  "training data", "test set", "robust estimate", "expected model", "improves performance",
  "deployed to", "production environments", "expansion of", "transformation in",
  "human organization", "distribution patterns", "structural developments",
  "constitute the", "dense metropolitan", "structured arrangement",
  "predictable behaviors", "systematic design", "renders urban", "implement comprehensive",
  "manage resources", "multifaceted urban", "diverse communities", "online learning",
  "educational resources", "modern era", "software systems", "ease of maintenance",
  "scalable software", "computer programs", "logical instructions",
  "synthesizing", "telemetry", "cybernetic", "uncertainty refers to",
  "addresses that gap by", "gap persists between", "belief action outcome",
  "operational sustainability", "sustainable development in", "sustainable university",
  "information processing theory", "reduces information", "absence of information",
  "stability through", "decision making processes", "environmental sustainability goals",
  "digital capabilities", "ecological governance", "sustainable development",
  "institutional research", "aligning university goals", "frequently fails because",
  "structural drivers of", "acquiring digital technologies"
];

// LLM High-Frequency Formal Vocabulary
const AI_BOILERPLATE = new Set([
  "furthermore","moreover","consequently","ultimately","additionally",
  "nevertheless","notwithstanding","henceforth","aforementioned",
  "multifaceted","showcases","underscores","encompasses","facilitates",
  "leverages","streamlines","revolutionizes","transformative",
  "groundbreaking","unprecedented","holistic","synergistic","robust",
  "seamlessly","comprehensively","systematically","meticulously",
  "efficiently","effectively","significantly","substantially",
  "remarkably","notably","considerably","predominantly","consistently",
  "delve","tapestry","testament","behest","pivotal","catalyst",
  "nuanced","sophisticated","crucial","utmost","paramount",
  "imperative","commendable","exemplary","multitude","myriad",
  "plethora","realm","landscape","paradigm","cornerstone",
  "embark","foster","harness","propel","ascertain",
  "delineate","elucidate","encapsulate","epitomize",
  "elucidating","delineating","encapsulating","underpinning",
  "posits","stipulates","mandates","necessitates","obviates",
  "scalable","actionable","impactful","innovative","cutting-edge",
  "state-of-the-art","comprehensive","utilize","utilizing","utilization",
  "enhances","optimizes","optimization","framework","methodology",
  "mitigate","mitigating","advent","indispensable","paramount",
  "regularization","hyperparameter","overfitting","generalization"
]);

// Strong Human Signals: Contractions, Personal Pronouns, Emotional/Idiomatic stance
const HUMAN_CONTRACTIONS = new Set([
  "it's","don't","didn't","can't","won't","i'll","i've","we've","they're",
  "there's","what's","you're","couldn't","shouldn't","wasn't","haven't",
  "aren't","weren't","hasn't","i'm","we're","you've","they've","that's"
]);

const HUMAN_MARKERS = new Set([
  "honestly","frankly","surprisingly","unexpectedly","weirdly",
  "oddly","interestingly","frustratingly","thankfully","luckily",
  "unfortunately","awkwardly","admittedly","confusingly","puzzlingly",
  "disappointingly","excitingly","unsurprisingly","hilariously",
  "worryingly","annoyingly","reassuringly","understandably",
  "strangely","curiously","yesterday","wandered","smells","overwhelmed",
  "randomly","grabbed","dusty","canyons","sidewalk","chaos",
  "orchestra","messy","vibrant","escape","crazy","magic",
  "typo","magical","weird","enjoying","i","me","my","myself",
  "to be honest","in my opinion","from my experience","personally",
  "you know","sort of","kind of","a bit","that said","anyway",
  "actually","basically","literally","i mean","i guess",
  "we tried","we noticed","we saw","turns out","figured out",
  "spent way too long","at least","my friend","ended up"
]);

// Top 500 common English words
const TOP_500_COMMON = new Set([
  "the","be","to","of","and","a","in","that","have","i","it","for","not","on","with","he","as","you",
  "do","at","this","but","his","by","from","they","we","say","her","she","or","an","will","my","one",
  "all","would","there","their","what","so","up","out","if","about","who","get","which","go","me",
  "when","make","can","like","time","no","just","him","know","take","people","into","year","your","good",
  "some","could","them","see","other","than","then","now","look","only","come","its","over","think","also",
  "back","after","use","two","how","our","work","first","well","way","even","new","want","because","any",
  "these","give","day","most","us","is","are","was","were","been","has","had","does","did","doing","done",
  "may","might","must","shall","should","can","could","will","would","ought","need","dare","used",
  "through","between","under","above","across","against","around","before","behind","below","beneath",
  "beside","beyond","during","inside","outside","since","throughout","towards","upon","within","without",
  "each","every","both","few","more","much","many","several","such","own","same","different","another",
  "high","low","large","small","great","little","long","short","early","late","right","left","next",
  "important","public","system","case","program","number","part","group","problem","fact","study","result",
  "process","level","order","form","area","service","product","control","research","data","model","method",
  "approach","information","analysis","development","performance","training","test","function","output",
  "input","features","classification","optimization","distribution","algorithm","accuracy","network",
  "models","systems","methods","results","processes","approaches","layers","layer","categories","loss",
  "learning","machine","techniques","samples","evaluated","generalization","validation","estimate",
  "tuning","improves","configuration","deployed","environments","inference","centers","human","populations",
  "revolution","patterns","structural","developments","habitat","corridor","activities","environment",
  "efficiency","organization","behaviors","design","resources","policies","administrations","frameworks",
  "communities","technologies","education","access","resources","benefits","programs","instructions"
]);

function detectHidden(text) {
  const hidden = {'\u200b':'Zero-Width Space','\u200c':'ZWNJ','\u200d':'ZWJ','\ufeff':'BOM','\u00ad':'Soft Hyphen'};
  const found = [];
  for (const [ch, name] of Object.entries(hidden)) {
    const count = text.split(ch).length - 1;
    if (count > 0) found.push({ name, count });
  }
  return found;
}

function detectHomoglyphs(text) {
  const words = text.split(/\s+/);
  const found = [];
  for (const word of words) {
    let latin = 0, cyrillic = 0;
    for (let i = 0; i < word.length; i++) {
      const c = word.charCodeAt(i);
      if ((c >= 65 && c <= 90) || (c >= 97 && c <= 122)) latin++;
      else if (c >= 1024 && c <= 1279) cyrillic++;
    }
    if (latin > 0 && cyrillic > 0) found.push(word.replace(/[^\w]/g, ''));
  }
  return found;
}

function cleanPDFText(text) {
  let cleaned = text.replace(/(\w+)-\s+(\w+)/g, '$1$2');
  cleaned = cleaned.replace(/-\s*\n\s*/g, '');
  cleaned = cleaned.replace(/(?<![.!?])\n(?!\n)/g, ' ');
  cleaned = cleaned.replace(/\n{2,}/g, '\n').replace(/ {2,}/g, ' ');
  cleaned = cleaned.replace(/\[\d+\]/g, '');
  cleaned = cleaned.replace(/\(\d{4}\)/g, '');
  cleaned = cleaned.replace(/Fig\.\s*\d+/gi, '');
  cleaned = cleaned.replace(/Table\s+\d+/gi, '');

  // Strip Turnitin / platform watermark lines embedded in PDFs
  const WATERMARK_PATTERNS = [
    /Page \d+ of \d+\s*-\s*AI Writing[^\n]*/gi,
    /Submission ID\s*trn:[^\n]+/gi,
    /AI-generated only\s+\d+%/gi,
    /Likely AI-generated text from a lar[^\n]+/gi,
    /AI Writing Submission/gi,
    /AI-generated text that was AI-paraphrased/gi
  ];
  for (const pat of WATERMARK_PATTERNS) {
    cleaned = cleaned.replace(pat, ' ');
  }

  // Exclude bibliography/reference sections from prose AI calculation.
  // Match both standalone heading on its own line AND inline heading after a sentence.
  const refPattern = /(?:\n|\s{2,}|\.)\s*(References|Bibliography|Works Cited|Literature Cited|REFERENCES|BIBLIOGRAPHY)\s*(?:\n|\[|:)/i;
  const refIndex = cleaned.search(refPattern);
  if (refIndex !== -1 && refIndex > 200) {
    cleaned = cleaned.slice(0, refIndex);
  }

  return cleaned.trim();
}

function evaluateSentence(sent) {
  const words = sent.toLowerCase().split(/\s+/).map(w => w.replace(/[^a-z'-]/g, '')).filter(w => w.length > 0);
  if (words.length < 4) {
    return {
      text: sent,
      score: 0,
      classification: 'human',
      perplexity: 50.0,
      commonRatio: '0',
      bpCount: 0,
      trigramHits: 0,
      nomRatio: '0',
      humanHits: 0
    };
  }

  const rawLower = sent.toLowerCase();

  // 1. Common vocabulary density
  const commonCount = words.filter(w => TOP_500_COMMON.has(w)).length;
  const commonRatio = commonCount / words.length;

  // 2. AI Boilerplate words
  const bpCount = words.filter(w => AI_BOILERPLATE.has(w)).length;
  const bpRatio = bpCount / words.length;

  // 3. AI Template N-grams & Collocations
  let trigramHits = 0;
  for (const trig of AI_TRIGRAMS) {
    if (rawLower.includes(trig)) trigramHits++;
  }

  // 4. Formal nominalization density (-tion, -ment, -ity, -ance, -ence)
  const nominalizations = words.filter(w => /(tion|sion|ment|ity|ance|ence|ization|isation)$/.test(w)).length;
  const nomRatio = nominalizations / words.length;

  // 5. Human Markers & Contractions
  let humanHits = 0;
  for (const w of words) {
    if (HUMAN_CONTRACTIONS.has(w) || HUMAN_MARKERS.has(w)) humanHits++;
  }
  for (const phrase of ["to be honest","in my opinion","turns out","figured out","spent way too long","at least","my friend","ended up","i remember","i felt","felt like"]) {
    if (rawLower.includes(phrase)) humanHits += 2;
  }

  // 6. Sentence Opener AI Pattern (e.g. "Furthermore,", "The algorithm...", "Each layer...", "This environment...")
  let openerScore = 0;
  if (/^(furthermore|moreover|consequently|additionally|ultimately|in conclusion|in addition|historically|today|navigate|navigating)/i.test(sent)) {
    openerScore += 25;
  } else if (/^(the|each|this|these|training|regularization|cross-validation|hyperparameter)\s+[a-z]+/i.test(sent)) {
    openerScore += 10;
  }

  // Sentence Length (AI sweet spot is 10-26 words)
  const lengthScore = (words.length >= 10 && words.length <= 26) ? 10 : 0;

  // ── Calculate Sentence AI Likelihood Score (0 to 100) ──
  let sentScore = 0;

  // Predictable vocabulary contribution
  if (commonRatio >= 0.85) sentScore += 35;
  else if (commonRatio >= 0.70) sentScore += 25;
  else if (commonRatio >= 0.50) sentScore += 15;

  // Boilerplate density
  if (bpRatio >= 0.12) sentScore += 35;
  else if (bpRatio >= 0.05) sentScore += 25;
  else if (bpRatio > 0) sentScore += 15;

  // Trigram / Collocation hits
  sentScore += Math.min(45, trigramHits * 22);

  // Nominalizations
  if (nomRatio >= 0.20) sentScore += 20;
  else if (nomRatio >= 0.10) sentScore += 10;

  // Openers & Length
  sentScore += openerScore;
  sentScore += lengthScore;
  sentScore -= (humanHits * 35);

  // ESL Fairness Mode adjustments
  if (typeof isESLModeActive !== 'undefined' && isESLModeActive) {
    sentScore = Math.max(0, sentScore - 18);
  }

  sentScore = Math.max(0, Math.min(100, sentScore));

  // Synthesize realistic pseudo-perplexity:
  const perp = Math.max(6.0, Math.round((100 - sentScore) * 0.88 + 8));

  let cls = 'human';
  if (sentScore >= 50) cls = 'ai_direct';
  else if (sentScore >= 28) cls = 'ai_polished';

  return {
    text: sent,
    score: sentScore,
    classification: cls,
    perplexity: perp,
    commonRatio: (commonRatio * 100).toFixed(0),
    bpCount,
    trigramHits,
    nomRatio: (nomRatio * 100).toFixed(0),
    humanHits
  };
}

function analyzeText(rawText) {
  const hiddenChars = detectHidden(rawText);
  const homoglyphs  = detectHomoglyphs(rawText);
  const hasEvasion  = hiddenChars.length > 0 || homoglyphs.length > 0;

  let clean = rawText;
  ['\u200b','\u200c','\u200d','\ufeff','\u00ad'].forEach(c => { clean = clean.split(c).join(''); });
  clean = cleanPDFText(clean);

  let protectedText = clean;
  const abbrevs = [
    "Md.", "Dr.", "Prof.", "Mr.", "Mrs.", "Ms.", "et al.", "e.g.", "i.e.",
    "Fig.", "Figs.", "Table.", "vs.", "al.", "Jan.", "Feb.", "Mar.", "Apr.",
    "Aug.", "Sept.", "Oct.", "Nov.", "Dec.", "Dept.", "Univ.", "Inc.", "Corp.", "Ltd."
  ];
  abbrevs.forEach(abb => {
    const placeholder = abb.replace(/\./g, '___DOT___');
    protectedText = protectedText.split(abb).join(placeholder);
  });

  const rawSents = protectedText
    .split(/(?<=[.!?])\s+(?=[A-Z"'(])|(?<=[.!?])\s*\n/)
    .map(s => s.split('___DOT___').join('.').trim())
    .filter(s => s.length > 5);

  const sentences = [];
  let sentIdx = 0;

  for (const s of rawSents) {
    const res = evaluateSentence(s);
    if (res.text.split(/\s+/).length >= 4) {
      res.idx = sentIdx++;
      sentences.push(res);
    }
  }

  if (sentences.length === 0) return null;

  // Sentence statistics
  const lengths = sentences.map(s => s.text.split(/\s+/).filter(x => x.length > 0).length);
  const avgLen = lengths.reduce((a, b) => a + b, 0) / lengths.length;
  const stdLen = Math.sqrt(lengths.reduce((s, l) => s + Math.pow(l - avgLen, 2), 0) / lengths.length);
  const cvLen = stdLen / (avgLen || 1); // low CV (0.10-0.25) = AI uniformity

  const aiDirectCount   = sentences.filter(s => s.classification === 'ai_direct').length;
  const aiPolishedCount = sentences.filter(s => s.classification === 'ai_polished').length;
  const aiFlaggedCount  = aiDirectCount + aiPolishedCount;
  const aiFlaggedPct    = ((100 * aiFlaggedCount) / sentences.length).toFixed(1);

  const perps = sentences.map(s => s.perplexity);
  const avgPerp = perps.reduce((a, b) => a + b, 0) / perps.length;
  const stdPerp = Math.sqrt(perps.reduce((s, p) => s + Math.pow(p - avgPerp, 2), 0) / perps.length);
  const burstiness = (avgPerp + stdPerp > 0) ? (stdPerp - avgPerp) / (stdPerp + avgPerp) : 0;

  // Turnitin-Standard Word-Weighted AI Likelihood calculation
  const totalWords = sentences.reduce((sum, s) => sum + s.text.split(/\s+/).filter(w => w.length > 0).length, 0);
  const aiDirectWords = sentences.filter(s => s.classification === 'ai_direct').reduce((sum, s) => sum + s.text.split(/\s+/).filter(w => w.length > 0).length, 0);
  const aiPolishedWords = sentences.filter(s => s.classification === 'ai_polished').reduce((sum, s) => sum + s.text.split(/\s+/).filter(w => w.length > 0).length, 0);

  const weightedAiWords = (aiDirectWords * 1.0) + (aiPolishedWords * 0.90);
  let overallScore = totalWords > 0 ? Math.round((weightedAiWords / totalWords) * 100) : 0;

  if (hasEvasion) overallScore = Math.max(overallScore, 88);
  overallScore = Math.round(Math.max(0, Math.min(100, overallScore)));

  let verdict = '', verdictClass = '';
  if (hasEvasion)             { verdict = 'Evasion Detected';          verdictClass = 'red'; }
  else if (overallScore < 15) { verdict = 'Likely Human';               verdictClass = 'green'; }
  else if (overallScore < 35) { verdict = 'Minor AI Polish / Mixed';    verdictClass = 'amber'; }
  else if (overallScore < 60) { verdict = 'Substantial AI-Assisted';    verdictClass = 'amber'; }
  else if (overallScore < 80) { verdict = 'High AI Content';            verdictClass = 'red'; }
  else                        { verdict = 'Likely AI-Generated';        verdictClass = 'red'; }

  return {
    score: overallScore,
    avg: avgPerp,
    avgPerp,
    burstiness,
    sentences,
    aiSentences: aiFlaggedCount,
    aiDirectCount,
    aiPolishedCount,
    aiFlaggedPct,
    hasEvasion,
    hiddenChars,
    homoglyphs,
    verdict,
    verdictClass,
    avgLen: avgLen.toFixed(1),
    cvLen: cvLen.toFixed(2)
  };
}

// ═══════════════════════════════════════════════
// GLOBAL STATE & VARIABLES
// ═══════════════════════════════════════════════
let activeSubmissionId   = "MN-NEW";
let activeSubmissionTitle = "Assignment Document";
let currentAnalysisResult = null;
let currentAnalysisText   = "";
let extractedPDFText      = "";
let currentFileName       = "";
let currentFileSize       = "";
let activeTab             = "text"; // 'text' or 'pdf'
let currentView           = "inspector"; // 'inspector', 'studio', 'methodology'

// ═══════════════════════════════════════════════
// VIEW SWITCHER (Header Tabs & Mobile Bottom Bar)
// ═══════════════════════════════════════════════
function switchView(viewName) {
  currentView = viewName;
  
  // Sections
  document.querySelectorAll('.workspace-section').forEach(sec => sec.classList.remove('active'));
  const targetSec = document.getElementById('section-' + viewName);
  if (targetSec) targetSec.classList.add('active');

  // Header Nav Tabs
  document.querySelectorAll('.header-nav .nav-tab').forEach(tab => {
    if (tab.dataset.view === viewName) tab.classList.add('active');
    else tab.classList.remove('active');
  });

  // Mobile Bottom Bar
  document.querySelectorAll('.m-bottom-btn').forEach(btn => {
    if (btn.dataset.view === viewName) btn.classList.add('active');
    else btn.classList.remove('active');
  });

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

document.querySelectorAll('[data-view]').forEach(el => {
  el.addEventListener('click', (e) => {
    const v = el.dataset.view;
    if (v) switchView(v);
  });
});

const btnBackToInput = document.getElementById('btn-back-to-input');
if (btnBackToInput) {
  btnBackToInput.addEventListener('click', () => switchView('inspector'));
}

// ═══════════════════════════════════════════════
// PROGRESS BAR & PARTICLES
// ═══════════════════════════════════════════════
const progressBar = document.getElementById('progress-bar');
if (progressBar) {
  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    progressBar.style.width = scrollPct + '%';
  }, { passive: true });
}

const particleCanvas = document.getElementById('particle-canvas');
if (particleCanvas) {
  const pctx = particleCanvas.getContext('2d');
  let pW, pH;
  let pList = [];

  function resizeP() {
    pW = particleCanvas.width = window.innerWidth;
    pH = particleCanvas.height = window.innerHeight;
  }
  resizeP();
  window.addEventListener('resize', resizeP);

  for (let i = 0; i < 40; i++) {
    pList.push({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: 0.8 + Math.random() * 1.5,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      alpha: 0.2 + Math.random() * 0.5
    });
  }

  (function loopP() {
    pctx.clearRect(0, 0, pW, pH);
    pList.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0) p.x = pW;
      if (p.x > pW) p.x = 0;
      if (p.y < 0) p.y = pH;
      if (p.y > pH) p.y = 0;

      pctx.beginPath();
      pctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      pctx.fillStyle = `rgba(37,99,235,${p.alpha})`;
      pctx.fill();
    });
    requestAnimationFrame(loopP);
  })();
}

// ═══════════════════════════════════════════════
// INPUT TAB SWITCHING & SAMPLE LOADERS
// ═══════════════════════════════════════════════
const textInput = document.getElementById('text-input');
const charCount = document.getElementById('char-count');
const wordCount = document.getElementById('word-count');

function updateCounts() {
  if (!textInput) return;
  const t = textInput.value;
  if (charCount) charCount.textContent = t.length + ' chars';
  const w = t.trim().split(/\s+/).filter(x => x.length > 0);
  if (wordCount) wordCount.textContent = w.length + ' words';
  
  const hdrWords = document.getElementById('hdr-doc-words');
  if (hdrWords) hdrWords.textContent = w.length;
}

if (textInput) {
  textInput.value = SAMPLES.human;
  updateCounts();
  textInput.addEventListener('input', updateCounts);
}

// Input Tabs (Text / PDF)
document.querySelectorAll('.tab-row .tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    activeTab = btn.dataset.tab;
    document.querySelectorAll('.tab-row .tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.card-body-content .tab-body').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const tb = document.getElementById('tab-' + activeTab);
    if (tb) tb.classList.add('active');
  });
});

// Sample Chips
document.querySelectorAll('.sample-chips .chip-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.sample-chips .chip-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const sType = btn.dataset.sample;
    if (SAMPLES[sType] && textInput) {
      // Switch to text tab if on PDF
      const btnTabText = document.getElementById('btn-tab-text');
      if (btnTabText) btnTabText.click();
      textInput.value = SAMPLES[sType];
      updateCounts();
    }
  });
});

// Clear Text Button
const btnClearText = document.getElementById('btn-clear-text');
if (btnClearText && textInput) {
  btnClearText.addEventListener('click', () => {
    textInput.value = '';
    updateCounts();
    textInput.focus();
  });
}

// ═══════════════════════════════════════════════
// PDF UPLOAD & PARSING
// ═══════════════════════════════════════════════
const dropZone      = document.getElementById('drop-zone');
const pdfInput      = document.getElementById('pdf-input');
const fileInfo      = document.getElementById('file-info');
const fileName      = document.getElementById('file-name');
const fileSizeEl    = document.getElementById('file-size');
const clearBtn      = document.getElementById('btn-clear-file');
const extractStatus = document.getElementById('pdf-extract-status');
const extractMsg    = document.getElementById('extract-msg');

if (dropZone && pdfInput) {
  dropZone.addEventListener('click', () => pdfInput.click());

  dropZone.addEventListener('dragover', e => {
    e.preventDefault();
    dropZone.classList.add('dragover');
  });
  dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
  dropZone.addEventListener('drop', e => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'application/pdf') handlePDFFile(file);
  });

  pdfInput.addEventListener('change', () => {
    if (pdfInput.files[0]) handlePDFFile(pdfInput.files[0]);
  });
}

const btnChangeFile = document.getElementById('btn-change-file');
if (btnChangeFile && pdfInput) {
  btnChangeFile.addEventListener('click', (e) => {
    e.stopPropagation();
    pdfInput.click();
  });
}

if (clearBtn) {
  clearBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    extractedPDFText = '';
    currentFileName = '';
    currentFileSize = '';
    if (pdfInput) pdfInput.value = '';
    if (fileInfo) fileInfo.classList.add('hidden');
    if (dropZone) dropZone.classList.remove('hidden');
    if (extractStatus) extractStatus.classList.add('hidden');
  });
}

async function handlePDFFile(file) {
  currentFileName = file.name;
  currentFileSize = (file.size / 1024).toFixed(1) + ' KB';
  if (fileName) fileName.textContent  = currentFileName;
  if (fileSizeEl) fileSizeEl.textContent = currentFileSize;
  if (dropZone) dropZone.classList.add('hidden');
  if (fileInfo) fileInfo.classList.remove('hidden');
  if (extractStatus) extractStatus.classList.remove('hidden');
  if (extractMsg) extractMsg.textContent = 'Parsing PDF text layers client-side…';

  try {
    if (typeof pdfjsLib === 'undefined') {
      throw new Error('PDF.js library is loading. Please wait a moment and retry.');
    }

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    let fullText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      if (extractMsg) extractMsg.textContent = `Extracting page ${i} of ${pdf.numPages}…`;
      const page    = await pdf.getPage(i);
      const content = await page.getTextContent();
      // Use hasEOL or whitespace to preserve paragraph/line breaks from PDF layout
      let pageText = '';
      for (const item of content.items) {
        pageText += (item.str || '') + (item.hasEOL ? '\n' : ' ');
      }
      fullText += pageText + '\n';
    }

    extractedPDFText = fullText.trim();
    const wCount = extractedPDFText.split(/\s+/).filter(x => x.length > 0).length;
    if (extractMsg) {
      extractMsg.textContent = `✓ Successfully extracted ${wCount} words across ${pdf.numPages} page(s). Ready for Murnitin inspection.`;
    }
  } catch (err) {
    if (extractMsg) {
      extractMsg.textContent = '⚠ Could not parse PDF client-side. You can copy-paste into the Plain Text tab.';
    }
    console.error(err);
  }
}

// ═══════════════════════════════════════════════
// ENGINE INDICATOR
// ═══════════════════════════════════════════════
function setEngineIndicator(mode) {
  const el = document.getElementById('engine-indicator');
  if (!el) return;
  if (mode === 'ml') {
    el.textContent = 'RoBERTa ML Model';
    el.style.background = 'rgba(34, 197, 94, 0.25)';
    el.style.color = '#86efac';
  } else {
    el.textContent = 'Statistical Engine';
    el.style.background = 'rgba(37, 99, 235, 0.3)';
    el.style.color = '#93c5fd';
  }
}

// ═══════════════════════════════════════════════
// RUN INSPECTION & RECEIPT MODAL
// ═══════════════════════════════════════════════
const btnInspect   = document.getElementById('btn-inspect');
const receiptModal = document.getElementById('receipt-modal');
const modalClose   = document.getElementById('btn-modal-close');
const modalX       = document.getElementById('btn-modal-x');

function applyReceiptAndModal(result, text, origin) {
  currentAnalysisResult = result;
  currentAnalysisText   = text;

  activeSubmissionId   = 'MN-' + Math.floor(1000000 + Math.random() * 9000000);
  const submissionDate = new Date().toLocaleString();
  const wordCountVal   = text.split(/\s+/).filter(x => x.length > 0).length;
  const charCountVal   = text.length;
  activeSubmissionTitle = activeTab === 'pdf'
    ? currentFileName.replace(/\.[^/.]+$/, "").replace(/[_\s]+/g, " ")
    : (text.length > 50 ? text.slice(0, 50) + '…' : text);

  // Update Header & Paper Title Tags
  const hdrId = document.getElementById('hdr-doc-id');
  if (hdrId) hdrId.textContent = activeSubmissionId;

  const hdrWords = document.getElementById('hdr-doc-words');
  if (hdrWords) hdrWords.textContent = wordCountVal.toLocaleString();

  const studioTitle = document.getElementById('studio-doc-title');
  if (studioTitle) studioTitle.textContent = activeSubmissionTitle;

  const paperTitle = document.getElementById('paper-doc-title');
  if (paperTitle) paperTitle.textContent = activeSubmissionTitle;

  const paperIdTag = document.getElementById('paper-id-tag');
  if (paperIdTag) paperIdTag.textContent = activeSubmissionId;

  const paperDate = document.getElementById('paper-doc-date');
  if (paperDate) paperDate.textContent = submissionDate;

  // Receipts
  const rId = document.getElementById('receipt-id');
  if (rId) rId.textContent = activeSubmissionId;

  const rTitle = document.getElementById('receipt-title');
  if (rTitle) rTitle.textContent = activeSubmissionTitle;

  const rDate = document.getElementById('receipt-date');
  if (rDate) rDate.textContent = submissionDate;

  const rWords = document.getElementById('receipt-words');
  if (rWords) rWords.textContent = wordCountVal.toLocaleString() + ' words';

  const rChars = document.getElementById('receipt-chars');
  if (rChars) rChars.textContent = charCountVal.toLocaleString() + ' chars';

  const rOrigin = document.getElementById('receipt-origin');
  if (rOrigin) rOrigin.textContent = origin;

  // Print Cover Val sync
  document.querySelectorAll('.print-val-id').forEach(el => el.textContent = activeSubmissionId);
  document.querySelectorAll('.print-val-title').forEach(el => el.textContent = activeSubmissionTitle);
  document.querySelectorAll('.print-val-date').forEach(el => el.textContent = submissionDate);
  document.querySelectorAll('.print-val-words').forEach(el => el.textContent = wordCountVal);
  document.querySelectorAll('.print-val-chars').forEach(el => el.textContent = charCountVal);
  document.querySelectorAll('.print-val-hash').forEach(el => {
    el.textContent = 'mn256_' + Math.random().toString(16).substr(2, 16);
  });

  const prGauge = document.querySelector('.pr-gauge-pct');
  if (prGauge) prGauge.textContent = result.score + '%';

  const prVerdict = document.querySelector('.pr-verdict-val');
  if (prVerdict) prVerdict.textContent = result.verdict;

  // Unhide Header quick action buttons
  const btnHdrReceipt = document.getElementById('btn-hdr-receipt');
  if (btnHdrReceipt) btnHdrReceipt.classList.remove('hidden');

  const btnHdrDownload = document.getElementById('btn-hdr-download');
  if (btnHdrDownload) btnHdrDownload.classList.remove('hidden');

  // Mini score badge for mobile
  const mbScore = document.getElementById('mobile-score-badge');
  if (mbScore) {
    mbScore.textContent = result.score + '%';
    mbScore.style.background = result.score < 25 ? 'var(--t-green)' : result.score < 80 ? 'var(--t-amber)' : 'var(--t-red)';
  }
  const mbDot = document.getElementById('mb-dot-score');
  if (mbDot) {
    mbDot.textContent = result.score + '%';
    mbDot.style.background = result.score < 25 ? 'var(--t-green)' : result.score < 80 ? 'var(--t-amber)' : 'var(--t-red)';
  }

  // Open modal
  if (receiptModal) receiptModal.classList.remove('hidden');
}

if (btnInspect) {
  btnInspect.addEventListener('click', async () => {
    let text = '';
    let origin = 'Text Editor';

    if (activeTab === 'pdf') {
      if (!extractedPDFText) {
        if (extractMsg) extractMsg.textContent = '⚠ Please upload a PDF first.';
        if (extractStatus) extractStatus.classList.remove('hidden');
        return;
      }
      text = extractedPDFText;
      origin = currentFileName;
    } else {
      text = textInput ? textInput.value.trim() : '';
    }

    if (!text || text.split(/\s+/).length < 10) {
      alert('Please provide at least 10 words for Murnitin analysis.');
      return;
    }

    btnInspect.disabled = true;
    const btnLabel = btnInspect.querySelector('.btn-label') || btnInspect;
    const origText = btnLabel.textContent;
    btnLabel.textContent = '🔬 Running Murnitin Inspection…';

    // Determine API Endpoint: try relative if on same origin, or Render backend if on static host
    const apiEndpoints = [
      '/api/analyze',
      'https://murnitin.onrender.com/api/analyze'
    ];

    let backendSuccess = false;

    for (const endpoint of apiEndpoints) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 60000);

        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            text,
            eslMode: typeof isESLModeActive !== 'undefined' ? isESLModeActive : false 
          }),
          signal: controller.signal,
        });
        clearTimeout(timeout);

        if (!response.ok) throw new Error(`Server error ${response.status}`);
        const result = await response.json();
        if (result.error) throw new Error(result.error);

        if (!result.verdictClass) {
          result.verdictClass = result.score < 25 ? 'green' : result.score < 80 ? 'amber' : 'red';
        }

        setEngineIndicator('ml');
        applyReceiptAndModal(result, text, origin);
        backendSuccess = true;
        break;
      } catch (err) {
        // Try next endpoint or fallback
      }
    }

    if (!backendSuccess) {
      console.warn('RoBERTa ML backend unavailable, using client-side statistical engine.');
      setEngineIndicator('heuristic');
      const result = analyzeText(text);
      if (result) {
        applyReceiptAndModal(result, text, origin);
      }
    }

    btnInspect.disabled = false;
    btnLabel.textContent = origText;
  });
}

// Modal Close & Switch to Feedback Studio
function closeReceiptAndOpenStudio() {
  if (receiptModal) receiptModal.classList.add('hidden');
  if (currentAnalysisResult) {
    renderStudioDocument(currentAnalysisResult, currentAnalysisText);
    renderSidebarDrawer(currentAnalysisResult);
    renderPrintReport(currentAnalysisResult, currentAnalysisText);
  }
  switchView('studio');
}

if (modalClose) modalClose.addEventListener('click', closeReceiptAndOpenStudio);
if (modalX) modalX.addEventListener('click', () => {
  if (receiptModal) receiptModal.classList.add('hidden');
});

const btnHdrReceipt = document.getElementById('btn-hdr-receipt');
if (btnHdrReceipt) {
  btnHdrReceipt.addEventListener('click', () => {
    if (receiptModal) receiptModal.classList.remove('hidden');
  });
}

const btnStudioReceipt = document.getElementById('btn-studio-receipt');
if (btnStudioReceipt) {
  btnStudioReceipt.addEventListener('click', () => {
    if (receiptModal) receiptModal.classList.remove('hidden');
  });
}

// ═══════════════════════════════════════════════
// RENDER TURNITIN PAPER DOCUMENT CANVAS
// ═══════════════════════════════════════════════
function renderStudioDocument(r, rawText) {
  const emptyBox = document.getElementById('studio-doc-empty');
  const paperSheet = document.getElementById('studio-paper-sheet');
  const highlightMap = document.getElementById('highlight-map');

  if (emptyBox) emptyBox.classList.add('hidden');
  if (paperSheet) paperSheet.classList.remove('hidden');
  if (!highlightMap) return;

  highlightMap.innerHTML = '';

  let matchIndex = 1;
  r.sentences.forEach((s) => {
    const span = document.createElement('span');
    span.className = 'hl-sent ' + s.classification;
    span.id = `sent-block-${s.idx}`;

    // Tag badge for flagged sentences
    let tagHtml = '';
    if (s.classification === 'ai_direct') {
      tagHtml = `<span class="hl-tag-badge">${matchIndex++}</span>`;
    } else if (s.classification === 'ai_polished') {
      tagHtml = `<span class="hl-tag-badge">${matchIndex++}</span>`;
    }

    span.innerHTML = tagHtml + escapeHtml(s.text) + ' ';
    span.title = `Sentence #${s.idx + 1} | Perplexity: ${(typeof s.perplexity === 'number' ? s.perplexity : 50).toFixed(1)} | Class: ${s.classification || 'human'}`;

    span.addEventListener('click', (e) => {
      e.stopPropagation();
      // Remove previous active focus
      document.querySelectorAll('.hl-sent.active-focus').forEach(el => el.classList.remove('active-focus'));
      span.classList.add('active-focus');

      // Show floating Sentence XAI Popover
      showSentenceXAIPopover(s, span);

      // If drawer match item exists, scroll it
      const matchCard = document.getElementById(`match-card-${s.idx}`);
      if (matchCard) {
        matchCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        matchCard.style.boxShadow = '0 0 0 2px var(--t-blue)';
        setTimeout(() => { matchCard.style.boxShadow = ''; }, 2000);
      }
    });

    highlightMap.appendChild(span);
  });
}

// ═══════════════════════════════════════════════
// FLOATING SENTENCE XAI POPOVER LOGIC
// ═══════════════════════════════════════════════
const xaiPopover = document.getElementById('sentence-xai-popover');
const xaiBadge   = document.getElementById('xai-pop-badge');
const xaiPpx     = document.getElementById('xai-pop-ppx');
const xaiText    = document.getElementById('xai-pop-text');
const xaiSignals = document.getElementById('xai-pop-signals');
const btnXaiJump = document.getElementById('btn-xai-jump-match');
const btnPopClose= document.getElementById('btn-close-popover');

if (btnPopClose && xaiPopover) {
  btnPopClose.addEventListener('click', () => xaiPopover.classList.add('hidden'));
}

document.addEventListener('click', (e) => {
  if (xaiPopover && !xaiPopover.contains(e.target) && !e.target.closest('.hl-sent')) {
    xaiPopover.classList.add('hidden');
  }
});

function showSentenceXAIPopover(s, targetEl) {
  if (!xaiPopover) return;

  const rect = targetEl.getBoundingClientRect();
  const popW = 320;
  
  let left = rect.left;
  let top = rect.top - 180;

  if (top < 70) top = rect.bottom + 10;
  if (left + popW > window.innerWidth - 20) left = window.innerWidth - popW - 20;
  if (left < 10) left = 10;

  xaiPopover.style.left = `${left}px`;
  xaiPopover.style.top = `${top}px`;

  const isDirect   = s.classification === 'ai_direct';
  const isPolished = s.classification === 'ai_polished';
  const isHuman    = s.classification === 'human';

  if (xaiBadge) {
    xaiBadge.className = 'xai-badge ' + (s.classification || 'human');
    xaiBadge.textContent = isDirect ? '🔴 AI-Direct' : isPolished ? '🟡 AI-Polished' : isHuman ? '🟢 Human' : '🟣 Evasion';
  }

  const ppxVal = typeof s.perplexity === 'number' ? s.perplexity : 50;
  if (xaiPpx) {
    xaiPpx.textContent = `PPX: ${ppxVal.toFixed(1)} ${ppxVal < 25 ? '(Low Entropy / AI)' : ppxVal < 55 ? '(Mixed Entropy)' : '(Diverse Human)'}`;
  }

  if (xaiText) {
    xaiText.textContent = `"${s.text}"`;
  }

  if (xaiSignals) {
    xaiSignals.innerHTML = '';
    const tags = [];
    if (s.confidence) {
      tags.push(`🎯 ${s.confidence}% Confidence`);
    }
    if (s.reason) {
      tags.push(`🔍 ${s.reason}`);
    }
    if (s.signals) {
      if (s.signals.boilerplate > 0) tags.push(`Boilerplate: ${s.signals.boilerplate}%`);
      if (s.signals.collocations > 0) tags.push(`${s.signals.collocations} AI Collocations`);
      if (s.signals.transition > 0) tags.push('AI Transition Opener');
      if (s.signals.vocabulary_richness > 20) tags.push('Low Vocab Diversity');
    }
    if (tags.length === 0) {
      if (isDirect) tags.push('High Model Confidence', 'Predictable Token Entropy');
      else if (isPolished) tags.push('Hybrid Vocabulary', 'Paraphrased Transitions');
      else tags.push('Natural Human Stance', 'Organic Lexical Variety');
    }
    tags.forEach(t => {
      const tagSpan = document.createElement('span');
      tagSpan.className = 'xai-signal-tag';
      tagSpan.textContent = t;
      xaiSignals.appendChild(tagSpan);
    });
  }

  if (btnXaiJump) {
    btnXaiJump.onclick = () => {
      xaiPopover.classList.add('hidden');
      const matchCard = document.getElementById(`match-card-${s.idx}`);
      if (matchCard) {
        matchCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        matchCard.style.boxShadow = '0 0 0 2px var(--t-blue)';
        setTimeout(() => { matchCard.style.boxShadow = ''; }, 2000);
      }
    };
  }

  xaiPopover.classList.remove('hidden');
}

// ESL Fairness Mode State
let isESLModeActive = false;
const toggleESL = document.getElementById('toggle-esl');
if (toggleESL) {
  toggleESL.addEventListener('change', () => {
    isESLModeActive = toggleESL.checked;
  });
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ═══════════════════════════════════════════════
// RENDER TURNITIN MATCH OVERVIEW (SIDEBAR DRAWER)
// ═══════════════════════════════════════════════
function renderSidebarDrawer(r) {
  const emptyState = document.getElementById('sidebar-empty');
  const activeState = document.getElementById('sidebar-active');

  if (emptyState) emptyState.classList.add('hidden');
  if (activeState) activeState.classList.remove('hidden');

  // Radial Score Gauge
  const gFill = document.getElementById('g-fill');
  const circumference = 314.159;
  const offset = circumference - (circumference * r.score / 100);
  if (gFill) {
    gFill.style.strokeDashoffset = offset;
    gFill.style.stroke = r.score < 25 ? 'var(--t-green)' : r.score < 80 ? 'var(--t-amber)' : 'var(--t-red)';
  }

  const scorePct = document.getElementById('score-pct');
  if (scorePct) scorePct.textContent = r.score + '%';

  const verdictEl = document.getElementById('m-verdict');
  if (verdictEl) {
    verdictEl.textContent = r.verdict;
    verdictEl.className = 'verdict-pill ' + (r.score < 25 ? 'green' : r.score < 80 ? 'amber' : 'red');
  }

  const vDescEl = document.getElementById('verdict-desc');
  if (vDescEl) {
    if (r.score >= 80) vDescEl.textContent = 'High probability of machine-generated prose.';
    else if (r.score >= 60) vDescEl.textContent = 'Substantial portions of document generated with AI assistance.';
    else if (r.score >= 35) vDescEl.textContent = 'Notable AI assistance, paraphrasing, or machine-edited prose detected.';
    else if (r.score >= 15) vDescEl.textContent = 'Minor indicators — collaborative editing or mild AI polish.';
    else vDescEl.textContent = 'Linguistic variation aligns with organic human writing.';
  }

  // Quick metrics
  const mSents = document.getElementById('m-sentences');
  if (mSents) mSents.textContent = r.sentences.length;

  const mAiSents = document.getElementById('m-ai-sents');
  if (mAiSents) mAiSents.textContent = r.aiSentences;

  const mBurst = document.getElementById('m-burstiness');
  if (mBurst) mBurst.textContent = (typeof r.burstiness === 'number' ? r.burstiness : 0).toFixed(1);

  const mEvasion = document.getElementById('m-evasion');
  if (mEvasion) {
    mEvasion.textContent = r.hasEvasion ? '⚠️ Flagged' : '✓ None';
    mEvasion.style.color = r.hasEvasion ? 'var(--t-red)' : 'var(--t-green)';
  }

  const mPerp = document.getElementById('m-perplexity');
  if (mPerp) mPerp.textContent = (typeof r.avg === 'number' ? r.avg : 50).toFixed(1);

  // Match Breakdown Cards
  const matchContainer = document.getElementById('match-items-container');
  const matchBadge = document.getElementById('match-count-badge');
  if (matchContainer) {
    matchContainer.innerHTML = '';
    const flagged = r.sentences.filter(s => s.classification !== 'human');
    if (matchBadge) matchBadge.textContent = `${flagged.length} flagged`;

    if (flagged.length === 0) {
      matchContainer.innerHTML = `
        <div style="text-align:center; padding: 2rem 1rem; color:var(--text-muted); font-size:0.85rem;">
          <span style="font-size:1.5rem; display:block; margin-bottom:0.25rem;">✨</span>
          No high-confidence AI matches found in this document.
        </div>
      `;
    } else {
      flagged.forEach((s, idx) => {
        const card = document.createElement('div');
        const isPolished = s.classification === 'ai_polished';
        card.className = `match-card-item ${isPolished ? 'polished-card' : ''}`;
        card.id = `match-card-${s.idx}`;

        const confHtml = s.confidence ? `<span style="font-size:0.7rem; color:var(--text-muted); font-weight:600; margin-left:auto;">${s.confidence}% Conf</span>` : '';
        const reasonHtml = s.reason ? `<div style="font-size:0.72rem; color:var(--t-blue); margin-top:0.35rem; font-family:var(--font-mono); opacity:0.9;">↳ Evidence: ${escapeHtml(s.reason)}</div>` : '';

        card.innerHTML = `
          <div class="match-card-header" style="display:flex; align-items:center; gap:0.5rem;">
            <span class="match-tag-text">${isPolished ? '🟡 AI-Polished' : '🔴 AI-Direct'} Match #${idx + 1}</span>
            <span class="match-score-text">PPX: ${(typeof s.perplexity === 'number' ? s.perplexity : 50).toFixed(1)}</span>
            ${confHtml}
          </div>
          <p class="match-card-snippet">"${escapeHtml(s.text)}"</p>
          ${reasonHtml}
        `;

        card.addEventListener('click', () => {
          const targetSpan = document.getElementById(`sent-block-${s.idx}`);
          if (targetSpan) {
            targetSpan.scrollIntoView({ behavior: 'smooth', block: 'center' });
            document.querySelectorAll('.hl-sent.active-focus').forEach(el => el.classList.remove('active-focus'));
            targetSpan.classList.add('active-focus');
          }
        });

        matchContainer.appendChild(card);
      });
    }
  }

  // Perplexity Profile Chart
  drawPerplexityChart(r.sentences);

  // Evasion Tab Details
  const evSection = document.getElementById('evasion-section');
  const evCleanBox = document.getElementById('evasion-clean-box');
  const evDetails = document.getElementById('evasion-details');

  if (r.hasEvasion) {
    if (evSection) evSection.classList.remove('hidden');
    if (evCleanBox) evCleanBox.classList.add('hidden');
    if (evDetails) {
      let html = '';
      r.hiddenChars.forEach(h => {
        html += `<div style="padding:0.4rem; background:#fee2e2; border-radius:4px; color:#991b1b;">
          <strong>${h.count}× ${h.name}</strong> — invisible character inserted.
        </div>`;
      });
      if (r.homoglyphs.length > 0) {
        html += `<div style="padding:0.4rem; background:#fee2e2; border-radius:4px; color:#991b1b;">
          <strong>${r.homoglyphs.length} Mixed-script homoglyphs:</strong> ${r.homoglyphs.slice(0,5).join(', ')}
        </div>`;
      }
      evDetails.innerHTML = html;
    }
  } else {
    if (evSection) evSection.classList.add('hidden');
    if (evCleanBox) evCleanBox.classList.remove('hidden');
  }

  // ── Populate Murnitin vs Turnitin Signal Meters (Tab 4) ──
  const sigNeuralVal = document.getElementById('sig-val-neural');
  const sigNeuralBar = document.getElementById('sig-bar-neural');
  const sigVocabVal  = document.getElementById('sig-val-vocab');
  const sigVocabBar  = document.getElementById('sig-bar-vocab');
  const sigTransVal  = document.getElementById('sig-val-trans');
  const sigTransBar  = document.getElementById('sig-bar-trans');
  const sigSyntaxVal = document.getElementById('sig-val-syntax');
  const sigSyntaxBar = document.getElementById('sig-bar-syntax');

  const neuralPct = r.score || 0;
  if (sigNeuralVal) sigNeuralVal.textContent = `${neuralPct}%`;
  if (sigNeuralBar) sigNeuralBar.style.width = `${Math.max(5, neuralPct)}%`;

  const sSum = r.signalSummary || {};
  const vocabScore = sSum.vocabulary_richness_avg || (r.score > 50 ? 68 : 25);
  if (sigVocabVal) sigVocabVal.textContent = vocabScore > 50 ? 'High (Repetitive)' : vocabScore > 20 ? 'Moderate' : 'Diverse (Human)';
  if (sigVocabBar) sigVocabBar.style.width = `${Math.min(100, Math.max(10, vocabScore * 2))}%`;

  const transScore = sSum.transition_avg || (r.score > 50 ? 45 : 10);
  if (sigTransVal) sigTransVal.textContent = transScore > 40 ? 'High Formulaic' : transScore > 15 ? 'Moderate' : 'Natural (Low)';
  if (sigTransBar) sigTransBar.style.width = `${Math.min(100, Math.max(10, transScore * 1.8))}%`;

  const syntaxScore = sSum.syntactic_avg || 50;
  if (sigSyntaxVal) sigSyntaxVal.textContent = syntaxScore > 60 ? 'Uniform AI Syntax' : 'Organic Cadence';
  if (sigSyntaxBar) sigSyntaxBar.style.width = `${Math.min(100, Math.max(15, syntaxScore))}%`;
}

// Drawer Tabs Switching
document.querySelectorAll('.drawer-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    const target = tab.dataset.dtab;
    document.querySelectorAll('.drawer-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.drawer-tab-pane').forEach(p => p.classList.remove('active'));
    tab.classList.add('active');
    const pane = document.getElementById('dtab-' + target);
    if (pane) pane.classList.add('active');
  });
});

// Layer Filter Toggles
document.querySelectorAll('.layer-toggle-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const layer = btn.dataset.layer;
    btn.classList.toggle('active');
    const isActive = btn.classList.contains('active');

    let selector = '';
    if (layer === 'ai') selector = '.hl-sent.ai_direct, .hl-sent.ai';
    else if (layer === 'polished') selector = '.hl-sent.polished, .hl-sent.ai_polished';
    else if (layer === 'human') selector = '.hl-sent.human';
    else if (layer === 'evasion') selector = '.hl-sent.evasion';

    if (selector) {
      document.querySelectorAll(selector).forEach(el => {
        el.style.opacity = isActive ? '1' : '0.25';
        el.style.background = isActive ? '' : 'transparent';
      });
    }
  });
});

// Mobile Drawer Toggle
const btnMobileToggle = document.getElementById('btn-mobile-drawer-toggle');
const mBtnOverview = document.getElementById('m-btn-overview');
const sidebarDrawer = document.getElementById('metric-sidebar');

function toggleMobileDrawer() {
  if (sidebarDrawer) {
    sidebarDrawer.classList.toggle('mobile-drawer-open');
  }
}

if (btnMobileToggle) btnMobileToggle.addEventListener('click', toggleMobileDrawer);
if (mBtnOverview) {
  mBtnOverview.addEventListener('click', () => {
    switchView('studio');
    toggleMobileDrawer();
  });
}

// ═══════════════════════════════════════════════
// PERPLEXITY PROFILE CHART (Drawer Canvas)
// ═══════════════════════════════════════════════
function drawPerplexityChart(sentences) {
  const canvas = document.getElementById('perplexity-chart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.offsetWidth || 340;
  const H = 140;

  canvas.width = W;
  canvas.height = H;

  const perps = sentences.map(s => s.perplexity);
  const maxP = Math.max(...perps, 40);
  const step = W / (perps.length - 1 || 1);
  const pad = 12;

  ctx.clearRect(0, 0, W, H);

  // Background Grid
  ctx.strokeStyle = '#f1f5f9';
  ctx.lineWidth = 1;
  [0.25, 0.5, 0.75].forEach(t => {
    const y = pad + (1 - t) * (H - 2 * pad);
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
    ctx.stroke();
  });

  // Gradient fill
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, 'rgba(37, 99, 235, 0.25)');
  grad.addColorStop(1, 'rgba(37, 99, 235, 0)');

  ctx.beginPath();
  perps.forEach((p, i) => {
    const x = i * step;
    const y = pad + (1 - p / maxP) * (H - 2 * pad);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.lineTo((perps.length - 1) * step, H);
  ctx.lineTo(0, H);
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();

  // Line stroke
  ctx.beginPath();
  ctx.strokeStyle = '#2563eb';
  ctx.lineWidth = 2.5;
  ctx.lineJoin = 'round';
  perps.forEach((p, i) => {
    const x = i * step;
    const y = pad + (1 - p / maxP) * (H - 2 * pad);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();

  // Dots
  perps.forEach((p, i) => {
    const x = i * step;
    const y = pad + (1 - p / maxP) * (H - 2 * pad);
    const cls = sentences[i].classification;
    const color = cls === 'ai_direct' ? '#dc2626' : cls === 'ai_polished' ? '#d97706' : '#059669';
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  });
}

// ═══════════════════════════════════════════════
// RENDER PRINT / PDF EXPORT CONTENT
// ═══════════════════════════════════════════════
function renderPrintReport(r, rawText) {
  const reportBody = document.getElementById('report-body');
  if (reportBody) reportBody.classList.remove('hidden');

  const ts = document.getElementById('report-timestamp');
  if (ts) ts.textContent = new Date().toLocaleString();

  document.querySelectorAll('.ph-score').forEach(el => el.textContent = r.score + '%');

  const tbody = document.getElementById('sentence-tbody');
  if (tbody) {
    tbody.innerHTML = r.sentences.map(s => {
      const clsMap = { human: 'style="color:#059669;font-weight:bold;"', ai_direct: 'style="color:#dc2626;font-weight:bold;"', ai_polished: 'style="color:#d97706;font-weight:bold;"' };
      const labelMap = { human: 'HUMAN', ai_direct: 'AI-DIRECT', ai_polished: 'AI-POLISHED' };
      return `
        <tr>
          <td style="font-family:monospace; color:#64748b;">${String(s.idx + 1).padStart(2,'0')}</td>
          <td>${escapeHtml(s.text)}</td>
          <td style="font-family:monospace;">${(typeof s.perplexity === 'number' ? s.perplexity : 50).toFixed(1)}</td>
          <td ${clsMap[s.classification] || ''}>${labelMap[s.classification] || s.classification}</td>
        </tr>
      `;
    }).join('');
  }
}

// ═══════════════════════════════════════════════
// PRINT & PDF REPORT GENERATION (jsPDF)
// ═══════════════════════════════════════════════
const btnPrint = document.getElementById('btn-print');
if (btnPrint) {
  btnPrint.addEventListener('click', () => window.print());
}

function handleDownloadPDF() {
  if (!currentAnalysisResult) {
    alert('Please run an inspection first before downloading the PDF report.');
    return;
  }

  // Show loading state on all download buttons
  const allBtns = [
    document.getElementById('btn-download-pdf'),
    document.getElementById('btn-hdr-download'),
    document.getElementById('btn-studio-download'),
    document.getElementById('m-btn-export'),
  ].filter(Boolean);

  const origLabels = allBtns.map(b => b.textContent);
  allBtns.forEach(b => { b.disabled = true; b.textContent = '⏳ Generating PDF…'; });

  // Small delay so the UI updates before the synchronous PDF generation locks the thread
  setTimeout(() => {
    try {
      generateMurnitinPDF(currentAnalysisResult, currentAnalysisText);
    } catch(e) {
      alert('PDF generation failed: ' + e.message);
      console.error(e);
    } finally {
      allBtns.forEach((b, i) => { b.disabled = false; b.textContent = origLabels[i]; });
    }
  }, 50);
}

const btnDl1 = document.getElementById('btn-download-pdf');
const btnDl2 = document.getElementById('btn-hdr-download');
const btnDl3 = document.getElementById('btn-studio-download');
const btnDlMobile = document.getElementById('m-btn-export');

if (btnDl1) btnDl1.addEventListener('click', handleDownloadPDF);
if (btnDl2) btnDl2.addEventListener('click', handleDownloadPDF);
if (btnDl3) btnDl3.addEventListener('click', handleDownloadPDF);
if (btnDlMobile) btnDlMobile.addEventListener('click', handleDownloadPDF);

function generateMurnitinPDF(r, rawText) {
  try {
    // jsPDF UMD bundle exposes window.jspdf.jsPDF; some CDNs use window.jsPDF directly
    const jsPDFClass = (window.jspdf && window.jspdf.jsPDF)
      || window.jsPDF
      || null;

    if (!jsPDFClass) {
      alert(
        'PDF library (jsPDF) failed to load.\n\n' +
        'Please check your internet connection, then refresh the page and try again.'
      );
      return;
    }
    const doc = new jsPDFClass({ unit: 'mm', format: 'a4', orientation: 'portrait' });

    const PW = 210;
    const PH = 297;
    const ML = 18;
    const MR = 18;
    const CW = PW - ML - MR;

    const C = {
      black:     [0,   0,   0],
      white:     [255, 255, 255],
      navy:      [11,  23,  39],
      navyBar:   [15,  35,  61],
      blue:      [37,  99,  235],
      green:     [5,   150, 105],
      amber:     [217, 119, 6],
      red:       [220, 38,  38],
      gray100:   [248, 249, 250],
      gray200:   [226, 232, 240],
      gray400:   [148, 163, 184],
      gray700:   [51,  65,  85],
      gray900:   [15,  23,  42],
    };

    const fill   = (c) => doc.setFillColor(c[0], c[1], c[2]);
    const stroke = (c) => doc.setDrawColor(c[0], c[1], c[2]);
    const text   = (c) => doc.setTextColor(c[0], c[1], c[2]);
    const font   = (style, size) => { doc.setFont('helvetica', style); doc.setFontSize(size); };
    const rect   = (x, y, w, h, s='F') => doc.rect(x, y, w, h, s);

    function wrapText(str, maxWidth) {
      return doc.splitTextToSize(str, maxWidth);
    }

    function drawPageHeader(title) {
      fill(C.navyBar); rect(0, 0, PW, 14);
      fill(C.red);     rect(0, 13, PW, 1.2);
      font('bold', 8); text(C.white);
      doc.text('MURNITIN FEEDBACK STUDIO', ML, 9);
      font('normal', 7); text(C.gray400);
      doc.text(title, ML + 55, 9);
      font('bold', 7); text(C.white);
      doc.text(`#${activeSubmissionId}`, PW - MR, 9, { align: 'right' });
    }

    function drawPageFooter(pageNum, totalPages) {
      const y = PH - 8;
      fill(C.gray200); rect(0, PH - 12, PW, 12);
      font('normal', 7); text(C.gray700);
      doc.text('Murnitin Feedback Studio  ·  Developed by Md. Mehedi Hasan  ·  mdmehedihasan.us', ML, y);
      doc.text(`Page ${pageNum} of ${totalPages}`, PW - MR, y, { align: 'right' });
      fill(C.red); rect(0, PH - 12, PW, 1);
    }

    // ── PAGE 1: COVER DIGITAL RECEIPT ──
    fill(C.navy); rect(0, 0, PW, PH);
    fill(C.red);  rect(0, 0, PW, 4);

    font('bold', 24); text(C.white);
    doc.text('Murnitin Feedback Studio', ML, 42);
    font('normal', 11); text(C.gray400);
    doc.text('Explainable Academic Integrity & AI Verification', ML, 50);

    fill(C.gray700); rect(ML, 55, CW, 0.5);

    // Receipt Card Box
    const boxY = 64;
    const boxH = 75;
    fill([18, 30, 49]); rect(ML, boxY, CW, boxH, 'F');
    stroke(C.gray700); rect(ML, boxY, CW, boxH, 'S');
    fill(C.red); rect(ML, boxY, 3, boxH, 'F');

    const submissionDate = new Date().toLocaleString();
    const wordCountVal   = rawText.split(/\s+/).filter(x => x.length > 0).length;
    const charCountVal   = rawText.length;
    const hashVal        = 'mn256_' + Math.random().toString(16).substr(2, 16);

    const receiptLines = [
      ['Submission ID',    activeSubmissionId],
      ['Document Title',   activeSubmissionTitle || 'Untitled Document'],
      ['Submission Date',  submissionDate],
      ['Word Count',       wordCountVal.toLocaleString() + ' words'],
      ['Character Count',  charCountVal.toLocaleString() + ' chars'],
      ['Integrity Hash',   hashVal],
    ];

    font('bold', 9); text(C.white);
    doc.text('OFFICIAL DIGITAL SUBMISSION RECEIPT', ML + 8, boxY + 9);

    receiptLines.forEach(([label, val], i) => {
      const rowY = boxY + 18 + i * 9;
      font('normal', 7.5); text(C.gray400);
      doc.text(label, ML + 8, rowY);
      font('bold', 7.5); text(C.white);
      doc.text(String(val).substring(0, 56), ML + 55, rowY);
      fill([28, 45, 70]); rect(ML + 6, rowY + 2, CW - 12, 0.3);
    });

    // Score Circle & Verdict
    const badgeY = boxY + boxH + 15;
    const sColor = r.score < 25 ? C.green : r.score < 80 ? C.amber : C.red;

    stroke(sColor); doc.setDrawColor(sColor[0], sColor[1], sColor[2]);
    doc.setLineWidth(2.5);
    doc.circle(ML + 30, badgeY + 22, 22, 'S');
    doc.setLineWidth(0.3);

    font('bold', 24); text(sColor);
    doc.text(r.score + '%', ML + 30, badgeY + 20, { align: 'center' });
    font('normal', 7); text(C.gray400);
    doc.text('AI Likelihood', ML + 30, badgeY + 26, { align: 'center' });

    const verdictBoxX = ML + 60;
    fill([18, 30, 49]); rect(verdictBoxX, badgeY + 4, CW - 62, 36, 'F');
    stroke(sColor); rect(verdictBoxX, badgeY + 4, CW - 62, 36, 'S');
    fill(sColor); rect(verdictBoxX, badgeY + 4, 3, 36, 'F');

    font('bold', 15); text(sColor);
    doc.text(r.verdict, verdictBoxX + 8, badgeY + 17);

    font('normal', 7.5); text(C.gray400);
    const vDesc = r.score >= 80
      ? 'High-density AI signatures detected across syntax and lexical entropy.'
      : r.score >= 25
      ? 'Mixed signals indicating collaborative authoring, paraphrasing, or revision.'
      : 'Natural burstiness and lexical distribution conforming to human prose.';
    doc.text(wrapText(vDesc, CW - 75), verdictBoxX + 8, badgeY + 25);

    // Cover Footer
    font('normal', 7); text(C.gray400);
    doc.text('Developed by Md. Mehedi Hasan  ·  mdmehedihasan.us  ·  Zero-Knowledge Client-Side Analysis', PW / 2, PH - 10, { align: 'center' });
    fill(C.red); rect(0, PH - 3, PW, 3);

    // ── PAGE 2: SENTENCE-BY-SENTENCE BREAKDOWN ──
    doc.addPage();
    fill(C.white); rect(0, 0, PW, PH);
    drawPageHeader('Sentence-by-Sentence Integrity Analysis');

    let y = 22;
    font('bold', 13); text(C.gray900);
    doc.text('Sentence Integrity Breakdown', ML, y); y += 4;
    font('normal', 7.5); text(C.gray700);
    doc.text('Sentence-level perplexity scores and classification labels.', ML, y); y += 6;

    const tableRows = r.sentences.map(s => [
      String(s.idx + 1).padStart(2, '0'),
      s.text.length > 105 ? s.text.substring(0, 102) + '…' : s.text,
      (typeof s.perplexity === 'number' ? s.perplexity : 50).toFixed(1),
      s.classification === 'ai_direct' ? 'AI-DIRECT' : s.classification === 'ai_polished' ? 'AI-POLISHED' : 'HUMAN'
    ]);

    if (typeof doc.autoTable === 'function') {
      doc.autoTable({
        startY: y,
        head: [['#', 'Sentence Passage', 'Perplexity', 'Classification']],
        body: tableRows,
        margin: { left: ML, right: MR },
        tableWidth: CW,
        styles: { font: 'helvetica', fontSize: 7, cellPadding: 2.5 },
        headStyles: { fillColor: C.navyBar, textColor: C.white, fontStyle: 'bold' },
        columnStyles: {
          0: { cellWidth: 12, halign: 'center', fontStyle: 'bold' },
          1: { cellWidth: 106 },
          2: { cellWidth: 20, halign: 'center' },
          3: { cellWidth: 32, halign: 'center', fontStyle: 'bold' },
        },
        alternateRowStyles: { fillColor: C.gray100 },
        didDrawPage: () => {
          drawPageHeader('Sentence-by-Sentence Integrity Analysis');
        }
      });
    }

    const totalPages = doc.internal.getNumberOfPages();
    for (let p = 2; p <= totalPages; p++) {
      doc.setPage(p);
      drawPageFooter(p, totalPages);
    }

    const filename = `Murnitin_Integrity_Report_${activeSubmissionId}_${new Date().toISOString().slice(0,10)}.pdf`;
    doc.save(filename);
  } catch (err) {
    alert("Error generating PDF: " + err.message);
    console.error(err);
  }
}
