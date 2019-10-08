import { AlloyElement } from './alloy-element';
import { AlloyAtom } from './alloy-atom';
import { AlloySignature } from './alloy-signature';

export class AlloyTuple extends AlloyElement {

    private readonly _id: string;
    private readonly _atoms: Array<AlloyAtom>;

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
    constructor (id: string, atoms: Array<AlloyAtom>) {

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
    arity (): number {

        return this._atoms.length;

    }

    /**
     * Returns the ordered array of atoms that comprise this tuple.
     */
    atoms (): Array<AlloyAtom> {

        return this._atoms.slice();

    }

    /**
     * Returns the string `tuple`.
     */
    expressionType (): string {

        return 'tuple';

    }

    /**
     * Returns the unique ID of this tuple.
     *
     * @remarks
     * This unique ID must be provided to the constructor, as uniqueness of an
     * ID based on atoms alone cannot be guaranteed.
     */
    id (): string {

        return this._id;

    }

    /**
     * Returns a printable string.
     */
    toString (): string {

        return this.name();

    }

    /**
     * Returns an ordered array of the types of the atoms in this tuple.
     */
    types (): Array<AlloySignature> {

        return this._atoms.map(atom => atom.type());

    }

}
