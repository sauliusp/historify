/**
 * Available time frames for history analysis.
 */
export type TimeFrame = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';

/**
 * Represents a browser history item.
 */
export interface HistoryItem {
  url: string;
  title: string;
  visitCount: number;
  lastVisitTime: number;
}

/**
 * Represents a bookmark suggestion.
 */
export interface BookmarkSuggestion {
  url: string;
  title: string;
  visitCount: number;
}

/**
 * Dimensions interface for visualizations.
 */
export interface Dimensions {
  width: number;
  height: number;
} 