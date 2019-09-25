import { DagreLayout } from './graph-layout-algorithms/dagre-layout';
import { AlloyGraph } from '../graph/alloy-graph';
export class GraphLayout {
    constructor(selection) {
        this._svg = selection
            .style('user-select', 'none')
            .style('font-family', 'monospace')
            .style('font-size', '10px');
    }
    resize() {
    }
    set_instance(instance) {
        let dag = new DagreLayout(this._svg);
        let graph = new AlloyGraph(instance);
        dag.layout(graph);
    }
}
