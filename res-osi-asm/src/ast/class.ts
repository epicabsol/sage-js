import {typed} from '../typed';

/**
 * AST constructor.
 */
export abstract class AST extends Object {

	constructor() {
		super();
	}

	/**
	 * Create new instance of same type.
	 *
	 * @return New instance.
	 */
	public createNew() {
		const Constructor = this.constructor as new() => AST;
		return new Constructor() as this;
	}

	/**
	 * Copy instance.
	 *
	 * @return Copied instance.
	 */
	public copy() {
		const r = this.createNew();
		return r;
	}
}
typed.decorate('AST')(AST);
