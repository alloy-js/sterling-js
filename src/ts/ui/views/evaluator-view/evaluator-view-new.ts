import { Instance } from '../../..';
import { AlloyConnection } from '../../server/alloy-connection';
import { View } from '../view';
import { Evaluator } from './evaluator';
import Split from 'split.js';
import { EvaluatorInput } from './evaluator-input';
import { EvaluatorOutput } from './evaluator-output';
import { EvaluatorStageNew } from './evaluator-stage-new';

export class EvaluatorViewNew extends View {

    _evaluator: Evaluator;
    _input: EvaluatorInput;
    _output: EvaluatorOutput;
    _stage: EvaluatorStageNew;

    constructor (selection, alloy: AlloyConnection) {

        super(selection);

        Split(['#eval-editor', '#eval-display'], {
            sizes: [30, 70],
            minSize: [300, 100],
            gutterSize: 4
        });
        Split(['#eval-output', '#eval-console'], {
            sizes: [75, 25],
            direction: 'vertical',
            gutterSize: 4
        });

        this._evaluator = new Evaluator(alloy);
        this._input = new EvaluatorInput(selection.select('#eval-input'));
        this._output = new EvaluatorOutput(selection.select('#eval-output'));
        this._stage = new EvaluatorStageNew(selection.select('#eval-display'));

        this._input.addEventListener('evaluate', event => this._evaluator.evaluate(event.text));
        this._evaluator.addEventListener('ready', event => this._input.enable(event.ready));
        this._evaluator.addEventListener('update', event => this._output.expressions(event.expressions));

    }

    set_instance (instance: Instance) {

        const nodes = instance.atoms().map(atom => ({
            id: atom.id()
        }));

        this._stage.nodes(nodes);

        const tuples = instance.tuples().map(tuple => {
            const atoms = tuple.atoms();
            return {
                source: atoms[0].id(),
                target: atoms[atoms.length-1].id(),
                relation: tuple.parent().id()
            };
        });

        this._stage.addTuples(tuples);

    }

    _on_hide (): void {

    }

    _on_show (): void {

    }

}
