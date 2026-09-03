# CPA Training Audit Report

Generated: 2026-09-02T02:58:39.720Z

## Summary

| Module                           | Status | Time (ms) | Score | Validation                                               |
|------------------------------------|----------|-------------|---------|------------------------------------------------------------|
| Module 1: Documentation Parsing  | PASS   | 3         | 100   | LosPollos + MyLead rules parsed; macro mapping valid     |
| Module 2: LosPollos generation   | PASS   | 26108     | 92    | Quiz-gate / s1-s5 valid / compliant                      |
| Module 3: MyLead generation      | PASS   | 82764     | 92    | Risk notice + review tone + sub1-sub5 valid              |
| Module 4: Compliance Stress Test | PASS   | 1         | 0     | Non-compliant draft rejected by ComplianceGuard          |
| Module 5: Memory Convergence     | PASS   | 4         | 100   | Static rules and memory wins blend without network bleed |

## Module Details


### Module 1: Documentation Parsing
- Status: PASS
- Duration: 3 ms
- Compliance score: 100
- Validation: LosPollos + MyLead rules parsed; macro mapping valid
- Notes:
  - LosPollos macro: {"click_id":"s1","campaign_id":"s2","variant":"s3","geo":"s4","traffic_source":"s5"}
  - MyLead macro: {"traffic_source":"sub1","campaign_id":"sub2","variant":"sub3","click_id":"sub4","geo":"sub5"}


### Module 2: LosPollos generation
- Status: PASS
- Duration: 26108 ms
- Compliance score: 92
- Validation: Quiz-gate / s1-s5 valid / compliant
- Notes:
  - Headline: The weird relief of answering questions instead of swiping
  - Body preview: I hit a point last month where I just couldn’t do it anymore. Not the swiping, but the guessing. I’d match with someone who seemed perfect on paper, only to realize after two texts
  - Macro: {"click_id":"s1","campaign_id":"s2","variant":"s3","geo":"s4","traffic_source":"s5"}
  - Guard: The post exhibits a highly organic, narrative-driven tone consistent with genuine user experiences on Reddit. It avoids all blacklisted aggressive sales patterns (e.g., 'BUY NOW', 'CLICK HERE') and makes no guaranteed income or success claims. The mention of a 'structured compatibility quiz' is framed as a personal discovery rather than a direct advertisement, and the Call to Action is a soft, community-engagement question ('Does anyone else find...') rather than a directive to click a link. This aligns with Reddit's preference for authentic storytelling over astroturfing or direct self-promotion.


### Module 3: MyLead generation
- Status: PASS
- Duration: 82764 ms
- Compliance score: 92
- Validation: Risk notice + review tone + sub1-sub5 valid
- Notes:
  - Headline: I finally stopped guessing what I’m actually paying in fees
  - Body preview: Honestly, I used to just look at the headline exchange rate and call it a day. Then I realized I was getting hit with these vague 'network congestion' surcharges and withdrawal lim
  - Macro: {"traffic_source":"sub1","campaign_id":"sub2","variant":"sub3","click_id":"sub4","geo":"sub5"}
  - Guard: The post exhibits a high level of organic, first-person narrative tone typical of genuine user experiences on Reddit. It avoids aggressive sales language, affiliate links, or direct product promotion. The content focuses on a personal workflow improvement (testing fee structures) rather than recommending a specific brand, which mitigates astroturfing risks. The inclusion of a clear disclaimer ('not financial advice') and the absence of guaranteed income or success claims ensure compliance with consumer protection guidelines. The CTA is soft and community-oriented, inviting discussion rather than driving traffic to an external commercial entity.


### Module 4: Compliance Stress Test
- Status: PASS
- Duration: 1 ms
- Compliance score: 0
- Validation: Non-compliant draft rejected by ComplianceGuard
- Notes:
  - Flagged keywords: click here, DIRECT_SPAM_CTA, CTA_STEALTH_POLICY_VIOLATION
  - Detected violations: BLACKLISTED_SPAM_PATTERN_TRIGGERED, ZERO_TOLERANCE_POLICY


### Module 5: Memory Convergence
- Status: PASS
- Duration: 4 ms
- Compliance score: 100
- Validation: Static rules and memory wins blend without network bleed
- Notes:
  - Prompt preview: 

### NETWORK MEMORY (LOSPOLLOS)
WINNING HISTORICAL EXAMPLES:
WIN 1 | Hook: "The weird relief of answering questions instead of swiping" | CTA: "Does anyone else find that the 'vibe check' is way hard
  - Directives: 18+ Community Guidelines | Confidentiality Notice | Do not use prohibited tactic: bot_traffic

