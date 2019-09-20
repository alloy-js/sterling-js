import * as d3 from 'd3';
import { Instance } from '..';
import { rectangle } from './graph-node-shapes/rectangle';
import { DagreLayout } from './graph-layout-algorithms/dagre-layout';
import { line } from './graph-link-shapes/line';
import { text } from './graph-node-shapes/text';

export class GraphLayout {

    _svg;
    _gLink;
    _gNode;
    _zoom;

    _show_builtin: boolean = false;
    _show_disconnected: boolean = true;
    _show_meta: boolean = false;
    _show_private: boolean = false;

    constructor (selection) {

        this._svg = selection
            .style('user-select', 'none')
            .style('font-family', 'monospace')
            .style('font-size', '10px');

        this._gLink = selection.append('g')
            .attr('class', 'links');

        this._gNode = selection.append('g')
            .attr('class', 'nodes');

        this._zoom = d3.zoom()
            .on('zoom', () => {
                this._gLink.attr('transform', d3.event.transform);
                this._gNode.attr('transform', d3.event.transform);
            });

        this._svg.call(this._zoom);

    }

    resize () {

    }

    set_instance (instance: Instance) {

        let { atoms, tuples } = this._read_instance(instance);
        let dag = new DagreLayout();

        dag.layout(atoms, tuples);

        this.zoom_to(dag.width(), dag.height());

        let nodes = dag.nodes(),
            links = dag.links();

        let rect = rectangle();
        let label = text();
        let path = line();

        let gNode = this._gNode
            .selectAll('.node')
            .data(nodes);

        gNode
            .exit()
            .remove();

        gNode
            .enter()
            .append('g')
            .attr('class', 'node')
            .merge(gNode)
            .call(rect)
            .call(label)
            .attr('transform', d => `translate(${d.x},${d.y})`);

        let gLink = this._gLink
            .selectAll('.link')
            .data(links);

        gLink
            .exit()
            .remove();

        gLink
            .enter()
            .append('g')
            .attr('class', 'link')
            .merge(gLink)
            .call(path);

    }

    zoom_to (width, height) {

        let w = parseInt(this._svg.style('width')),
            h = parseInt(this._svg.style('height'));

        let scale = 0.9 / Math.max(width / w, height / h);

        this._svg
            .transition()
            .duration(750)
            .call(this._zoom.transform, d3.zoomIdentity
                .translate(w / 2, h / 2)
                .scale(scale)
                .translate(-width / 2, -height / 2));

    }

    _read_instance (instance) {

        // Retrive all atoms and filter out as necessary
        let atoms = instance
            .atoms()
            .filter(atom => this._show_builtin ? true : !atom.signature().builtin())
            .filter(atom => this._show_meta ? true : !atom.signature().meta())
            .filter(atom => this._show_private ? true : !atom.signature().private());

        // Retrieve all tuples and filter out as necessary
        let tuples = instance
            .fields()
            .filter(field => this._show_meta ? true : !field.meta())
            .filter(field => this._show_private ? true : !field.private())
            .map(field => field.tuples())
            .reduce((acc, cur) => acc.concat(cur), []);

        // Add back in any atoms that are still part of a relation
        // Not the most efficient, but instances are generally small-ish
        tuples.forEach(tuple => {
            let atms = tuple.atoms(),
                frst = atms[0],
                last = atms[atms.length-1];
            if (!atoms.includes(frst)) atoms.push(frst);
            if (!atoms.includes(last)) atoms.push(last);
        });

        // Remove atoms that aren't connected
        if (!this._show_disconnected) {

        }

        return {
            atoms: atoms,
            tuples: tuples
        };

    }

}
