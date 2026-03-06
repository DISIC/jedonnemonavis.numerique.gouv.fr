import { FormTemplateButtonStyleType } from '@/prisma/generated/zod';
import {
	ButtonWithElements,
	FormTemplateButtonWithVariants
} from '@/src/types/prismaTypesExtended';
import { ButtonIntegrationTypes } from '@prisma/client';

export interface ButtonCopyInstructionsPanelProps {
	buttonStyle?: FormTemplateButtonStyleType | null;
	button?: ButtonWithElements;
	formTemplateButton?: FormTemplateButtonWithVariants | null;
	integrationType?: ButtonIntegrationTypes;
}

export type ButtonInstructionTabProps = ButtonCopyInstructionsPanelProps & {
	isForDemarchesSimplifiees?: boolean;
};
