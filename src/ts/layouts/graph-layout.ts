import * as d3 from 'd3';
import { Instance } from '..';
// import { rectangle } from './graph-node-shapes/rectangle';
import { DagreLayout } from './graph-layout-algorithms/dagre-layout';
// import { line } from './graph-edge-shapes/line';
// import { text } from './graph-node-shapes/text';
import { GraphLayoutPreferences } from './graph-layout-preferences';
import { AlloyGraph } from '../graph/alloy-graph';

export class GraphLayout {

    _svg;
    _g0;
    _g1;
    _g2;
    _zoom;
    _transition;

    _prefs: GraphLayoutPreferences;

    constructor (selection) {

        this._svg = selection
            .style('user-select', 'none')
            .style('font-family', 'monospace')
            .style('font-size', '10px');

        // this._g0 = selection.append('g')
        //     .attr('class', 'nodes');
        //
        // this._g1 = selection.append('g')
        //     .attr('class', 'links');
        //
        // this._g2 = selection.append('g')
        //     .attr('class', 'nodes');

        this._zoom = d3.zoom()
            .on('zoom', () => {
                // this._g0.attr('transform', d3.event.transform);
                // this._g1.attr('transform', d3.event.transform);
                // this._g2.attr('transform', d3.event.transform);
            });

        // this._transition = this._svg.transition().duration(500);

        // this._svg.call(this._zoom);

        this._prefs = new GraphLayoutPreferences();

    }

    resize () {

    }

    set_instance (instance: Instance) {

        let dag = new DagreLayout();

        let graph = new AlloyGraph(instance);
        dag.layout(this._svg, graph);

        // this.zoom_to(dag.width(), dag.height());

        return;

        // let nodes = dag.nodes(),
        //     signodes = nodes.filter(node => node.data.expressionType() === 'signature'),
        //     atmnodes = nodes.filter(node => node.data.expressionType() === 'atom'),
        //     edges = dag.edges();
        //
        // let rect = rectangle();
        // let label = text();
        // let path = (line() as any).transition(this._transition);
        //
        // let g2 = this._g2
        //     .selectAll('.node')
        //     .data(atmnodes);
        //
        // g2
        //     .exit()
        //     .remove();
        //
        // g2
        //     .enter()
        //     .append('g')
        //     .attr('class', 'node')
        //     .merge(g2)
        //     .call(rect)
        //     .call(label)
        //     .transition(this._transition)
        //     .attr('transform', d => `translate(${d.x},${d.y})`);
        //
        // let g1 = this._g1
        //     .selectAll('.link')
        //     .data(edges);
        //
        // g1
        //     .exit()
        //     .remove();
        //
        // g1
        //     .enter()
        //     .append('g')
        //     .attr('class', 'link')
        //     .merge(g1)
        //     .call(path);
        //
        // let g0 = this._g0
        //     .selectAll('.node')
        //     .data(signodes);
        //
        // g0
        //     .exit()
        //     .remove();
        //
        // g0
        //     .enter()
        //     .append('g')
        //     .attr('class', 'node')
        //     .merge(g0)
        //     .call(rect)
        //     .call(label)
        //     .call(this._style_sig_nodes)
        //     .transition(this._transition)
        //     .attr('transform', d => `translate(${d.x},${d.y})`);

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

    _style_sig_nodes (selection) {

        selection
            .selectAll('rect')
            .style('stroke', '#444')
            .style('fill', '#eee');

    }

}
