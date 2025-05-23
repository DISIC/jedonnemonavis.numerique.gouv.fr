async function getInseeAccessToken(): Promise<string> {
	const response = await fetch(`${process.env.INSEE_API_URL}/token`, {
		method: "POST",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded",
		},
		body: new URLSearchParams({
			grant_type: "client_credentials",
			client_id: process.env.INSEE_API_KEY!,
			client_secret: process.env.INSEE_API_SECRET!,
		}),
	});

	if (!response.ok) {
		throw new Error(`Impossible d'obtenir un token (HTTP ${response.status})`);
	}

	const data = await response.json();
	return data.access_token;
}

export async function getSiretInfo(siret: string): Promise<any> {
	const token = await getInseeAccessToken();

	const response = await fetch(`${process.env.INSEE_API_URL}/entreprises/sirene/V3.11/siret/${siret}`, {
		method: "GET",
		headers: {
			Authorization: `Bearer ${token}`,
			Accept: "application/json",
		},
	});

	if (!response.ok) {
		console.error('Erreur lors de l’appel à l’API INSEE', response);
		throw new Error(`Erreur API INSEE : ${response.status}`);
	}

	const data = await response.json();
	return data;
}