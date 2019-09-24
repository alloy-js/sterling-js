import * as d3 from 'd3';
import { AlloyGraph } from '../../graph/alloy-graph';
import { rectangle } from '../graph-node-shapes/rectangle';
import { text } from '../graph-node-shapes/text';
declare const dagre: any;

export class DagreLayout {

    _include_private_nodes: boolean = false;

    _props;
    _nodes;
    _edges;
    _links;

    _rank_sep: number = 150;
    _node_width: number = 150;
    _node_height: number = 50;

    height () {
        return this._props ? this._props.height : 0;
    }

    layout (svg, graph: AlloyGraph) {

        let { tree, edges } = graph.graph();
        let layers = d3.range(tree.height)
            .reverse()
            .map(i => tree.descendants().filter(n => n.height === i));

        let transition = svg.transition().duration(500);
        let rect = rectangle();
        let label = text();

        this._position_compound_graph(tree, edges);

        let layer_groups = svg
            .selectAll('g.layer')
            .data(layers)
            .join('g')
            .attr('class', 'layer');

        let sig_groups = layer_groups
            .selectAll('g.signatures')
            .data(d => [d.filter(node => node.data.expressionType() === 'signature')])
            .join('g')
            .attr('class', 'signatures');

        let atm_groups = layer_groups
            .selectAll('g.atoms')
            .data(d => [d.filter(node => node.data.expressionType() === 'atom')])
            .join('g')
            .attr('class', 'atoms');

        sig_groups
            .selectAll('g.signature')
            .data(d => d, d => d.data.id())
            .join('g')
            .attr('class', 'signature')
            .call(rect)
            .call(label)
            .transition(transition)
            .attr('transform', d => `translate(${d.x},${d.y})`);

        atm_groups
            .selectAll('g.atom')
            .data(d => d, d => d.data.id())
            .join('g')
            .attr('class', 'atom')
            .call(rect)
            .call(label)
            .transition(transition)
            .attr('transform', d => `translate(${d.x},${d.y})`);

        let zoom = d3.zoom()
            .on('zoom', () => {
                sig_groups.attr('transform', d3.event.transform);
                atm_groups.attr('transform', d3.event.transform);
            });

        let w = parseInt(svg.style('width')),
            h = parseInt(svg.style('height')),
            scale = 0.9 / Math.max(this.width() / w, this.height() / h);

        transition
            .call(zoom.transform, d3.zoomIdentity
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
