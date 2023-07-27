import { DefinitionWalker, StepChildrenType } from './definition-walker';
import { BranchedStep, SequentialStep, Step } from '../model';

describe('DefinitionWalker', () => {
	function createIf(name: string, falseStep: Step): BranchedStep {
		return {
			componentType: 'switch',
			id: 'if' + name,
			type: 'if' + name,
			name,
			branches: {
				true: [],
				false: [falseStep]
			},
			properties: {}
		};
	}

	function createTask(name: string): Step {
		return {
			componentType: 'task',
			id: 'task' + name,
			type: 'task' + name,
			name,
			properties: {}
		};
	}

	const taskFoo = createTask('foo');
	const ifAlfa = createIf('alfa', taskFoo);
	const ifBeta = createIf('beta', ifAlfa);
	const loop = {
		componentType: 'container',
		id: 'loop',
		name: 'loop',
		type: 'loop',
		properties: {},
		sequence: [ifBeta]
	} as SequentialStep;
	const definition = {
		sequence: [
			createIf('q', createTask('p')),
			loop // loop > ifBeta > 'false' > ifAlfa > 'false' > taskFoo
		],
		properties: {}
	};

	let walker: DefinitionWalker;

	beforeAll(() => {
		walker = new DefinitionWalker();
	});

	describe('getChildren', () => {
		it('returns null for task', () => {
			expect(walker.getChildren(taskFoo)).toBeNull();
		});

		it('returns single sequence for container', () => {
			const result = walker.getChildren(loop);
			expect(result?.type).toEqual(StepChildrenType.sequence);
			expect(result?.items).toEqual(loop.sequence);
		});

		it('returns branches for branched step', () => {
			const result = walker.getChildren(ifBeta);
			expect(result?.type).toEqual(StepChildrenType.branches);
			expect(result?.items).toEqual(ifBeta.branches);
		});
	});

	describe('getParents', () => {
		it('returns task parents', () => {
			const parents = walker.getParents(definition, taskFoo);
			expect(parents.length).toEqual(6);
			expect(parents[0]).toEqual(loop);
			expect(parents[1]).toEqual(ifBeta);
			expect(parents[2]).toEqual('false');
			expect(parents[3]).toEqual(ifAlfa);
			expect(parents[4]).toEqual('false');
			expect(parents[5]).toEqual(taskFoo);
		});

		it('returns alfa parents', () => {
			const parents = walker.getParents(definition, ifBeta);
			expect(parents.length).toEqual(2);
			expect(parents[0]).toEqual(loop);
			expect(parents[1]).toEqual(ifBeta);
		});

		it('returns loop parents', () => {
			const parents = walker.getParents(definition, loop);
			expect(parents.length).toEqual(1);
			expect(parents[0]).toEqual(loop);
		});

		it('returns no parents for root sequence', () => {
			const parents = walker.getParents(definition, definition.sequence);
			expect(parents.length).toEqual(0);
		});

		it('returns parents when passed stepId', () => {
			const parents = walker.getParents(definition, 'ifbeta');
			expect(parents.length).toEqual(2);
			expect(parents[0]).toBe(loop);
			expect(parents[1]).toBe(ifBeta);
		});
	});

	describe('findById', () => {
		it('returns null when stepId not exists', () => {
			const found = walker.findById(definition, 'invalidId');
			expect(found).toBeNull();
		});

		it('returns task step', () => {
			const found = walker.findById(definition, taskFoo.id);
			expect(found).toBe(taskFoo);
		});

		it('returns container step', () => {
			const found = walker.findById(definition, loop.id);
			expect(found).toBe(loop);
		});

		it('returns switch step', () => {
			const found = walker.findById(definition, ifBeta.id);
			expect(found).toBe(ifBeta);
		});
	});

	describe('forEach', () => {
		it('iterates over defition', () => {
			let count = 0;

			walker.forEach(definition, (step, index, parent) => {
				switch (count) {
					case 0:
						expect(step).toBe(definition.sequence[0]);
						expect(index).toBe(0);
						expect(parent).toBe(definition.sequence);
						break;
					case 1:
						expect(step).toBe((definition.sequence[0] as BranchedStep).branches['false'][0]);
						break;
					case 2:
						expect(step).toBe(loop);
						break;
					case 3:
						expect(step).toBe(ifBeta);
						expect(index).toBe(0);
						expect(parent).toBe(loop.sequence);
						break;
					case 4:
						expect(step).toBe(ifAlfa);
						break;
					case 5:
						expect(step).toBe(taskFoo);
						break;
				}
				count++;
			});

			expect(count).toEqual(6);
		});

		it('stops when callback returns false', () => {
			let count = 0;

			walker.forEach(definition, () => {
				count++;
				if (count === 2) {
					return false;
				}
			});

			expect(count).toEqual(2);
		});
	});

	describe('forEachSequence', () => {
		it('iterates over sequence', () => {
			const steps: Step[] = [];

			walker.forEachSequence(loop.sequence, step => {
				steps.push(step);
			});

			expect(steps.length).toEqual(3);
			expect(steps[0]).toBe(ifBeta);
			expect(steps[1]).toBe(ifAlfa);
			expect(steps[2]).toBe(taskFoo);
		});
	});

	describe('forEachChildren', () => {
		it('iterates when sequential step is passed', () => {
			const steps: Step[] = [];

			walker.forEachChildren(loop, step => {
				steps.push(step);
			});

			expect(steps.length).toEqual(3);
			expect(steps[0]).toBe(ifBeta);
			expect(steps[1]).toBe(ifAlfa);
			expect(steps[2]).toBe(taskFoo);
		});

		it('iterates when branched step is passed', () => {
			const steps: Step[] = [];

			walker.forEachChildren(ifBeta, step => {
				steps.push(step);
			});

			expect(steps.length).toEqual(2);
			expect(steps[0]).toBe(ifAlfa);
			expect(steps[1]).toBe(taskFoo);
		});
	});
});
