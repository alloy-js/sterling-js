import { Atom } from './atom';

export class Tuple {

    expressionType = () => 'tuple';

    _atoms: Array<Atom>;

    constructor (atoms: Array<Atom>) {

        this._atoms = atoms;

    }

    atoms (): Array<Atom> {
        return this._atoms.slice();
    }

    toString (): string {
        return this._atoms.join('->');
    }

}
