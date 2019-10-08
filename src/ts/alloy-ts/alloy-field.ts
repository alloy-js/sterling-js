import { AlloyElement } from './alloy-element';
import { AlloySignature } from './alloy-signature';
import { AlloyTuple } from './alloy-tuple';

export class AlloyField extends AlloyElement {

    private readonly _types: Array<AlloySignature>;
    private readonly _tuples: Array<AlloyTuple>;

    private readonly _is_meta: boolean;
    private readonly _is_private: boolean;

    /**
     * Create a new Alloy field.
     *
     * @remarks
     * An alloy field consists of an ordered array of
     * [[AlloySignature|signatures]] that define the types of the "columns" of
     * the relation defined by the field, as well as a list of
     * [[AlloyTuple|tuples]] that define the contents (or "rows") of the
     * relation. The arity of the field, or number of columns, must be at least
     * two.
     *
     * @param name The name of this field
     * @param types The types that define the columns of this relation
     * @param tuples The contents of this relation
     * @param is_meta Is this a meta field?
     * @param is_private Is this a private field?
     *
     * @throws Error When the arity is less than two or an atom's type does not
     * match the type of the column in which it resides.
     */
    constructor (name: string,
                 types: Array<AlloySignature>,
                 tuples: Array<AlloyTuple>,
                 is_meta?: boolean,
                 is_private?: boolean) {

        super(name);

        this._types = types;
        this._tuples = tuples;
        this._is_meta = is_meta ? is_meta : false;
        this._is_private = is_private ? is_private : false;

        // Check that the field has an arity of at least two
        if (types.length < 2) {
            throw Error(`Field ${name} has arity less than two.`);
        }

        // Check that all tuples are composed of correct types
        tuples.forEach(tuple => {
            tuple.atoms().forEach((atom, i) => {
                if (atom.type() !== types[i]) {
                    throw Error(`Tuple ${tuple} has incorrect types.`);
                }
            });
        });

    }

    /**
     * Returns the number of "columns" in the relation defined by this field.
     */
    arity (): number {

        return this._types.length;

    }

    /**
     * Returns the string `field`.
     */
    expressionType (): string {

        return 'field';

    }

    /**
     * Returns the unique ID of this field.
     *
     * @remarks
     * The unique ID of a field is constructed as the name of the type of the
     * first column of the relation, followed by a `<:`, followed by the name
     * of this field.
     */
    id (): string {

        return this._types[0].name() + '<:' + this.name();

    }

    /**
     * Returns true if this is a meta field, false otherwise.
     */
    is_meta (): boolean {

        return this._is_meta;

    }

    /**
     * Returns true if this is a private field, false otherwise.
     */
    is_private (): boolean {

        return this._is_private;

    }

    /**
     * Returns the number of "rows" in the relation defined by this field.
     */
    size (): number {

        return this._tuples.length;

    }

    /**
     * Returns a printable string.
     */
    toString (): string {

        return this.name();

    }

    /**
     * Returns a copy of this field's tuples.
     */
    tuples (): Array<AlloyTuple> {

        return this._tuples.slice();

    }

    /**
     * Returns a copy of the types that define the columns of this relation.
     */
    types (): Array<AlloySignature> {

        return this._types.slice();

    }

}
