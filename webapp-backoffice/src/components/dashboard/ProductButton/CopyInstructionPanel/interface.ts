import { FormTemplateButtonStyleType } from '@/prisma/generated/zod';
import {
	ButtonWithForm,
	ButtonWithTemplateButton,
	FormTemplateButtonWithVariants
} from '@/src/types/prismaTypesExtended';

export interface ButtonCopyInstructionsPanelProps {
	buttonStyle: FormTemplateButtonStyleType;
	button: ButtonWithForm & ButtonWithTemplateButton;
	formTemplateButton?: FormTemplateButtonWithVariants;
}

export type ButtonInstructionTabProps = ButtonCopyInstructionsPanelProps & {
	isForDemarchesSimplifiees?: boolean;
};
