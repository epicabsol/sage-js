import {typed} from './typed';
import {
	PrimitiveInt16S,
	PrimitiveInt16U,
	PrimitiveStringP8N
} from '@sage-js/core';
import {
	InstructionBCLPushConstantString
} from './instruction/bcl/pushconstantstring';
import {
	InstructionAbstractPushConstantStringString
} from './instruction/abstract/pushconstantstringstring';

import {
	InstructionBCLGetThisMemberFunction
} from './instruction/bcl/getthismemberfunction';
import {
	InstructionBCLGetThisMemberValue
} from './instruction/bcl/getthismembervalue';
import {
	InstructionBCLSetThisMemberValue
} from './instruction/bcl/setthismembervalue';
import {
	InstructionBCLGetMemberFunction
} from './instruction/bcl/getmemberfunction';
import {
	InstructionBCLGetMemberValue
} from './instruction/bcl/getmembervalue';
import {
	InstructionBCLSetMemberValue
} from './instruction/bcl/setmembervalue';
import {
	InstructionAbstractGetThisMemberFunctionString
} from './instruction/abstract/getthismemberfunctionstring';
import {
	InstructionAbstractGetThisMemberValueString
} from './instruction/abstract/getthismembervaluestring';
import {
	InstructionAbstractSetThisMemberValueString
} from './instruction/abstract/setthismembervaluestring';
import {
	InstructionAbstractGetMemberFunctionString
} from './instruction/abstract/getmemberfunctionstring';
import {
	InstructionAbstractGetMemberValueString
} from './instruction/abstract/getmembervaluestring';
import {
	InstructionAbstractSetMemberValueString
} from './instruction/abstract/setmembervaluestring';

import {OSI} from './osi';

describe('OSI', () => {
	describe('transformAbstractStrings*', () => {
		it('PushConstantString', () => {
			const osi = new OSI();
			osi.header.versionMajor = new PrimitiveInt16S(4);
			osi.header.versionMinor = new PrimitiveInt16S(1);
			osi.header.initVersion();

			const strp = new PrimitiveStringP8N('hello world');

			osi.header.stringTable.entries.push(strp);

			const inst = new InstructionBCLPushConstantString();
			inst.arg0 = new PrimitiveInt16U(0);

			const sub = osi.subroutines.addNew();
			sub.subroutine.instructions.push(inst);

			osi.transformAbstractStringAdd();

			const instAbs = typed.tryCast(
				sub.subroutine.instructions[0],
				InstructionAbstractPushConstantStringString
			);
			expect(instAbs.arg0.value).toBe(strp.value);

			osi.transformAbstractStringRemove();

			const instBCL = typed.tryCast(
				sub.subroutine.instructions[0],
				InstructionBCLPushConstantString
			);
			expect(instBCL.arg0.value).toBe(0);

			osi.transformAbstractStringAdd();
			osi.header.stringTable.entries = [];
			osi.transformAbstractStringRemove();

			const addedStr = osi.header.stringTable.entries[0];
			if (addedStr) {
				expect(addedStr.value).toBe(strp.value);
			}
			else {
				expect(addedStr).toBeTruthy();
			}
		});
	});

	describe('transformAbstractSymbols*', () => {
		const InstructionBCLs = [
			InstructionBCLGetThisMemberFunction,
			InstructionBCLGetThisMemberValue,
			InstructionBCLSetThisMemberValue,
			InstructionBCLGetMemberFunction,
			InstructionBCLGetMemberValue,
			InstructionBCLSetMemberValue
		];
		const InstructionAbstracts = [
			InstructionAbstractGetThisMemberFunctionString,
			InstructionAbstractGetThisMemberValueString,
			InstructionAbstractSetThisMemberValueString,
			InstructionAbstractGetMemberFunctionString,
			InstructionAbstractGetMemberValueString,
			InstructionAbstractSetMemberValueString
		];
		for (let i = 0; i < InstructionBCLs.length; i++) {
			const InstructionBCL = InstructionBCLs[i];
			const InstructionAbstract = InstructionAbstracts[i];

			it(InstructionBCL.NAME, () => {
				const osi = new OSI();
				osi.header.versionMajor = new PrimitiveInt16S(4);
				osi.header.versionMinor = new PrimitiveInt16S(1);
				osi.header.initVersion();

				const strp = new PrimitiveStringP8N('some_symbol');

				osi.header.symbolTable.entries.push(strp);

				const inst = new InstructionBCL();
				inst.arg0 = new PrimitiveInt16U(0);

				const sub = osi.subroutines.addNew();
				sub.subroutine.instructions.push(inst);

				osi.transformAbstractSymbolAdd();

				const instAbs = typed.tryCast(
					sub.subroutine.instructions[0],
					InstructionAbstract
				);
				expect(instAbs.arg0.value).toBe(strp.value);

				osi.transformAbstractSymbolRemove();

				const instBCL = typed.tryCast(
					sub.subroutine.instructions[0],
					InstructionBCL
				);
				expect(instBCL.arg0.value).toBe(0);

				osi.transformAbstractSymbolAdd();
				osi.header.symbolTable.entries = [];
				osi.transformAbstractSymbolRemove();

				const addedStr = osi.header.symbolTable.entries[0];
				if (addedStr) {
					expect(addedStr.value).toBe(strp.value);
				}
				else {
					expect(addedStr).toBeTruthy();
				}
			});
		}
	});
});