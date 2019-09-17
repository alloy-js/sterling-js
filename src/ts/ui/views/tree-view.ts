import { View } from './view';
import { TreeLayout } from '../../layouts/tree-layout';

export class TreeView extends View {

    _layout;

    constructor (selection) {

        super(selection);

        // TODO: Replace with layout instead of view
        this._layout = new TreeLayout(selection.select('#tree'));
        window.addEventListener('resize', this._layout.resize.bind(this._layout));

    }

    set_instance (instance) {

        this._layout.set_instance(instance);

    }

}