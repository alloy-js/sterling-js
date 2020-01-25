import { EventDispatcher } from '../../../util/event-dispatcher';
export class Evaluator extends EventDispatcher {
    constructor(alloy) {
        super();
        this._alloy = null;
        this._nextid = 0;
        this._expressions = [];
        this._pending = 0;
        this._alloy = alloy;
        this._alloy.on_eval(this._parse.bind(this));
    }
    clear() {
        this._pending = 0;
        this._updatePending(0);
        this._expressions = [];
        this.dispatchEvent({
            type: 'update',
            expressions: this._expressions,
            update: null
        });
    }
    evaluate(expression) {
        const e = {
            id: this._nextid++,
            expression: expression,
            result: this._alloy.connected() ? null : 'No Connection',
            error: !this._alloy.connected()
        };
        this._updatePending(1);
        this._addExpression(e);
        this._alloy.request_eval(e.id, e.expression);
    }
    _addError(error, message) {
        this._addExpression({
            id: -1,
            expression: 'Error',
            result: message,
            error: true
        });
    }
    _addExpression(expression) {
        this._expressions.push(expression);
        this.dispatchEvent({
            type: 'add',
            add: expression,
            expressions: this._expressions
        });
    }
    _parse(response) {
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
    _updatePending(add) {
        this._pending += add;
        this.dispatchEvent({
            type: 'ready',
            ready: this._pending === 0
        });
    }
}
