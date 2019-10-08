import { AlloyElement } from './alloy-element';
import { AlloyAtom } from './alloy-atom';

/**
 * A signature in an Alloy instance.
 *
 * @remarks
 * In Alloy, a signature introduces a set of atoms.
 */
export class AlloySignature extends AlloyElement {

    /**
     * This signature's parent type
     */
    private readonly _type: AlloySignature | null;

    /**
     * An array of signatures for which this is the parent type
     */
    private readonly _subtypes: Array<AlloySignature>;

    /**
     * An array of [[AlloyAtom|atoms]] defined by this signature
     */
    private readonly _atoms: Array<AlloyAtom>;

    private readonly _is_builtin: boolean;
    private readonly _is_meta: boolean;
    private readonly _is_one: boolean;
    private readonly _is_private: boolean;
    private readonly _is_subset: boolean;

    /**
     * Create a new Alloy signature.
     * @param name The name of this signature
     * @param is_builtin Is this a built-in signature?
     * @param is_meta Is this a meta signature?
     * @param is_one Is this a singleton signature?
     * @param is_private Is this a private signature?
     * @param is_subset Is this a subset signature?
     */
    constructor (name: string,
                 is_builtin?: boolean,
                 is_meta?: boolean,
                 is_one?: boolean,
                 is_private?: boolean,
                 is_subset?: boolean) {

        super(name);

        this._type = null;
        this._subtypes = [];
        this._atoms = [];

        this._is_builtin = is_builtin ? is_builtin : false;
        this._is_meta = is_meta ? is_meta : false;
        this._is_one = is_one ? is_one : false;
        this._is_private = is_private ? is_private : false;
        this._is_subset = is_subset ? is_subset : false;

    }

    /**
     * Returns an array of atoms whose type are this signature.
     *
     * @remarks
     * To return a list of atoms defined directly by this signature, omit the
     * optional nest parameter. To include atoms defined by this signature
     * and all subtypes of this signature, pass in a truthy value for the
     * nest parameter.
     *
     * @param nest Whether or not to recursively include atoms
     */
    atoms (nest?: boolean): Array<AlloyAtom> {

        return nest
            ? this.atoms()
                .concat(this.subTypes(true)
                    .reduce((acc, cur) => acc.concat(cur.atoms()), [])
                )
            : this._atoms.slice();
    }

    /**
     * Returns the string `signature`.
     */
    expressionType (): string {

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
    id (): string {

        return this.name();

    }

    /**
     * Returns true if this is a builtin signature, false otherwise.
     *
     * @remarks
     * Builtin signatures include "univ", "int", "seq/int", "string".
     */
    isBuiltin (): boolean {

        return this._is_builtin;

    }

    /**
     * Returns true if this is a meta signature, false otherwise.
     */
    isMeta (): boolean {

        return this._is_meta;

    }

    /**
     * Returns true if this is a singleton signature, false otherwise.
     */
    isOne (): boolean {

        return this._is_one;

    }

    /**
     * Returns true if this is a private signature, false otherwise.
     */
    isPrivate (): boolean {

        return this._is_private;

    }

    /**
     * Returns true if this is a subset signature, false otherwise.
     */
    isSubset (): boolean {

        return this._is_subset;

    }

    /**
     * Returns an array of signatures that are subtypes of this signature.
     *
     * @remarks
     * To return a list of immediate subtypes, omit the optional nest parameter.
     * To include all subtypes of this signature, including all of those that
     * are below this one in the inheritance tree, pass in a truthy value for
     * the nest parameter.
     *
     * @param nest Whether or not to recursively include subtypes
     */
    subTypes (nest?: boolean): Array<AlloySignature> {

        return nest
            ? this.subTypes()
                .concat(this._subtypes
                    .map(sig => sig.subTypes(true))
                    .reduce((acc, cur) => acc.concat(cur), [])
                )
            : this._subtypes.slice();

    }

    /**
     * Return a array, in order from highest to lowest, of this signature's
     * ancestors.
     *
     * @remarks
     * The final element of the list will be this signature.
     */
    typeHierarchy (): Array<AlloySignature> {

        let hierarchy = this._type ? this._type.typeHierarchy() : [];
        hierarchy.push(this);
        return hierarchy;

    }

}
