export class View {
    constructor(selection) {
        this._view_selection = selection;
    }
    show() {
        if (this._view_selection)
            this._view_selection.style('display', null);
    }
    hide() {
        if (this._view_selection)
            this._view_selection.style('display', 'none');
    }
}
