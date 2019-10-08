import { AlloyElement } from './alloy-element';
import { AlloyAtom } from './alloy-atom';
import { filter_exclude_labels, IDSig, is_subset } from './alloy-xml';

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
    private _subtypes: Array<AlloySignature>;

    /**
     * An array of [[AlloyAtom|atoms]] defined by this signature
     */
    private _atoms: Array<AlloyAtom>;

    private readonly _is_builtin: boolean;
    private readonly _is_meta: boolean;
    private readonly _is_one: boolean;
    private readonly _is_private: boolean;
    private readonly _is_subset: boolean;

    /**
     * Create a new Alloy signature.
     * @param name The name of this signature
     * @param type The parent type of this signature
     * @param is_builtin Is this a built-in signature?
     * @param is_meta Is this a meta signature?
     * @param is_one Is this a singleton signature?
     * @param is_private Is this a private signature?
     * @param is_subset Is this a subset signature?
     */
    constructor (name: string,
                 type?: AlloySignature,
                 is_builtin?: boolean,
                 is_meta?: boolean,
                 is_one?: boolean,
                 is_private?: boolean,
                 is_subset?: boolean) {

        super(name);

        this._type = type ? type : null;
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
     * Returns the atom with the given name if it exists, otherwise null.
     * @param name The name of the atom
     */
    findAtom (name: string): AlloyAtom {

        return this._atoms.find(atom => atom.name() === name) || null;

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
     * Returns a printable string.
     */
    toString (): string {

        return this.name();

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

    static buildSigs (bitwidth: number, maxseq: number, sigs: Array<Element>): Map<number, AlloySignature> {

        let ids: Map<number, AlloySignature> = new Map();

        // Int and seq/Int don't actually include atoms in the XML file,
        // so they need to be assembled separately from the rest of the sigs.
        let intElement = sigs.find(el => el.getAttribute('label') === 'Int');
        let seqElement = sigs.find(el => el.getAttribute('label') === 'seq/Int');

        let int = AlloySignature._buildInt(bitwidth, intElement);
        let seq = AlloySignature._buildSeq(maxseq, seqElement, int.sig);

        ids.set(int.id, int.sig);
        ids.set(seq.id, seq.sig);

        // Parse the non-subset signatures
        sigs
            .filter(filter_exclude_labels('Int', 'seq/Int'))
            .filter(el => !is_subset(el))
            .forEach(el => {
                let sig = AlloySignature._buildSig(el);
                ids.set(sig.id, sig.sig);
            });

        // TODO: Parse the subset signatures

        return ids;

    }

    /**
     * Assemble the builtin Int signature.
     *
     * @remarks
     * The total number of integers will be equal to 2<sup>bitwidth</sup>, and
     * the values will fall into the range
     * [-2<sup>bitwidth</sup>/2, 2<sup>bitwidth</sup>/2].
     *
     * @param bitwidth The bitwidth
     * @param element The XML sig element with the "Int" label attribute
     */
    private static _buildInt (bitwidth: number, element: Element): IDSig {

        if (!element) throw Error('Instance contains no Int element');
        if (bitwidth < 1) throw Error(`Invalid bitwidth ${bitwidth}`);

        let id = element.getAttribute('ID');
        if (!id) throw Error('Invalid Int element');

        let int = new AlloySignature('Int', null, true);

        let n = 2**bitwidth;
        for (let i=-n/2; i<n/2; ++i) {
            int._atoms.push(new AlloyAtom(int, i.toString()));
        }

        return {
            id: parseInt(id),
            sig: int
        }

    }

    /**
     * Assemble the builtin seq/Int signature.
     *
     * @param maxseq The maximum sequence length
     * @param element The XML sig element with the "seq/Int" label attribute
     * @param int The Int signature
     * @private
     */
    private static _buildSeq (maxseq: number, element: Element, int: AlloySignature): IDSig {

        if (!element) throw Error('Instance contains no seq/Int element');

        let id = element.getAttribute('ID');
        if (!id) throw Error('Invalid seq/Int element');

        let seq = new AlloySignature('seq/Int', int, true, false, false, false, true);

        for (let i=0; i<maxseq; ++i) {
            let atom  = int.findAtom(i.toString());
            if (!atom) throw Error('The maxseq value is invalid');
            seq._atoms.push(atom);
        }

        return {
            id: parseInt(id),
            sig: seq
        };

    }

    /**
     * Assemble a signature from an element of an XML file.
     *
     * @remarks
     * This method will not assemble subset signatures, as those require a
     * reference to their parent signature in order to extract existing atoms.
     *
     * @param element The XML sig element
     */
    private static _buildSig (element: Element): IDSig {

        if (!element) throw Error('Signature element does not exist');

        let id = element.getAttribute('ID');
        if (!id) throw Error('Signature element has no ID attribute');

        let label = element.getAttribute('label');
        if (!label) throw Error('Signature element has no label attribute');

        let parentID = element.getAttribute('parentID');
        let builtin = element.getAttribute('builtin') === 'yes';
        let meta = element.getAttribute('meta') === 'yes';
        let one = element.getAttribute('one') === 'yes';
        let priv = element.getAttribute('private') === 'yes';
        let subset = element.getAttribute('subset') === 'yes';

        if (subset)
            throw Error('Subset signature must be built using AlloySignature.buildSubset()');

        let sig = new AlloySignature(label, null, builtin, meta, one, priv, subset);

        // TODO: Parse and set atoms

        if (parentID) {
            return {
                id: parseInt(id),
                parentID: parseInt(parentID),
                sig: sig
            }
        } else {
            return {
                id: parseInt(id),
                sig: sig
            }
        }

    }

}
