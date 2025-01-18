/**
 * Dashboard component containing all visualizations.
 */
import React, {useEffect, useState} from 'react';
import {HistoryVisualization} from './HistoryVisualization';
import {DomainVisualization} from './DomainVisualization';
import {
  TimeFrame,
  HistoryItem,
  BookmarkSuggestion,
  TimeframeOption,
  DateRange,
} from '../types';
import {historyService} from 'services/HistoryService';
import {bookmarkSuggestionService} from 'services/BookmarkSuggestionService';
import {CustomDateRangePicker} from './DateRangePicker';
import {HierarchyVisualization} from './HierarchyVisualization';

/**
 * Main dashboard component for the history visualizer.
 */
export const Dashboard: React.FC = () => {
  const [timeframeOption, setTimeframeOption] = useState<TimeframeOption>({
    type: 'daily',
  });
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: null,
    endDate: null,
  });
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [suggestions, setSuggestions] = useState<BookmarkSuggestion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        await handleHistoryItems(timeframeOption);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [timeframeOption]);

  const handleHistoryItems = async (timeframeOption: TimeframeOption) => {
    setTimeframeOption(timeframeOption);
    const historyItems = await historyService.getHistory(timeframeOption);
    const bookmarkSuggestions =
      await bookmarkSuggestionService.getSuggestions(historyItems);
    setHistory(historyItems);
    setSuggestions(bookmarkSuggestions);
  };

  const handleBookmark = async (suggestion: BookmarkSuggestion) => {
    if (!suggestion.isBookmarked) {
      await bookmarkSuggestionService.createBookmark(
        suggestion.url,
        suggestion.title,
      );
      // Refresh suggestions after bookmarking
      const newSuggestions =
        await bookmarkSuggestionService.getSuggestions(history);
      setSuggestions(newSuggestions);
    }
  };

  const handleTimeframeChange = (value: TimeFrame | 'custom') => {
    if (value === 'custom') {
      setTimeframeOption({
        type: 'custom',
        dateRange,
      });
    } else {
      setTimeframeOption({type: value});
      setDateRange({startDate: null, endDate: null});
    }
  };

  const handleDateRangeChange = (dates: [Date | null, Date | null]) => {
    const [start, end] = dates;
    const newDateRange = {startDate: start, endDate: end};
    setDateRange(newDateRange);

    if (start && end) {
      setTimeframeOption({
        type: 'custom',
        dateRange: newDateRange,
      });
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="dashboard">
      <div className="controls">
        <div className="timeframe-selector">
          <label htmlFor="timeframe">Time Range:</label>
          <select
            id="timeframe"
            value={timeframeOption.type}
            onChange={(e) =>
              handleTimeframeChange(e.target.value as TimeFrame | 'custom')
            }
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
            <option value="yearly">Yearly</option>
            <option value="custom">Custom Range</option>
          </select>

          {timeframeOption.type === 'custom' && (
            <CustomDateRangePicker
              dateRange={dateRange}
              onDateRangeChange={handleDateRangeChange}
            />
          )}
        </div>
      </div>

      <div className="visualizations-grid">
        <div className="visualization-card">
          <h2>Browsing Activity by Hour</h2>
          <HistoryVisualization data={history} />
        </div>

        <div className="visualization-card">
          <h2>Top Visited Domains</h2>
          <DomainVisualization data={history} />
        </div>

        <div className="visualization-card">
          <h2>Domain Hierarchy</h2>
          <HierarchyVisualization data={history} />
        </div>
      </div>

      <div className="suggestions-panel">
        <h2>Recommended Bookmarks</h2>
        <div className="suggestions-grid">
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className={`suggestion-card ${suggestion.isBookmarked ? 'bookmarked' : ''}`}
            >
              <h3>{suggestion.title}</h3>
              <a
                href={suggestion.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                {new URL(suggestion.url).hostname}
              </a>
              <span className="visit-count">
                {suggestion.timeframeVisits} visits in this period
              </span>
              <button
                onClick={() => handleBookmark(suggestion)}
                className="bookmark-button"
                disabled={suggestion.isBookmarked}
              >
                {suggestion.isBookmarked ? 'Bookmarked' : 'Add Bookmark'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
