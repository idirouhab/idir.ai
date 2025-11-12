'use client';

import { useEffect } from 'react';

export default function APIDocsPage() {
  useEffect(() => {
    // Dynamically load Swagger UI
    const loadSwaggerUI = async () => {
      // Load CSS
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui.css';
      document.head.appendChild(link);

      // Load JS
      const script1 = document.createElement('script');
      script1.src = 'https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-bundle.js';
      script1.async = true;

      const script2 = document.createElement('script');
      script2.src = 'https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-standalone-preset.js';
      script2.async = true;

      script1.onload = () => {
        script2.onload = () => {
          // @ts-ignore
          if (window.SwaggerUIBundle) {
            // @ts-ignore
            window.ui = window.SwaggerUIBundle({
              url: '/openapi.yaml',
              dom_id: '#swagger-ui',
              deepLinking: true,
              presets: [
                // @ts-ignore
                window.SwaggerUIBundle.presets.apis,
                // @ts-ignore
                window.SwaggerUIStandalonePreset,
              ],
              plugins: [
                // @ts-ignore
                window.SwaggerUIBundle.plugins.DownloadUrl,
              ],
              layout: 'StandaloneLayout',
            });
          }
        };
        document.body.appendChild(script2);
      };

      document.body.appendChild(script1);
    };

    loadSwaggerUI();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <div id="swagger-ui"></div>
    </div>
  );
}
