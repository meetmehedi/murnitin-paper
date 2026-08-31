import http.server
import socketserver
import json
import re
import math
import sys
import os

from murnitin_engine import (
    evaluate_sentence,
    clean_pdf_text,
    split_sentences,
    detect_hidden_characters,
    detect_homoglyphs,
    INVISIBLE
)

# Port configuration
PORT = int(os.environ.get("PORT", "8000"))

# ─────────────────────────────────────────────────────────────────────────────
# LAZY-LOAD HUGGING FACE ENSEMBLE MODELS
# Note: Fakespot model removed — it classifies fake/real reviews, NOT AI vs Human text.
#       Its 'Human' label output on academic AI prose was causing massive false negatives.
# ─────────────────────────────────────────────────────────────────────────────
PIPE_AHMED = None
PIPE_OPENAI = None

try:
    print("Loading Hugging Face AI Detector Ensemble Models...")
    from transformers import pipeline
    
    # 1. ahmediqbal/ai-text-detector-model (primary — fine-tuned for academic AI detection)
    PIPE_AHMED = pipeline("text-classification", model="ahmediqbal/ai-text-detector-model")
    print("✓ Model 1/2 (ahmediqbal) loaded!")
    
    # 2. roberta-base-openai-detector (secondary — GPT-2 era baseline calibration)
    PIPE_OPENAI = pipeline("text-classification", model="roberta-base-openai-detector")
    print("✓ Model 2/2 (openai-detector) loaded!")
    
    print("✓ Ensemble Engine fully initialized!")
except Exception as e:
    print("⚠ Could not load ensemble transformers. Falling back to statistical heuristics.")
    print("Error details:", e)


# ─────────────────────────────────────────────────────────────────────────────
# HTTP HANDLER
# ─────────────────────────────────────────────────────────────────────────────
class MurnitinHandler(http.server.SimpleHTTPRequestHandler):
    def do_POST(self):
        global PIPE_AHMED, PIPE_FAKESPOT, PIPE_OPENAI
        if self.path == '/api/analyze':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            
            try:
                data = json.loads(post_data.decode('utf-8'))
                raw_text = data.get('text', '')
            except Exception as e:
                self.send_response(400)
                self.end_headers()
                self.wfile.write(b"Invalid JSON payload")
                return

            if not raw_text:
                self.send_response(400)
                self.end_headers()
                self.wfile.write(b"Empty text field")
                return

            # Evasion Diagnostics
            hidden = detect_hidden_characters(raw_text)
            homo = detect_homoglyphs(raw_text)
            has_evasion = len(hidden) > 0 or len(homo) > 0

            # Clean text
            clean_text = raw_text
            for ch in INVISIBLE:
                clean_text = clean_text.replace(ch, '')
            clean_text = clean_pdf_text(clean_text)

            # Strip Turnitin / platform watermark lines embedded in PDFs
            WATERMARK_PATTERNS = [
                r'Page \d+ of \d+\s*-\s*AI Writing',
                r'Submission ID\s*trn:',
                r'AI-generated only\s+\d+%',
                r'Likely AI-generated text from a lar',
                r'AI Writing Submission',
                r'AI-generated text that was AI-paraphrased',
            ]
            for pat in WATERMARK_PATTERNS:
                clean_text = re.sub(pat, ' ', clean_text, flags=re.IGNORECASE)

            # Robust sentence splitting with abbreviation protection
            sentences = split_sentences(clean_text)

            if not sentences:
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'error': 'No scorable sentences found.'}).encode('utf-8'))
                return

            sent_results = []
            ai_direct_count = 0
            ai_polished_count = 0

            # Ensemble classification if models loaded successfully
            if PIPE_AHMED and PIPE_OPENAI:
                try:
                    # Run predictions
                    preds_ahmed = PIPE_AHMED(sentences)
                    preds_openai = PIPE_OPENAI(sentences)
                    
                    for i, (s, p_ahmed, p_openai) in enumerate(zip(sentences, preds_ahmed, preds_openai)):
                        # Ahmed: labels 'AI' or 'Human'
                        score_ahmed = p_ahmed['score'] if p_ahmed['label'] == 'AI' else (1.0 - p_ahmed['score'])
                        # OpenAI detector: labels 'Fake' (AI) or 'Real' (human)
                        score_openai = p_openai['score'] if p_openai['label'] == 'Fake' else (1.0 - p_openai['score'])
                        
                        # DUAL-GATE: Both models must agree above calibrated thresholds.
                        # Thresholds validated against Turnitin ground truth on academic papers.
                        # Ahmed>0.95 + OpenAI>0.35 -> ~45-49% on AI-heavy papers like mis_v5
                        cls = 'human'
                        if score_ahmed > 0.95 and score_openai > 0.35:
                            cls = 'ai_direct'
                            ai_direct_count += 1
                        elif score_ahmed > 0.82 and score_openai > 0.25:
                            cls = 'ai_polished'
                            ai_polished_count += 1
                            
                        # Calibrated perplexity: low combined -> high perp (human), high -> low perp (AI)
                        combined = score_ahmed * 0.75 + score_openai * 0.25
                        p_score = max(6.0, round((1.0 - combined) * 88.0 + 8.0, 1))
                        
                        sent_results.append({
                            'idx': i,
                            'text': s,
                            'perplexity': p_score,
                            'classification': cls
                        })
                except Exception as e:
                    print("⚠ Model inference failed. Falling back to statistical scoring:", e)
                    PIPE_AHMED = None
            
            # Fallback to local statistical engine if models not available/crashed
            if not sent_results:
                for i, s in enumerate(sentences):
                    res = evaluate_sentence(s)
                    cls = res['classification']
                    if cls == 'ai_direct':
                        ai_direct_count += 1
                    elif cls == 'ai_polished':
                        ai_polished_count += 1
                    sent_results.append({
                        'idx': i,
                        'text': s,
                        'perplexity': res['perplexity'],
                        'classification': cls
                    })

            # Calculate perplexity metrics
            perps = [r['perplexity'] for r in sent_results]
            avg_perplexity = round(sum(perps) / len(perps), 1)
            variance = sum((p - avg_perplexity) ** 2 for p in perps) / len(perps)
            burstiness = round(math.sqrt(variance), 1)

            # Turnitin-Standard Word-Weighted AI Likelihood calculation
            total_words = sum(len(s.split()) for s in sentences)
            ai_direct_words = sum(len(r['text'].split()) for r in sent_results if r['classification'] == 'ai_direct')
            ai_polished_words = sum(len(r['text'].split()) for r in sent_results if r['classification'] == 'ai_polished')
            
            weighted_ai_words = (ai_direct_words * 1.0) + (ai_polished_words * 0.90)
            calibrated_score = (weighted_ai_words / total_words * 100.0) if total_words > 0 else 0.0
            
            if has_evasion:
                calibrated_score = max(calibrated_score, 85.0)
            
            score = round(max(0.0, min(100.0, calibrated_score)))

            # Verdict mapping matching Turnitin
            if score < 20:       verdict = 'Likely Human'
            elif score < 45:     verdict = 'Mostly Human'
            elif score < 70:     verdict = 'Inconclusive / Mixed'
            elif score < 85:     verdict = 'Likely AI-Assisted'
            else:                verdict = 'Likely AI-Generated'
            if has_evasion:      verdict = 'Evasion Detected'

            response_data = {
                'score': score,
                'avg': avg_perplexity,
                'burstiness': burstiness,
                'sentences': sent_results,
                'aiSentences': ai_direct_count + ai_polished_count,
                'aiDirectCount': ai_direct_count,
                'aiPolishedCount': ai_polished_count,
                'aiFlaggedPct': round((ai_direct_count + ai_polished_count) / len(sentences) * 100, 1),
                'hasEvasion': has_evasion,
                'hiddenChars': hidden,
                'homoglyphs': [h['word'] for h in homo],
                'verdict': verdict,
                'verdictClass': 'green' if score < 25 else 'yellow' if score < 80 else 'red'
            }

            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(response_data).encode('utf-8'))
        else:
            self.send_response(404)
            self.end_headers()

    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

# Start Server
if __name__ == '__main__':
    script_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(script_dir)

    handler = MurnitinHandler
    socketserver.TCPServer.allow_reuse_address = True

    httpd = None
    for candidate_port in range(PORT, PORT + 10):
        try:
            httpd = socketserver.TCPServer(("", candidate_port), handler)
            break
        except OSError as e:
            if getattr(e, 'errno', None) not in {48, 98, 10048}:
                raise
            print(f"Port {candidate_port} is busy, trying {candidate_port + 1}...")

    if httpd is None:
        raise RuntimeError(f"Unable to start server on ports {PORT}-{PORT + 9}")

    with httpd as server:
        print(f"Murnitin Server running at http://localhost:{httpd.server_address[1]}/")
        try:
            server.serve_forever()
        except KeyboardInterrupt:
            print("\nShutting down server.")
            sys.exit(0)
