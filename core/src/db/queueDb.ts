/**
 * @deprecated Use ContentQueueRepository from './queueRepository.js' instead.
 * This file is retained as a backward-compatibility proxy.
 */

import {
  ContentQueueRepository,
  ContentQueueItem,
  QueueStatus,
  TargetPlatform,
} from './queueRepository.js';

export { QueueStatus, TargetPlatform };

export interface QueueItem {
  id: string;
  campaign_id: string;
  target_platform: TargetPlatform;
  hook: string;
  body: string;
  cta: string;
  image_path: string;
  risk_score: number;
  status: QueueStatus;
  created_at: number;
  scheduled_for?: number | null;
  published_url?: string | null;
  published_at?: number | null;
}

/**
 * @deprecated Use ContentQueueRepository instead.
 */
export class QueueDatabase {
  private static instance: QueueDatabase | null = null;
  private repo: ContentQueueRepository;

  private constructor() {
    this.repo = ContentQueueRepository.getInstance();
  }

  public static getInstance(): QueueDatabase {
    if (!this.instance) {
      this.instance = new QueueDatabase();
    }
    return this.instance;
  }

  public enqueue(
    item: Omit<QueueItem, 'id' | 'created_at' | 'status'> & Partial<Pick<QueueItem, 'id' | 'status' | 'created_at'>>
  ): QueueItem {
    const record = this.repo.enqueue({
      id: item.id,
      campaign_id: item.campaign_id,
      network: 'lospollos',
      target_platform: item.target_platform,
      hook: item.hook,
      body: item.body,
      stealth_cta: item.cta,
      tracking_url: '',
      image_path: item.image_path,
      risk_score: item.risk_score,
      status: item.status,
      published_url: item.published_url,
      created_at: item.created_at,
    });

    return {
      id: record.id,
      campaign_id: record.campaign_id,
      target_platform: record.target_platform,
      hook: record.hook,
      body: record.body,
      cta: record.stealth_cta,
      image_path: record.image_path,
      risk_score: record.risk_score,
      status: record.status,
      created_at: record.created_at,
      published_url: record.published_url,
      published_at: record.updated_at,
    };
  }

  public listPending(limit: number = 50): QueueItem[] {
    return this.repo.listPending(limit).map((r) => this.mapRecord(r));
  }

  public listAll(status?: QueueStatus, limit: number = 100): QueueItem[] {
    return this.repo.listAll(status, limit).map((r) => this.mapRecord(r));
  }

  public updateStatus(id: string, status: QueueStatus): boolean {
    return this.repo.updateStatus(id, status);
  }

  public markDispatched(id: string, publishedUrl: string): boolean {
    return this.repo.markDispatched(id, publishedUrl);
  }

  public getNextApproved(platform?: TargetPlatform): QueueItem | null {
    const approved = this.repo.listApproved(10);
    const item = platform ? approved.find((a) => a.target_platform === platform) : approved[0];
    return item ? this.mapRecord(item) : null;
  }

  public deleteItem(id: string): boolean {
    return this.repo.deleteItem(id);
  }

  public getStats(): { total: number; pending: number; approved: number; rejected: number; dispatched: number } {
    return this.repo.getStats();
  }

  private mapRecord(r: ContentQueueItem): QueueItem {
    return {
      id: r.id,
      campaign_id: r.campaign_id,
      target_platform: r.target_platform,
      hook: r.hook,
      body: r.body,
      cta: r.stealth_cta,
      image_path: r.image_path,
      risk_score: r.risk_score,
      status: r.status,
      created_at: r.created_at,
      published_url: r.published_url,
      published_at: r.updated_at,
    };
  }
}
