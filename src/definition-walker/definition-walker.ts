import { Branches, Definition, Sequence, Step } from '../model';
import { defaultResolvers } from './default-resolvers';

export interface StepChildren {
	type: StepChildrenType;
	items: Sequence | Branches;
}

export enum StepChildrenType {
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

type StepWithParentSequenceOrName = StepWithParentSequence | string;

export type StepChildrenResolver = (step: Step) => StepChildren | null;

export type StepForEachCallback = (step: Step, index: number, parentSequence: Sequence) => void | boolean;

export class DefinitionWalker {
	private readonly resolvers: StepChildrenResolver[];

	public constructor(resolvers?: StepChildrenResolver[]) {
		this.resolvers = resolvers ? resolvers.concat(defaultResolvers) : defaultResolvers;
	}

	/**
	 * Returns children of the step. If the step doesn't have children, returns null.
	 * @param step The step.
	 */
	public getChildren(step: Step): StepChildren | null {
		const count = this.resolvers.length;
		for (let i = 0; i < count; i++) {
			const result = this.resolvers[i](step);
			if (result) {
				return result;
			}
		}
		return null;
	}

	/**
	 * Returns the parents of the step or the sequence.
	 * @param definition The definition.
	 * @param needle The step, stepId or sequence to find.
	 * @returns The parents of the step or the sequence.
	 */
	public getParents(definition: Definition, needle: Sequence | Step | string): StepOrName[] {
		const result: StepWithParentSequenceOrName[] = [];

		let searchSequence: Sequence | null = null;
		let searchStepId: string | null = null;
		if (Array.isArray(needle)) {
			searchSequence = needle;
		} else if (typeof needle === 'string') {
			searchStepId = needle;
		} else {
			searchStepId = needle.id;
		}

		if (this.find(definition.sequence, searchSequence, searchStepId, result)) {
			result.reverse();
			return result.map(item => {
				return typeof item === 'string' ? item : item.step;
			});
		}

		throw new Error(searchStepId ? `Cannot get parents of step: ${searchStepId}` : 'Cannot get parents of sequence');
	}

	public findParentSequence(definition: Definition, stepId: string): StepWithParentSequence | null {
		const result: StepWithParentSequenceOrName[] = [];
		if (this.find(definition.sequence, null, stepId, result)) {
			return result[0] as StepWithParentSequence;
		}
		return null;
	}

	public getParentSequence(definition: Definition, stepId: string): StepWithParentSequence {
		const result = this.findParentSequence(definition, stepId);
		if (!result) {
			throw new Error(`Cannot find step by id: ${stepId}`);
		}
		return result;
	}

	public findById(definition: Definition, stepId: string): Step | null {
		const result = this.findParentSequence(definition, stepId);
		return result ? result.step : null;
	}

	public getById(definition: Definition, stepId: string): Step {
		return this.getParentSequence(definition, stepId).step;
	}

	public forEach(sequenceOrDefinition: Sequence | Definition, callback: StepForEachCallback) {
		const sequence = Array.isArray(sequenceOrDefinition) ? sequenceOrDefinition : sequenceOrDefinition.sequence;
		this.iterate(sequence, callback);
	}

	private find(
		sequence: Sequence,
		needSequence: Sequence | null,
		needStepId: string | null,
		result: StepWithParentSequenceOrName[]
	): boolean {
		if (needSequence && sequence === needSequence) {
			return true;
		}
		const count = sequence.length;
		for (let index = 0; index < count; index++) {
			const step = sequence[index];
			if (needStepId && step.id === needStepId) {
				result.push({ step, index, parentSequence: sequence });
				return true;
			}

			const children = this.getChildren(step);
			if (children) {
				switch (children.type) {
					case StepChildrenType.sequence:
						{
							const parentSequence = children.items as Sequence;
							if (this.find(parentSequence, needSequence, needStepId, result)) {
								result.push({ step, index, parentSequence });
								return true;
							}
						}
						break;

					case StepChildrenType.branches:
						{
							const branches = children.items as Branches;
							const branchNames = Object.keys(branches);
							for (const branchName of branchNames) {
								const parentSequence = branches[branchName];
								if (this.find(parentSequence, needSequence, needStepId, result)) {
									result.push(branchName);
									result.push({ step, index, parentSequence });
									return true;
								}
							}
						}
						break;

					default:
						throw new Error(`Step children type ${children.type} is not supported`);
				}
			}
		}
		return false;
	}

	private iterate(sequence: Sequence, callback: StepForEachCallback): boolean {
		const count = sequence.length;
		for (let index = 0; index < count; index++) {
			const step = sequence[index];
			if (callback(step, index, sequence) === false) {
				return false;
			}

			const children = this.getChildren(step);
			if (children) {
				switch (children.type) {
					case StepChildrenType.sequence:
						{
							const childSequence = children.items as Sequence;
							if (this.iterate(childSequence, callback) === false) {
								return false;
							}
						}
						break;

					case StepChildrenType.branches:
						{
							const branches = children.items as Branches;
							const branchNames = Object.keys(branches);
							for (const branchName of branchNames) {
								const parentSequence = branches[branchName];
								if (this.iterate(parentSequence, callback) === false) {
									return false;
								}
							}
						}
						break;

					default:
						throw new Error(`Step children type ${children.type} is not supported`);
				}
			}
		}
		return true;
	}
}
