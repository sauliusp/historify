/**
 * Service for managing bookmark suggestions.
 */
import {HistoryItem, BookmarkSuggestion} from '../types';

interface BookmarkStatus {
  url: string;
  isBookmarked: boolean;
}

class BookmarkSuggestionService {
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
   * Creates a new bookmark
   * @param {string} url URL to bookmark
   * @param {string} title Title for the bookmark
   * @return {Promise<void>}
   */
  public async createBookmark(url: string, title: string): Promise<void> {
    return new Promise((resolve) => {
      chrome.bookmarks.create(
        {
          parentId: '1',
          url,
          title,
        },
        () => resolve(),
      );
    });
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
      .sort((a, b) => b.timeframeVisits - a.timeframeVisits)
      .slice(0, 10)
      .map((item) => ({
        url: item.url,
        title: item.title,
        timeframeVisits: item.timeframeVisits,
        isBookmarked: existingBookmarks.includes(item.url),
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

export const bookmarkSuggestionService =
  BookmarkSuggestionService.getInstance();
