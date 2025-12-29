'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error details to console
    console.error('[Course Error Page] Error details:', {
      message: error.message,
      name: error.name,
      stack: error.stack,
      digest: error.digest,
      timestamp: new Date().toISOString(),
    });

    // You can also send to an analytics service here
    if (typeof window !== 'undefined') {
      // Report to Sentry or other error tracking service
      if ((window as any).Sentry) {
        (window as any).Sentry.captureException(error, {
          tags: {
            page: 'course',
            digest: error.digest,
          },
        });
      }
    }
  }, [error]);

  return (
    <div className="min-h-screen bg-[#050505] text-slate-200 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center space-y-8">
        {/* Error icon */}
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-full bg-red-500/10 border-2 border-red-500/30 flex items-center justify-center text-4xl">
            ⚠️
          </div>
        </div>

        {/* Error message */}
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-white">
            Something went wrong
          </h1>
          <p className="text-lg text-slate-400">
            We encountered an error while loading this course.
          </p>

          {/* Technical details (only in development) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-left">
              <p className="text-xs font-mono text-red-300 mb-2">
                <strong>Error:</strong> {error.message}
              </p>
              {error.digest && (
                <p className="text-xs font-mono text-red-300">
                  <strong>Digest:</strong> {error.digest}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button
            onClick={reset}
            className="px-6 py-3 bg-[#00ff88] text-black font-bold rounded-xl hover:scale-105 transition-all"
          >
            Try again
          </button>
          <Link
            href="/en/courses"
            className="px-6 py-3 border border-white/10 text-slate-300 font-medium rounded-xl hover:bg-white/5 transition-all flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to courses
          </Link>
        </div>

        {/* Support message */}
        <p className="text-sm text-slate-500">
          If this problem persists, please contact support.
        </p>
      </div>
    </div>
  );
}
