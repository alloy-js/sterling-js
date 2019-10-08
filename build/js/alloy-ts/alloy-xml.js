/**
 * Build a function that can be used to filter an array of Elements by
 * removing those with a specific "label" attribute value.
 * @param exclude The labels to exclude
 */
function filter_exclude_labels(...exclude) {
    return (element) => {
        let label = element.getAttribute('label');
        return !exclude.includes(label);
    };
}
/**
 * Build a function that can be used to filter an array of Elements by
 * removing those that have any of the given attributes.
 * @param exclude
 */
function filter_exclude_attr(...exclude) {
    return (element) => {
        return !exclude.find(attr => !!element.getAttribute(attr));
    };
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
function is_subset(element) {
    return element.tagName === 'sig' && !!element.querySelector('type');
}
export { filter_exclude_attr, filter_exclude_labels, is_subset };
