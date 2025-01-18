/**
 * Component for visualizing hierarchical browsing data using circle packing.
 */
import React, {useEffect, useRef, useState} from 'react';
import * as d3 from 'd3';
import {HistoryItem, Dimensions} from '../types';

interface HierarchyVisualizationProps {
  data: HistoryItem[];
}

interface HierarchyNode {
  name: string;
  children?: HierarchyNode[];
  value?: number;
  url?: string;
}

export const HierarchyVisualization: React.FC<HierarchyVisualizationProps> = ({
  data,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState<Dimensions>({
    width: 0,
    height: 0,
  });

  const updateDimensions = () => {
    if (containerRef.current) {
      const size = Math.min(containerRef.current.clientWidth, 800);
      setDimensions({
        width: size,
        height: size,
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

    // Process data into hierarchical structure
    const hierarchyData: HierarchyNode = {name: 'root', children: []};
    const domainMap = new Map<string, HierarchyNode>();

    data.forEach((item) => {
      try {
        const url = new URL(item.url);
        const domain = url.hostname;
        const path = url.pathname;

        if (!domainMap.has(domain)) {
          const domainNode: HierarchyNode = {
            name: domain,
            children: [],
          };
          domainMap.set(domain, domainNode);
          hierarchyData.children!.push(domainNode);
        }

        const domainNode = domainMap.get(domain)!;
        domainNode.children!.push({
          name: item.title || path,
          value: item.timeframeVisits,
          url: item.url,
        });
      } catch (e) {
        // Skip invalid URLs
      }
    });

    const color = d3
      .scaleLinear<string>()
      .domain([0, 5])
      .range(['hsl(152,80%,80%)', 'hsl(228,30%,40%)'])
      .interpolate(d3.interpolateHcl);

    const pack = (data: any) =>
      d3.pack().size([dimensions.width, dimensions.height]).padding(3)(
        d3
          .hierarchy(data)
          .sum((d) => d.value)
          .sort((a, b) => (b.value || 0) - (a.value || 0)),
      );

    const root = pack(hierarchyData);
    let focus = root;
    let view: [number, number, number] = [root.x, root.y, root.r * 2];

    const svg = d3
      .select(svgRef.current)
      .attr(
        'viewBox',
        `-${dimensions.width / 2} -${dimensions.height / 2} ${dimensions.width} ${dimensions.height}`,
      )
      .style('display', 'block')
      .style('margin', '0 -14px')
      .style('background', 'white')
      .style('cursor', 'pointer')
      .on('click', (event) => zoom(event, root));

    const node = svg
      .append('g')
      .selectAll('circle')
      .data(root.descendants().slice(1))
      .join('circle')
      .attr('fill', (d) => (d.children ? color(d.depth) : 'white'))
      .attr('fill-opacity', (d) => (d.children ? 1 : 0.7))
      .attr('pointer-events', (d) => (!d.children ? 'none' : null))
      .on('mouseover', function () {
        d3.select(this).attr('stroke', '#000');
      })
      .on('mouseout', function () {
        d3.select(this).attr('stroke', null);
      })
      .on(
        'click',
        (event, d) => focus !== d && (zoom(event, d), event.stopPropagation()),
      );

    const label = svg
      .append('g')
      .style('font', '10px sans-serif')
      .attr('pointer-events', 'all')
      .attr('text-anchor', 'middle')
      .selectAll('text')
      .data(root.descendants())
      .join('text')
      .style('fill-opacity', (d) => (d.parent === root ? 1 : 0))
      .style('display', (d) => (d.parent === root ? 'inline' : 'none'))
      .text((d) => d.data.name)
      .style('cursor', (d) => (d.data.url ? 'pointer' : 'default'))
      .on('click', (event, d) => {
        event.stopPropagation();
        if (d.data.url) {
          window.open(d.data.url, '_blank');
        }
      });

    function zoomTo(v: [number, number, number]) {
      const k = dimensions.width / v[2];

      view = v;

      label.attr(
        'transform',
        (d) => `translate(${(d.x - v[0]) * k},${(d.y - v[1]) * k})`,
      );
      node.attr(
        'transform',
        (d) => `translate(${(d.x - v[0]) * k},${(d.y - v[1]) * k})`,
      );
      node.attr('r', (d) => d.r * k);
    }

    function zoom(event: any, d: any) {
      const focus0 = focus;
      focus = d;

      const transition = svg
        .transition()
        .duration(event.altKey ? 7500 : 750)
        .tween('zoom', (d) => {
          const i = d3.interpolateZoom(view, [focus.x, focus.y, focus.r * 2]);
          return (t) => zoomTo(i(t));
        });

      label
        .filter(function (d: any) {
          return d.parent === focus || this.style.display === 'inline';
        })
        .transition(transition)
        .style('fill-opacity', (d) => (d.parent === focus ? 1 : 0))
        .on('start', function (d: any) {
          if (d.parent === focus) this.style.display = 'inline';
        })
        .on('end', function (d: any) {
          if (d.parent !== focus) this.style.display = 'none';
        });
    }

    zoomTo([root.x, root.y, root.r * 2]);
  }, [data, dimensions]);

  return (
    <div ref={containerRef} className="visualization-container">
      <svg ref={svgRef} />
    </div>
  );
};
