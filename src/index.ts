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
	 */
	id: string;

	/**
	 * @description The component type rendered by the designer.
	 */
	componentType: ComponentType;

	/**
	 * @description The type of the step.
	 */
	type: string;

	/**
	 * @description The name of the step.
	 */
	name: string;

	/**
	 * @description The properties of the step.
	 */
	properties: Properties;
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
};

/**
 * @description Represents a property value. The value must be serializable.
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
