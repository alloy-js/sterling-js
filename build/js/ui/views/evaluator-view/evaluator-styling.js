export class EvaluatorStyling {
    constructor(selection) {
        this._styling = selection;
        // LOCKING
        this._styling.append('button')
            .text('Lock all nodes')
            .on('click', () => {
            if (this._stage)
                this._stage.lockAllNodes();
        });
        this._styling.append('button')
            .text('Unlock all nodes')
            .on('click', () => {
            if (this._stage)
                this._stage.unlockAllNodes();
        });
        // COMBINED EDGES
        const combineEdges = this._styling.append('div');
        this._combineEdges = combineEdges.append('input')
            .attr('type', 'checkbox')
            .attr('id', 'combineEdges')
            .on('change', () => {
            if (this._stage)
                this._stage.toggleCombineEdges();
            this._update();
        });
        combineEdges.append('label')
            .attr('for', 'combineEdges')
            .text('Combine Edges');
        // SHOW MIDDLES
        const showMiddles = this._styling.append('div');
        this._showMiddles = showMiddles.append('input')
            .attr('type', 'checkbox')
            .attr('id', 'showMiddles')
            .on('change', () => {
            if (this._stage)
                this._stage.toggleShowMiddles();
            this._update();
        });
        showMiddles.append('label')
            .attr('for', 'showMiddles')
            .text('Show skipped atoms in labels');
        // CIRCLE RADIUS
        const radius = this._styling.append('div');
        this._radius = radius.append('input')
            .attr('type', 'number')
            .attr('id', 'radius')
            .attr('min', 1)
            .attr('max', 150)
            .on('change', () => {
            const radius = parseInt(this._radius.property('value'));
            if (this._stage)
                this._stage.setRadius(radius);
            this._update();
        });
        radius.append('label')
            .attr('for', 'radius')
            .text('Circle radius');
        // NODE FONT SIZE
        const nodefont = this._styling.append('div');
        this._nodeFontSize = nodefont.append('input')
            .attr('type', 'number')
            .attr('id', 'node-font')
            .attr('min', 1)
            .attr('max', 72)
            .on('change', () => {
            const size = parseInt(this._nodeFontSize.property('value'));
            if (this._stage)
                this._stage.setNodeFontSize(size);
            this._update();
        });
        nodefont.append('label')
            .attr('for', 'node-font')
            .text('Node font size');
        // EDGE FONT SIZE
        const edgefont = this._styling.append('div');
        this._edgeFontSize = edgefont.append('input')
            .attr('type', 'number')
            .attr('id', 'node-font')
            .attr('min', 1)
            .attr('max', 72)
            .on('change', () => {
            const size = parseInt(this._edgeFontSize.property('value'));
            if (this._stage)
                this._stage.setEdgeFontSize(size);
            this._update();
        });
        edgefont.append('label')
            .attr('for', 'node-font')
            .text('Edge font size');
    }
    setStage(stage) {
        this._stage = stage;
        this._update();
    }
    setVisible(visible) {
        this._styling.style('display', visible ? null : 'none');
    }
    _update() {
        this._combineEdges.property('checked', this._stage._combineEdges);
        this._showMiddles.property('checked', this._stage._showMiddles);
        this._radius.property('value', this._stage._radius);
        this._nodeFontSize.property('value', this._stage._nodeFontSize);
        this._edgeFontSize.property('value', this._stage._edgeFontSize);
    }
}
