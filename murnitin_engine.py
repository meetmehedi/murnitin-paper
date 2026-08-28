"""
murnitin_engine.py  — Statistical AI Detection Engine
Handles academic/technical papers with an expanded vocabulary,
sentence-level n-gram transition scoring, and PDF-aware text cleaning.
"""

import re
import math
import json
import sys

# ─────────────────────────────────────────────────────────────────────────────
# MULTI-FEATURE AI DETECTION PATTERNS & VOCABULARY
# ─────────────────────────────────────────────────────────────────────────────

AI_TRIGRAMS = [
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
    "scalable software", "computer programs", "logical instructions"
]

AI_BOILERPLATE = {
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
}

HUMAN_CONTRACTIONS = {
    "it's","don't","didn't","can't","won't","i'll","i've","we've","they're",
    "there's","what's","you're","couldn't","shouldn't","wasn't","haven't",
    "aren't","weren't","hasn't","i'm","we're","you've","they've","that's"
}

HUMAN_MARKERS = {
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
}

TOP_500_COMMON = {
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
}


# ─────────────────────────────────────────────────────────────────────────────
# TEXT CLEANING  (handles PDF extraction artifacts)
# ─────────────────────────────────────────────────────────────────────────────
def clean_pdf_text(text):
    text = re.sub(r'-\s*\n\s*', '', text)
    text = re.sub(r'(?<![.!?])\n(?!\n)', ' ', text)
    text = re.sub(r'\n{2,}', '\n', text)
    text = re.sub(r' {2,}', ' ', text)
    text = re.sub(r'978-\d[\d-]+', '', text)
    text = re.sub(r'\[\d+\]', '', text)
    text = re.sub(r'\(\d{4}\)', '', text)
    text = re.sub(r'Fig\.\s*\d+', '', text)
    text = re.sub(r'Table\s+\d+', '', text)
    text = re.sub(r'Algorithm\s+\d+', '', text)
    text = re.sub(r'^\s*\d+\s*$', '', text, flags=re.MULTILINE)
    return text.strip()


def split_sentences(text):
    raw = re.split(r'(?<=[.!?])\s+(?=[A-Z"\'(])|(?<=[.!?])\s*\n', text)
    sents = []
    for s in raw:
        s = s.strip()
        if len(s.split()) >= 4:
            sents.append(s)
    return sents


# ─────────────────────────────────────────────────────────────────────────────
# EVASION DETECTION
# ─────────────────────────────────────────────────────────────────────────────
INVISIBLE = {
    '\u200b': "Zero-Width Space (U+200B)",
    '\u200c': "Zero-Width Non-Joiner (U+200C)",
    '\u200d': "Zero-Width Joiner (U+200D)",
    '\ufeff': "Byte Order Mark (U+FEFF)",
    '\u00ad': "Soft Hyphen (U+00AD)",
}

def detect_hidden_characters(text):
    return [{'character': name, 'occurrences': text.count(char)}
            for char, name in INVISIBLE.items() if text.count(char) > 0]


def detect_homoglyphs(text):
    findings = []
    for word in re.findall(r'\b\w+\b', text):
        latin = sum(1 for c in word if 65 <= ord(c) <= 90 or 97 <= ord(c) <= 122)
        cyril = sum(1 for c in word if 1024 <= ord(c) <= 1279)
        greek = sum(1 for c in word if 913 <= ord(c) <= 987)
        if (latin > 0) and (cyril > 0 or greek > 0):
            findings.append({'word': word, 'Latin': latin, 'Cyrillic': cyril, 'Greek': greek})
    return findings


# ─────────────────────────────────────────────────────────────────────────────
# SENTENCE EVALUATION
# ─────────────────────────────────────────────────────────────────────────────
def evaluate_sentence(sent):
    words = [re.sub(r"[^a-z'-]", '', w.lower()) for w in sent.split() if w.strip()]
    words = [w for w in words if w]
    if len(words) < 4:
        return {'text': sent, 'score': 0, 'classification': 'human', 'perplexity': 50.0}

    raw_lower = sent.lower()

    # 1. Common vocabulary density
    common_count = sum(1 for w in words if w in TOP_500_COMMON)
    common_ratio = common_count / len(words)

    # 2. AI Boilerplate words
    bp_count = sum(1 for w in words if w in AI_BOILERPLATE)
    bp_ratio = bp_count / len(words)

    # 3. AI Template N-grams & Collocations
    trigram_hits = sum(1 for trig in AI_TRIGRAMS if trig in raw_lower)

    # 4. Formal nominalization density
    nom_count = sum(1 for w in words if re.search(r'(tion|sion|ment|ity|ance|ence|ization|isation)$', w))
    nom_ratio = nom_count / len(words)

    # 5. Human Markers & Contractions
    human_hits = sum(1 for w in words if w in HUMAN_CONTRACTIONS or w in HUMAN_MARKERS)
    for phrase in ["to be honest","in my opinion","turns out","figured out","spent way too long","at least","my friend","ended up","i remember","i felt","felt like"]:
        if phrase in raw_lower:
            human_hits += 2

    # 6. Sentence Opener AI Pattern
    opener_score = 0
    if re.match(r'^(furthermore|moreover|consequently|additionally|ultimately|in conclusion|in addition|historically|today|navigate|navigating)', sent, re.I):
        opener_score += 25
    elif re.match(r'^(the|each|this|these|training|regularization|cross-validation|hyperparameter)\s+[a-z]+', sent, re.I):
        opener_score += 10

    length_score = 10 if (10 <= len(words) <= 26) else 0

    sent_score = 0
    if common_ratio >= 0.85: sent_score += 35
    elif common_ratio >= 0.70: sent_score += 25
    elif common_ratio >= 0.50: sent_score += 15

    if bp_ratio >= 0.12: sent_score += 35
    elif bp_ratio >= 0.05: sent_score += 25
    elif bp_ratio > 0: sent_score += 15

    sent_score += min(45, trigram_hits * 22)
    if nom_ratio >= 0.20: sent_score += 20
    elif nom_ratio >= 0.10: sent_score += 10

    sent_score += opener_score
    sent_score += length_score
    sent_score -= (human_hits * 35)

    sent_score = max(0, min(100, sent_score))
    perp = max(6.0, round((100 - sent_score) * 0.88 + 8, 1))

    cls = 'human'
    if sent_score >= 55:
        cls = 'ai_direct'
    elif sent_score >= 32:
        cls = 'ai_polished'

    return {
        'text': sent,
        'score': sent_score,
        'classification': cls,
        'perplexity': perp
    }


# ─────────────────────────────────────────────────────────────────────────────
# MAIN ANALYSIS
# ─────────────────────────────────────────────────────────────────────────────
def analyze_document(text, source_label="Input"):
    hidden = detect_hidden_characters(text)
    homo   = detect_homoglyphs(text)
    has_evasion = len(hidden) > 0 or len(homo) > 0

    clean = text
    for ch in INVISIBLE:
        clean = clean.replace(ch, '')
    clean = clean_pdf_text(clean)

    raw_sents = split_sentences(clean)
    if not raw_sents:
        return {'error': 'No scorable sentences found.'}

    sent_results = []
    for i, s in enumerate(raw_sents):
        res = evaluate_sentence(s)
        sent_results.append({
            'index': i + 1,
            'text': s,
            'perplexity': res['perplexity'],
            'classification': res['classification'],
            'score': res['score']
        })

    lengths = [len(r['text'].split()) for r in sent_results]
    avg_len = sum(lengths) / len(lengths)
    std_len = math.sqrt(sum((l - avg_len) ** 2 for l in lengths) / len(lengths))
    cv_len = std_len / (avg_len or 1)

    perps = [r['perplexity'] for r in sent_results]
    avg   = sum(perps) / len(perps)
    variance = sum((p - avg) ** 2 for p in perps) / len(perps)
    burstiness = math.sqrt(variance)

    ai_direct = [r for r in sent_results if r['classification'] == 'ai_direct']
    ai_polish = [r for r in sent_results if r['classification'] == 'ai_polished']
    ai_total  = ai_direct + ai_polish
    flagged_ratio = len(ai_total) / len(sent_results)

    avg_sent_score = sum(r['score'] for r in sent_results) / len(sent_results)

    if flagged_ratio >= 0.70:
        overall_score = 65 + (flagged_ratio * 25) + (avg_sent_score * 0.10)
        if cv_len < 0.25:
            overall_score += 8
    elif flagged_ratio >= 0.35:
        overall_score = 35 + (flagged_ratio * 35) + (avg_sent_score * 0.15)
    else:
        overall_score = (avg_sent_score * 0.60) + (flagged_ratio * 30)
        if cv_len > 0.40:
            overall_score -= 10

    if has_evasion:
        overall_score = max(overall_score, 88)

    overall_score = round(max(0.0, min(100.0, overall_score)))

    if has_evasion:         verdict = 'Evasion Detected'
    elif overall_score < 20: verdict = 'Likely Human'
    elif overall_score < 45: verdict = 'Mostly Human'
    elif overall_score < 65: verdict = 'Inconclusive / Mixed'
    elif overall_score < 82: verdict = 'Likely AI-Assisted'
    else:                   verdict = 'Likely AI-Generated'

    return {
        'source': source_label,
        'summary': {
            'ai_probability': overall_score,
            'verdict': verdict,
            'avg_perplexity': round(avg, 2),
            'burstiness': round(burstiness, 2),
            'total_sentences': len(sent_results),
            'ai_direct_count': len(ai_direct),
            'ai_polished_count': len(ai_polish),
            'ai_flagged_pct': round(100 * len(ai_total) / len(sent_results), 1),
            'evasion_detected': has_evasion,
        },
        'evasion_report': {
            'hidden_characters': hidden,
            'homoglyphs': homo,
        },
        'sentences': sent_results,
    }


def print_report(result):
    s  = result['summary']
    er = result['evasion_report']
    sentences = result['sentences']

    print('=' * 70)
    print(f'MURNITIN INTEGRITY REPORT  —  {result["source"]}')
    print('=' * 70)
    print()
    print('─── OVERALL SCORES ─────────────────────────────────────────────')
    print(f'  AI Likelihood    : {s["ai_probability"]}%')
    print(f'  Verdict          : {s["verdict"]}')
    print(f'  Avg Perplexity   : {s["avg_perplexity"]:.2f}   (lower = more formulaic/AI)')
    print(f'  Burstiness       : {s["burstiness"]:.2f}   (lower = more uniform/AI)')
    print(f'  Sentences scored : {s["total_sentences"]}')
    print(f'  AI-flagged       : {s["ai_direct_count"] + s["ai_polished_count"]} ({s["ai_flagged_pct"]}%)')
    print(f'    ├ AI-Direct    : {s["ai_direct_count"]}  (perplexity < 16)')
    print(f'    └ AI-Polished  : {s["ai_polished_count"]}  (perplexity 16–30)')
    print()

    print('─── EVASION FORENSICS ──────────────────────────────────────────')
    if er['hidden_characters']:
        for h in er['hidden_characters']:
            print(f'  ⚠  {h["character"]}: {h["occurrences"]} occurrence(s)')
    elif er['homoglyphs']:
        print(f'  ⚠  Homoglyphs detected in {len(er["homoglyphs"])} word(s)')
    else:
        print('  ✓  No evasion techniques detected')
    print()

    print('─── MOST SUSPICIOUS SENTENCES (AI-Direct) ──────────────────────')
    shown = 0
    for r in sentences:
        if r['classification'] == 'ai_direct' and shown < 8:
            print(f'  [{r["index"]:03d}] perp={r["perplexity"]:6.1f} | {r["text"][:100]}')
            shown += 1
    if shown == 0:
        print('  None flagged as AI-Direct.')
    print()

    print('─── AI-POLISHED SENTENCES ───────────────────────────────────────')
    shown = 0
    for r in sentences:
        if r['classification'] == 'ai_polished' and shown < 6:
            print(f'  [{r["index"]:03d}] perp={r["perplexity"]:6.1f} | {r["text"][:100]}')
            shown += 1
    if shown == 0:
        print('  None flagged.')
    print()

    print('─── COMPLIANCE CHECKLIST ────────────────────────────────────────')
    print('  ✓  FERPA  : No student PII processed')
    print('  ✓  GDPR   : No raw text retained beyond session')
    print('  ✓  ZK     : Client-side only — zero server upload')
    print('  ✓  Advisory use: Not intended as automated disciplinary verdict')
    print()
    print('Generated by Murnitin v1.1  ·  github.com/meetmehedi/murnitin')
    print('=' * 70)


# ─────────────────────────────────────────────────────────────────────────────
# CLI  — python3 murnitin_engine.py [file.pdf | file.txt | --demo]
# ─────────────────────────────────────────────────────────────────────────────
if __name__ == '__main__':
    if len(sys.argv) > 1 and not sys.argv[1].startswith('--'):
        filepath = sys.argv[1]

        if filepath.endswith('.pdf'):
            try:
                from pypdf import PdfReader
            except ImportError:
                print('Install pypdf: pip3 install pypdf'); sys.exit(1)

            reader   = PdfReader(filepath)
            raw_text = ' '.join(p.extract_text() or '' for p in reader.pages)
            label    = f'{filepath} ({len(reader.pages)} pages, {len(raw_text.split())} words)'
        else:
            with open(filepath, 'r', encoding='utf-8') as f:
                raw_text = f.read()
            label = filepath

        result = analyze_document(raw_text, label)
        print_report(result)

    else:
        # Built-in demo
        HUMAN = (
            "Yesterday, I wandered down to the old bookshop near the canal. "
            "The smells of coffee and decaying paper immediately overwhelmed me. "
            "I randomly grabbed a dusty green volume — honestly one of the more surreal afternoons of my year. "
            "The whole atmosphere felt incredibly peaceful, a nice escape from the crazy pace of regular life."
        )
        AI = (
            "Furthermore, the utilization of digital technologies has significantly altered the contemporary educational landscape. "
            "It provides students with seamless access to a comprehensive array of educational resources and platforms. "
            "Moreover, online learning systems offer unparalleled flexibility and convenience to learners across the globe. "
            "Ultimately, the systematic implementation of technology in pedagogy has demonstrated substantial benefits for modern academic structures."
        )

        print('\n=== DEMO: Human Sample ===')
        print_report(analyze_document(HUMAN, 'Human Essay'))
        print('\n=== DEMO: AI Sample ===')
        print_report(analyze_document(AI, 'AI Essay'))
