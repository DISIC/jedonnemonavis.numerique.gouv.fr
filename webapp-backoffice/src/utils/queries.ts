export async function getSiretInfo(siret: string): Promise<any> {
	if (typeof siret !== 'string' || !/^\d{9,14}$/.test(siret)) {
		throw new Error('Invalid SIRET');
	}

	const response = await fetch(
		`${process.env.INSEE_API_URL}/siret/${encodeURIComponent(siret)}`,
		{
			method: 'GET',
			headers: {
				'X-INSEE-Api-Key-Integration': process.env.INSEE_API_KEY!,
				Accept: 'application/json'
			}
		}
	);

	if (!response.ok) {
		console.error("Erreur lors de l'appel à l'API INSEE", response);
		throw new Error(`Erreur API INSEE : ${response.status}`);
	}

	const data = await response.json();
	return data;
}
