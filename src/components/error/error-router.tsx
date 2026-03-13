'use client';

import BadRequest from './bad-request';
import Unauthorized from './unauthorized';
import ServerError from './server-error';
import AccessDenied from './access-denied';
import NotFound from './not-found';
import ErrorPageLayout from './error-page-layout';

export default function ErrorRouter({
  status,
  cause,
  recommendation,
}: {
  status: string;
  cause: string;
  recommendation: string;
}) {
  switch (status) {
    case '400':
      return <BadRequest cause={cause} recommendation={recommendation} />;
    case '401':
      return <Unauthorized cause={cause} recommendation={recommendation} />;
    case '403':
      return <AccessDenied cause={cause} recommendation={recommendation} />;
    case '404':
      return <NotFound cause={cause} recommendation={recommendation} />;
    case '500':
      return <ServerError cause={cause} recommendation={recommendation} />;
    default:
      return (
        <ErrorPageLayout
          title="Unknown Error"
          status={status}
          description="Our team will work to find this out."
          cause={cause}
          recommendation={recommendation}
          imageSrc="/assets/unknown-error.png"
        />
      );
  }
}
