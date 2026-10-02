import os
import sys

POSTS_DIR = r"D:\WEB\antigravity\affiliate\blog\src\content\posts"

links_to_add = [
    # Pair 1
    (
        "tinder-verification-checkmark-human-bot-farms.md",
        "\n\n---\n\n### Related Forensic Investigation\n* Compare this case with our deep dive into biometric exploits: [The Fake Verification Checkmark Trap: How Tinder Bot Networks Slip Past Facial Biometrics](/fake-verification-checkmark-trap-how-bots-bypass-tinder-checks/).\n"
    ),
    (
        "fake-verification-checkmark-trap-how-bots-bypass-tinder-checks.md",
        "\n\n---\n\n### Related Forensic Investigation\n* Examine how organized syndicates operate: [Tinder Verification Checkmark: Does It Actually Stop Human-Operated Bot Farms?](/tinder-verification-checkmark-human-bot-farms/).\n"
    ),
    # Pair 2
    (
        "the-48-hour-whatsapp-move-crypto-dating-funnel-anatomy.md",
        "\n\n---\n\n### Related Forensic Investigation\n* Understand the messaging threshold: [Why Scammers Demand WhatsApp Within Three Messages – The 2026 Forensic Breakdown](/why-dating-scammers-demand-whatsapp-within-three-messages/).\n"
    ),
    (
        "why-dating-scammers-demand-whatsapp-within-three-messages.md",
        "\n\n---\n\n### Related Forensic Investigation\n* Trace the complete financial execution: [The 48-Hour WhatsApp Move: Anatomy of a Crypto Dating Funnel](/the-48-hour-whatsapp-move-crypto-dating-funnel-anatomy/).\n"
    ),
    # Pair 3
    (
        "hinge-algorithm-unmasked-standouts-most-compatible-scoring.md",
        "\n\n---\n\n### Related Forensic Investigation\n* Review backend queue timing and exposure: [How Hinge’s “Most Compatible” Algorithm Works: A 2026 Forensic Breakdown](/hinge-most-compatible-algorithm-backend-telemetry/).\n"
    ),
    (
        "hinge-most-compatible-algorithm-backend-telemetry.md",
        "\n\n---\n\n### Related Forensic Investigation\n* Inspect scoring metrics and standout feeds: [Hinge Algorithm Most Compatible Calculation 2026: Inside the Matching Engine](/hinge-algorithm-unmasked-standouts-most-compatible-scoring/).\n"
    ),
    # Pair 4
    (
        "how-to-revive-dead-tinder-conversation-pattern-interrupts.md",
        "\n\n---\n\n### Related Forensic Investigation\n* Explore low-pressure alternatives: [Reviving Stalled Dating-App Conversations in 2026: Low-Pressure Openers That Elicit a Response](/reviving-stalled-conversations-low-pressure-openers/).\n"
    ),
    (
        "reviving-stalled-conversations-low-pressure-openers.md",
        "\n\n---\n\n### Related Forensic Investigation\n* Study advanced conversational psychology: [How to Revive a Dead Tinder Conversation in 2026: Five Pattern-Interrupt Scripts](/how-to-revive-dead-tinder-conversation-pattern-interrupts/).\n"
    ),
    # Pair 5
    (
        "hinge-opening-lines-that-get-85-reply-rates-data-backed-strategie.md",
        "\n\n---\n\n### Related Forensic Investigation\n* Test verified starter prompts: [Hinge Icebreakers That Actually Work: Data-Backed Openers With 80%+ Reply Rate](/hinge-icebreakers-that-actually-work/).\n"
    ),
    (
        "hinge-icebreakers-that-actually-work.md",
        "\n\n---\n\n### Related Forensic Investigation\n* Analyze the statistical breakdown: [Hinge Opening Lines That Get 85% Reply Rates: Data-Backed Strategies (2026 Edition)](/hinge-opening-lines-that-get-85-reply-rates-data-backed-strategie/).\n"
    ),
]

for fname, snippet in links_to_add:
    fpath = os.path.join(POSTS_DIR, fname)
    if os.path.exists(fpath):
        with open(fpath, "r", encoding="utf-8") as f:
            content = f.read()
        if "Related Forensic Investigation" not in content:
            with open(fpath, "a", encoding="utf-8") as f:
                f.write(snippet)
            print(f"Added related link to {fname}")
        else:
            print(f"Already contains related link: {fname}")
    else:
        print(f"File not found: {fname}")
