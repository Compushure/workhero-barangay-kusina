import NotFound from '@/components/error/not-found';

export default function NotFoundPage() {
  return (
    <NotFound
      cause="Page not found"
      recommendation="Check the URL or return to the login page."
    />
  );
}
