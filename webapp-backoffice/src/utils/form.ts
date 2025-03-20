export type Feeling = 'good' | 'bad' | 'medium';

type Smiley = {
	label: string;
	value: Feeling;
	img: string;
	imgSelected: string;
};

export const smileys: Smiley[] = [
	{
		label: 'Pas bien',
		value: 'bad',
		img: '/assets/smileys/bad.svg',
		imgSelected: '/assets/smileys/bad-selected.svg'
	},
	{
		label: 'Moyen',
		value: 'medium',
		img: '/assets/smileys/medium.svg',
		imgSelected: '/assets/smileys/medium-selected.svg'
	},
	{
		label: 'Très bien',
		value: 'good',
		img: '/assets/smileys/good.svg',
		imgSelected: '/assets/smileys/good-selected.svg'
	}
];
