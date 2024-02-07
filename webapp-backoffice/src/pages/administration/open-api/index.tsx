import dynamic from 'next/dynamic';
import React from 'react';
import { useState, useEffect } from 'react';
import { SwaggerUIProps } from 'swagger-ui-react';
import { tss } from 'tss-react/dsfr';
import { fr } from '@codegouvfr/react-dsfr';
const SwaggerUI = dynamic<SwaggerUIProps>(import('swagger-ui-react') as any, {
	ssr: false
});
import 'swagger-ui-react/swagger-ui.css';
import { Loader } from '@/src/components/ui/Loader';

const DocAPI = () => {
	type DocApi = {} & {
		paths: {
			[key: string]: any;
		};
	};

	const [docApi, setDocApi] = useState<DocApi | null>(null);
	const { cx, classes } = useStyles();

	const getDocApi = async () => {
		const url = `${process.env.NEXT_PUBLIC_BO_APP_URL}/api/open-api`;
		const fetching = await fetch(url.split(',').join(''), {
			method: 'GET'
		}).then(async r => {
			if (!r.ok) {
				throw Error(`got status ${r.status}`);
			}
			return r.json();
		});

		console.log('fetching : ', fetching);

		setDocApi(fetching as {} & { paths: Record<string, Object> });
	};

	const filterDoc = (fieldToKeep: string) => {
		let clonedObject = JSON.parse(JSON.stringify(docApi));
		let newPathObject = { paths: {} } as DocApi;
		if (clonedObject.paths && clonedObject.paths[fieldToKeep]) {
			newPathObject.paths[fieldToKeep] = clonedObject.paths[fieldToKeep];
		} else {
			console.error('Path does not exist in the OpenAPI object');
			return null;
		}
		clonedObject.paths = newPathObject.paths;
		return clonedObject;
	};

	useEffect(() => {
		getDocApi();
	}, []);

	return (
		<div className={fr.cx('fr-container', 'fr-py-6w')}>
			{docApi === null ? (
				<Loader></Loader>
			) : (
				<>
					<p
						dangerouslySetInnerHTML={{
							__html: docApi.paths['/privateData'].post.description
						}}
					></p>
					<SwaggerUI spec={filterDoc('/privateData')} />
					<p
						dangerouslySetInnerHTML={{
							__html: docApi.paths['/privateData'].post.description
						}}
					></p>
					<SwaggerUI
						spec={filterDoc('/products/xwiki')}
						layout="BaseLayout"
						presets={[]}
					/>
				</>
			)}
		</div>
	);
};

const useStyles = tss.withName(DocAPI.name).create(() => ({
	removeWrapper: {
		display: 'flex',
		justifyContent: 'end'
	},
	iconError: {
		color: fr.colors.decisions.text.default.error.default
	}
}));

export default DocAPI;
