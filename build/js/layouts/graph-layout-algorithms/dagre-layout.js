import * as d3 from 'd3';
import { Delaunay } from 'd3-delaunay';
import { rectangle } from '../graph-node-shapes/rectangle';
import { node_label } from '../graph-node-shapes/node-label';
import { edge } from '../graph-edge-shapes/edge';
import { node } from '../graph-node-shapes/node';
export class DagreLayout {
    constructor(svg) {
        this._include_private_nodes = false;
        this._rank_sep = 100;
        this._node_width = 150;
        this._node_height = 50;
        this._svg = svg;
        this._svg_width = parseInt(this._svg.style('width'));
        this._svg_height = parseInt(this._svg.style('height'));
        this._delaunaygroup = this._svg.append('g').attr('class', 'delaunay');
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
            .call(this._edge.transition(transition));
        this._atom_group
            .selectAll('g.node')
            .data(d => d, d => d.data.id())
            .call(this._node.transition(transition));
        let w = parseInt(this._svg.style('width')), h = parseInt(this._svg.style('height')), scale = 0.9 / Math.max(this.width() / w, this.height() / h);
        transition
            .call(this._zoom.transform, d3.zoomIdentity
            .translate(w / 2, h / 2)
            .scale(scale)
            .translate(-this.width() / 2, -this.height() / 2));
        this._svg
            .select('#univ')
            .style('display', 'none');
        transition.on('end', this._make_voronoi_new.bind(this));
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
        this._sig_rect = rectangle()
            .attr('rx', 2)
            .style('stroke', '#999');
        this._sig_label = node_label()
            .placement('tl')
            .style('font-size', '16px')
            .style('fill', '#999');
        this._edge = edge();
        this._node = node();
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
    _make_voronoi_new() {
        let points = this._edge.points();
        let delaunay = Delaunay
            .from(points, d => d.x, d => d.y)
            .voronoi(_padded_bbox(points, 20));
        let paths = Array.from(delaunay.cellPolygons());
        this._delaunaygroup
            .attr('fill', 'transparent')
            .attr('stroke', 'none')
            .selectAll('path')
            .data(paths)
            .join('path')
            .attr('d', d3.line())
            .on('mouseover', (d, i) => {
            this._edge.highlight(points[i].element);
        })
            .on('mouseout', () => {
            this._edge.highlight(null);
        });
        this._delaunaygroup
            .raise();
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
