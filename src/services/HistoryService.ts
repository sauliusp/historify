/**
 * Service for managing browser history operations.
 */
import {TimeFrame, HistoryItem} from '../types';

export class HistoryService {
  private static instance: HistoryService;

  /**
   * Private constructor to prevent direct instantiation.
   */
  private constructor() {}

  /**
   * Gets the singleton instance of HistoryService.
   * @return {HistoryService} The singleton instance.
   */
  public static getInstance(): HistoryService {
    if (!HistoryService.instance) {
      HistoryService.instance = new HistoryService();
    }
    return HistoryService.instance;
  }

  /**
   * Retrieves browser history for the specified timeframe.
   * @param {TimeFrame} timeframe The timeframe to fetch history for.
   * @return {Promise<HistoryItem[]>} Promise resolving to history items.
   */
  public async getHistory(timeframe: TimeFrame): Promise<HistoryItem[]> {
    const startTime = this.getStartTime(timeframe);
    
    return new Promise((resolve) => {
      chrome.history.search({
        text: '',
        startTime,
        maxResults: 1000,
      }, (historyItems) => {
        resolve(historyItems.map((item) => ({
          url: item.url!,
          title: item.title!,
          visitCount: item.visitCount!,
          lastVisitTime: item.lastVisitTime!,
        })));
      });
    });
  }

  /**
   * Calculates the start time for a given timeframe.
   * @param {TimeFrame} timeframe The timeframe to calculate for.
   * @return {number} The start time in milliseconds.
   */
  private getStartTime(timeframe: TimeFrame): number {
    const now = new Date();
    switch (timeframe) {
      case 'daily':
        return now.setHours(0, 0, 0, 0);
      case 'weekly':
        return now.setDate(now.getDate() - 7);
      case 'monthly':
        return now.setMonth(now.getMonth() - 1);
      case 'quarterly':
        return now.setMonth(now.getMonth() - 3);
      case 'yearly':
        return now.setFullYear(now.getFullYear() - 1);
      default:
        return now.setHours(0, 0, 0, 0);
    }
  }
} 