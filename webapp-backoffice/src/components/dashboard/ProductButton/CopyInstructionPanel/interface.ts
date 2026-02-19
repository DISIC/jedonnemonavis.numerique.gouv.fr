import { FormTemplateButtonStyleType } from '@/prisma/generated/zod';
import {
	ButtonWithElements,
	FormTemplateButtonWithVariants
} from '@/src/types/prismaTypesExtended';

export interface ButtonCopyInstructionsPanelProps {
	buttonStyle: FormTemplateButtonStyleType;
	button: ButtonWithElements;
	formTemplateButton?: FormTemplateButtonWithVariants;
}

export type ButtonInstructionTabProps = ButtonCopyInstructionsPanelProps & {
	isForDemarchesSimplifiees?: boolean;
};
