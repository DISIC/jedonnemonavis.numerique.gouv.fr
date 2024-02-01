import dynamic from 'next/dynamic';
const SwaggerUI = dynamic(import('swagger-ui-react'), { ssr: false });
import "swagger-ui-react/swagger-ui.css"

const DocAPI = () => {

	return (
		<div>
			<SwaggerUI url={`${process.env.NEXT_PUBLIC_BO_APP_URL}/api/open-api`} />
		</div>
	);
}

export default DocAPI;

