import { AlloyElement } from './alloy-element';
import { AlloySignature } from './alloy-signature';

export class AlloyField extends AlloyElement {

    private readonly _types: Array<AlloySignature>;

    private readonly _is_meta: boolean;
    private readonly _is_private: boolean;

    constructor (name: string,
                 types: Array<AlloySignature>,
                 is_meta: boolean,
                 is_private: boolean) {

        super(name);

        this._types = types;
        this._is_meta = is_meta;
        this._is_private = is_private;

    }

    /**
     * Returns the number of "columns" in the relation defined by this field.
     */
    arity (): number {

        return this._types.length;

    }

    /**
     * Returns the string 'field'.
     */
    expressionType (): string {

        return 'field';

    }

    id (): string {

        return '';

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

        return 0;

    }

}