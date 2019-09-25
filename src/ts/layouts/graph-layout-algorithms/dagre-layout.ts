import * as d3 from 'd3';
import { Delaunay } from 'd3-delaunay';
import { AlloyGraph } from '../../graph/alloy-graph';
import { rectangle } from '../graph-node-shapes/rectangle';
import { line } from '../graph-edge-shapes/line';
import { node_label } from '../graph-node-shapes/node-label';
import { edge_label } from '../graph-node-shapes/edge-label';
import { arrow } from '../graph-edge-shapes/arrow';
declare const dagre: any;

export class DagreLayout {

    _include_private_nodes: boolean = false;

    _props;
    _nodes;
    _edges;
    _links;
    
    _svg;
    _sig_group;
    _edge_group;
    _atom_group;
    _zoom;

    _svg_width;
    _svg_height;

    _atom_rect;
    _atom_label;
    _edge_line;
    _edge_label;
    _edge_arrow;
    _sig_rect;
    _sig_label;
    _hover_edge_line;
    _hover_edge_label;
    _hover_edge_label_bg;
    _hover_edge_arrow;

    _points;
    _delaunay;
    _delaunaygroup;

    _rank_sep: number = 100;
    _node_width: number = 150;
    _node_height: number = 50;

    constructor (svg) {

        this._svg = svg;
        this._svg_width = parseInt(this._svg.style('width'));
        this._svg_height = parseInt(this._svg.style('height'));

        this._zoom = d3.zoom()
            .on('zoom', () => {
                if (this._sig_group) this._sig_group.attr('transform', d3.event.transform);
                if (this._edge_group) this._edge_group.attr('transform', d3.event.transform);
                if (this._atom_group) this._atom_group.attr('transform', d3.event.transform);
                if (this._delaunaygroup) this._delaunaygroup.attr('transform', d3.event.transform);
            });

        this._svg
            .call(this._zoom);

        this._init_styles();
    }
    
    height () {
        return this._props ? this._props.height : 0;
    }

    layout (graph: AlloyGraph) {

        let { tree, edges } = graph.graph();

        let transition = this._svg.transition().duration(500);

        this._position_compound_graph(tree, edges);

        let signatures = tree.descendants().filter(node => node.data.expressionType() === 'signature');
        let atoms = tree.descendants().filter(node => node.data.expressionType() === 'atom');

        this._sig_group = this._svg
            .selectAll('g.signatures')
            .data([signatures])
            .join('g')
            .attr('class', 'signatures');

        this._edge_group = this._svg
            .selectAll('g.edges')
            .data([edges])
            .join('g')
            .attr('class', 'edges');

        this._atom_group = this._svg
            .selectAll('g.atoms')
            .data([atoms])
            .join('g')
            .attr('class', 'atoms');

        this._sig_group
            .selectAll('g.signature')
            .data(d => d, d => d.data.id())
            .join('g')
            .sort((a, b) => a.depth - b.depth)
            .attr('class', 'signature')
            .attr('id', d => d.data.id())
            .attr('transform', d => `translate(${d.x},${d.y})`)
            .call(this._sig_rect)
            .call(this._sig_label);

        this._edge_group
            .selectAll('g.edge')
            .data(d => d, d => d.data.id())
            .join('g')
            .attr('class', 'edge')
            .call(this._edge_line)
            .call(this._edge_label)
            .call(this._edge_arrow);

        this._atom_group
            .selectAll('g.atom')
            .data(d => d, d => d.data.id())
            .join('g')
            .attr('class', 'atom')
            .attr('transform', d => `translate(${d.x},${d.y})`)
            .call(this._atom_rect)
            .call(this._atom_label);

        this._make_voronoi();

        let w = parseInt(this._svg.style('width')),
            h = parseInt(this._svg.style('height')),
            scale = 0.9 / Math.max(this.width() / w, this.height() / h);

        transition
            .call(this._zoom.transform, d3.zoomIdentity
                .translate(w / 2, h / 2)
                .scale(scale)
                .translate(-this.width() / 2, -this.height() / 2)
            );

        this._svg
            .select('#univ')
            .style('display', 'none');

    }

    edges () {
        return this._edges;
    }

    nodes () {
        return this._nodes;
    }

    links () {
        return this._links;
    }

    width () {
        return this._props ? this._props.width : 0;
    }

    _graph_properties () {
        return {
            ranksep: this._rank_sep
        };
    }

    _init_styles () {

        this._atom_rect = rectangle()
            .attr('rx', 2)
            .style('stroke', '#222')
            .style('fill', 'steelblue');
        this._atom_label = node_label()
            .style('fill', 'white')
            .style('font-weight', 'bold');

        this._sig_rect = rectangle()
            .attr('rx', 2)
            .attr('stroke', '#777');
        this._sig_label = node_label()
            .placement('tl')
            .style('fill', '#777');

        this._edge_arrow = arrow();
        this._edge_line = line();
        this._edge_label = edge_label()
            .attr('fill', '#777');

        this._hover_edge_line = line()
            .style('stroke', 'steelblue')
            .style('stroke-width', 3);
        this._hover_edge_label = edge_label()
            .attr('font-size', '16px')
            .attr('font-weight', 'bold');

        this._hover_edge_label_bg = edge_label()
            .selector('.bg')
            .attr('font-size', '16px')
            .attr('font-weight', 'bold')
            .attr('stroke-linejoin', 'round')
            .attr('stroke-width', 15)
            .attr('stroke', 'white');

        this._hover_edge_arrow = arrow()
            .style('stroke', 'steelblue')
            .style('fill', 'steelblue')
            .width(4);
    }

    _position_compound_graph (tree, edges) {

        let graph = new dagre.graphlib.Graph({multigraph: true, compound: true});
        let props = this._graph_properties();

        graph.setGraph(props);
        graph.setDefaultEdgeLabel(function () { return {} });

        tree.each(node => {
            node.width = this._node_width;
            node.height = this._node_height;
        });

        edges.forEach(edge => {
            edge.labelpos = 'c';
            edge.width = 1;
            edge.height = 1;
            edge.label = _edge_label(edge)
        });

        tree.each(node => graph.setNode(node.data.id(), node));
        edges.forEach(edge => graph.setEdge(edge.source.id(), edge.target.id(), edge, edge.data.id()));

        tree.each(node => {
            if (node.children) {
                node.children.forEach(child => {
                    graph.setParent(child.data.id(), node.data.id());
                });
            }
        });

        dagre.layout(graph);

        this._props = props;
        this._nodes = tree.descendants();
        this._edges = edges;

    }

    _make_voronoi () {

        this._points = [];
        let points = this._points;

        this._edge_group
            .selectAll('g.edge')
            .each(function (d) {
                d.points.forEach(point => {
                    points.push({
                        x: point.x,
                        y: point.y,
                        element: this
                    });
                });
            });

        this._delaunay = Delaunay
            .from(points, d => d.x, d => d.y)
            .voronoi(_padded_bbox(points, 20));

        let paths = Array.from(this._delaunay.cellPolygons());

        let line = d3.line();

        this._delaunaygroup = this._svg
            .selectAll('g.delaunay')
            .data([paths])
            .join('g')
            .attr('class', 'delaunay');

        this._delaunaygroup
            .selectAll('path')
            .data(d => d)
            .join('path')
            .attr('fill', 'transparent')
            .attr('stroke', 'none')
            .attr('d', line)
            .on('mouseover', (d, i) => {
                let s = d3.select(this._points[i].element)
                    .call(this._hover_edge_line)
                    .call(this._hover_edge_arrow)
                    .call(this._hover_edge_label)
                    .raise();
                this._hover_edge_label_bg(s)
                    .attr('class', 'bg')
                    .lower();
            })
            .on('mouseout', (d, i) => {
                let s = d3.select(this._points[i].element);
                s.selectAll('.bg')
                    .remove();
                s
                    .call(this._edge_line)
                    .call(this._edge_arrow)
                    .call(this._edge_label);
            });

    }

}

function _edge_label (edge) {
    let parent = edge.data.parent();
    let label = parent ? parent.label() : '';
    let middles = edge.middle;
    if (!middles.length) return label;
    return label + '[' + middles.join(',') + ']';
}

function _padded_bbox (points, padding) {

    let bbox = points
        .reduce((acc, cur) => {
            if (cur.x < acc[0]) acc[0] = cur.x;
            if (cur.x > acc[2]) acc[2] = cur.x;
            if (cur.y < acc[1]) acc[1] = cur.y;
            if (cur.y > acc[3]) acc[3] = cur.y;
            return acc;
        }, [Infinity, Infinity, -Infinity, -Infinity]);
    bbox[0] -= padding;
    bbox[1] -= padding;
    bbox[2] += padding;
    bbox[3] += padding;

    return bbox;

}
