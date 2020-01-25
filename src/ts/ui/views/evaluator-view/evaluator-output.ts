import * as d3 from 'd3';
import { Expression } from './evaluator';

export class EvaluatorOutput {

    _output;

    constructor (selection) {

        this._output = selection;

    }

    expressions (expressions: Expression[]) {

        const selection = this._output
            .selectAll('div.output')
            .data(expressions, d => d.id)
            .join(
                enter => {
                    const div = enter.append('div').attr('class', 'output');
                    div.append('div').attr('class', 'expression');
                    div.append('div').attr('class', 'result');
                    return div;
                }
            );

        selection
            .selectAll('div.expression')
            .each(renderExpression);

        selection
            .selectAll('div.result')
            .each(renderResult);

        function renderExpression (expression: Expression) {

            d3.select(this)
                .text(expression.expression);

        }

        function renderResult (expression: Expression) {

            d3.select(this)
                .classed('error', expression.error)
                .classed('expanded', true)
                .text(expression.result);

        }

    }

}
