import { Link } from 'react-router-dom';

export default function TestRoute() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">Test Route Page</h1>
      <p className="mb-4">If you can see this, routing is working!</p>
      <div className="space-x-4">
        <Link to="/" className="bg-blue-500 text-white px-4 py-2 rounded">Go Home</Link>
        <Link to="/poles/test-id" className="bg-green-500 text-white px-4 py-2 rounded">Test Pole Details</Link>
      </div>
    </div>
  );
}