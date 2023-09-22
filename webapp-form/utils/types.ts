export type Feeling = 'good' | 'bad' | 'medium';

export type Opinion = {
	satisfaction?: Feeling;
	easy?: Feeling;
	comprehension?: Feeling;
	difficulties: string[];
	difficulties_verbatim?: string;
	help: string[];
	help_verbatim?: string;
	verbatim?: string;
};

export type Product = {
	title: string;
};
