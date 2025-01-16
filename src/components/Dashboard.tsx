/**
 * Dashboard component containing all visualizations.
 */
import React, {useEffect, useState} from 'react';
import {HistoryService} from '../services/HistoryService';
import {BookmarkSuggestionService} from '../services/BookmarkSuggestionService';
import {HistoryVisualization} from './HistoryVisualization';
import {DomainVisualization} from './DomainVisualization';
import {TimeFrame, HistoryItem, BookmarkSuggestion} from '../types';

/**
 * Main dashboard component for the history visualizer.
 */
export const Dashboard: React.FC = () => {
  const [timeframe, setTimeframe] = useState<TimeFrame>('daily');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [suggestions, setSuggestions] = useState<BookmarkSuggestion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const historyService = HistoryService.getInstance();
        const bookmarkService = BookmarkSuggestionService.getInstance();

        const historyItems = await historyService.getHistory(timeframe);
        setHistory(historyItems);

        const bookmarkSuggestions =
          await bookmarkService.getSuggestions(historyItems);
        setSuggestions(bookmarkSuggestions);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [timeframe]);

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
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value as TimeFrame)}
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
            <option value="yearly">Yearly</option>
          </select>
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
      </div>

      <div className="suggestions-panel">
        <h2>Recommended Bookmarks</h2>
        <div className="suggestions-grid">
          {suggestions.map((suggestion, index) => (
            <div key={index} className="suggestion-card">
              <h3>{suggestion.title}</h3>
              <a
                href={suggestion.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                {new URL(suggestion.url).hostname}
              </a>
              <span className="visit-count">
                {suggestion.visitCount} visits
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
