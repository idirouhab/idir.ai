import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'Idir Ouhab Meskine - Senior Solutions Engineer at n8n';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#0a0a0a',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '60px',
          position: 'relative',
        }}
      >
        {/* Automation Grid Background Pattern */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.06,
            background: `
              linear-gradient(90deg, #00ff88 1px, transparent 1px),
              linear-gradient(0deg, #00ff88 1px, transparent 1px),
              radial-gradient(circle at 10% 20%, #00d1ff 2px, transparent 2px),
              radial-gradient(circle at 90% 30%, #ff0055 2px, transparent 2px),
              radial-gradient(circle at 30% 80%, #00d1ff 2px, transparent 2px),
              radial-gradient(circle at 70% 70%, #00ff88 2px, transparent 2px)
            `,
            backgroundSize: '60px 60px, 60px 60px, 100% 100%, 100% 100%, 100% 100%, 100% 100%',
          }}
        />

        {/* Node Connection Lines - Subtle */}
        <svg
          width="1200"
          height="630"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            opacity: 0.05,
          }}
        >
          {/* Connecting lines between nodes */}
          <line x1="120" y1="130" x2="300" y2="200" stroke="#00ff88" strokeWidth="2" />
          <line x1="300" y1="200" x2="500" y2="180" stroke="#00d1ff" strokeWidth="2" />
          <line x1="900" y1="150" x2="1080" y2="200" stroke="#ff0055" strokeWidth="2" />
          <line x1="350" y1="450" x2="550" y2="480" stroke="#00d1ff" strokeWidth="2" />
          <line x1="700" y1="400" x2="850" y2="500" stroke="#00ff88" strokeWidth="2" />

          {/* Nodes */}
          <circle cx="120" cy="130" r="8" fill="#00ff88" />
          <circle cx="300" cy="200" r="8" fill="#00d1ff" />
          <circle cx="500" cy="180" r="8" fill="#ff0055" />
          <circle cx="900" cy="150" r="8" fill="#00ff88" />
          <circle cx="1080" cy="200" r="8" fill="#00d1ff" />
          <circle cx="350" cy="450" r="8" fill="#ff0055" />
          <circle cx="550" cy="480" r="8" fill="#00ff88" />
          <circle cx="700" cy="400" r="8" fill="#00d1ff" />
          <circle cx="850" cy="500" r="8" fill="#ff0055" />
        </svg>

        {/* Central Radial Glow */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '800px',
            height: '800px',
            background: 'radial-gradient(circle, rgba(0, 255, 136, 0.08) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        {/* Main Content Container - Centered */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            zIndex: 10,
            gap: '24px',
            marginBottom: '40px',
          }}
        >
          {/* Name */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            {/* IDIR - White Bold */}
            <div
              style={{
                fontSize: 90,
                fontWeight: 900,
                color: '#ffffff',
                letterSpacing: '-3px',
                lineHeight: 1,
                textTransform: 'uppercase',
                textShadow: '0 0 40px rgba(255, 255, 255, 0.15)',
              }}
            >
              IDIR
            </div>
            {/* OUHAB MESKINE - Neon Green with Glow */}
            <div
              style={{
                fontSize: 64,
                fontWeight: 300,
                color: '#00ff88',
                letterSpacing: '4px',
                lineHeight: 1,
                textTransform: 'uppercase',
                textShadow: '0 0 30px rgba(0, 255, 136, 0.5), 0 0 50px rgba(0, 255, 136, 0.3)',
              }}
            >
              OUHAB MESKINE
            </div>
          </div>

          {/* Role - Monospace Developer Style */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              fontSize: 28,
              fontWeight: 500,
              color: '#ffffff',
              fontFamily: 'monospace',
              letterSpacing: '0px',
              marginTop: '16px',
            }}
          >
            <span style={{ color: '#d1d5db' }}>Senior Solutions Engineer</span>
            <span style={{ color: '#00d1ff', fontWeight: 700 }}>@</span>
            <span style={{ color: '#00d1ff', fontWeight: 700 }}>n8n</span>
          </div>
        </div>

        {/* Bottom Section - Ghost Chips + URL */}
        <div
          style={{
            position: 'absolute',
            bottom: 80,
            left: 0,
            right: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '20px',
            zIndex: 10,
          }}
        >
          {/* Ghost Chip Tags - Larger & Vibrant */}
          <div
            style={{
              display: 'flex',
              gap: '16px',
              alignItems: 'center',
            }}
          >
            <div
              style={{
                padding: '12px 32px',
                fontSize: 22,
                fontWeight: 900,
                textTransform: 'uppercase',
                letterSpacing: '1px',
                color: '#ff0055',
                border: '2px solid #ff0055',
                borderRadius: '8px',
                background: 'transparent',
              }}
            >
              AI
            </div>
            <div
              style={{
                padding: '12px 32px',
                fontSize: 22,
                fontWeight: 900,
                textTransform: 'uppercase',
                letterSpacing: '1px',
                color: '#00ff88',
                border: '2px solid #00ff88',
                borderRadius: '8px',
                background: 'transparent',
              }}
            >
              AUTOMATION
            </div>
            <div
              style={{
                padding: '12px 32px',
                fontSize: 22,
                fontWeight: 900,
                textTransform: 'uppercase',
                letterSpacing: '1px',
                color: '#00d1ff',
                border: '2px solid #00d1ff',
                borderRadius: '8px',
                background: 'transparent',
              }}
            >
              SPEAKER
            </div>
          </div>

          {/* Website URL - High Contrast for Visibility */}
          <div
            style={{
              fontSize: 24,
              fontWeight: 600,
              color: '#d1d5db',
              letterSpacing: '2px',
              fontFamily: 'monospace',
            }}
          >
            idir.ai
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
