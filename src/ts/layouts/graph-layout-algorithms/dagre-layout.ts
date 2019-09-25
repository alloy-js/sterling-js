import * as d3 from 'd3';
import { AlloyGraph } from '../../graph/alloy-graph';
import { rectangle } from '../graph-node-shapes/rectangle';
import { text } from '../graph-node-shapes/text';
import { line } from '../graph-edge-shapes/line';
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

    _rank_sep: number = 150;
    _node_width: number = 150;
    _node_height: number = 50;

    constructor (svg) {

        this._svg = svg;

        this._zoom = d3.zoom()
            .on('zoom', () => {
                if (this._sig_group) this._sig_group.attr('transform', d3.event.transform);
                if (this._edge_group) this._edge_group.attr('transform', d3.event.transform);
                if (this._atom_group) this._atom_group.attr('transform', d3.event.transform);
            });

        this._svg.call(this._zoom);
    }
    
    height () {
        return this._props ? this._props.height : 0;
    }

    layout (graph: AlloyGraph) {

        let { tree, edges } = graph.graph();

        let transition = this._svg.transition().duration(500);
        let atm_rect = rectangle();
        let sig_rect = rectangle().stroke('#777');
        let atm_label = text();
        let sig_label = text().placement('tl').fill('#777');
        let path = line();

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
            .attr('transform', d => `translate(${d.x},${d.y})`)
            .call(sig_rect)
            .call(sig_label);

        this._edge_group
            .selectAll('g.edge')
            .data(d => d, d => d.data.id())
            .join('g')
            .attr('class', 'edge')
            .call(path);

        this._atom_group
            .selectAll('g.atom')
            .data(d => d, d => d.data.id())
            .join('g')
            .attr('class', 'atom')
            .attr('transform', d => `translate(${d.x},${d.y})`)
            .call(atm_rect)
            .call(atm_label);

        let w = parseInt(this._svg.style('width')),
            h = parseInt(this._svg.style('height')),
            scale = 0.9 / Math.max(this.width() / w, this.height() / h);

        transition
            .call(this._zoom.transform, d3.zoomIdentity
                .translate(w / 2, h / 2)
                .scale(scale)
                .translate(-this.width() / 2, -this.height() / 2)
            );

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

    _position_compound_graph (tree, edges) {

        let graph = new dagre.graphlib.Graph({multigraph: true, compound: true});
        let props = this._graph_properties();

        graph.setGraph(props);
        graph.setDefaultEdgeLabel(function () { return {} });

        tree.each(node => {
            node.width = this._node_width;
            node.height = this._node_height;
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

}
