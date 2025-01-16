/**
 * Component for visualizing domain visit statistics.
 */
import React, {useEffect, useRef, useState} from 'react';
import * as d3 from 'd3';
import {HistoryItem, Dimensions} from '../types';

interface DomainVisualizationProps {
  data: HistoryItem[];
}

/**
 * Renders a bar chart showing top visited domains.
 */
export const DomainVisualization: React.FC<DomainVisualizationProps> = ({
  data,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState<Dimensions>({
    width: 0,
    height: 0,
  });

  /**
   * Updates the dimensions of the visualization container.
   */
  const updateDimensions = () => {
    if (containerRef.current) {
      setDimensions({
        width: containerRef.current.clientWidth,
        height: Math.min(containerRef.current.clientWidth * 0.6, 400),
      });
    }
  };

  useEffect(() => {
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  useEffect(() => {
    if (!data.length || !svgRef.current || !dimensions.width) return;

    // Clear previous visualization
    d3.select(svgRef.current).selectAll('*').remove();

    const margin = {top: 20, right: 30, bottom: 100, left: 50};
    const width = dimensions.width - margin.left - margin.right;
    const height = dimensions.height - margin.top - margin.bottom;

    // Process data
    const domainCounts = d3
      .rollups(
        data,
        (v) => v.length,
        (d) => new URL(d.url).hostname,
      )
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10);

    // Create SVG
    const svg = d3
      .select(svgRef.current)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Create scales
    const x = d3
      .scaleBand()
      .range([0, width])
      .padding(0.2)
      .domain(domainCounts.map((d) => d[0]));

    const y = d3
      .scaleLinear()
      .range([height, 0])
      .domain([0, d3.max(domainCounts, (d) => d[1]) || 0]);

    // Add gradient
    const gradient = svg
      .append('defs')
      .append('linearGradient')
      .attr('id', 'bar-gradient')
      .attr('gradientUnits', 'userSpaceOnUse')
      .attr('x1', 0)
      .attr('y1', height)
      .attr('x2', 0)
      .attr('y2', 0);

    gradient
      .append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#2196f3')
      .attr('stop-opacity', 0.6);

    gradient
      .append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#2196f3')
      .attr('stop-opacity', 0.9);

    // Add bars
    svg
      .selectAll('.bar')
      .data(domainCounts)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', (d) => x(d[0]) || 0)
      .attr('width', x.bandwidth())
      .attr('y', (d) => y(d[1]))
      .attr('height', (d) => height - y(d[1]))
      .attr('fill', 'url(#bar-gradient)');

    // Add axes
    svg
      .append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll('text')
      .attr('transform', 'rotate(-45)')
      .style('text-anchor', 'end');

    svg
      .append('g')
      .call(d3.axisLeft(y))
      .call((g) => g.select('.domain').remove());

    // Add grid lines
    svg
      .append('g')
      .attr('class', 'grid')
      .attr('opacity', 0.1)
      .call(
        d3
          .axisLeft(y)
          .tickSize(-width)
          .tickFormat(() => ''),
      );
  }, [data, dimensions]);

  return (
    <div ref={containerRef} className="visualization-container">
      <svg ref={svgRef} />
    </div>
  );
};
