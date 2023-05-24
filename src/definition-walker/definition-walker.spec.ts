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
	const ifAlfa = createIf('beta', taskFoo);
	const ifBeta = createIf('alfa', ifAlfa);
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
	});

	describe('findById', () => {
		it('returns null when stepId not exists', () => {
			const found = walker.findById(definition, 'invalidId');
			expect(found).toBeNull();
		});

		it('returns task step', () => {
			const found = walker.findById(definition, taskFoo.id);
			expect(found).toEqual(taskFoo);
		});

		it('returns container step', () => {
			const found = walker.findById(definition, loop.id);
			expect(found).toEqual(loop);
		});

		it('returns switch step', () => {
			const found = walker.findById(definition, ifBeta.id);
			expect(found).toEqual(ifBeta);
		});
	});
});
