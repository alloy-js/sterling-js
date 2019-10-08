import { AlloyElement } from './alloy-element';
/**
 * An atom in an Alloy instance.
 *
 * @remarks
 * In Alloy, an atom is a primitive entity that is *indivisible*, *immutable*,
 * and *uninterpreted*.
 */
export class AlloyAtom extends AlloyElement {
    /**
     * Create a new Alloy atom.
     *
     * @param signature The type of this atom
     * @param name The name of this atom
     */
    constructor(signature, name) {
        super(name);
        this._type = signature;
    }
    /**
     * Returns the string `atom`
     */
    expressionType() {
        return 'atom';
    }
    /**
     * Returns the unique ID of this atom.
     *
     * @remarks
     * The unique ID of an atom is a combination of the ID of the atom's type,
     * an [[AlloySignature]], and the atom's name, separated by a colon.
     */
    id() {
        return this._type.id() + ':' + this.name();
    }
    /**
     * Returns true if this atom is of type **signature**, false otherwise.
     * @param signature The signature to check against
     */
    isType(signature) {
        return this.typeHierarchy().includes(signature);
    }
    /**
     * Returns a printable string.
     */
    toString() {
        return this.name();
    }
    /**
     * Returns the type of this atom.
     *
     * @remarks
     * Due to the hierarchical nature of Alloy signatures, it is possible for
     * atoms to have multiple types. This method returns the atom's immediate
     * type, i.e., the "lowest" level signature of which it is a child.
     */
    type() {
        return this._type;
    }
    /**
     * Return an array, in order from highest to lowest, of this atom's types.
     */
    typeHierarchy() {
        return this._type.typeHierarchy();
    }
}
