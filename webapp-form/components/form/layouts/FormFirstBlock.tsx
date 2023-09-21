import { SmileyInput } from '../elements/SmileyInput';

export const FormFirstBlock = () => {
	return (
		<div>
			<form>
				<SmileyInput
					label="Comment s'est passée cette démarche pour vous ?"
					hint="Ce champ est obligatoire"
					name="satisfaction"
					onChange={value => {
						console.log(value);
					}}
				/>
			</form>
		</div>
	);
};
