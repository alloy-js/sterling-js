import * as d3 from 'd3';
import { Delaunay } from 'd3-delaunay';
import { rectangle } from '../graph-node-shapes/rectangle';
import { line } from '../graph-edge-shapes/line';
import { node_label } from '../graph-node-shapes/node-label';
import { edge_label } from '../graph-node-shapes/edge-label';
import { arrow } from '../graph-edge-shapes/arrow';
export class DagreLayout {
    constructor(svg) {
        this._include_private_nodes = false;
        this._rank_sep = 100;
        this._node_width = 150;
        this._node_height = 50;
        this._svg = svg;
        this._svg_width = parseInt(this._svg.style('width'));
        this._svg_height = parseInt(this._svg.style('height'));
        this._zoom = d3.zoom()
            .on('zoom', () => {
            if (this._sig_group)
                this._sig_group.attr('transform', d3.event.transform);
            if (this._edge_group)
                this._edge_group.attr('transform', d3.event.transform);
            if (this._atom_group)
                this._atom_group.attr('transform', d3.event.transform);
            if (this._delaunaygroup)
                this._delaunaygroup.attr('transform', d3.event.transform);
        });
        this._svg
            .call(this._zoom);
        this._init_styles();
    }
    height() {
        return this._props ? this._props.height : 0;
    }
    layout(graph) {
        let { tree, edges } = graph.graph();
        let transition = this._svg.transition().duration(400);
        this._sig_rect.transition(transition);
        this._sig_label.transition(transition);
        this._atom_rect.transition(transition);
        this._atom_label.transition(transition);
        this._edge_line.transition(transition);
        this._edge_label.transition(transition);
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
            .join(enter => enter.append('g')
            .attr('transform', d => `translate(${d.x},${d.y})`), update => update
            .call(update => update.transition(transition)
            .attr('transform', d => `translate(${d.x},${d.y})`)), exit => exit
            .call(exit => exit.transition(transition).remove())
            .selectAll('rect')
            .call(this._sig_rect.exit)
            .call(this._sig_label.exit))
            .sort((a, b) => a.depth - b.depth)
            .attr('class', 'signature')
            .attr('id', d => d.data.id())
            .call(this._sig_rect)
            .call(this._sig_label)
            .transition(transition)
            .attr('transform', d => `translate(${d.x},${d.y})`);
        this._edge_group
            .selectAll('g.edge')
            .data(d => d, d => d.data.id())
            .join(enter => enter.append('g'), update => update, exit => exit
            .call(exit => exit.transition(transition).remove())
            .call(exit => exit.selectAll('path')
            .call(this._edge_line.exit))
            .call(exit => exit.selectAll('text')
            .call(this._edge_label.exit)))
            .attr('class', 'edge')
            .call(this._edge_line)
            .call(this._edge_label)
            .call(this._edge_arrow);
        this._atom_group
            .selectAll('g.atom')
            .data(d => d, d => d.data.id())
            .join(enter => enter.append('g')
            .attr('transform', d => `translate(${d.x},${d.y})`), update => update
            .call(update => update.transition(transition)
            .attr('transform', d => `translate(${d.x},${d.y})`)), exit => exit
            .call(exit => exit.transition(transition).remove())
            .selectAll('rect')
            .call(this._atom_rect.exit)
            .call(this._atom_label.exit))
            .attr('class', 'atom')
            .call(this._atom_rect)
            .call(this._atom_label);
        this._make_voronoi();
        let w = parseInt(this._svg.style('width')), h = parseInt(this._svg.style('height')), scale = 0.9 / Math.max(this.width() / w, this.height() / h);
        transition
            .call(this._zoom.transform, d3.zoomIdentity
            .translate(w / 2, h / 2)
            .scale(scale)
            .translate(-this.width() / 2, -this.height() / 2));
        this._svg
            .select('#univ')
            .style('display', 'none');
    }
    edges() {
        return this._edges;
    }
    nodes() {
        return this._nodes;
    }
    links() {
        return this._links;
    }
    width() {
        return this._props ? this._props.width : 0;
    }
    _graph_properties() {
        return {
            ranksep: this._rank_sep
        };
    }
    _init_styles() {
        this._atom_rect = rectangle()
            .attr('rx', 2)
            .style('stroke', '#222')
            .style('fill', 'steelblue');
        this._atom_label = node_label()
            .style('fill', 'white')
            .style('font-size', '16px')
            .style('font-weight', 'bold');
        this._sig_rect = rectangle()
            .attr('rx', 2)
            .style('stroke', '#999');
        this._sig_label = node_label()
            .placement('tl')
            .style('font-size', '16px')
            .style('fill', '#999');
        this._edge_arrow = arrow();
        this._edge_line = line();
        this._edge_label = edge_label()
            .style('fill', '#777')
            .style('font-size', '12px');
        this._hover_edge_line = line()
            .style('stroke', 'steelblue')
            .style('stroke-width', 3);
        this._hover_edge_label = edge_label()
            .style('font-size', '16px');
        this._hover_edge_label_bg = edge_label()
            .selector('.bg')
            .style('font-size', '16px')
            .style('font-weight', 'bold')
            .style('stroke-linejoin', 'round')
            .style('stroke-width', 15)
            .style('stroke', 'white');
        this._hover_edge_arrow = arrow()
            .style('stroke', 'steelblue')
            .style('fill', 'steelblue')
            .width(4);
    }
    _position_compound_graph(tree, edges) {
        let graph = new dagre.graphlib.Graph({ multigraph: true, compound: true });
        let props = this._graph_properties();
        graph.setGraph(props);
        graph.setDefaultEdgeLabel(function () { return {}; });
        tree.each(node => {
            node.width = this._node_width;
            node.height = this._node_height;
        });
        edges.forEach(edge => {
            edge.labelpos = 'c';
            edge.width = 1;
            edge.height = 1;
            edge.label = _edge_label(edge);
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
    _make_voronoi() {
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
                .call(this._hover_edge_line.transition(null))
                .call(this._hover_edge_arrow)
                .call(this._hover_edge_label.transition(null))
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
                .call(this._edge_line.transition(null))
                .call(this._edge_arrow)
                .call(this._edge_label.transition(null));
        });
    }
}
function _edge_label(edge) {
    let parent = edge.data.parent();
    let label = parent ? parent.label() : '';
    let middles = edge.middle;
    if (!middles.length)
        return label;
    return label + '[' + middles.join(',') + ']';
}
function _padded_bbox(points, padding) {
    let bbox = points
        .reduce((acc, cur) => {
        if (cur.x < acc[0])
            acc[0] = cur.x;
        if (cur.x > acc[2])
            acc[2] = cur.x;
        if (cur.y < acc[1])
            acc[1] = cur.y;
        if (cur.y > acc[3])
            acc[3] = cur.y;
        return acc;
    }, [Infinity, Infinity, -Infinity, -Infinity]);
    bbox[0] -= padding;
    bbox[1] -= padding;
    bbox[2] += padding;
    bbox[3] += padding;
    return bbox;
}
