import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-50">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">404</h1>
        <p className="text-slate-400">
          Looks like this route doesn&apos;t exist.
        </p>
        <Link
          to="/"
          className="inline-flex items-center px-4 py-2 rounded-lg border border-slate-600 text-sm font-medium text-slate-50 hover:bg-slate-900"
        >
          Back to home
        </Link>
      </div>
    </main>
  );
};

export default NotFound;

