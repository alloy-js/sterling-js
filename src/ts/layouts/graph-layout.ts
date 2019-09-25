import { Instance } from '..';
import { DagreLayout } from './graph-layout-algorithms/dagre-layout';
import { AlloyGraph } from '../graph/alloy-graph';

export class GraphLayout {

    _svg;

    constructor (selection) {

        this._svg = selection
            .style('user-select', 'none')
            .style('font-family', 'monospace')
            .style('font-size', '10px');

    }

    resize () {

    }

    set_instance (instance: Instance) {

        let dag = new DagreLayout(this._svg);
        let graph = new AlloyGraph(instance);
        dag.layout(graph);


    }

}
