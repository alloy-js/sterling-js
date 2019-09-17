export class Field {
    constructor(label, types) {
        this.expressionType = () => 'field';
        this._label = label;
        this._parent = null;
        this._tuples = [];
        this._types = types;
    }
    has(...atoms) {
        return !!this._tuples.find(t => {
            return t.atoms().every((a, i) => atoms[i] === a);
        });
    }
    label() {
        return this._label;
    }
    size() {
        return this._types.length;
    }
    toString() {
        return (this._parent ? this._parent + '<:' : '') + this._label;
    }
    tuples() {
        return this._tuples.slice();
    }
    types() {
        return this._types.slice();
    }
}
