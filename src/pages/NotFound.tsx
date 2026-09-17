import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-24 text-center">
      <span className="font-display text-6xl font-bold text-royal-200">404</span>
      <h1 className="mt-3 text-xl font-bold text-royal-900">Page not found</h1>
      <p className="mt-2 text-sm text-royal-500">The page you're looking for doesn't exist.</p>
      <Link to="/" className="mt-6">
        <Button>Back to Home</Button>
      </Link>
    </div>
  );
}
