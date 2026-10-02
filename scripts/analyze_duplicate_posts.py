import os
import re
import glob
from collections import defaultdict
import difflib
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

POSTS_DIR = r"D:\WEB\antigravity\affiliate\blog\src\content\posts"


def parse_frontmatter(content):
    meta = {}
    body = content
    if content.startswith("---"):
        parts = content.split("---", 2)
        if len(parts) >= 3:
            fm_text = parts[1]
            body = parts[2]
            for line in fm_text.splitlines():
                if ":" in line:
                    key, val = line.split(":", 1)
                    key = key.strip()
                    val = val.strip().strip('"').strip("'")
                    meta[key] = val
    return meta, body

def clean_text(text):
    # Remove markdown formatting, html tags, extra whitespace
    text = re.sub(r'```.*?```', '', text, flags=re.DOTALL)
    text = re.sub(r'<[^>]+>', ' ', text)
    text = re.sub(r'[#*_`\[\]()\-+=>|~]', ' ', text)
    text = re.sub(r'\s+', ' ', text).lower().strip()
    return text

def get_words(text):
    return set(re.findall(r'\b[a-z]{3,}\b', text.lower()))

def get_shingles(text, k=4):
    words = re.findall(r'\b[a-z]{2,}\b', text.lower())
    if len(words) < k:
        return set()
    return set(" ".join(words[i:i+k]) for i in range(len(words) - k + 1))

def jaccard_similarity(set1, set2):
    if not set1 or not set2:
        return 0.0
    intersection = len(set1.intersection(set2))
    union = len(set1.union(set2))
    return intersection / union if union > 0 else 0.0

def main():
    files = glob.glob(os.path.join(POSTS_DIR, "*.md"))
    print(f"Total post files found: {len(files)}")

    posts = []
    for fpath in files:
        fname = os.path.basename(fpath)
        slug = os.path.splitext(fname)[0]
        with open(fpath, "r", encoding="utf-8", errors="replace") as f:
            content = f.read()
        meta, body = parse_frontmatter(content)
        cleaned_body = clean_text(body)
        shingles = get_shingles(cleaned_body, k=4)
        word_set = get_words(cleaned_body)
        word_count = len(re.findall(r'\b\w+\b', cleaned_body))

        posts.append({
            "filename": fname,
            "slug": slug,
            "title": meta.get("title", slug),
            "description": meta.get("description", ""),
            "category": meta.get("category", ""),
            "body": body,
            "cleaned_body": cleaned_body,
            "shingles": shingles,
            "word_set": word_set,
            "word_count": word_count
        })

    # 1. Exact or near Title duplicates
    print("\n" + "="*60)
    print("1. АНАЛИЗ ЗАГОЛОВКОВ (TITLES)")
    print("="*60)
    title_map = defaultdict(list)
    for p in posts:
        norm_title = re.sub(r'[^a-z0-9]', '', p["title"].lower())
        title_map[norm_title].append(p)

    exact_title_dupes = [group for group in title_map.values() if len(group) > 1]
    if exact_title_dupes:
        print(f"🚨 Найдено {len(exact_title_dupes)} групп точных дублей заголовков:")
        for g in exact_title_dupes:
            print(f"   - Title: \"{g[0]['title']}\"")
            for item in g:
                print(f"     -> {item['filename']}")
    else:
        print("✅ Точных дубликатов заголовков не обнаружено.")

    # Near Title similarity (> 75%)
    near_title_pairs = []
    for i in range(len(posts)):
        for j in range(i + 1, len(posts)):
            p1 = posts[i]
            p2 = posts[j]
            t1 = p1["title"].lower()
            t2 = p2["title"].lower()
            ratio = difflib.SequenceMatcher(None, t1, t2).ratio()
            if ratio >= 0.70:
                near_title_pairs.append((ratio, p1, p2))

    near_title_pairs.sort(key=lambda x: x[0], reverse=True)
    print(f"\n🔍 Похожие заголовки (сходство >= 70%): {len(near_title_pairs)} пар")
    for ratio, p1, p2 in near_title_pairs[:15]:
        print(f"   [{ratio*100:.1f}% схожесть]")
        print(f"     1) {p1['filename']}: \"{p1['title']}\"")
        print(f"     2) {p2['filename']}: \"{p2['title']}\"")

    # 2. Content similarity analysis (Jaccard on 4-grams)
    print("\n" + "="*60)
    print("2. АНАЛИЗ СХОДСТВА ТЕКСТА (CONTENT DUPLICATION / SHINGLES)")
    print("="*60)
    content_similar_pairs = []
    for i in range(len(posts)):
        for j in range(i + 1, len(posts)):
            p1 = posts[i]
            p2 = posts[j]
            sim = jaccard_similarity(p1["shingles"], p2["shingles"])
            # Also calculate word overlap
            word_sim = jaccard_similarity(p1["word_set"], p2["word_set"])
            if sim >= 0.20 or word_sim >= 0.65:
                content_similar_pairs.append((sim, word_sim, p1, p2))

    content_similar_pairs.sort(key=lambda x: x[0], reverse=True)
    if content_similar_pairs:
        print(f"🚨 Найдено {len(content_similar_pairs)} пар с пересечением текста:")
        for sim, word_sim, p1, p2 in content_similar_pairs:
            print(f"   - 4-gram сходство: {sim*100:.1f}%, пересечение словаря: {word_sim*100:.1f}%")
            print(f"     Статья A: {p1['filename']} ({p1['word_count']} слов)")
            print(f"     Статья B: {p2['filename']} ({p2['word_count']} слов)")
    else:
        print("✅ Сильных дублей текстов (пересечение шинглов >= 20%) не обнаружено.")

    # 3. Slugs analysis (stemming/similarity)
    print("\n" + "="*60)
    print("3. АНАЛИЗ СЛАГОВ / ТЕМАТИЧЕСКИХ КЛАСТЕРОВ")
    print("="*60)
    slug_clusters = defaultdict(list)
    for p in posts:
        # Extract base keywords from slug
        words = [w for w in p["slug"].split("-") if w not in ["2026", "the", "and", "for", "how", "to", "in", "of", "a", "your", "on"]]
        key = "-".join(sorted(words[:3]))
        slug_clusters[key].append(p)

    multi_clusters = {k: v for k, v in slug_clusters.items() if len(v) > 2}
    print(f"Крупные тематические кластеры статей (одна узкая тема): {len(multi_clusters)}")
    for k, v in list(multi_clusters.items())[:10]:
        print(f"   Кластер [{k}] ({len(v)} статей):")
        for item in v[:4]:
            print(f"     • {item['filename']} -> \"{item['title'][:65]}...\"")

if __name__ == "__main__":
    main()
