import Alert from '@codegouvfr/react-dsfr/Alert';
import { Snackbar } from '@mui/material';

interface ToastProps {
	isOpen: boolean;
	setIsOpen: (isOpen: boolean) => void;
	autoHideDuration: number;
	severity: 'success' | 'info' | 'warning' | 'error';
	message: string;
}

export const Toast = ({
	isOpen,
	setIsOpen,
	autoHideDuration,
	severity,
	message
}: ToastProps) => {
	return (
		<Snackbar
			open={isOpen}
			autoHideDuration={autoHideDuration}
			onClose={() => setIsOpen(false)}
			role={severity === 'success' ? 'status' : 'alert'}
			sx={{
				'& .MuiPaper-root': {
					padding: 0,
					bgcolor: 'white',
					color: 'black'
				},
				'& .MuiSnackbarContent-message': {
					padding: 0
				}
			}}
			message={
				<div role="status">
					<Alert severity={severity} description={message} small />
				</div>
			}
		/>
	);
};
