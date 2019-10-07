import { AlloyElement } from './alloy-element';
/**
 * A signature in an Alloy instance.
 *
 * @remarks
 * In Alloy, a signature introduces a set of atoms.
 */
export class AlloySignature extends AlloyElement {
    /**
     * Create a new Alloy signature.
     * @param name The name of this signature
     * @param is_builtin Is this a built-in signature?
     * @param is_meta Is this a meta signature?
     * @param is_one Is this a singleton signature?
     * @param is_private Is this a private signature?
     * @param is_subset Is this a subset signature?
     */
    constructor(name, is_builtin, is_meta, is_one, is_private, is_subset) {
        super(name);
        this._type = null;
        this._is_builtin = is_builtin ? is_builtin : false;
        this._is_meta = is_meta ? is_meta : false;
        this._is_one = is_one ? is_one : false;
        this._is_private = is_private ? is_private : false;
        this._is_subset = is_subset ? is_subset : false;
    }
    /**
     * Returns the string `signature`.
     */
    expressionType() {
        return 'signature';
    }
    /**
     * Return the unique ID of this signature.
     *
     * @remarks
     * The unique ID of a signature is a combination of all signature names,
     * starting with the highest level parent and ending with this one, of all
     * signatures in this signature's ancenstry.
     */
    id() {
        return this.name();
    }
    isBuiltin() {
        return this._is_builtin;
    }
    isMeta() {
        return this._is_meta;
    }
    isOne() {
        return this._is_one;
    }
    isPrivate() {
        return this._is_private;
    }
    isSubset() {
        return this._is_subset;
    }
    /**
     * Return a list, in order from highest to lowest, of this signature's
     * ancestors.
     *
     * @remarks
     * The final element of the list will be this signature.
     */
    typeHierarchy() {
        let hierarchy = this._type ? this._type.typeHierarchy() : [];
        hierarchy.push(this);
        return hierarchy;
    }
}
