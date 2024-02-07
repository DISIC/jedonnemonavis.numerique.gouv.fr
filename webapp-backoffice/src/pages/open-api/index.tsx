import dynamic from "next/dynamic";
import { SwaggerUIProps } from 'swagger-ui-react';
const SwaggerUI = dynamic<SwaggerUIProps>(import('swagger-ui-react') as any, {ssr: false}) 
import "swagger-ui-react/swagger-ui.css";

const DocAPI = () => {

	return (
		<div>
			<SwaggerUI url={`${process.env.NEXT_PUBLIC_BO_APP_URL}/api/open-api`} />
		</div>
	);
}

export default DocAPI;

