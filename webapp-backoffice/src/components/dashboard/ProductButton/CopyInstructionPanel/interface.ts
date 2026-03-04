import { FormTemplateButtonStyleType } from '@/prisma/generated/zod';
import {
	ButtonWithElements,
	FormTemplateButtonWithVariants
} from '@/src/types/prismaTypesExtended';

export interface ButtonCopyInstructionsPanelProps {
	buttonStyle?: FormTemplateButtonStyleType | null;
	button: ButtonWithElements;
	formTemplateButton?: FormTemplateButtonWithVariants | null;
}

export type ButtonInstructionTabProps = ButtonCopyInstructionsPanelProps & {
	isForDemarchesSimplifiees?: boolean;
};
