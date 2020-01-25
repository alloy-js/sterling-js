import { EventDispatcher } from '../../../util/event-dispatcher';
import { AlloyConnection } from '../../server/alloy-connection';

export interface Expression {
    id: number,
    expression: string,
    result: null | boolean | number | string,
    error: boolean
}

export class Evaluator extends EventDispatcher {

    private _alloy: AlloyConnection = null;
    private _nextid: number = 0;
    private _expressions: Expression[] = [];
    private _pending = 0;

    constructor (alloy: AlloyConnection) {

        super();

        this._alloy = alloy;
        this._alloy.on_eval(this._parse.bind(this));

    }

    clear () {

        this._pending = 0;
        this._updatePending(0);

        this._expressions = [];
        this.dispatchEvent({
            type: 'update',
            expressions: this._expressions,
            update: null
        });

    }

    evaluate (expression: string) {

        const e: Expression = {
            id: this._nextid++,
            expression: expression,
            result: this._alloy.connected() ? null : 'No Connection',
            error: !this._alloy.connected()
        };

        this._updatePending(1);
        this._addExpression(e);

        this._alloy.request_eval(e.id, e.expression);

    }

    _addError (error: string, message: string) {

        this._addExpression({
            id: -1,
            expression: 'Error',
            result: message,
            error: true
        });

    }

    _addExpression (expression: Expression) {

        this._expressions.push(expression);
        this.dispatchEvent({
            type: 'add',
            add: expression,
            expressions: this._expressions
        });

    }

    _parse (response: string) {

        const tokens = response.match(/EVL:(-?\d+):(.*)/);

        if (tokens === null) {

            this._addError('Invalid response', response);
            return;

        }

        const id = parseInt(tokens[1]);
        const result = tokens[2].trim();

        if (id === -1) {

            this._addError('Error', result);
            return;

        }

        const expr = this._expressions.find(expr => expr.id === id);

        if (!expr) {

            this._addError('Error', `Unable to find expression ID: ${id}`);
            return;

        }

        if (result.slice(0, 4) === 'ERR:') {
            expr.result = result.slice(4);
            expr.error = true;
        }
        else if (result === 'true' || result === 'false') {
            expr.result = result === 'true';
            expr.error = false;
        }
        else if (/^-?\d+$/.test(result)) {
            expr.result = parseInt(result);
            expr.error = false;
        }
        else {
            expr.result = result;
            expr.error = false;
        }

        this._updatePending(-1);

        this.dispatchEvent({
            type: 'update',
            expressions: this._expressions,
            update: expr
        });

    }

    _updatePending (add: number) {

        this._pending += add;

        this.dispatchEvent({
            type: 'ready',
            ready: this._pending === 0
        });

    }

}
