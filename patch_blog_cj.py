import sys

def patch_file(path, target, replacement):
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()
    if target in content:
        content = content.replace(target, replacement, 1)
        with open(path, "w", encoding="utf-8") as f:
            f.write(content)
        print("SUCCESS:", path)
    else:
        print("ERROR: Target not found in", path)
        sys.exit(1)

# 1. Patch why-you-get-matches-but-no-dates
target_matches = """**Move to Verified Platforms**

Even with perfect tactics, unverified accounts can still sabotage your conversion rate. **FlirtCheck Forensic Archive** aggregates verified profiles across major apps and offers a "Verified Match" filter that instantly removes the bottleneck. Join the community on **/r/dating** for real-time verification tips, success stories, and a safe space to practice your new scripts."""

replace_matches = """**Move to Verified Platforms & Scientific Matchmaking**

Even with perfect messaging tactics, the swipe app cycle is structurally designed to keep you trapped in endless micro-dopamine loops without ever meeting in real life. Unverified accounts, ghosting habits, and algorithmic throttles sabotage genuine connections.

If you are looking for long-term compatibility rather than ephemeral swipe validation, migrate to verified, scientifically backed platforms like [eharmony Verified Match](/go?offer=cj_eharmony&sub1=fc_blog_matches), where 32-dimension compatibility screening weeds out time-wasters before you exchange a single word. You can also benchmark and verify profiles through the **FlirtCheck Forensic Archive** to screen for authenticity and prevent catfish scams before planning an in-person meetup."""

patch_file('/var/www/affiliate/blog/src/content/posts/why-you-get-matches-but-no-dates-cracking-the-2026-matchesbutnoda.md', target_matches, replace_matches)

# 2. Patch coffee-vs-dinner
target_coffee = """* **Inform Your Circle:** Drop a pin to a trusted friend or family member with the venue name, the time, and a vague description of your companion. A quick text upon arrival and departure costs nothing and provides immense peace of mind."""

replace_coffee = """* **Inform Your Circle:** Drop a pin to a trusted friend or family member with the venue name, the time, and a vague description of your companion. A quick text upon arrival and departure costs nothing and provides immense peace of mind.
* **Curated Neutral Venues & Activities:** If you prefer structured, high-reputation public spots (such as museum exhibitions, historic cafes, or central boutique hotel lounges with verified security), explore [Booking.com Verified Public Venues & Experiences](/go?offer=cj_booking&sub1=fc_blog_coffee) to reserve a safe, verified first-meeting environment."""

patch_file('/var/www/affiliate/blog/src/content/posts/coffee-vs-dinner-date-one-why-low-investment-venues-win.md', target_coffee, replace_coffee)
