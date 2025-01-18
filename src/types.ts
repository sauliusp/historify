/**
 * Available time frames for history analysis.
 */
export type TimeFrame = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';

/**
 * Extends chrome.history.HistoryItem with additional properties
 */
export interface HistoryItem extends chrome.history.HistoryItem {
  timeframeVisits: number;
}

/**
 * Represents a bookmark suggestion.
 */
export interface BookmarkSuggestion {
  url: string;
  title: string;
  timeframeVisits: number;
  isBookmarked: boolean;
}

/**
 * Dimensions interface for visualizations.
 */
export interface Dimensions {
  width: number;
  height: number;
}

export interface DateRange {
  startDate: Date | null;
  endDate: Date | null;
}

export interface TimeframeOption {
  type: TimeFrame | 'custom';
  dateRange?: DateRange;
}
