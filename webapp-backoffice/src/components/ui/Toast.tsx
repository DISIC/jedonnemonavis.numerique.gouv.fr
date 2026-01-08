import Alert from '@codegouvfr/react-dsfr/Alert';
import { Snackbar, SnackbarOrigin } from '@mui/material';

interface ToastProps {
	isOpen: boolean;
	setIsOpen: (isOpen: boolean) => void;
	autoHideDuration: number;
	severity: 'success' | 'info' | 'warning' | 'error';
	message: string;
	placement?: SnackbarOrigin;
}

export const Toast = ({
	isOpen,
	setIsOpen,
	autoHideDuration,
	severity,
	message,
	placement
}: ToastProps) => {
	return (
		<Snackbar
			open={isOpen}
			autoHideDuration={autoHideDuration}
			onClose={() => setIsOpen(false)}
			role={severity === 'success' ? 'status' : 'alert'}
			anchorOrigin={placement}
			sx={{
				'& .MuiPaper-root': {
					padding: 0,
					bgcolor: 'white',
					color: 'black'
				},
				'& .MuiSnackbarContent-message': {
					padding: 0
				},
				zIndex: 9999
			}}
			message={
				<div role="alert">
					<Alert severity={severity} description={message} small />
				</div>
			}
		/>
	);
};
