import fs from 'fs';
import path from 'path';

export const WARMUP_BLACKLIST_SUBREDDITS = new Set([
  'dating',
  'tinder',
  'dating_advice',
  'relationship_advice',
]);

export const WARMUP_WHITELIST_SUBREDDITS = [
  'AskReddit',
  'NoStupidQuestions',
  'CasualConversation',
];

export interface RedditAccountStatus {
  username: string;
  comment_karma: number;
  link_karma: number;
  total_karma: number;
  karma_threshold_reached: boolean;
  allowed_subreddits: string[];
  updated_at: number;
}

export function resolveAccountStatusPath(): string {
  const prodPath = '/var/www/affiliate/core/data/reddit_account_status.json';
  if (fs.existsSync('/var/www/affiliate/core/data')) {
    return prodPath;
  }
  const localCandidates = [
    path.resolve(process.cwd(), 'core/data'),
    path.resolve(process.cwd(), 'data'),
  ];
  for (const c of localCandidates) {
    if (fs.existsSync(c)) {
      return path.join(c, 'reddit_account_status.json');
    }
  }
  return path.resolve(process.cwd(), 'core/data/reddit_account_status.json');
}

export function getRedditAccountStatus(): RedditAccountStatus {
  const filePath = resolveAccountStatusPath();
  try {
    if (fs.existsSync(filePath)) {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      if (typeof data.comment_karma === 'number') {
        return data;
      }
    }
  } catch {}

  // Safe fallback default: comment_karma = 1 (Cold seed warmup mode)
  return {
    username: process.env.REDDIT_USERNAME || 'sov2008',
    comment_karma: 1,
    link_karma: 0,
    total_karma: 1,
    karma_threshold_reached: false,
    allowed_subreddits: [...WARMUP_WHITELIST_SUBREDDITS],
    updated_at: Date.now(),
  };
}

export function saveRedditAccountStatus(status: RedditAccountStatus): void {
  const filePath = resolveAccountStatusPath();
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    try {
      fs.mkdirSync(dir, { recursive: true });
    } catch {}
  }
  fs.writeFileSync(filePath, JSON.stringify(status, null, 2), 'utf8');
}
