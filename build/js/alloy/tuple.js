export class Tuple {
    constructor(atoms) {
        this.expressionType = () => 'tuple';
        this._atoms = atoms;
    }
    atoms() {
        return this._atoms.slice();
    }
    toString() {
        return this._atoms.join('->');
    }
}
