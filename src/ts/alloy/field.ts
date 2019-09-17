import { Signature } from './signature';
import { Tuple } from './tuple';
import { Atom } from './atom';

export class Field {

    expressionType = () => 'field';

    _label: string;
    _parent: Signature;
    _tuples: Array<Tuple>;
    _types: Array<Signature>;

    constructor (label: string, types: Array<Signature>) {

        this._label = label;
        this._parent = null;
        this._tuples = [];
        this._types = types;

    }

    has (...atoms: Array<Atom>): boolean {

        return !!this._tuples.find(t => {
            return t.atoms().every((a, i) => atoms[i] === a);
        });

    }

    label (): string {
        return this._label;
    }

    size (): number {
        return this._types.length;
    }

    toString (): string {
        return (this._parent ? this._parent + '<:' : '') + this._label;
    }

    tuples (): Array<Tuple> {
        return this._tuples.slice();
    }

    types (): Array<Signature> {
        return this._types.slice();
    }

}
