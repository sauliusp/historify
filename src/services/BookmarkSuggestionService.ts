/**
 * Service for managing bookmark suggestions.
 */
import {HistoryItem, BookmarkSuggestion} from '../types';

export class BookmarkSuggestionService {
  private static instance: BookmarkSuggestionService;

  /**
   * Private constructor to prevent direct instantiation.
   */
  private constructor() {}

  /**
   * Gets the singleton instance of BookmarkSuggestionService.
   * @return {BookmarkSuggestionService} The singleton instance.
   */
  public static getInstance(): BookmarkSuggestionService {
    if (!BookmarkSuggestionService.instance) {
      BookmarkSuggestionService.instance = new BookmarkSuggestionService();
    }
    return BookmarkSuggestionService.instance;
  }

  /**
   * Generates bookmark suggestions based on browsing history.
   * @param {HistoryItem[]} historyItems Array of history items.
   * @return {Promise<BookmarkSuggestion[]>} Promise resolving to suggestions.
   */
  public async getSuggestions(
    historyItems: HistoryItem[],
  ): Promise<BookmarkSuggestion[]> {
    const existingBookmarks = await this.getExistingBookmarks();
    
    return historyItems
      .filter((item) => !existingBookmarks.includes(item.url))
      .sort((a, b) => b.visitCount - a.visitCount)
      .slice(0, 5)
      .map((item) => ({
        url: item.url,
        title: item.title,
        visitCount: item.visitCount,
      }));
  }

  /**
   * Retrieves existing bookmarks from the browser.
   * @return {Promise<string[]>} Promise resolving to bookmark URLs.
   */
  private async getExistingBookmarks(): Promise<string[]> {
    return new Promise((resolve) => {
      chrome.bookmarks.getTree((bookmarkItems) => {
        const urls: string[] = [];
        const processNode = (node: chrome.bookmarks.BookmarkTreeNode) => {
          if (node.url) urls.push(node.url);
          if (node.children) node.children.forEach(processNode);
        };
        bookmarkItems.forEach(processNode);
        resolve(urls);
      });
    });
  }
} 