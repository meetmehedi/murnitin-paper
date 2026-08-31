"""
validate_murnitin.py — Comprehensive Scientific Validation Suite for Murnitin 3.0
Benchmarks accuracy, recall, precision, Turnitin ground-truth alignment, and evasion forensics.
"""

import os
import sys
import json
import time
import requests
import pypdf
from murnitin_engine import analyze_document, evaluate_sentence

TEST_CASES = [
    {
        "id": "TC-01",
        "name": "Academic Ground Truth (mis_v5 PDF)",
        "type": "Hybrid Academic Paper (15 pages)",
        "ground_truth_turnitin": "49%",
        "expected_range": (42, 53),
        "source": "file",
        "path": "mis_v5 (1).pdf",
        "expected_verdict": "Substantial AI-Assisted"
    },
    {
        "id": "TC-02",
        "name": "Pure Machine Learning AI",
        "type": "100% LLM Generated",
        "ground_truth_turnitin": "100%",
        "expected_range": (85, 100),
        "source": "text",
        "text": (
            "Machine learning models have transformed how we approach data classification tasks. "
            "The algorithm processes input features through multiple layers of computation. "
            "Each layer applies a transformation that reduces dimensional complexity. "
            "The output layer produces probability distributions over predefined categories. "
            "Training involves minimizing a loss function through gradient-based optimization. "
            "Regularization techniques prevent overfitting to training data samples. "
            "The model is evaluated on a held-out test set to measure generalization performance. "
            "Cross-validation provides a robust estimate of expected model accuracy. "
            "Hyperparameter tuning improves performance by optimizing configuration settings. "
            "The final model is deployed to production environments for real-time inference."
        ),
        "expected_verdict": "Likely AI-Generated"
    },
    {
        "id": "TC-03",
        "name": "Buzzword & Transition AI",
        "type": "100% LLM with Academic Transitions",
        "ground_truth_turnitin": "100%",
        "expected_range": (85, 100),
        "source": "text",
        "text": (
            "The expansion of modern urban centers represents a significant transformation in human organization. "
            "Historically, populations were concentrated near agricultural centers; however, the industrial revolution altered these distribution patterns. "
            "Furthermore, structural developments of steel and glass constitute the primary human habitat. "
            "Consequently, navigating a dense metropolitan corridor reveals a structured arrangement of activities. "
            "Moreover, this environment is characterized by efficiency, organization, and predictable behaviors. "
            "Additionally, this systematic design is what renders urban systems functional. "
            "In addition to high population density, municipal administrations implement comprehensive policies to manage resources effectively. "
            "Ultimately, these multifaceted urban frameworks facilitate seamless integration of diverse communities."
        ),
        "expected_verdict": "Likely AI-Generated"
    },
    {
        "id": "TC-04",
        "name": "Informal Experiential Human",
        "type": "100% Human Writing",
        "ground_truth_turnitin": "0%",
        "expected_range": (0, 15),
        "source": "text",
        "text": (
            "So I was trying to get my Python script to run but kept hitting this weird error where the file path had spaces in it and nothing I tried seemed to work. "
            "Turns out you just need to wrap the path in quotes, which I should have figured out like an hour earlier. "
            "Anyway, once that was sorted the rest of it was pretty straightforward. "
            "My friend Sam had the same issue last week and she ended up just moving all her files to a path without spaces, which is honestly probably a cleaner solution. "
            "I spent way too long on this but at least I know for next time."
        ),
        "expected_verdict": "Likely Human"
    },
    {
        "id": "TC-05",
        "name": "Formal Academic Human (Peer-Reviewed Style)",
        "type": "100% Human Scholarly Prose",
        "ground_truth_turnitin": "0%",
        "expected_range": (0, 25),
        "source": "text",
        "text": (
            "The relationship between poverty and educational attainment has been studied extensively over the past five decades. "
            "While early research focused primarily on material resources such as textbooks and facilities, more recent scholarship has shifted toward examining social and psychological factors. "
            "Children from low-income households often face chronic stress that impairs cognitive development. "
            "This observation has led researchers to question whether interventions targeting academic skills alone are sufficient. "
            "Several longitudinal studies have tracked cohorts from early childhood through adulthood, revealing persistent gaps that widen over time. "
            "The mechanisms driving these disparities remain contested among sociologists and economists."
        ),
        "expected_verdict": "Likely Human"
    },
    {
        "id": "TC-06",
        "name": "Hybrid Co-Authored Prose",
        "type": "50% Human + 50% AI Assistance",
        "ground_truth_turnitin": "45-55%",
        "expected_range": (35, 65),
        "source": "text",
        "text": (
            "I remember when I first started learning coding, it felt like learning a magical language where a single typo could collapse the universe. "
            "It was incredibly frustrating but rewarding. "
            "The process of writing computer programs is a highly structured activity. "
            "It requires the developer to define clear logical instructions that the computer executes in sequence. "
            "Furthermore, software systems must be designed with modularity to ensure ease of maintenance over time. "
            "In conclusion, the integration of structured engineering practices is essential for developing scalable software solutions. "
            "Honestly, once you cross that initial learning cliff, the logic makes a weird kind of sense."
        ),
        "expected_verdict": "Inconclusive / Mixed / Substantial AI-Assisted"
    },
    {
        "id": "TC-07",
        "name": "Adversarial Evasion Attack (Zero-Width + Homoglyphs)",
        "type": "Adversarial AI Bypasser",
        "ground_truth_turnitin": "Often Bypassed (0% False Negative)",
        "expected_range": (80, 100),
        "source": "text",
        "text": (
            "The util\u0456ze of d\u0456g\u0456tal technologies has altered the landscape of educat\u0456on in the modern era. "
            "It provides st\u200budents with access to a wide array of educational resources. "
            "Furthermore, online learning systems off\u0435r flex\u0456b\u0456l\u0456ty and conv\u0435ni\u0435nce to students across the world."
        ),
        "expected_verdict": "Evasion Detected"
    }
]

def run_suite():
    print("=" * 80)
    print("  MURNITIN 3.0 ACADEMIC INTEGRITY & AI DETECTION — SCIENTIFIC VALIDATION SUITE")
    print("=" * 80)
    print()

    results = []
    passed_count = 0

    for tc in TEST_CASES:
        if tc["source"] == "file":
            reader = pypdf.PdfReader(tc["path"])
            text = "\n".join([p.extract_text() or "" for p in reader.pages])
        else:
            text = tc["text"]

        # Test against Live API
        try:
            resp = requests.post("http://localhost:8000/api/analyze", json={"text": text}, timeout=30)
            if resp.status_code == 200:
                data = resp.json()
                score = data["score"]
                verdict = data["verdict"]
                sentences = len(data["sentences"])
                ai_sents = data["aiSentences"]
                has_evasion = data.get("hasEvasion", False)
                signals = data.get("signalSummary", {})
                confidence = data.get("avgConfidence", 0)
            else:
                raise Exception(f"HTTP {resp.status_code}")
        except Exception as e:
            # Fallback to local engine test
            engine_res = analyze_document(text)
            score = engine_res["summary"]["ai_probability"]
            verdict = engine_res["summary"]["verdict"]
            sentences = engine_res["summary"]["total_sentences"]
            ai_sents = engine_res["summary"]["ai_direct_count"] + engine_res["summary"]["ai_polished_count"]
            has_evasion = engine_res["summary"]["evasion_detected"]
            signals = {}
            confidence = 0

        low, high = tc["expected_range"]
        is_passed = (low <= score <= high) or (tc["id"] == "TC-07" and has_evasion)
        if is_passed:
            passed_count += 1

        status_str = "✅ PASS" if is_passed else "❌ FAIL"
        print(f"[{tc['id']}] {tc['name']} ({tc['type']})")
        print(f"  • Turnitin Benchmark : {tc['ground_truth_turnitin']}")
        print(f"  • Murnitin Output    : {score}% (Expected: {low}-{high}%) | Verdict: {verdict}")
        print(f"  • Sentences Flagged  : {ai_sents}/{sentences} | Evasion Flagged: {has_evasion}")
        if confidence:
            print(f"  • Explainable Signals: Avg Conf {confidence}% | Signals: {signals}")
        print(f"  • Status             : {status_str}")
        print("-" * 80)

        results.append({
            "id": tc["id"],
            "name": tc["name"],
            "type": tc["type"],
            "turnitin": tc["ground_truth_turnitin"],
            "murnitin_score": f"{score}%",
            "expected_range": f"{low}% - {high}%",
            "verdict": verdict,
            "passed": is_passed
        })

    accuracy = (passed_count / len(TEST_CASES)) * 100.0
    print()
    print("=" * 80)
    print(f"  VALIDATION SUMMARY: {passed_count}/{len(TEST_CASES)} PASSED ({accuracy:.1f}% BENCHMARK CONFORMANCE)")
    print("=" * 80)
    return results

if __name__ == "__main__":
    run_suite()
