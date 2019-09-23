import * as d3 from 'd3';
import { rectangle } from './graph-node-shapes/rectangle';
import { DagreLayout } from './graph-layout-algorithms/dagre-layout';
import { line } from './graph-edge-shapes/line';
import { text } from './graph-node-shapes/text';
import { GraphLayoutPreferences } from './graph-layout-preferences';
export class GraphLayout {
    constructor(selection) {
        this._svg = selection
            .style('user-select', 'none')
            .style('font-family', 'monospace')
            .style('font-size', '10px');
        this._g0 = selection.append('g')
            .attr('class', 'nodes');
        this._g1 = selection.append('g')
            .attr('class', 'links');
        this._g2 = selection.append('g')
            .attr('class', 'nodes');
        this._zoom = d3.zoom()
            .on('zoom', () => {
            this._g0.attr('transform', d3.event.transform);
            this._g1.attr('transform', d3.event.transform);
            this._g2.attr('transform', d3.event.transform);
        });
        this._svg.call(this._zoom);
        this._prefs = new GraphLayoutPreferences();
    }
    resize() {
    }
    set_instance(instance) {
        // let { atoms, tuples } = this._read_instance(instance);
        let dag = new DagreLayout();
        dag.layout_new(instance, this._prefs);
        // dag.layout(atoms, tuples);
        this.zoom_to(dag.width(), dag.height());
        let nodes = dag.nodes(), signodes = nodes.filter(node => node.datum().expressionType() === 'signature'), atmnodes = nodes.filter(node => node.datum().expressionType() === 'atom'), edges = dag.edges();
        let rect = rectangle();
        let label = text();
        let path = line();
        let g2 = this._g2
            .selectAll('.node')
            .data(atmnodes);
        g2
            .exit()
            .remove();
        g2
            .enter()
            .append('g')
            .attr('class', 'node')
            .merge(g2)
            .call(rect)
            .call(label)
            .attr('transform', d => `translate(${d.x},${d.y})`);
        let g1 = this._g1
            .selectAll('.link')
            .data(edges);
        g1
            .exit()
            .remove();
        g1
            .enter()
            .append('g')
            .attr('class', 'link')
            .merge(g1)
            .call(path);
        let g0 = this._g0
            .selectAll('.node')
            .data(signodes);
        g0
            .exit()
            .remove();
        g0
            .enter()
            .append('g')
            .attr('class', 'node')
            .merge(g0)
            .call(rect)
            .call(label)
            .attr('transform', d => `translate(${d.x},${d.y})`);
    }
    zoom_to(width, height) {
        let w = parseInt(this._svg.style('width')), h = parseInt(this._svg.style('height'));
        let scale = 0.9 / Math.max(width / w, height / h);
        this._svg
            .transition()
            .duration(750)
            .call(this._zoom.transform, d3.zoomIdentity
            .translate(w / 2, h / 2)
            .scale(scale)
            .translate(-width / 2, -height / 2));
    }
    _read_instance(instance) {
        let sb = this._prefs.show_builtin, sm = this._prefs.show_meta, sp = this._prefs.show_private, sd = this._prefs.show_disconnected;
        // Retrive all atoms and filter out as necessary
        let atoms = instance
            .atoms()
            .filter(atom => sb ? true : !atom.signature().builtin())
            .filter(atom => sm ? true : !atom.signature().meta())
            .filter(atom => sp ? true : !atom.signature().private());
        // Retrieve all tuples and filter out as necessary
        let tuples = instance
            .fields()
            .filter(field => sm ? true : !field.meta())
            .filter(field => sp ? true : !field.private())
            .map(field => field.tuples())
            .reduce((acc, cur) => acc.concat(cur), []);
        // Add back in any atoms that are still part of a relation
        // Not the most efficient, but instances are generally small-ish
        tuples.forEach(tuple => {
            let atms = tuple.atoms(), frst = atms[0], last = atms[atms.length - 1];
            if (!atoms.includes(frst))
                atoms.push(frst);
            if (!atoms.includes(last))
                atoms.push(last);
        });
        // Remove atoms that aren't connected
        if (!sd) {
        }
        return {
            atoms: atoms,
            tuples: tuples
        };
    }
}
