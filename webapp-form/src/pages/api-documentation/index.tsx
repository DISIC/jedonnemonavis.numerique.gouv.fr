import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';

function ApiDoc() {
  return (
    <SwaggerUI
      url={`${process.env.NEXT_PUBLIC_WEBAPP_FORM_URL}/api/open-api`}
    />
  );
}

export default ApiDoc;
