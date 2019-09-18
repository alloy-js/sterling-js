import * as d3 from 'd3';
import { Instance, Tuple } from '..';

export class GraphLayout {

    _svg;
    _gLink;
    _gNode;

    constructor (selection) {

        this._svg = selection;
        this._gLink = selection.append('g')
            .attr('class', 'links')
            .style('stroke', '#aaa');
        this._gNode = selection.append('g').attr('class', 'nodes');

    }

    resize () {

    }

    set_instance (instance: Instance) {

        let nodes = instance.atoms(),
            links = instance.tuples().map(to_link);

        let width = parseInt(this._svg.style('width')),
            height = parseInt(this._svg.style('height'));

        let simulation = d3.forceSimulation()
            .force('link', d3.forceLink().id(d => d.label()))
            .force('charge', d3.forceManyBody())
            .force('center', d3.forceCenter(width/2, height/2));

        let linksel = this._gLink
            .selectAll('line')
            .data(links);

        linksel
            .exit()
            .remove();

        linksel = linksel
            .enter()
            .append('line')
            .merge(linksel);

        let nodesel = this._gNode
            .selectAll('g')
            .data(nodes);

        nodesel
            .exit()
            .remove();

        let nodeent = nodesel
            .enter()
            .append('g');

        nodeent
            .append('circle')
            .attr('cx', 0)
            .attr('cy', 0)
            .attr('r', 2.5);
        nodeent
            .append('text')
            .text(d => d.label());

        nodesel = nodeent
            .merge(nodesel);

        simulation
            .nodes(nodes)
            .on('tick', ticked);

        function ticked () {
            linksel
                .attr('x1', d => d.source.x)
                .attr('x2', d => d.target.x)
                .attr('y1', d => d.source.y)
                .attr('y2', d => d.target.y);
            nodesel
                .attr('transform', d => `translate(${d.x},${d.y})`);
                // .attr('cx', d => d.x)
                // .attr('cy', d => d.y);
        }

    }

}

function to_link(tuple: Tuple) {
    let atoms = tuple.atoms();
    return {
        source: atoms[0],
        target: atoms[atoms.length-1],
        tuple: tuple
    }
}
