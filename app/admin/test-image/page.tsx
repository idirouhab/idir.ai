'use client';

import { useState } from 'react';
import Image from 'next/image';

export default function TestImagePage() {
  const [imageUrl, setImageUrl] = useState('');
  const [testUrl, setTestUrl] = useState('');
  const [error, setError] = useState('');

  const handleTest = async () => {
    setError('');

    try {
      // Test if the URL is accessible
      const response = await fetch(testUrl, { method: 'HEAD' });
      if (!response.ok) {
        setError(`HTTP ${response.status}: ${response.statusText}`);
      } else {
        setError('✅ URL is accessible!');
        setImageUrl(testUrl);
      }
    } catch (err: any) {
      setError(`❌ Error: ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-3xl font-bold mb-8">Image Test Page</h1>

      <div className="space-y-6 max-w-2xl">
        {/* Test URL Input */}
        <div>
          <label className="block mb-2 font-bold">Paste Image URL to Test:</label>
          <input
            type="text"
            value={testUrl}
            onChange={(e) => setTestUrl(e.target.value)}
            className="w-full px-4 py-2 bg-gray-900 border border-gray-700 text-white"
            placeholder="https://cymypipxhlgjmrzonpdw.supabase.co/storage/v1/object/public/blog-images/..."
          />
          <button
            onClick={handleTest}
            className="mt-2 px-6 py-2 bg-blue-500 text-white font-bold"
          >
            Test URL
          </button>
        </div>

        {/* Error/Success Message */}
        {error && (
          <div className={`p-4 border-2 ${error.includes('✅') ? 'bg-green-900 border-green-500' : 'bg-red-900 border-red-500'}`}>
            {error}
          </div>
        )}

        {/* Test with regular img tag */}
        {imageUrl && (
          <div>
            <h2 className="text-xl font-bold mb-2">Test 1: Regular &lt;img&gt; Tag</h2>
            <div className="border-2 border-gray-700 p-4">
              <img src={imageUrl} alt="Test" className="max-w-full h-auto" />
            </div>
          </div>
        )}

        {/* Test with Next.js Image */}
        {imageUrl && (
          <div>
            <h2 className="text-xl font-bold mb-2">Test 2: Next.js &lt;Image&gt; Component</h2>
            <div className="border-2 border-gray-700 p-4">
              <div className="relative w-full aspect-video">
                <Image
                  src={imageUrl}
                  alt="Test"
                  fill
                  className="object-contain"
                  unoptimized={false}
                />
              </div>
            </div>
          </div>
        )}

        {/* Test with unoptimized Next.js Image */}
        {imageUrl && (
          <div>
            <h2 className="text-xl font-bold mb-2">Test 3: Next.js Image (Unoptimized)</h2>
            <div className="border-2 border-gray-700 p-4">
              <div className="relative w-full aspect-video">
                <Image
                  src={imageUrl}
                  alt="Test"
                  fill
                  className="object-contain"
                  unoptimized={true}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
