import * as d3 from 'd3';
export class GraphLayout {
    constructor(selection) {
        this._svg = selection
            .style('user-select', 'none')
            .style('font-family', 'monospace')
            .style('font-size', '10px')
            .call(d3.zoom()
            .on('zoom', () => {
            this._gLink.attr('transform', d3.event.transform);
            this._gNode.attr('transform', d3.event.transform);
        }));
        this._gLink = selection.append('g')
            .attr('class', 'links')
            .style('stroke', '#aaa')
            .style('fill', 'none');
        this._gNode = selection.append('g')
            .attr('class', 'nodes');
    }
    resize() {
    }
    set_instance(instance) {
        function to_node(atom) {
            return Object.assign(atom, {
                atom: atom,
                width: 20,
                height: 20
            });
        }
        let nodes = instance.atoms().map(to_node), links = instance.tuples().map(to_link), g = new dagre.graphlib.Graph(), graph = {
            width: parseInt(this._svg.style('width')),
            height: parseInt(this._svg.style('height')),
            marginx: 50,
            marginy: 50,
            ranksep: 100
        };
        let counts = new Map();
        links.forEach(link => {
            let s = link.source.label(), t = link.target.label();
            counts.set(s, (counts.get(s) || 0) + 1);
            counts.set(t, (counts.get(t) || 0) + 1);
        });
        nodes = nodes
            .filter(n => counts.get(n.label()) > 0 || !n.signature().builtin());
        g.setGraph(graph);
        g.setDefaultEdgeLabel(function () { return {}; });
        nodes.forEach(node => {
            g.setNode(node.label(), node);
        });
        links.forEach(link => {
            g.setEdge(link.source.label(), link.target.label());
        });
        dagre.layout(g);
        let width = graph.width, height = graph.height;
        this._svg
            .attr('viewBox', `0 0 ${width} ${height}`);
        let linksel = this._gLink
            .selectAll('path')
            .data(g.edges().map(e => g.edge(e).points));
        linksel
            .exit()
            .remove();
        let line = d3.line()
            .x(d => d.x)
            .y(d => d.y);
        linksel = linksel
            .enter()
            .append('path')
            .merge(linksel)
            .attr('d', line);
        let nodesel = this._gNode
            .selectAll('g')
            .data(nodes);
        nodesel
            .exit()
            .remove();
        nodesel = nodesel
            .enter()
            .append('g')
            .merge(nodesel);
        circle_nodes(nodesel);
        nodesel
            .attr('transform', d => `translate(${d.x},${d.y})`);
    }
}
function circle_nodes(selection) {
    let circles = selection
        .selectAll('circle')
        .data(d => [d]);
    circles
        .exit()
        .remove();
    circles = circles
        .enter()
        .append('circle')
        .merge(circles);
    circles
        .attr('cx', 0)
        .attr('cy', 0)
        .attr('r', 25)
        .style('fill', 'white')
        .style('stroke', 'black');
    let text = selection
        .selectAll('text')
        .data(d => [d]);
    text
        .exit()
        .remove();
    text = text
        .enter()
        .append('text')
        .merge(text)
        .text(d => d.label());
    text.attr('text-anchor', 'middle')
        .attr('dy', '0.31em');
}
function to_link(tuple) {
    let atoms = tuple.atoms();
    return {
        source: atoms[0],
        target: atoms[atoms.length - 1],
        tuple: tuple
    };
}
