import os
import difflib
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

dir_path = r"D:\WEB\antigravity\affiliate\blog\src\content\posts"

pairs = [
    ("tinder-verification-checkmark-human-bot-farms.md", "fake-verification-checkmark-trap-how-bots-bypass-tinder-checks.md"),
    ("the-48-hour-whatsapp-move-crypto-dating-funnel-anatomy.md", "why-dating-scammers-demand-whatsapp-within-three-messages.md"),
    ("hinge-opening-lines-that-get-85-reply-rates-data-backed-strategie.md", "hinge-icebreakers-that-actually-work.md"),
    ("hinge-algorithm-unmasked-standouts-most-compatible-scoring.md", "hinge-most-compatible-algorithm-backend-telemetry.md"),
    ("how-to-revive-dead-tinder-conversation-pattern-interrupts.md", "reviving-stalled-conversations-low-pressure-openers.md"),
    ("how-to-avoid-catfishing-the-2026-online-dating-safety-guide-every.md", "how-to-spot-catfish-osint-ai.md"),
    ("detect-stolen-instagram-photos-on-dating-profiles-your-2026-playb.md", "stolen-photos-fake-dating-profile-how-to-fight-back-in-2026.md")
]

print("=== СРАВНЕНИЕ ТЕМАТИЧЕСКИ БЛИЗКИХ ПАР СТАТЕЙ ===\n")
for f1, f2 in pairs:
    p1 = os.path.join(dir_path, f1)
    p2 = os.path.join(dir_path, f2)
    if os.path.exists(p1) and os.path.exists(p2):
        with open(p1, 'r', encoding='utf-8') as file1:
            t1 = file1.read()
        with open(p2, 'r', encoding='utf-8') as file2:
            t2 = file2.read()
        
        ratio = difflib.SequenceMatcher(None, t1, t2).ratio()
        
        # Word overlap
        w1 = set(t1.lower().split())
        w2 = set(t2.lower().split())
        overlap = len(w1.intersection(w2)) / len(w1.union(w2))
        
        print(f"Пара:\n  A: {f1}\n  B: {f2}")
        print(f"  Сходство последовательности текста: {ratio*100:.1f}%")
        print(f"  Сходство словаря (Jaccard): {overlap*100:.1f}%")
        print(f"  Длина A: {len(t1.split())} слов, Длина B: {len(t2.split())} слов")
        print("-" * 50)
