import { AlloySignature } from './alloy-signature';

/**
 * An Alloy signature paired with the ID assigned to it in the instance XML file
 */
interface IDSig {

    /**
     * The ID assigned to the signature in the instance XML file
     */
    id: number,

    /**
     * The ID of the signature's parent
     */
    parentID?: number,

    /**
     * The signature
     */
    sig: AlloySignature

}

/**
 * Build a function that can be used to filter an array of Elements by
 * removing those with a specific "label" attribute value.
 * @param exclude The labels to exclude
 */
function filter_exclude_labels (...exclude: Array<string>): {(element: Element): boolean} {

    return (element: Element) => {
        let label = element.getAttribute('label');
        return !exclude.includes(label);
    }

}

/**
 * Build a function that can be used to filter an array of Elements by
 * removing those that have any of the given attributes.
 * @param exclude
 */
function filter_exclude_attr (...exclude: Array<string>): {(element: Element): boolean} {

    return (element: Element) => {
        return !exclude.find(attr => !!element.getAttribute(attr));
    }

}

/**
 * Determine if the given element is a subset signature.
 *
 * @remarks
 * In an Alloy XML file, a subset signature will have a "type" element that
 * defines which signature it is a subset of.
 *
 * @param element The element to test
 */
function is_subset (element: Element) {

    return element.tagName === 'sig' && !!element.querySelector('type');

}

export {
    IDSig,
    filter_exclude_attr,
    filter_exclude_labels,
    is_subset
}
