import os
import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch

os.makedirs("paper/figures", exist_ok=True)

plt.rcParams.update({
    'font.family': 'sans-serif',
    'font.sans-serif': ['DejaVu Sans', 'Arial', 'Helvetica'],
    'figure.dpi': 300
})

def draw_card(ax, x, y, w, h, bg_color, border_color, badge, badge_bg, title, subtitle, items):
    # Card Background
    card = FancyBboxPatch((x, y), w, h, boxstyle="round,pad=0.015,rounding_size=0.02",
                          facecolor=bg_color, edgecolor=border_color, linewidth=1.8, zorder=2)
    ax.add_patch(card)

    # 1. Badge (at the very top)
    badge_y = y + h - 0.035
    b_len = len(badge) * 0.009 + 0.035
    badge_box = FancyBboxPatch((x + 0.018, badge_y - 0.018), b_len, 0.032,
                               boxstyle="round,pad=0.004,rounding_size=0.008",
                               facecolor=badge_bg, edgecolor='none', zorder=3)
    ax.add_patch(badge_box)
    ax.text(x + 0.018 + b_len/2, badge_y - 0.002, badge, ha='center', va='center',
            fontsize=8.5, weight='bold', color='#ffffff', zorder=4)

    # 2. Title (below badge)
    title_y = badge_y - 0.038
    # Handle multi-line title if any
    title_lines = title.split('\n')
    for line in title_lines:
        ax.text(x + 0.018, title_y, line, ha='left', va='top',
                fontsize=10.5, weight='bold', color='#0f172a', zorder=3)
        title_y -= 0.034

    # 3. Subtitle (below title)
    if subtitle:
        title_y -= 0.005
        ax.text(x + 0.018, title_y, subtitle, ha='left', va='top',
                fontsize=8.8, style='italic', color='#334155', zorder=3)
        title_y -= 0.036

    # 4. Bullet Items (spaced evenly)
    title_y -= 0.008
    for item in items:
        ax.text(x + 0.022, title_y, f"• {item}", ha='left', va='top',
                fontsize=8.5, color='#1e293b', zorder=3)
        title_y -= 0.032

def draw_arrow(ax, p1, p2, color="#475569", lw=2.0, style="-|>"):
    ax.annotate('', xy=p2, xytext=p1,
                arrowprops=dict(arrowstyle=style, color=color, lw=lw,
                                mutation_scale=16, shrinkA=3, shrinkB=3), zorder=5)

def generate_perfect_architecture():
    # Large 15x7 canvas to ensure generous padding and ZERO overlapping text
    fig, ax = plt.subplots(figsize=(15, 6.8))
    ax.set_xlim(0, 1.25)
    ax.set_ylim(0, 1.0)
    ax.axis('off')

    # Group container backgrounds (4 columns)
    col_w = [0.25, 0.38, 0.22, 0.26]
    col_x = [0.02, 0.30, 0.71, 0.96]

    g1 = FancyBboxPatch((col_x[0], 0.02), col_w[0], 0.94, boxstyle="round,pad=0.01,rounding_size=0.025",
                        facecolor="#f8fafc", edgecolor="#cbd5e1", linewidth=1.2, linestyle="--", zorder=1)
    g2 = FancyBboxPatch((col_x[1], 0.02), col_w[1], 0.94, boxstyle="round,pad=0.01,rounding_size=0.025",
                        facecolor="#f8fafc", edgecolor="#cbd5e1", linewidth=1.2, linestyle="--", zorder=1)
    g3 = FancyBboxPatch((col_x[2], 0.02), col_w[2], 0.94, boxstyle="round,pad=0.01,rounding_size=0.025",
                        facecolor="#f8fafc", edgecolor="#cbd5e1", linewidth=1.2, linestyle="--", zorder=1)
    g4 = FancyBboxPatch((col_x[3], 0.02), col_w[3], 0.94, boxstyle="round,pad=0.01,rounding_size=0.025",
                        facecolor="#f8fafc", edgecolor="#cbd5e1", linewidth=1.2, linestyle="--", zorder=1)

    for g in [g1, g2, g3, g4]:
        ax.add_patch(g)

    # Column Titles
    ax.text(col_x[0] + col_w[0]/2, 0.925, "1. INGESTION MODALITIES", ha='center', va='center', fontsize=11, weight='bold', color="#1e293b")
    ax.text(col_x[1] + col_w[1]/2, 0.925, "2. TRIPARTITE FORENSIC PIPELINE", ha='center', va='center', fontsize=11, weight='bold', color="#1e293b")
    ax.text(col_x[2] + col_w[2]/2, 0.925, "3. FUSION & XAI", ha='center', va='center', fontsize=11, weight='bold', color="#1e293b")
    ax.text(col_x[3] + col_w[3]/2, 0.925, "4. VERIFIABLE OUTCOMES", ha='center', va='center', fontsize=11, weight='bold', color="#1e293b")

    # Column 1 Cards (Height: 0.38 each)
    draw_card(ax, 0.035, 0.49, 0.22, 0.39,
              bg_color="#eff6ff", border_color="#2563eb",
              badge="MODALITY A", badge_bg="#1d4ed8",
              title="Document Ingestion", subtitle="Text & PDF Submissions",
              items=["Raw Document Stream", "Unicode Codepoint Parser", "Format Sanitization"])

    draw_card(ax, 0.035, 0.06, 0.22, 0.39,
              bg_color="#f0fdf4", border_color="#16a34a",
              badge="MODALITY B", badge_bg="#15803d",
              title="Draft Timeline Logs", subtitle="Temporal Process Logs",
              items=["Google Docs / Word API", "Keystroke Intervals (IKI)", "Revision Edit Sequences"])

    # Column 2 Cards (Height: 0.26 each)
    draw_card(ax, 0.315, 0.63, 0.35, 0.26,
              bg_color="#fffbeb", border_color="#d97706",
              badge="STAGE 2.1", badge_bg="#b45309",
              title="Module 1: Adversarial Forensics", subtitle="Pre-Tokenization Sanitization",
              items=["Zero-Width Space Stripping", "Homoglyph Canonical Mapping", "Adversarial Anomaly Score"])

    draw_card(ax, 0.315, 0.345, 0.35, 0.26,
              bg_color="#f5f3ff", border_color="#7c3aed",
              badge="STAGE 2.2", badge_bg="#6d28d9",
              title="Module 2: Multi-Signal XAI", subtitle="Linguistic Feature Space",
              items=["Sentence-Level Perplexity Variance", "Burstiness Coefficient (B)", "POS N-Gram Entropy (H_pos)"])

    draw_card(ax, 0.315, 0.06, 0.35, 0.26,
              bg_color="#ecfdf5", border_color="#059669",
              badge="STAGE 2.3", badge_bg="#047857",
              title="Module 3: Process Verification", subtitle="Dynamic Drafting Velocity",
              items=["Typing Rate Threshold Check", "Paste Burst Anomaly Detector", "Process Authenticity Index (PAI)"])

    # Column 3 Card (Height: 0.83)
    draw_card(ax, 0.725, 0.06, 0.19, 0.83,
              bg_color="#fef2f2", border_color="#dc2626",
              badge="CORE ENGINE", badge_bg="#b91c1c",
              title="Multi-Modal\nDecision Fusion", subtitle="Evidence Integration",
              items=["Multi-Signal Weights", "ESL Bias Mitigation", "Confidence Calibrator", "Sentence Heatmaps", "Process Correlation", "Dynamic Risk Scoring"])

    # Column 4 Cards (Height: 0.39 each)
    draw_card(ax, 0.975, 0.49, 0.23, 0.39,
              bg_color="#f8fafc", border_color="#475569",
              badge="EXPLAINABLE XAI", badge_bg="#334155",
              title="Evidence Report", subtitle="Transparent Due Process",
              items=["Sentence Perplexity Heatmap", "No Opaque Black Boxes", "Empirical Evidence Trail", "Fair Conduct Hearings"])

    draw_card(ax, 0.975, 0.06, 0.23, 0.39,
              bg_color="#f8fafc", border_color="#0284c7",
              badge="PRIVACY-FIRST", badge_bg="#0369a1",
              title="Zero-Knowledge Index", subtitle="GDPR & FERPA Compliant",
              items=["Salted MinHash Sketches", "Jaccard Shingle Matching", "No Raw Text Persistence", "Guaranteed Student IP"])

    # Flow Arrows
    # Modality A to Modules 1 & 2
    draw_arrow(ax, (0.255, 0.72), (0.315, 0.76), color="#2563eb")
    draw_arrow(ax, (0.255, 0.62), (0.315, 0.48), color="#2563eb")

    # Module 1 to Module 2
    draw_arrow(ax, (0.49, 0.63), (0.49, 0.605), color="#d97706")

    # Modality B to Module 3
    draw_arrow(ax, (0.255, 0.25), (0.315, 0.19), color="#16a34a")

    # Modules to Decision Fusion
    draw_arrow(ax, (0.665, 0.76), (0.725, 0.68), color="#d97706")
    draw_arrow(ax, (0.665, 0.475), (0.725, 0.48), color="#7c3aed")
    draw_arrow(ax, (0.665, 0.19), (0.725, 0.28), color="#059669")

    # Decision Fusion to Outcomes
    draw_arrow(ax, (0.915, 0.68), (0.975, 0.68), color="#dc2626")
    draw_arrow(ax, (0.915, 0.28), (0.975, 0.26), color="#0284c7")

    plt.tight_layout()
    plt.savefig("paper/figures/fig1_architecture.png", dpi=300, bbox_inches='tight')
    plt.close()
    print("Saved clean, non-overlapping fig1_architecture.png")

if __name__ == "__main__":
    generate_perfect_architecture()
