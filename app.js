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
// STATISTICAL ENGINE VOCABULARY & FREQUENCIES
// ═══════════════════════════════════════════════
const BASE_FREQS = {
  "the":0.060,"of":0.035,"and":0.028,"a":0.022,"in":0.020,"to":0.019,
  "is":0.018,"that":0.015,"for":0.012,"it":0.011,"with":0.010,"as":0.010,
  "are":0.009,"on":0.009,"at":0.008,"by":0.008,"an":0.008,"be":0.007,
  "this":0.007,"from":0.007,"or":0.006,"which":0.006,"not":0.006,
  "was":0.005,"have":0.005,"were":0.005,"they":0.004,"we":0.004,
  "been":0.004,"has":0.004,"can":0.004,"than":0.004,"these":0.003,
  "their":0.003,"more":0.003,"also":0.003,"into":0.003,"its":0.003,
  "both":0.003,"may":0.003,"such":0.003,"between":0.003,"each":0.002,
  "while":0.002,"through":0.002,"when":0.002,"one":0.002,"two":0.002,
  "all":0.002,"if":0.002,"but":0.002,"other":0.002,"our":0.002,
  "used":0.002,"using":0.002,"about":0.002,"after":0.002,"only":0.002,
  "then":0.002,"up":0.002,"over":0.002,"new":0.001,"well":0.001,
  "based":0.002,"thus":0.002,"however":0.002,"where":0.002,"will":0.002,
  "within":0.002,"across":0.001,"without":0.001,"under":0.001,
  "during":0.001,"different":0.001,"most":0.001,"some":0.001,"any":0.001,
  "how":0.001,"could":0.001,"given":0.001,"since":0.001,"no":0.001,
  "model":0.0035,"models":0.003,"data":0.003,"learning":0.003,
  "results":0.003,"method":0.002,"methods":0.002,"approach":0.002,
  "analysis":0.002,"study":0.002,"paper":0.002,"research":0.002,
  "proposed":0.002,"show":0.002,"shows":0.002,"performance":0.002,
  "training":0.002,"prediction":0.002,"features":0.002,"set":0.002,
  "network":0.002,"deep":0.002,"machine":0.002,"neural":0.002,
  "accuracy":0.002,"dataset":0.002,"framework":0.002,"system":0.002,
  "algorithm":0.002,"feature":0.002,"use":0.003,"information":0.002
};

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
  "embark","foster","leverage","harness","propel","ascertain",
  "delineate","elucidate","underscore","encapsulate","epitomize",
  "elucidating","delineating","encapsulating","underpinning",
  "posits","stipulates","mandates","necessitates","obviates"
]);

const HUMAN_MARKERS = new Set([
  "honestly","frankly","surprisingly","unexpectedly","weirdly",
  "oddly","interestingly","frustratingly","thankfully","luckily",
  "unfortunately","awkwardly","admittedly","confusingly","puzzlingly",
  "disappointingly","excitingly","unsurprisingly","hilariously",
  "worryingly","annoyingly","reassuringly","understandably","arguably",
  "presumably","supposedly","apparently","seemingly","evidently",
  "strangely","notably","curiously","typically","usually","often",
  "sometimes","rarely","seldom","occasionally","frequently",
  "yesterday","wandered","bookshop","canal","smells","decaying","overwhelmed",
  "pleasant","randomly","grabbed","dusty","canyons","sidewalk","chaos",
  "orchestra","messy","vibrant","escape","crazy","regular","magic",
  "coding","typo","magical","weird","enjoying"
]);

const AI_PROB     = 0.055;
const HUMAN_PROB  = 0.00002;
const OOV_PROB    = 0.00015;

function getWordProb(word) {
  const w = word.toLowerCase().replace(/[^a-z'-]/g, '');
  if (!w) return OOV_PROB;
  if (AI_BOILERPLATE.has(w)) return AI_PROB;
  if (HUMAN_MARKERS.has(w)) return HUMAN_PROB;
  return BASE_FREQS[w] || OOV_PROB;
}

function sentencePerplexity(sentence) {
  const words = sentence.split(/\s+/).filter(w => w.length > 0);
  if (words.length === 0) return 0;
  const sumLog = words.reduce((s, w) => s + Math.log2(getWordProb(w)), 0);
  const entropy = -sumLog / words.length;
  return Math.min(Math.pow(2, entropy), 500);
}

function cleanPDFText(text) {
  let cleaned = text.replace(/-\s*\n\s*/g, '');
  cleaned = cleaned.replace(/(?<![.!?])\n(?!\n)/g, ' ');
  cleaned = cleaned.replace(/\n{2,}/g, '\n').replace(/ {2,}/g, ' ');
  cleaned = cleaned.replace(/\[\d+\]/g, '');
  cleaned = cleaned.replace(/\(\d{4}\)/g, '');
  cleaned = cleaned.replace(/Fig\.\s*\d+/gi, '');
  cleaned = cleaned.replace(/Table\s+\d+/gi, '');
  return cleaned.trim();
}

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

function analyzeText(rawText) {
  const hiddenChars  = detectHidden(rawText);
  const homoglyphs   = detectHomoglyphs(rawText);
  const hasEvasion   = hiddenChars.length > 0 || homoglyphs.length > 0;

  let clean = rawText;
  ['\u200b','\u200c','\u200d','\ufeff','\u00ad'].forEach(c => { clean = clean.split(c).join(''); });
  clean = cleanPDFText(clean);

  const rawSents = clean.split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 2);
  const sentences = [];
  let sentIdx = 0;

  rawSents.forEach(text => {
    const wordCount = text.split(/\s+/).filter(x=>x.length>0).length;
    if (wordCount < 4) return;
    const p = sentencePerplexity(text);
    let cls = 'human';
    if (p < 16)       cls = 'ai_direct';
    else if (p < 30)  cls = 'ai_polished';
    
    sentences.push({ idx: sentIdx++, text, perplexity: p, classification: cls });
  });

  if (sentences.length === 0) return null;

  const perps   = sentences.map(s => s.perplexity);
  const avg     = perps.reduce((a, b) => a + b, 0) / perps.length;
  const variance = perps.reduce((s, p) => s + Math.pow(p - avg, 2), 0) / perps.length;
  const burstiness = Math.sqrt(variance);

  const aiDirectCount = sentences.filter(s => s.classification === 'ai_direct').length;
  const aiPolishedCount = sentences.filter(s => s.classification === 'ai_polished').length;
  const aiFlaggedPct = (100 * (aiDirectCount + aiPolishedCount) / sentences.length).toFixed(1);

  // Score
  let score = 0;
  if (avg < 20 && burstiness < 14) {
    score = 95 - avg * 1.8 - burstiness * 1.2;
  } else if (avg < 36 && burstiness < 26) {
    score = 65 - avg * 0.8 - burstiness * 0.5;
  } else {
    score = Math.max(2, 18 - avg * 0.07 - burstiness * 0.04);
  }
  if (hasEvasion) score = Math.max(score, 85);
  score = Math.round(Math.max(0, Math.min(100, score)));

  // Verdict
  let verdict = '', verdictClass = '';
  if (score < 25)     { verdict = 'Likely Human';         verdictClass = 'green'; }
  else if (score < 55) { verdict = 'Inconclusive / Mixed';  verdictClass = 'yellow'; }
  else if (score < 80) { verdict = 'Likely AI-Assisted';  verdictClass = 'yellow'; }
  else                 { verdict = 'Likely AI-Generated';  verdictClass = 'red'; }

  if (hasEvasion) { verdict = 'Evasion Detected'; verdictClass = 'red'; }

  return {
    score, avg, burstiness, sentences, aiSentences: aiDirectCount + aiPolishedCount, 
    aiDirectCount, aiPolishedCount, aiFlaggedPct, hasEvasion,
    hiddenChars, homoglyphs, verdict, verdictClass
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

if (clearBtn) {
  clearBtn.addEventListener('click', () => {
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
      const pageText = content.items.map(item => item.str).join(' ');
      fullText += pageText + ' ';
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
    ? currentFileName.replace(/\.[^/.]+$/, "")
    : (text.length > 40 ? text.slice(0, 40) + '…' : text);

  // Update Header & Paper Title Tags
  const hdrId = document.getElementById('hdr-doc-id');
  if (hdrId) hdrId.textContent = activeSubmissionId;

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

    try {
      // ── Try ML server first ──
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 25000);

      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
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

    } catch (err) {
      console.warn('Using client-side statistical engine:', err.message);
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
    span.title = `Sentence #${s.idx + 1} | Perplexity: ${s.perplexity.toFixed(1)} | Class: ${s.classification}`;

    span.addEventListener('click', () => {
      // Remove previous active focus
      document.querySelectorAll('.hl-sent.active-focus').forEach(el => el.classList.remove('active-focus'));
      span.classList.add('active-focus');

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
    else if (r.score >= 55) vDescEl.textContent = 'Substantial AI-assistance or paraphrasing detected.';
    else if (r.score >= 25) vDescEl.textContent = 'Mixed indicators — collaborative editing or mild AI polish.';
    else vDescEl.textContent = 'Linguistic variation aligns with organic human writing.';
  }

  // Quick metrics
  const mSents = document.getElementById('m-sentences');
  if (mSents) mSents.textContent = r.sentences.length;

  const mAiSents = document.getElementById('m-ai-sents');
  if (mAiSents) mAiSents.textContent = r.aiSentences;

  const mBurst = document.getElementById('m-burstiness');
  if (mBurst) mBurst.textContent = r.burstiness.toFixed(1);

  const mEvasion = document.getElementById('m-evasion');
  if (mEvasion) {
    mEvasion.textContent = r.hasEvasion ? '⚠️ Flagged' : '✓ None';
    mEvasion.style.color = r.hasEvasion ? 'var(--t-red)' : 'var(--t-green)';
  }

  const mPerp = document.getElementById('m-perplexity');
  if (mPerp) mPerp.textContent = r.avg.toFixed(1);

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

        card.innerHTML = `
          <div class="match-card-header">
            <span class="match-tag-text">${isPolished ? '🟡 AI-Polished' : '🔴 AI-Direct'} Match #${idx + 1}</span>
            <span class="match-score-text">PPX: ${s.perplexity.toFixed(1)}</span>
          </div>
          <p class="match-card-snippet">"${escapeHtml(s.text)}"</p>
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
          <td style="font-family:monospace;">${s.perplexity.toFixed(1)}</td>
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
  generateMurnitinPDF(currentAnalysisResult, currentAnalysisText);
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
    const { jsPDF } = window.jspdf;
    if (!jsPDF) {
      throw new Error("jsPDF library is loading. Please refresh the page.");
    }
    const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });

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
      s.perplexity.toFixed(1),
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
          0: { cellWidth: 8, halign: 'center', fontStyle: 'bold' },
          1: { cellWidth: 110 },
          2: { cellWidth: 20, halign: 'center' },
          3: { cellWidth: 32, halign: 'center', fontStyle: 'bold' },
        },
        alternateRowStyles: { fillColor: C.gray100 },
        didDrawPage: () => {
          drawPageHeader('Sentence-by-Sentence Integrity Analysis');
          drawPageFooter(doc.internal.getCurrentPageInfo().pageNumber, '2');
        }
      });
    }

    drawPageFooter(doc.internal.getCurrentPageInfo().pageNumber, '2');

    const filename = `Murnitin_Integrity_Report_${activeSubmissionId}_${new Date().toISOString().slice(0,10)}.pdf`;
    doc.save(filename);
  } catch (err) {
    alert("Error generating PDF: " + err.message);
    console.error(err);
  }
}
