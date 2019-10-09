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
/**
 * Comparison function that can be used to sort an array of subset sig elements
 * based on type hierarchy. Guarantees that parents will appear before children.
 * @param a A subset sig element from an Alloy XML file
 * @param b A subset sig element from an Alloy XML file
 */
function subset_sort(a, b) {
    let aID = a.getAttribute('ID'), bID = b.getAttribute('ID'), aT = subset_type_id(a), bT = subset_type_id(b);
    if (!aID || !bID)
        throw Error('Element has no ID');
    if (bT === parseInt(aID))
        return -1;
    if (aT === parseInt(bID))
        return 1;
    return 0;
}
/**
 * Get the parent ID of a subset signature
 * @param element The subset signature element
 */
function subset_type_id(element) {
    let t = element.querySelector('type').getAttribute('ID');
    if (!t)
        throw Error('Element is not a subset signature');
    return parseInt(t);
}
export { filter_exclude_attr, filter_exclude_labels, is_subset, subset_sort, subset_type_id };
