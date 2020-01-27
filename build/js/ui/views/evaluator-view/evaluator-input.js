import * as d3 from 'd3';
import { EventDispatcher } from '../../../util/event-dispatcher';
export class EvaluatorInput extends EventDispatcher {
    constructor(selection) {
        super();
        this._input = selection;
        selection.on('keydown', this._onKeyDown.bind(this));
    }
    enable(enable) {
        this._input.attr('disabled', enable ? null : '');
    }
    _onEnter(ctrlKey) {
        const value = this._input.property('value');
        this._input.property('value', '');
        this.dispatchEvent({
            type: 'evaluate',
            text: value,
            ctrlKey: ctrlKey
        });
    }
    _onKeyDown() {
        if (d3.event.key === 'Enter') {
            d3.event.preventDefault();
            this._onEnter(d3.event.ctrlKey);
        }
    }
}
