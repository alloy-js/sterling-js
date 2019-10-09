import { AlloyElement } from './alloy-element';
export class AlloyTuple extends AlloyElement {
    /**
     * Create a new Alloy tuple.
     *
     * @remarks
     * In Alloy, a tuple is a sequence of atoms. As part of an Alloy instance,
     * tuples can either reside in a [[AlloyField|field]] or exist as a free
     * variable that makes an existentially quantified formula true. Because
     * it is possible for multiple tuples to contain the same ordered set of
     * atoms, a unique ID cannot be generated based on content alone. Therefore,
     * a unique ID must be provided upon creation.
     *
     * @param id The unique identifier for this tuple
     * @param atoms The ordered array of atoms that comprise this tuple
     */
    constructor(id, atoms) {
        super(`{${atoms.map(atom => atom.name()).join('->')}}`);
        this._id = id;
        this._atoms = atoms;
        if (atoms.length < 2) {
            throw Error('Tuples must have at least two atoms');
        }
    }
    /**
     * Returns the number of atoms in this tuple.
     */
    arity() {
        return this._atoms.length;
    }
    /**
     * Returns the ordered array of atoms that comprise this tuple.
     */
    atoms() {
        return this._atoms.slice();
    }
    /**
     * Returns the string `tuple`.
     */
    expressionType() {
        return 'tuple';
    }
    /**
     * Returns the unique ID of this tuple.
     *
     * @remarks
     * This unique ID must be provided to the constructor, as uniqueness of an
     * ID based on atoms alone cannot be guaranteed.
     */
    id() {
        return this._id;
    }
    /**
     * Returns a printable string.
     */
    toString() {
        return this.name();
    }
    /**
     * Returns an ordered array of the types of the atoms in this tuple.
     */
    types() {
        return this._atoms.map(atom => atom.type());
    }
    /**
     * Assemble a tuple for a [[AlloyField|field]].
     *
     * @remarks
     * The ID generated for a tuple in a field is the ID of the first atom's
     * type followed by the list of atoms separated by arrows.
     *
     * @param element The XML tuple element
     * @param types The array of types for this tuple
     */
    static buildFieldTuple(element, types) {
        let atomIDs = Array
            .from(element.querySelectorAll('atom'))
            .map(atom => atom.getAttribute('label'));
        if (atomIDs.includes(null))
            throw Error('Atom has no label attribute');
        let atoms = atomIDs.map((id, i) => types[i].findAtom(id));
        if (atoms.includes(null))
            throw Error('Unable to find all atoms in tuple');
        let id = types[0].id() + '<:' + atomIDs.join('->');
        return new AlloyTuple(id, atoms);
    }
}
