import * as d3 from 'd3';
import { EventDispatcher } from '../../../util/event-dispatcher';

export class EvaluatorInput extends EventDispatcher {

    _input;

    constructor (selection) {

        super();

        this._input = selection;
        selection.on('keydown', this._onKeyDown.bind(this));

    }

    enable (enable: boolean) {

        this._input.attr('disabled', enable ? null : '');

    }

    _onEnter () {

        const value = this._input.property('value');
        this._input.property('value', '');

        this.dispatchEvent({
            type: 'evaluate',
            text: value
        });

    }

    private _onKeyDown () {

        if (d3.event.key === 'Enter') {
            d3.event.preventDefault();
            this._onEnter();
        }

    }

}
