/**
 * The abstract superclass for all elements of an Alloy instance.
 */
export class AlloyElement {
    /**
     * Create a new named Element.
     * @param name The name of the element
     */
    constructor(name) {
        this._name = name;
    }
    /**
     * Returns the name of this element.
     */
    name() {
        return this._name;
    }
}
