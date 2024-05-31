/**
 * @description Represents a definition of a sequential workflow.
 */
export interface Definition {
	/**
	 * @description The root sequence of the sequential workflow.
	 */
	sequence: Sequence;

	/**
	 * @description The global properties of the sequential workflow.
	 */
	properties: Properties;
}

/**
 * @description Represents a sequence of steps.
 */
export type Sequence = Step[];

/**
 * @description Represents a step in a sequence.
 */
export interface Step {
	/**
	 * @description The unique identifier for the step.
	 * @example `13a6c12bf8f49df7c6f6db3fb764c01c`
	 */
	id: string;

	/**
	 * @description The component type rendered by the designer.
	 * @example `task`, `container`, `switch`, `folder`
	 */
	componentType: ComponentType;

	/**
	 * @description The type of the step.
	 * @example `sendEmail`, `readFile`, `writeFile`, `if`, `while`
	 */
	type: string;

	/**
	 * @description The name of the step.
	 * @example `Send email to Greg`, `Read x.txt`, `Write z.txt`, `If 0`, `While x < 10`
	 */
	name: string;

	/**
	 * @description The properties of the step.
	 */
	properties: Properties;

	/**
	 * @description The items of the step.
	 */
	items: string[]
	
}

/**
 * @description Represents a component type.
 */
export type ComponentType = string;

/**
 * @description Represents a set of branches.
 */
export interface Branches {
	[branchName: string]: Sequence;
}

/**
 * @description Represents a set of properties.
 */
export interface Properties {
	[propertyName: string]: PropertyValue;
}

/**
 * @description Represents a property value. The value must be serializable to JSON.
 */
export type PropertyValue = string | string[] | number | number[] | boolean | boolean[] | null | object;

// Extended types

/**
 * @description Represents a step that contains branches.
 */
export interface BranchedStep extends Step {
	/**
	 * @description The branches of the step.
	 */
	branches: Branches;
}

/**
 * @description Represents a step that contains a subsequence.
 */
export interface SequentialStep extends Step {
	/**
	 * @description The subsequence of the step.
	 */
	sequence: Sequence;
}
