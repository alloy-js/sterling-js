import { Instance } from '..';
import { DagreLayout } from './graph-layout-algorithms/dagre-layout';
import { AlloyGraph } from '../graph/alloy-graph';

export class GraphLayout {

    _svg;
    _dagre;

    constructor (selection) {

        this._svg = selection
            .style('user-select', 'none')
            .style('font-family', 'monospace')
            .style('font-size', '10px');

        this._dagre = new DagreLayout(this._svg);

    }

    resize () {

    }

    set_instance (instance: Instance) {

        let graph = new AlloyGraph(instance);
        this._dagre.layout(graph);

    }

}
