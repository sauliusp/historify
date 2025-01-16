/**
 * Component for visualizing browsing history data.
 */
import React, {useEffect, useRef, useState} from 'react';
import * as d3 from 'd3';
import {HistoryItem, Dimensions} from '../types';

interface HistoryVisualizationProps {
  data: HistoryItem[];
}

/**
 * Renders a line chart showing browsing activity by hour.
 */
export const HistoryVisualization: React.FC<HistoryVisualizationProps> = ({
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

    const margin = {top: 20, right: 30, bottom: 40, left: 50};
    const width = dimensions.width - margin.left - margin.right;
    const height = dimensions.height - margin.top - margin.bottom;

    // Create SVG
    const svg = d3
      .select(svgRef.current)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Process data
    const hourlyData = d3
      .rollups(
        data,
        (v) => v.length,
        (d) => new Date(d.lastVisitTime).getHours(),
      )
      .sort(([a], [b]) => a - b);

    // Create scales
    const x = d3.scaleLinear().domain([0, 23]).range([0, width]);
    const y = d3
      .scaleLinear()
      .domain([0, d3.max(hourlyData, (d) => d[1]) || 0])
      .range([height, 0]);

    // Create area generator
    const area = d3
      .area<[number, number]>()
      .x((d) => x(d[0]))
      .y0(height)
      .y1((d) => y(d[1]))
      .curve(d3.curveMonotoneX);

    // Add gradient
    const gradient = svg
      .append('defs')
      .append('linearGradient')
      .attr('id', 'area-gradient')
      .attr('gradientUnits', 'userSpaceOnUse')
      .attr('x1', 0)
      .attr('y1', height)
      .attr('x2', 0)
      .attr('y2', 0);

    gradient
      .append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#2196f3')
      .attr('stop-opacity', 0.1);

    gradient
      .append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#2196f3')
      .attr('stop-opacity', 0.4);

    // Add area
    svg
      .append('path')
      .datum(hourlyData)
      .attr('fill', 'url(#area-gradient)')
      .attr('d', area);

    // Add line
    const line = d3
      .line<[number, number]>()
      .x((d) => x(d[0]))
      .y((d) => y(d[1]))
      .curve(d3.curveMonotoneX);

    svg
      .append('path')
      .datum(hourlyData)
      .attr('fill', 'none')
      .attr('stroke', '#2196f3')
      .attr('stroke-width', 2)
      .attr('d', line);

    // Add axes
    const xAxis = d3
      .axisBottom(x)
      .ticks(24)
      .tickFormat((d) => `${d}h`);

    const yAxis = d3.axisLeft(y);

    svg
      .append('g')
      .attr('transform', `translate(0,${height})`)
      .call(xAxis)
      .call((g) => g.select('.domain').remove());

    svg
      .append('g')
      .call(yAxis)
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
