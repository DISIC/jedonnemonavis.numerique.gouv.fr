import React, {
	memo,
	forwardRef,
	type CSSProperties,
	AnchorHTMLAttributes,
	DetailedHTMLProps
} from 'react';
import { assert } from 'tsafe/assert';
import type { Equals } from 'tsafe';
import { fr } from '@codegouvfr/react-dsfr';
import { tss } from 'tss-react/dsfr';
import Link from 'next/link';
import { RegisterLink } from '@codegouvfr/react-dsfr/next-pagesdir';

type HTMLAnchorProps = DetailedHTMLProps<
	AnchorHTMLAttributes<HTMLAnchorElement>,
	HTMLAnchorElement
>;

export type RegisteredLinkProps = RegisterLink extends {
	Link: (props: infer LinkProps) => any;
}
	? Omit<LinkProps, 'children'>
	: Omit<HTMLAnchorProps, 'children'>;

export type PaginationProps = {
	id?: string;
	className?: string;
	count: number;
	defaultPage?: number;
	classes?: Partial<Record<'root' | 'list' | 'link', string>>;
	style?: CSSProperties;
	showFirstLast?: boolean;
	maxVisiblePages?: number;
	slicesSize?: number;
	getPageLinkProps: (pageNumber: number) => RegisteredLinkProps;
};

// naive page slicing
const getPaginationParts = ({
	count,
	defaultPage,
	maxVisiblePages,
	slicesSize
}: {
	count: number;
	defaultPage: number;
	maxVisiblePages: number;
	slicesSize: number;
}) => {
	// first n pages
	if (count <= maxVisiblePages) {
		return Array.from({ length: count }, (_, v) => ({
			number: v + 1,
			active: defaultPage === v + 1
		}));
	}
	// last n pages
	if (defaultPage > count - maxVisiblePages) {
		return Array.from({ length: maxVisiblePages }, (_, v) => {
			const pageNumber = count - (maxVisiblePages - v) + 1;
			return {
				number: pageNumber,
				active: defaultPage === pageNumber
			};
		});
	}
	// slices
	return [
		...Array.from({ length: slicesSize }, (_, v) => {
			if (defaultPage > slicesSize) {
				const pageNumber = v + defaultPage;
				return { number: pageNumber, active: defaultPage === pageNumber };
			}
			return { number: v + 1, active: defaultPage === v + 1 };
		}),
		{ number: null, active: false },
		...Array.from({ length: slicesSize }, (_, v) => {
			const pageNumber = count - (slicesSize - v) + 1;
			return {
				number: pageNumber,
				active: defaultPage === pageNumber
			};
		})
	];
};

/** @see <https://components.react-dsfr.codegouv.studio/?path=/docs/components-pagination> */
export const Pagination = memo(
	forwardRef<HTMLDivElement, PaginationProps>((props, ref) => {
		const {
			id: id_props,
			className,
			count,
			defaultPage = 1,
			showFirstLast = true,
			maxVisiblePages = 10,
			slicesSize = 4,
			getPageLinkProps,
			classes = {},
			style,
			...rest
		} = props;

		const { cx } = useStyles();

		assert<Equals<keyof typeof rest, never>>();

		// const id = useAnalyticsId({
		// 	defaultIdPrefix: 'fr-pagination',
		// 	explicitlyProvidedId: id_props
		// });

		// const { Link } = getLink();

		const parts = getPaginationParts({
			count,
			defaultPage,
			maxVisiblePages,
			slicesSize
		});

		return (
			<nav
				// id={id}
				role="navigation"
				className={cx(fr.cx('fr-pagination'), classes.root, className)}
				aria-label={count > 0 ? 'Pagination' : 'Aucun résultat'}
				style={style}
				ref={ref}
			>
				<ul className={cx(fr.cx('fr-pagination__list'), classes.list)}>
					{showFirstLast && (
						<li>
							{count > 0 && defaultPage > 1 ? (
								<Link
									{...getPageLinkProps(1)}
									className={cx(
										fr.cx('fr-pagination__link', 'fr-pagination__link--first'),
										classes.link,
										getPageLinkProps(1).className
									)}
									aria-disabled={true}
									role="link"
								>
									Première page
								</Link>
							) : (
								<a
									className={cx(
										fr.cx('fr-pagination__link', 'fr-pagination__link--first'),
										classes.link
									)}
									role="link"
								>
									Première page
								</a>
							)}
						</li>
					)}
					<li>
						{defaultPage > 1 ? (
							<Link
								className={cx(
									fr.cx(
										'fr-pagination__link',
										'fr-pagination__link--prev',
										'fr-pagination__link--lg-label'
									),
									classes.link
								)}
								{...getPageLinkProps(defaultPage - 1)}
								aria-disabled={true}
								role="link"
							>
								page précédente
							</Link>
						) : (
							<a
								className={cx(
									fr.cx(
										'fr-pagination__link',
										'fr-pagination__link--prev',
										'fr-pagination__link--lg-label'
									),
									classes.link
								)}
								role="link"
							>
								page précédente
							</a>
						)}
					</li>
					{parts.map(part => (
						<li key={part.number}>
							{part.number === null ? (
								<a className={cx(fr.cx('fr-pagination__link'), classes.link)}>
									...
								</a>
							) : (
								<Link
									className={cx(fr.cx('fr-pagination__link'), classes.link)}
									aria-current={part.active ? true : undefined}
									title={`Page ${part.number}`}
									{...getPageLinkProps(part.number)}
								>
									{part.number}
								</Link>
							)}
						</li>
					))}
					<li>
						{defaultPage < count ? (
							<Link
								className={cx(
									fr.cx(
										'fr-pagination__link',
										'fr-pagination__link--next',
										'fr-pagination__link--lg-label'
									),
									classes.link
								)}
								{...getPageLinkProps(defaultPage + 1)}
								role="link"
							>
								page suivante
							</Link>
						) : (
							<a
								className={cx(
									fr.cx(
										'fr-pagination__link',
										'fr-pagination__link--next',
										'fr-pagination__link--lg-label'
									),
									classes.link
								)}
								aria-disabled={true}
								role="link"
							>
								page suivante
							</a>
						)}
					</li>
					{showFirstLast && (
						<li>
							{defaultPage < count ? (
								<Link
									className={cx(
										fr.cx('fr-pagination__link', 'fr-pagination__link--last'),
										classes.link
									)}
									{...getPageLinkProps(count)}
									aria-disabled={true}
									role="link"
								>
									Dernière page
								</Link>
							) : (
								<a
									className={cx(
										fr.cx('fr-pagination__link', 'fr-pagination__link--last'),
										classes.link
									)}
									role="link"
								>
									Dernière page
								</a>
							)}
						</li>
					)}
				</ul>
			</nav>
		);
	})
);

Pagination.displayName = 'Pagination';

const useStyles = tss.create({});
