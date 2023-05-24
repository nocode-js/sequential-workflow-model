import { BranchedStep, SequentialStep, Step } from '../model';
import { StepChildren, StepChildrenResolver, StepChildrenType } from './definition-walker';

export const defaultResolvers: StepChildrenResolver[] = [sequentialResolver, branchedResolver];

function branchedResolver(step: Step): StepChildren | null {
	const branches = (step as BranchedStep).branches;
	if (branches) {
		return { type: StepChildrenType.branches, items: branches };
	}
	return null;
}

function sequentialResolver(step: Step): StepChildren | null {
	const sequence = (step as SequentialStep).sequence;
	if (sequence) {
		return { type: StepChildrenType.sequence, items: sequence };
	}
	return null;
}
