import { Tuple } from './tuple';
export class Atom {
    constructor(signature, label) {
        this.expressionType = () => 'atom';
        this._label = label;
        this._signature = signature;
    }
    isType(signature) {
        return signature === this._signature ||
            this._signature.types().includes(this._signature);
    }
    join(field) {
        return field.tuples()
            .filter(tuple => tuple.atoms().shift() === this)
            .map(tuple => new Tuple(tuple.atoms().slice(1)));
    }
    label() {
        return this._label;
    }
    signature() {
        return this._signature;
    }
    toString() {
        return this._label;
    }
}
