import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { GetServerSideProps } from 'next/types';
import { tss } from 'tss-react/dsfr';
import prisma from '../../utils/db';
import { fr } from '@codegouvfr/react-dsfr';
import { FormWithElements } from '@/src/utils/types';
import { useState, useEffect, useRef } from 'react';
import { FormStepRenderer } from '@/src/components/form/layouts/FormStepRenderer';
import Button from '@codegouvfr/react-dsfr/Button';
import { Alert } from '@codegouvfr/react-dsfr/Alert';
import Success from '@codegouvfr/react-dsfr/picto/Success';
import { trpc } from '@/src/utils/trpc';
import { v4 as uuidv4 } from 'uuid';
import Notice from '@codegouvfr/react-dsfr/Notice';
import {
	DynamicAnswerData,
	FormAnswers,
	getVisibleBlocks,
	hasBlockAnswer,
	hasAllRequiredBlockAnswers,
	getInvalidEmailBlocks
} from '@/src/utils/form-validation';

type AvisPageProps = {
	form: FormWithElements;
	buttonId: number;
	productId: number;
	isPreview: boolean;
	isWidget: boolean;
	widgetNonce: string | null;
};

export default function AvisPage({
	form,
	buttonId,
	productId,
	isPreview,
	isWidget,
	widgetNonce
}: AvisPageProps) {
	const { classes, cx } = useStyles({ isWidget });

	const [currentStepIndex, setCurrentStepIndex] = useState(0);
	const [answers, setAnswers] = useState<FormAnswers>({});
	const [isSubmitted, setIsSubmitted] = useState(false);
	const [isRateLimitReached, setIsRateLimitReached] = useState(false);
	const [showValidationErrors, setShowValidationErrors] = useState(false);
	const reviewRef = useRef<{ id: number; created_at: Date } | null>(null);
	const createPromiseRef = useRef<Promise<{
		id: number;
		created_at: Date;
	} | null> | null>(null);

	// Send content height to parent widget for dynamic resizing
	const contentRef = useRef<HTMLDivElement>(null);
	const formRef = useRef<HTMLFormElement>(null);
	const isInitialStepMount = useRef(true);

	useEffect(() => {
		if (isInitialStepMount.current) {
			isInitialStepMount.current = false;
			return;
		}
		const firstField = formRef.current?.querySelector<HTMLElement>(
			'input:not([type="hidden"]):not([disabled]), textarea:not([disabled]), select:not([disabled])'
		);
		firstField?.focus();
	}, [currentStepIndex]);

	useEffect(() => {
		if (!isWidget || window.parent === window || !contentRef.current) return;

		const el = contentRef.current;

		const sendHeight = () => {
			const height = el.offsetHeight;
			window.parent.postMessage(
				{ source: 'jdma-widget', type: 'resize', height, nonce: widgetNonce },
				'*'
			);
		};

		const observer = new ResizeObserver(sendHeight);
		observer.observe(el);
		sendHeight();

		return () => observer.disconnect();
	}, [isWidget, widgetNonce, currentStepIndex, isSubmitted]);

	const formConfig = form.form_configs[0];
	const allSteps = form.form_template.form_template_steps;
	const steps = allSteps.filter(step => {
		const isHidden = formConfig?.form_config_displays?.some(
			d => d.kind === 'step' && d.parent_id === step.id && d.hidden
		);
		return !isHidden;
	});

	const currentStep = steps[currentStepIndex];

	const createReview = trpc.review.dynamicCreate.useMutation({
		onSuccess: () => {
			setIsRateLimitReached(false);
		},
		onError: error => {
			if (error.data?.httpStatus === 429) {
				localStorage.removeItem('userId');
				setIsRateLimitReached(true);
				return;
			}
			console.error('Error creating review:', error);
		}
	});

	const insertOrUpdateReview = trpc.review.dynamicInsertOrUpdate.useMutation({
		onError: error => {
			console.error('Error updating review:', error);
		}
	});

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		const invalidEmailBlocks = getInvalidEmailBlocks(
			currentStep.form_template_blocks,
			answers,
			formConfig
		);
		if (invalidEmailBlocks.length > 0) {
			setShowValidationErrors(true);
			formRef.current
				?.querySelector<HTMLInputElement>(`#input-${invalidEmailBlocks[0].id}`)
				?.focus();
			return;
		}

		const isLastStep = currentStepIndex === steps.length - 1;

		const saved = await saveCurrentStep();
		if (!saved) return;

		if (isLastStep) {
			setIsSubmitted(true);
			// Notify parent window when embedded as a widget
			if (isWidget && window.parent !== window) {
				window.parent.postMessage(
					{ source: 'jdma-widget', type: 'submitted', nonce: widgetNonce },
					'*'
				);
			}
		} else {
			setShowValidationErrors(false);
			setCurrentStepIndex(currentStepIndex + 1);
		}
	};

	const handlePrevious = () => {
		if (currentStepIndex > 0) {
			setShowValidationErrors(false);
			setCurrentStepIndex(currentStepIndex - 1);
		}
	};

	const getAnswersArray = (): DynamicAnswerData[] => {
		return Object.values(answers).flat();
	};

	const saveCurrentStep = async (): Promise<boolean> => {
		if (isPreview) return true;

		const currentStepAnswers = getAnswersArray().filter(answer => {
			return currentStep.form_template_blocks.some(block => {
				return block.id === answer.block_id;
			});
		});

		if (currentStepAnswers.length === 0) return true;

		let userId = localStorage.getItem('userId');
		if (!userId) {
			userId = uuidv4();
			localStorage.setItem('userId', userId);
		}

		if (!reviewRef.current && !createPromiseRef.current) {
			createPromiseRef.current = createReview
				.mutateAsync({
					review: {
						product_id: productId,
						button_id: buttonId,
						form_id: form.id,
						user_id: userId
					},
					answers: currentStepAnswers
				})
				.then(data => {
					const identity = {
						id: data.data.id,
						created_at: data.data.created_at
					};
					reviewRef.current = identity;
					return identity;
				})
				.catch(() => {
					createPromiseRef.current = null;
					return null;
				});
			return (await createPromiseRef.current) !== null;
		}

		const review = reviewRef.current;
		if (review) {
			insertOrUpdateReview.mutate({
				review_id: review.id,
				review_created_at: review.created_at,
				answers: currentStepAnswers
			});
			return true;
		}

		const pendingCreate = createPromiseRef.current;
		if (pendingCreate) {
			const identity = await pendingCreate;
			if (!identity) return false;
			insertOrUpdateReview.mutate({
				review_id: identity.id,
				review_created_at: identity.created_at,
				answers: currentStepAnswers
			});
		}

		return true;
	};

	const PreviewAlert = () => (
		<Notice
			className={cx(classes.notice)}
			isClosable
			onClose={function noRefCheck() {}}
			title={
				<>
					<b>Vous prévisualisez une version non plubliée du formulaire.</b>
					<span className={fr.cx('fr-ml-2v')}>
						Vos réponses ne sont pas prises en compte.
					</span>
				</>
			}
		/>
	);

	if (isSubmitted) {
		return (
			<div ref={contentRef}>
				{isPreview && !isWidget && <PreviewAlert />}
				<div className={classes.blueSection} />
				<div
					className={cx(
						classes.container,
						fr.cx('fr-container--fluid', 'fr-container')
					)}
				>
					<div className={fr.cx('fr-grid-row', 'fr-grid-row--center')}>
						<div className={fr.cx('fr-col-12', 'fr-col-lg-9')}>
							<div className={cx(classes.formSection, classes.thanksSection)}>
								<Success className={fr.cx('fr-mt-6v', 'fr-mb-2v')} />
								<h1>Merci beaucoup !</h1>
								<p className={fr.cx('fr-mt-8v')}>
									Merci, votre avis nous permettra d’améliorer la qualité du
									service.
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}

	const isFirstStep = currentStepIndex === 0;

	const visibleBlocks = getVisibleBlocks(
		currentStep.form_template_blocks,
		formConfig
	);
	const firstVisibleBlock = visibleBlocks[0];

	const isFirstAnswerEmpty =
		isFirstStep &&
		!!firstVisibleBlock &&
		!hasBlockAnswer(answers[`block_${firstVisibleBlock.id}`]);

	const hasAllRequiredAnswers = hasAllRequiredBlockAnswers(
		currentStep.form_template_blocks,
		answers,
		formConfig
	);

	return (
		<div ref={contentRef}>
			{isPreview && !isWidget && <PreviewAlert />}
			<div className={classes.blueSection} />
			<div
				className={cx(
					classes.container,
					fr.cx('fr-container--fluid', 'fr-container')
				)}
			>
				<div className={fr.cx('fr-grid-row', 'fr-grid-row--center')}>
					<div className={fr.cx('fr-col-12', 'fr-col-lg-9')}>
						<div className={classes.formSection}>
							<form ref={formRef} onSubmit={handleSubmit} noValidate>
								<FormStepRenderer
									step={currentStep}
									form={form}
									answers={answers}
									setAnswers={setAnswers}
									currentStepIndex={currentStepIndex}
									totalSteps={steps.length}
									isWidget={isWidget}
									showValidationErrors={showValidationErrors}
								/>

								{isRateLimitReached && (
									<div role="alert">
										<Alert
											severity="error"
											title=""
											description="Trop de tentatives de dépôt d'avis, veuillez patienter 1h avant de pouvoir re-déposer."
										/>
									</div>
								)}

								<div
									className={classes.buttonsContainer}
									style={{
										justifyContent:
											isFirstStep && isWidget ? 'center' : 'space-between'
									}}
								>
									{currentStepIndex < steps.length - 1 ? (
										<Button
											priority="primary"
											iconId="fr-icon-arrow-right-line"
											iconPosition="right"
											disabled={
												isFirstAnswerEmpty ||
												!hasAllRequiredAnswers ||
												isRateLimitReached
											}
											type="submit"
										>
											Continuer
										</Button>
									) : (
										<Button
											priority="primary"
											type="submit"
											disabled={!hasAllRequiredAnswers || isRateLimitReached}
										>
											Envoyer mon avis
										</Button>
									)}

									{currentStepIndex > 0 ? (
										<Button
											priority="secondary"
											iconId="fr-icon-arrow-left-line"
											iconPosition="left"
											onClick={handlePrevious}
											type="button"
										>
											Précédent
										</Button>
									) : (
										<div className={fr.cx(isWidget && 'fr-hidden')} />
									)}
								</div>
							</form>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export const getServerSideProps: GetServerSideProps<AvisPageProps> = async ({
	params,
	query,
	locale
}) => {
	if (!params?.id || isNaN(parseInt(params?.id as string))) {
		return {
			notFound: true
		};
	}

	const formId = parseInt(params.id as string);
	const isPreview = query.preview === 'true';
	const isWidget = query.mode === 'widget';
	const widgetNonce = isWidget ? (query.nonce as string) || null : null;
	const buttonId = parseInt(query.button as string);
	const formConfigParam = query.formConfig as string | undefined;

	if (!isPreview && !isWidget && (!buttonId || isNaN(buttonId))) {
		return {
			notFound: true
		};
	}

	await prisma.$connect();

	if (!isPreview && !isWidget) {
		const button = await prisma.button.findUnique({
			where: { id: buttonId },
			select: { id: true, form_id: true }
		});

		if (!button || button.form_id !== formId) {
			await prisma.$disconnect();
			return {
				notFound: true
			};
		}
	}

	const form = await prisma.form.findUnique({
		where: { id: formId },
		include: {
			form_template: {
				include: {
					form_template_steps: {
						include: {
							form_template_blocks: {
								include: {
									options: true
								}
							}
						}
					}
				}
			},
			form_configs: {
				include: {
					form_config_displays: true,
					form_config_labels: true
				},
				orderBy: {
					created_at: 'desc'
				},
				take: 1
			},
			product: {
				select: {
					id: true,
					title: true
				}
			}
		}
	});

	await prisma.$disconnect();

	if (!form) {
		return {
			notFound: true
		};
	}

	let formWithConfig = JSON.parse(JSON.stringify(form));

	if (formConfigParam) {
		try {
			const parsedConfig = JSON.parse(formConfigParam);
			formWithConfig.form_configs = [
				{
					form_config_displays:
						parsedConfig.displays || parsedConfig.form_config_displays || [],
					form_config_labels:
						parsedConfig.labels || parsedConfig.form_config_labels || []
				}
			];
		} catch (error) {
			console.error('Failed to parse formConfig:', error);
		}
	}

	return {
		props: {
			form: formWithConfig,
			buttonId: buttonId || 0,
			productId: form.product.id,
			isPreview,
			isWidget,
			widgetNonce,
			...(await serverSideTranslations(locale ?? 'fr', ['common']))
		}
	};
};

const blueSectionPxHeight = 200;

const useStyles = tss
	.withName({ AvisPage })
	.withParams<{ isWidget: boolean }>()
	.create(({ isWidget }) => ({
		container: {
			overflow: 'inherit',
			padding: isWidget ? `0` : `${fr.spacing('12v')} 0`,
			[fr.breakpoints.up('md')]: {
				padding: `0`
			}
		},
		blueSection: {
			display: 'none',
			backgroundColor: fr.colors.decisions.background.alt.blueFrance.default,
			...fr.spacing('padding', { topBottom: '6v', rightLeft: '10v' }),
			h1: {
				textAlign: 'center',
				fontSize: '2.5rem',
				margin: 0,
				color: fr.colors.decisions.background.flat.blueFrance.default
			},
			[fr.breakpoints.up('md')]: {
				display: 'block',
				height: `${blueSectionPxHeight}px`
			}
		},
		formSection: {
			backgroundColor: fr.colors.decisions.background.default.grey.default,
			...fr.spacing('padding', {
				topBottom: isWidget ? '2v' : 'auto',
				rightLeft: isWidget ? '4v' : '6v'
			}),
			// ...(isWidget && { paddingBottom: '80px' }),
			[fr.breakpoints.up('md')]: {
				transform: `translateY(-${blueSectionPxHeight / 2}px)`,
				...fr.spacing('padding', { topBottom: '8v', rightLeft: '16v' })
			}
		},
		buttonsContainer: {
			display: 'flex',
			flexDirection: 'row-reverse',
			justifyContent: 'space-between',
			marginTop: fr.spacing(isWidget ? '4v' : '8v')
		},
		thanksSection: {
			textAlign: 'center',
			h1: {
				color: fr.colors.decisions.background.flat.blueFrance.default
			},
			svg: {
				width: fr.spacing('20v'),
				height: fr.spacing('20v')
			}
		},
		notice: {
			...fr.typography[19].style,
			p: {
				fontWeight: 'normal'
			},
			'.fr-notice__title': {
				marginLeft: `-${fr.spacing('2v')}`,
				paddingTop: '1px'
			}
		}
	}));
