import { View } from './view';
import Split from 'split.js';
import * as d3 from 'd3';

export class EvaluatorView extends View {

    _alloy = null;
    _input = null;
    _output = null;
    _active = null;
    _nextid = 0;
    _expressions = [];

    constructor (selection) {

        super(selection);
        Split(['#eval-editor', '#eval-display'], {
            sizes: [40, 60],
            minSize: [300, 100],
            gutterSize: 4
        });

        this._input = selection.select('#eval-input');
        this._output = selection.select('#eval-output');

        this._initialize_input();

    }

    set_alloy (alloy) {

        if (alloy) {

            this._alloy = alloy;
            this._alloy.on_eval(this._parse_result.bind(this));

        }

    }

    set_instance (instance) {

        // TODO: parse instance for autocompletion data

        this._clear();

    }

    _clear () {

        this._expressions = [];
        this._active = null;
        this._update();

    }

    _disable () {

        this._input.attr('disabled', '');

    }

    _enable () {

        this._input.attr('disabled', null);

    }

    _evaluate () {

        const input = this._input.property('value');
        this._input.property('value', '');

        const tmpres = this._alloy
            ? 'Evaluating...'
            : 'ERROR: No connection';

        if (input.length) {

            const expression = {
                id: this._nextid++,
                expression: input,
                result: tmpres,
                active: false,
                error: !this._alloy
            };

            this._expressions.push(expression);
            this._set_active(expression);
            this._update();
            this._scroll_down();

            if (this._alloy) {
                this._alloy.request_eval(expression.id, expression.expression);
            }

        } else {

            this._enable();

        }

    }

    _initialize_input () {

        this._input.on('keydown', () => {
            if (d3.event.key === 'Enter') {
                d3.event.preventDefault();
                this._disable();
                this._evaluate();
            }
        });

    }

    _on_hide (): void {

    }

    _on_show (): void {

    }

    _parse_result (id: number, result: string) {

        // ... calculate result

        // Find corresponding command by id
        const expr = this._expressions.find(expr => expr.id === id);

        if (expr) {

            expr.result = result;

        }

        this._update();
        this._enable();

    }

    _set_active (expression) {

        this._active = expression;
        this._expressions.forEach(expr => {
            expr.active = expr === expression;
        });

    }

    _scroll_down () {

        this._output
            .property('scrollTop', this._output.property('scrollHeight'));

    }

    _update () {

        const selection = this._output.selectAll('div.output')
            .data(this._expressions, d => d.id)
            .join('div')
            .attr('class', 'output')
            .classed('active', d => d.active);

        selection.selectAll('div')
            .data(d => [d, d])
            .join('div')
            .attr('class', (d, i) => {
                return i === 0
                    ? 'expression'
                    : 'result';
            })
            .classed('error', (d, i) => {
                return i === 1 && d.error
            })
            .text((d, i) => {
                return i === 0
                    ? d.expression
                    : d.result;
            });

    }

}
