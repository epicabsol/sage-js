import {
	BufferView,
	PrimitiveInt16S,
	PrimitiveInt8U
} from '@sage-js/core';
import {typed} from '../../typed';
import {InstructionBCL} from './class';

/**
 * InstructionBCLCompareAndBranchIfFalse constructor.
 */
@typed.decorate('InstructionBCLCompareAndBranchIfFalse')
export class InstructionBCLCompareAndBranchIfFalse
extends InstructionBCL {

	/**
	 * Instruction size.
	 */
	public static readonly SIZE = 3;

	/**
	 * Opcode name.
	 */
	public static readonly NAME = 'CompareAndBranchIfFalse';

	/**
	 * The opcode.
	 */
	public static readonly OPCODE = new PrimitiveInt8U(0x53);

	/**
	 * Argument count.
	 */
	public static readonly ARGC = 1;

	/**
	 * Argument 0.
	 */
	public static readonly ARG0 = PrimitiveInt16S;

	/**
	 * Argument 0.
	 */
	public arg0 = new PrimitiveInt16S();

	/**
	 * Resource constructor.
	 */
	constructor() {
		super();
	}

	/**
	 * Copy instance.
	 *
	 * @return Copied instance.
	 */
	public copy() {
		const r = this.createNew();
		r.arg0 = this.arg0;
		return r;
	}

	/**
	 * Readable implementation.
	 *
	 * @param view View to read from.
	 */
	public bufferRead(view: BufferView) {
		this._readOpcode(view);
		this.arg0 = view.readReadableNew(this.arg0);
	}

	/**
	 * Writable implementation.
	 *
	 * @param view View to write to.
	 */
	public bufferWrite(view: BufferView) {
		view.writeWritable(this.opcode);
		view.writeWritable(this.arg0);
	}
}
