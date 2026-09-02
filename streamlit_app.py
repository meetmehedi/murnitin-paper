"""
streamlit_app.py — Murnitin AI & Plagiarism Inspector
Streamlit Community Cloud deployable version.
Uses murnitin_engine.py for statistical AI detection.
"""

import streamlit as st
import io
import time
import math
import pandas as pd
from datetime import datetime

# ─────────────────────────────────────────────────────────────────────────────
# PAGE CONFIG  (must be first Streamlit call)
# ─────────────────────────────────────────────────────────────────────────────
st.set_page_config(
    page_title="Murnitin — AI & Plagiarism Inspector",
    page_icon="murnitin.png",
    layout="wide",
    initial_sidebar_state="collapsed",
)

# ─────────────────────────────────────────────────────────────────────────────
# CUSTOM CSS — Dark premium theme matching original design
# ─────────────────────────────────────────────────────────────────────────────
st.markdown("""
<style>
  /* ── Google Fonts ── */
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500&display=swap');

  /* ── Root variables ── */
  :root {
    --bg: #050508;
    --surface: #0d0d14;
    --surface2: #13131e;
    --border: rgba(255,255,255,0.07);
    --accent: #7c6bff;
    --accent2: #a78bfa;
    --green: #22c55e;
    --yellow: #f59e0b;
    --red: #ef4444;
    --text: #e2e8f0;
    --muted: #64748b;
    --font: 'Inter', sans-serif;
    --mono: 'JetBrains Mono', monospace;
  }

  /* ── Global reset ── */
  html, body, [class*="css"] {
    font-family: var(--font) !important;
    background-color: var(--bg) !important;
    color: var(--text) !important;
  }

  /* ── Hide Streamlit chrome ── */
  #MainMenu, footer, header { visibility: hidden; }
  .block-container { padding: 1.5rem 2rem 3rem !important; max-width: 1200px !important; }

  /* ── Scrollbar ── */
  ::-webkit-scrollbar { width: 6px; height: 6px; }
  ::-webkit-scrollbar-track { background: var(--surface); }
  ::-webkit-scrollbar-thumb { background: var(--accent); border-radius: 99px; }

  /* ── Hero header ── */
  .murnitin-hero {
    text-align: center;
    padding: 3rem 1rem 2rem;
    background: radial-gradient(ellipse 80% 60% at 50% -10%, rgba(124,107,255,0.18), transparent);
  }
  .murnitin-badge {
    display: inline-flex; align-items: center; gap: 0.5rem;
    background: rgba(124,107,255,0.12); border: 1px solid rgba(124,107,255,0.3);
    border-radius: 99px; padding: 0.3rem 1rem; font-size: 0.75rem;
    color: var(--accent2); letter-spacing: 0.05em; margin-bottom: 1.2rem;
  }
  .murnitin-dot { width:7px; height:7px; border-radius:50%; background:var(--green);
    box-shadow: 0 0 8px var(--green); display:inline-block; animation: pulse 2s infinite; }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
  .murnitin-title { font-size: clamp(2.5rem,6vw,4.5rem); font-weight: 900; letter-spacing: -0.04em;
    background: linear-gradient(135deg, #fff 0%, var(--accent2) 100%);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin: 0 0 0.4rem; }
  .murnitin-subtitle { font-size: 1.1rem; color: var(--muted); margin-bottom: 2rem; }

  /* ── Stats row ── */
  .stats-row { display:flex; justify-content:center; gap:2rem; padding:1.2rem 2rem;
    border-top:1px solid var(--border); border-bottom:1px solid var(--border); margin-bottom:2rem; }
  .stat-item { text-align:center; }
  .stat-num { font-size:1.6rem; font-weight:800; color:var(--accent2); display:block; }
  .stat-lbl { font-size:0.7rem; color:var(--muted); text-transform:uppercase; letter-spacing:0.08em; }

  /* ── Cards ── */
  .mn-card {
    background: var(--surface2); border: 1px solid var(--border);
    border-radius: 16px; padding: 1.5rem; margin-bottom: 1rem;
    backdrop-filter: blur(10px);
  }
  .mn-card-title { font-size:0.7rem; text-transform:uppercase; letter-spacing:0.12em;
    color:var(--muted); margin-bottom:0.8rem; }

  /* ── Score gauge ── */
  .score-gauge {
    display: flex; flex-direction: column; align-items: center;
    padding: 2rem; gap: 0.5rem;
  }
  .score-circle {
    width: 160px; height: 160px; border-radius: 50%;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    font-size: 2.8rem; font-weight: 900;
    border: 4px solid currentColor;
    box-shadow: 0 0 40px currentColor;
  }
  .score-pct { font-size: 0.85rem; font-weight: 500; }
  .verdict-label { font-size: 1rem; font-weight: 600; letter-spacing: 0.03em; margin-top: 0.5rem; }

  /* ── Sentence table ── */
  .sent-row { padding: 0.5rem 0.8rem; border-radius: 8px; margin-bottom: 0.3rem;
    font-family: var(--mono); font-size: 0.78rem; border-left: 3px solid transparent; }
  .sent-ai   { background: rgba(239,68,68,0.08);  border-color: var(--red); }
  .sent-mid  { background: rgba(245,158,11,0.08); border-color: var(--yellow); }
  .sent-human{ background: rgba(34,197,94,0.06);  border-color: var(--green); }
  .sent-meta { font-size:0.68rem; color:var(--muted); margin-bottom:0.2rem; }

  /* ── Metric box ── */
  .metric-box {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 12px; padding: 1rem 1.2rem; text-align: center;
  }
  .metric-val { font-size: 1.8rem; font-weight: 800; }
  .metric-lbl { font-size: 0.68rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--muted); }

  /* ── Buttons ── */
  div[data-testid="stButton"] > button {
    background: linear-gradient(135deg, #7c6bff, #a78bfa) !important;
    color: #fff !important; border: none !important;
    border-radius: 10px !important; font-weight: 600 !important;
    padding: 0.6rem 1.4rem !important; font-size: 0.9rem !important;
    transition: all 0.2s !important;
  }
  div[data-testid="stButton"] > button:hover {
    transform: translateY(-2px) !important;
    box-shadow: 0 8px 24px rgba(124,107,255,0.4) !important;
  }
  div[data-testid="stButton"] > button:active { transform: none !important; }

  /* ── Secondary buttons (sample text) ── */
  .sample-btn button {
    background: rgba(255,255,255,0.05) !important;
    border: 1px solid var(--border) !important;
    color: var(--text) !important;
    font-size: 0.8rem !important; padding: 0.4rem 1rem !important;
  }
  .sample-btn button:hover { background: rgba(124,107,255,0.12) !important; }

  /* ── Text area ── */
  textarea {
    background: var(--surface2) !important; border: 1px solid var(--border) !important;
    color: var(--text) !important; font-family: var(--mono) !important;
    font-size: 0.85rem !important; border-radius: 12px !important;
  }
  textarea:focus { border-color: var(--accent) !important; box-shadow: 0 0 0 2px rgba(124,107,255,0.2) !important; }

  /* ── File uploader ── */
  [data-testid="stFileUploader"] {
    background: var(--surface2) !important; border: 1px dashed rgba(124,107,255,0.4) !important;
    border-radius: 12px !important;
  }

  /* ── Alert boxes ── */
  .alert-evasion {
    background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.4);
    border-radius: 12px; padding: 1rem 1.2rem; margin: 0.5rem 0;
    color: #fca5a5;
  }
  .alert-clean {
    background: rgba(34,197,94,0.08); border: 1px solid rgba(34,197,94,0.3);
    border-radius: 12px; padding: 0.8rem 1.2rem; margin: 0.5rem 0;
    color: #86efac;
  }

  /* ── Divider ── */
  hr { border-color: var(--border) !important; margin: 1.5rem 0 !important; }

  /* ── Compliance footer ── */
  .compliance { display:flex; gap:1rem; flex-wrap:wrap; padding:0.8rem 0; }
  .comp-item { background:rgba(34,197,94,0.08); border:1px solid rgba(34,197,94,0.2);
    border-radius:8px; padding:0.3rem 0.7rem; font-size:0.72rem; color:#86efac; }

  /* ── Download button ── */
  a.download-btn {
    display:inline-block; background:rgba(124,107,255,0.15); border:1px solid rgba(124,107,255,0.4);
    color:var(--accent2) !important; border-radius:10px; padding:0.5rem 1.2rem;
    font-size:0.82rem; text-decoration:none; font-weight:600; transition:all 0.2s;
  }
  a.download-btn:hover { background:rgba(124,107,255,0.3); text-decoration:none; }
</style>
""", unsafe_allow_html=True)


# ─────────────────────────────────────────────────────────────────────────────
# SAMPLE TEXTS
# ─────────────────────────────────────────────────────────────────────────────
SAMPLES = {
    "🧑 Human": (
        "Yesterday, I wandered down to the old bookshop near the canal. "
        "The smells of coffee and decaying paper immediately overwhelmed me. "
        "I randomly grabbed a dusty green volume — honestly one of the more surreal afternoons of my year. "
        "The whole atmosphere felt incredibly peaceful, a nice escape from the crazy pace of regular life. "
        "My friend called halfway through, and we ended up talking for two hours about nothing in particular. "
        "Sometimes the best afternoons are the unplanned ones."
    ),
    "🤖 AI": (
        "Furthermore, the utilization of digital technologies has significantly altered the contemporary educational landscape. "
        "It provides students with seamless access to a comprehensive array of educational resources and platforms. "
        "Moreover, online learning systems offer unparalleled flexibility and convenience to learners across the globe. "
        "Ultimately, the systematic implementation of technology in pedagogy has demonstrated substantial benefits for modern academic structures. "
        "Additionally, the integration of artificial intelligence into learning management systems has revolutionized personalized education at scale. "
        "Consequently, educators and institutions must leverage these multifaceted technological advancements to foster academic excellence."
    ),
    "🔀 Mixed": (
        "I started writing this paper during a particularly rough week, which probably shows in the early drafts. "
        "The core idea came from a conversation with my advisor about why traditional models fail on sparse data. "
        "Furthermore, the utilization of advanced machine learning algorithms has demonstrated substantial improvements in predictive accuracy. "
        "I spent three weeks just on the preprocessing pipeline, which was honestly more challenging than the model itself. "
        "Moreover, the systematic integration of ensemble methods has proven remarkably effective across multiple benchmark datasets. "
        "At the end of the day, I think the results speak for themselves — though I wish the training had converged faster."
    ),
    "⚠️ Evasion": (
        "This\u200b text\u200b contains\u200b hidden\u200b zero-width\u200b spaces\u200b inserted\u200b between\u200b words. "
        "These invisible characters are a known AI watermark evasion technique used to fool plagiarism detectors. "
        "The\u200c document\u200c may\u200c appear\u200c normal\u200c to\u200c the\u200c human\u200c eye. "
        "However forensic analysis reveals the presence of Unicode steganography throughout the text block. "
        "This\u200d type\u200d of\u200d manipulation\u200d is\u200d increasingly\u200d common\u200d in\u200d academic\u200d fraud cases."
    ),
}


# ─────────────────────────────────────────────────────────────────────────────
# IMPORT ENGINE
# ─────────────────────────────────────────────────────────────────────────────
try:
    from murnitin_engine import analyze_document
    ENGINE_OK = True
except ImportError:
    ENGINE_OK = False
    # Inline minimal fallback so the app still works
    import re, math as _math

    def _get_prob(word):
        FREQ = {"the":0.060,"of":0.035,"and":0.028,"a":0.022,"in":0.020,"to":0.019,
                "is":0.018,"that":0.015,"for":0.012,"it":0.011,"with":0.010}
        AI_BP = {"furthermore","moreover","consequently","ultimately","additionally","seamlessly","comprehensively"}
        HM = {"honestly","frankly","surprisingly","unexpectedly","weirdly"}
        w = re.sub(r"[^a-z'-]","",word.lower())
        if not w: return 0.00015
        if w in AI_BP: return 0.055
        if w in HM: return 0.00002
        return FREQ.get(w, 0.00015)

    def analyze_document(text, source_label="Input"):
        INVISIBLE = {'\u200b','‌','\u200d','\ufeff','\u00ad'}
        hidden = [ch for ch in INVISIBLE if ch in text]
        clean = text
        for c in INVISIBLE: clean = clean.replace(c,'')
        clean = re.sub(r'-\s*\n\s*','',clean)
        clean = re.sub(r'(?<![.!?])\n(?!\n)',' ',clean)
        sentences = [s.strip() for s in re.split(r'(?<=[.!?])\s+',clean) if len(s.strip().split())>=5]
        if not sentences:
            return {'error':'No scorable sentences.'}
        def perp(s):
            ws=[w for w in s.split() if w.strip()]
            if not ws: return 0.0
            return min(_math.pow(2,-sum(_math.log2(_get_prob(w)) for w in ws)/len(ws)),500.0)
        results=[]
        for i,s in enumerate(sentences):
            p=perp(s)
            cls='ai_direct' if p<16 else 'ai_polished' if p<30 else 'human'
            results.append({'index':i+1,'text':s,'perplexity':round(p,2),'classification':cls})
        perps=[r['perplexity'] for r in results]
        avg=sum(perps)/len(perps)
        var=sum((p-avg)**2 for p in perps)/len(perps)
        burst=_math.sqrt(var)
        n_ai=[r for r in results if r['classification']!='human']
        if avg<20 and burst<14: score=95-avg*1.8-burst*1.2
        elif avg<36 and burst<26: score=65-avg*0.8-burst*0.5
        else: score=max(2,18-avg*0.07-burst*0.04)
        has_ev = len(hidden)>0
        if has_ev: score=max(score,85)
        score=round(max(0,min(100,score)))
        verdict=('Evasion Detected' if has_ev else
                 'Likely Human' if score<25 else
                 'Inconclusive / Mixed' if score<55 else
                 'Likely AI-Assisted' if score<80 else 'Likely AI-Generated')
        return {'source':source_label,'summary':{'ai_probability':score,'verdict':verdict,
            'avg_perplexity':round(avg,2),'burstiness':round(burst,2),
            'total_sentences':len(results),'ai_direct_count':len([r for r in results if r['classification']=='ai_direct']),
            'ai_polished_count':len([r for r in results if r['classification']=='ai_polished']),
            'ai_flagged_pct':round(100*len(n_ai)/len(results),1),'evasion_detected':has_ev},
            'evasion_report':{'hidden_characters':[{'character':c,'occurrences':text.count(c)} for c in hidden],
                              'homoglyphs':[]},
            'sentences':results}


# ─────────────────────────────────────────────────────────────────────────────
# SESSION STATE
# ─────────────────────────────────────────────────────────────────────────────
if "text_input" not in st.session_state:
    st.session_state.text_input = ""
if "result" not in st.session_state:
    st.session_state.result = None
if "source_label" not in st.session_state:
    st.session_state.source_label = "User Input"
# Track the last PDF filename processed to avoid re-extraction on every rerun
if "pdf_loaded" not in st.session_state:
    st.session_state.pdf_loaded = None



# ─────────────────────────────────────────────────────────────────────────────
# HERO HEADER
# ─────────────────────────────────────────────────────────────────────────────
st.markdown("""
<div class="murnitin-hero">
  <div class="murnitin-badge">
    <span class="murnitin-dot"></span>
    Next-Gen Academic Integrity &nbsp;·&nbsp; Built by Md. Mehedi Hasan
  </div>
  <div class="murnitin-title">Murnitin</div>
  <div class="murnitin-subtitle">AI &amp; Plagiarism Inspector</div>
</div>
<div class="stats-row">
  <div class="stat-item"><span class="stat-num">4</span><span class="stat-lbl">Detection Modes</span></div>
  <div class="stat-item"><span class="stat-num" style="color:#22c55e">0</span><span class="stat-lbl">Data Stored</span></div>
  <div class="stat-item"><span class="stat-num">XAI</span><span class="stat-lbl">Explainable AI</span></div>
  <div class="stat-item"><span class="stat-num">100%</span><span class="stat-lbl">Server-Side</span></div>
</div>
""", unsafe_allow_html=True)


# ─────────────────────────────────────────────────────────────────────────────
# INPUT SECTION
# ─────────────────────────────────────────────────────────────────────────────
col_left, col_right = st.columns([3, 2], gap="large")

with col_left:
    st.markdown('<div class="mn-card-title">📄 Text Input</div>', unsafe_allow_html=True)

    # Sample text buttons
    st.markdown("**Load a sample:**")
    btn_cols = st.columns(4)
    for i, (label, sample_text) in enumerate(SAMPLES.items()):
        with btn_cols[i]:
            if st.button(label, key=f"sample_{i}", use_container_width=True):
                # Set text_input — text_area will pick it up via value= on next render
                st.session_state.text_input = sample_text
                st.session_state.source_label = f"Sample — {label}"
                st.session_state.pdf_loaded = None  # reset PDF tracker
                st.rerun()

    st.markdown("<br>", unsafe_allow_html=True)

    # Text area: NO key= so Streamlit doesn't own the state.
    # We control it entirely via value=st.session_state.text_input.
    text_input = st.text_area(
        "Paste text to inspect:",
        value=st.session_state.text_input,
        height=260,
        placeholder="Paste your essay, paper, or any text here for AI detection analysis…",
        label_visibility="collapsed",
    )
    # Sync user edits back to session state
    st.session_state.text_input = text_input

    word_count = len(text_input.split()) if text_input.strip() else 0
    st.caption(f"📝 {word_count} words  ·  {len(text_input)} characters")

with col_right:
    st.markdown('<div class="mn-card-title">📎 PDF Upload</div>', unsafe_allow_html=True)
    uploaded_file = st.file_uploader(
        "Upload a PDF file",
        type=["pdf"],
        label_visibility="collapsed",
        help="Drag & drop a PDF. Text will be extracted automatically."
    )

    if uploaded_file is not None:
        # Only extract if this is a newly uploaded file (not a re-render of the same file)
        if st.session_state.pdf_loaded != uploaded_file.name:
            with st.spinner("Extracting text from PDF…"):
                try:
                    from pypdf import PdfReader
                    reader = PdfReader(io.BytesIO(uploaded_file.read()))
                    pdf_text = " ".join(
                        (page.extract_text() or "") for page in reader.pages
                    )
                    # Set text_input — text_area picks it up via value= on next render
                    st.session_state.text_input = pdf_text
                    st.session_state.source_label = f"PDF: {uploaded_file.name} ({len(reader.pages)} pages)"
                    st.session_state.pdf_loaded = uploaded_file.name  # mark as processed
                    st.success(f"✅ Extracted {len(pdf_text.split())} words from {len(reader.pages)} pages")
                    st.rerun()  # rerun so text_area renders with new value
                except ImportError:
                    st.error("pypdf not installed. PDF upload unavailable.")
                except Exception as e:
                    st.error(f"PDF extraction failed: {e}")
        else:
            # Already processed this file — just show confirmation
            word_count_pdf = len(st.session_state.text_input.split())
            st.success(f"✅ {uploaded_file.name} loaded — {word_count_pdf:,} words ready")
    else:
        # File was removed — reset tracker
        if st.session_state.pdf_loaded is not None:
            st.session_state.pdf_loaded = None

    st.markdown("<br>", unsafe_allow_html=True)
    st.markdown("""
    <div class="mn-card" style="padding:1rem">
      <div class="mn-card-title">🛡️ Privacy Guarantee</div>
      <div style="font-size:0.8rem;color:#94a3b8;line-height:1.7">
        ✓ &nbsp;No text is stored after analysis<br>
        ✓ &nbsp;FERPA compliant — no student PII<br>
        ✓ &nbsp;GDPR compliant — session only<br>
        ✓ &nbsp;Advisory use — not disciplinary
      </div>
    </div>
    """, unsafe_allow_html=True)

st.markdown("<br>", unsafe_allow_html=True)

# Run button
run_col, _ = st.columns([1, 3])
with run_col:
    run_clicked = st.button("🔬 Run Integrity Inspection", use_container_width=True, type="primary")


# ─────────────────────────────────────────────────────────────────────────────
# ANALYSIS
# ─────────────────────────────────────────────────────────────────────────────
if run_clicked:
    text_to_analyze = st.session_state.text_input.strip()
    if not text_to_analyze:
        st.warning("⚠️ Please enter or upload some text first.")
    elif len(text_to_analyze.split()) < 20:
        st.warning("⚠️ Please provide at least 20 words for a meaningful analysis.")
    else:
        with st.spinner("🔬 Analysing document integrity…"):
            time.sleep(0.3)  # brief pause for UX
            result = analyze_document(text_to_analyze, st.session_state.source_label)
        st.session_state.result = result

# ─────────────────────────────────────────────────────────────────────────────
# RESULTS DISPLAY
# ─────────────────────────────────────────────────────────────────────────────
if st.session_state.result:
    result = st.session_state.result

    if "error" in result:
        st.error(f"❌ {result['error']}")
    else:
        s   = result["summary"]
        er  = result["evasion_report"]
        sentences = result["sentences"]
        score = s["ai_probability"]
        verdict = s["verdict"]

        # Color mapping
        if s.get("evasion_detected"):
            color = "#ef4444"
        elif score < 25:
            color = "#22c55e"
        elif score < 55:
            color = "#f59e0b"
        elif score < 80:
            color = "#f97316"
        else:
            color = "#ef4444"

        st.markdown("---")
        st.markdown("## 📊 Integrity Report")

        # ── Score + metrics row ──
        g_col, m1, m2, m3, m4 = st.columns([2, 1.2, 1.2, 1.2, 1.2])

        with g_col:
            st.markdown(f"""
            <div class="score-gauge">
              <div class="score-circle" style="color:{color}">
                <span style="line-height:1">{score}%</span>
                <span class="score-pct">AI Likelihood</span>
              </div>
              <div class="verdict-label" style="color:{color}">{verdict}</div>
              <div style="font-size:0.72rem;color:#64748b;margin-top:0.3rem">{result['source']}</div>
            </div>
            """, unsafe_allow_html=True)

        metrics = [
            (f"{s['avg_perplexity']:.1f}", "Avg Perplexity", "#7c6bff"),
            (f"{s['burstiness']:.1f}", "Burstiness", "#a78bfa"),
            (str(s['total_sentences']), "Sentences", "#94a3b8"),
            (f"{s['ai_flagged_pct']}%", "AI Flagged", color),
        ]
        for col, (val, lbl, clr) in zip([m1, m2, m3, m4], metrics):
            with col:
                st.markdown(f"""
                <div class="metric-box" style="margin-top:2rem">
                  <div class="metric-val" style="color:{clr}">{val}</div>
                  <div class="metric-lbl">{lbl}</div>
                </div>
                """, unsafe_allow_html=True)

        # ── Secondary metrics ──
        c1, c2, c3 = st.columns(3)
        c1.metric("🔴 AI-Direct", s["ai_direct_count"], help="Sentences with perplexity < 16 (high-confidence AI)")
        c2.metric("🟡 AI-Polished", s["ai_polished_count"], help="Sentences with perplexity 16–30 (AI-assisted)")
        c3.metric("🟢 Human", s["total_sentences"] - s["ai_direct_count"] - s["ai_polished_count"], help="Sentences with perplexity > 30")

        st.markdown("<br>", unsafe_allow_html=True)

        # ── Evasion Forensics ──
        st.markdown("### 🕵️ Evasion Forensics")
        hidden_chars = er.get("hidden_characters", [])
        homoglyphs   = er.get("homoglyphs", [])

        if hidden_chars or homoglyphs:
            st.markdown('<div class="alert-evasion">', unsafe_allow_html=True)
            st.markdown("⚠️ **Evasion techniques detected!**")
            if hidden_chars:
                for h in hidden_chars:
                    st.markdown(f"- **{h['character']}**: {h['occurrences']} occurrence(s)")
            if homoglyphs:
                st.markdown(f"- **Mixed-script homoglyphs** in {len(homoglyphs)} word(s)")
            st.markdown("</div>", unsafe_allow_html=True)
        else:
            st.markdown('<div class="alert-clean">✅ No evasion techniques detected</div>', unsafe_allow_html=True)

        st.markdown("<br>", unsafe_allow_html=True)

        # ── Sentence-Level Results ──
        st.markdown("### 📋 Sentence-Level Analysis")

        # Filter controls
        fc1, fc2, _ = st.columns([1, 1, 2])
        with fc1:
            show_filter = st.selectbox("Show:", ["All Sentences", "AI-Direct only", "AI-Polished only", "Human only"], key="sent_filter")
        with fc2:
            max_show = st.selectbox("Limit:", [20, 50, 100, "All"], index=0, key="sent_limit")

        filter_map = {
            "All Sentences": None,
            "AI-Direct only": "ai_direct",
            "AI-Polished only": "ai_polished",
            "Human only": "human",
        }
        cls_filter = filter_map[show_filter]
        filtered = [s for s in sentences if cls_filter is None or s["classification"] == cls_filter]
        if max_show != "All":
            filtered = filtered[:int(max_show)]

        for sent in filtered:
            cls = sent["classification"]
            row_cls = "sent-ai" if cls == "ai_direct" else "sent-mid" if cls == "ai_polished" else "sent-human"
            badge_color = "#ef4444" if cls == "ai_direct" else "#f59e0b" if cls == "ai_polished" else "#22c55e"
            badge_label = "AI Direct" if cls == "ai_direct" else "AI Polished" if cls == "ai_polished" else "Human"
            idx = sent.get("index", sent.get("idx", "?"))
            perp = sent["perplexity"]
            txt = sent["text"]
            st.markdown(f"""
            <div class="sent-row {row_cls}">
              <div class="sent-meta">
                #<b>{idx}</b> &nbsp;·&nbsp;
                Perplexity: <b>{perp:.1f}</b> &nbsp;·&nbsp;
                <span style="color:{badge_color};font-weight:600">{badge_label}</span>
              </div>
              {txt}
            </div>
            """, unsafe_allow_html=True)

        if not filtered:
            st.info("No sentences match the selected filter.")

        st.markdown("<br>", unsafe_allow_html=True)

        # ── Download Report ──
        st.markdown("### ⬇️ Download Report")
        now = datetime.now().strftime("%Y%m%d_%H%M%S")
        report_id = f"MN-{abs(hash(result['source'])) % 10000000:07d}"

        report_lines = [
            "=" * 70,
            f"MURNITIN INTEGRITY REPORT   ID: {report_id}",
            f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S UTC')}",
            "=" * 70,
            "",
            f"SOURCE   : {result['source']}",
            f"VERDICT  : {s['verdict']}",
            f"AI SCORE : {s['ai_probability']}%",
            "",
            "── METRICS ─────────────────────────────────────────────────────",
            f"  Avg Perplexity   : {s['avg_perplexity']:.2f}",
            f"  Burstiness       : {s['burstiness']:.2f}",
            f"  Total Sentences  : {s['total_sentences']}",
            f"  AI-Direct        : {s['ai_direct_count']}",
            f"  AI-Polished      : {s['ai_polished_count']}",
            f"  AI-Flagged Pct   : {s['ai_flagged_pct']}%",
            "",
            "── EVASION FORENSICS ────────────────────────────────────────────",
        ]
        if hidden_chars:
            for h in hidden_chars:
                report_lines.append(f"  ⚠  {h['character']}: {h['occurrences']} occurrence(s)")
        if homoglyphs:
            report_lines.append(f"  ⚠  Homoglyphs in {len(homoglyphs)} word(s)")
        if not hidden_chars and not homoglyphs:
            report_lines.append("  ✓  No evasion detected")
        report_lines += [
            "",
            "── SENTENCE RESULTS ─────────────────────────────────────────────",
        ]
        for sent in sentences:
            idx = sent.get("index", sent.get("idx", "?"))
            report_lines.append(
                f"  [{idx:>3}] perp={sent['perplexity']:6.1f} | {sent['classification']:12s} | {sent['text'][:90]}"
            )
        report_lines += [
            "",
            "── COMPLIANCE ───────────────────────────────────────────────────",
            "  ✓  FERPA  : No student PII processed",
            "  ✓  GDPR   : No raw text retained beyond session",
            "  ✓  Advisory use: Not intended as automated disciplinary verdict",
            "",
            "Generated by Murnitin v2.0 (Streamlit Edition)",
            "github.com/meetmehedi/murnitin",
            "=" * 70,
        ]
        report_text = "\n".join(report_lines)

        dl_col1, dl_col2, _ = st.columns([1.2, 1.2, 2])
        with dl_col1:
            st.download_button(
                label="📄 Download .txt Report",
                data=report_text,
                file_name=f"Murnitin_Report_{report_id}_{now}.txt",
                mime="text/plain",
                use_container_width=True,
            )
        with dl_col2:
            # CSV download
            df_export = pd.DataFrame([
                {
                    "Index": sent.get("index", sent.get("idx")),
                    "Classification": sent["classification"],
                    "Perplexity": sent["perplexity"],
                    "Text": sent["text"],
                }
                for sent in sentences
            ])
            st.download_button(
                label="📊 Download .csv Data",
                data=df_export.to_csv(index=False),
                file_name=f"Murnitin_Sentences_{report_id}_{now}.csv",
                mime="text/csv",
                use_container_width=True,
            )

        # ── Compliance badges ──
        st.markdown("""
        <div class="compliance">
          <span class="comp-item">✓ FERPA</span>
          <span class="comp-item">✓ GDPR</span>
          <span class="comp-item">✓ Zero Data Storage</span>
          <span class="comp-item">✓ Explainable AI</span>
          <span class="comp-item">✓ Advisory Use Only</span>
        </div>
        """, unsafe_allow_html=True)


# ─────────────────────────────────────────────────────────────────────────────
# FOOTER
# ─────────────────────────────────────────────────────────────────────────────
st.markdown("---")
st.markdown("""
<div style="text-align:center;font-size:0.75rem;color:#475569;padding:1rem 0">
  Murnitin v2.0 (Streamlit Edition) &nbsp;·&nbsp;
  Built by <a href="https://mdmehedihasan.us" target="_blank" style="color:#7c6bff;text-decoration:none">Md. Mehedi Hasan</a>
  &nbsp;·&nbsp;
  <a href="https://github.com/meetmehedi/murnitin" target="_blank" style="color:#7c6bff;text-decoration:none">GitHub ↗</a>
</div>
""", unsafe_allow_html=True)
