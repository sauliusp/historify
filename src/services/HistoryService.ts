/**
 * Service for managing browser history operations.
 */
import {TimeFrame, HistoryItem, TimeframeOption} from '../types';

class HistoryService {
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
   * Gets visit count for a URL within a specific timeframe
   */
  private async getVisitsInTimeframe(
    url: string,
    startTime: number,
  ): Promise<number> {
    const visits = await chrome.history.getVisits({url});
    return visits.filter(
      (visit) => visit.visitTime && visit.visitTime >= startTime,
    ).length;
  }

  /**
   * Retrieves browser history for the specified timeframe.
   */
  public async getHistory(
    timeframeOption: TimeframeOption,
  ): Promise<HistoryItem[]> {
    const startTime =
      timeframeOption.type === 'custom' && timeframeOption.dateRange?.startDate
        ? timeframeOption.dateRange.startDate.getTime()
        : this.getStartTime(timeframeOption.type as TimeFrame);

    const endTime =
      timeframeOption.type === 'custom' && timeframeOption.dateRange?.endDate
        ? timeframeOption.dateRange.endDate.getTime()
        : Date.now();

    const historyItems = await chrome.history.search({
      text: '',
      startTime,
      endTime,
      maxResults: 10000,
    });

    // Process each history item to include timeframe-specific visit count
    const processedItems = await Promise.all(
      historyItems.map(async (item) => {
        if (!item.url) return null;

        const timeframeVisits = await this.getVisitsInTimeframe(
          item.url,
          startTime,
        );

        return {
          ...item,
          timeframeVisits,
          url: item.url,
          title: item.title || '',
          visitCount: item.visitCount || 0,
          lastVisitTime: item.lastVisitTime || 0,
        } as HistoryItem;
      }),
    );

    return processedItems.filter((item): item is HistoryItem => item !== null);
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

export const historyService = HistoryService.getInstance();
