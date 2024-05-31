import { Branches, Definition, Sequence, Step } from '../model';
export interface StepChildren {
    type: StepChildrenType;
    items: Sequence | Branches;
}
export declare enum StepChildrenType {
    sequence = 1,
    branches = 2
}
export type StepOrName = Step | string;
export interface StepWithParentSequence {
    step: Step;
    /**
     * Index of the step in the parent sequence.
     */
    index: number;
    parentSequence: Sequence;
}
export type StepChildrenResolver = (step: Step) => StepChildren | null;
export type StepForEachCallback = (step: Step, index: number, parentSequence: Sequence) => void | boolean;
export declare class DefinitionWalker {
    private readonly resolvers;
    constructor(resolvers?: StepChildrenResolver[]);
    /**
     * Returns children of the step. If the step doesn't have children, returns null.
     * @param step The step.
     */
    getChildren(step: Step): StepChildren | null;
    /**
     * Returns the parents of the step or the sequence.
     * @param definition The definition.
     * @param needle The step, stepId or sequence to find.
     * @returns The parents of the step or the sequence.
     */
    getParents(definition: Definition, needle: Sequence | Step | string): StepOrName[];
    findParentSequence(definition: Definition, stepId: string): StepWithParentSequence | null;
    getParentSequence(definition: Definition, stepId: string): StepWithParentSequence;
    findById(definition: Definition, stepId: string): Step | null;
    getById(definition: Definition, stepId: string): Step;
    forEach(definition: Definition, callback: StepForEachCallback): void;
    forEachSequence(sequence: Sequence, callback: StepForEachCallback): void;
    forEachChildren(step: Step, callback: StepForEachCallback): void;
    private find;
    private iterateSequence;
    private iterateStep;
}
