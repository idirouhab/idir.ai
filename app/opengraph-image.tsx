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
          background: 'linear-gradient(135deg, #0a0a0a 0%, #0f0f0f 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '80px',
          position: 'relative',
        }}
      >
        {/* Subtle workflow node pattern background - left side */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '50%',
            height: '100%',
            opacity: 0.03,
            display: 'flex',
            background: 'radial-gradient(circle at 20% 30%, #00ff88 1px, transparent 1px), radial-gradient(circle at 40% 70%, #00cfff 1px, transparent 1px)',
            backgroundSize: '80px 80px',
          }}
        />

        {/* Subtle accent lines - top and bottom */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            background: 'linear-gradient(90deg, #00ff88 0%, #00cfff 50%, #ff0055 100%)',
            opacity: 0.6,
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 4,
            background: 'linear-gradient(90deg, #ff0055 0%, #00cfff 50%, #00ff88 100%)',
            opacity: 0.6,
          }}
        />

        {/* Main Content - Left side */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
            maxWidth: '650px',
          }}
        >
          {/* Name */}
          <div
            style={{
              fontSize: 72,
              fontWeight: 900,
              color: '#ffffff',
              letterSpacing: '-1.5px',
              lineHeight: 0.95,
              display: 'flex',
              flexDirection: 'column',
              textShadow: '0 2px 8px rgba(0, 0, 0, 0.5)',
            }}
          >
            <span style={{ fontWeight: 900 }}>IDIR</span>
            <span style={{ color: '#00ff88', fontWeight: 900 }}>OUHAB MESKINE</span>
          </div>

          {/* Role */}
          <div
            style={{
              fontSize: 32,
              fontWeight: 800,
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              textShadow: '0 2px 8px rgba(0, 0, 0, 0.5)',
            }}
          >
            <span>Senior Solutions Engineer</span>
            <span style={{ color: '#00cfff', fontWeight: 900 }}>@</span>
            <span style={{ color: '#00cfff', fontWeight: 900 }}>n8n</span>
          </div>

          {/* Tags */}
          <div
            style={{
              display: 'flex',
              gap: '12px',
              marginTop: '16px',
            }}
          >
            <div
              style={{
                background: '#ff0055',
                color: '#000000',
                padding: '12px 28px',
                fontSize: 22,
                fontWeight: 900,
                textTransform: 'uppercase',
                border: '2px solid #000000',
              }}
            >
              AI
            </div>
            <div
              style={{
                background: '#00ff88',
                color: '#000000',
                padding: '12px 28px',
                fontSize: 22,
                fontWeight: 900,
                textTransform: 'uppercase',
                border: '2px solid #000000',
              }}
            >
              AUTOMATION
            </div>
            <div
              style={{
                background: '#00cfff',
                color: '#000000',
                padding: '12px 28px',
                fontSize: 22,
                fontWeight: 900,
                textTransform: 'uppercase',
                border: '2px solid #000000',
              }}
            >
              SPEAKER
            </div>
          </div>

          {/* Website */}
          <div
            style={{
              fontSize: 26,
              fontWeight: 700,
              color: '#888888',
              marginTop: '8px',
            }}
          >
            idir.ai
          </div>
        </div>

        {/* Right side - Workflow visual */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '40px',
            opacity: 0.15,
          }}
        >
          {/* Node connections visual */}
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <div
              style={{
                width: 60,
                height: 60,
                borderRadius: '50%',
                background: '#00ff88',
                border: '4px solid #ffffff',
              }}
            />
            <div
              style={{
                width: 80,
                height: 4,
                background: '#ffffff',
              }}
            />
            <div
              style={{
                width: 60,
                height: 60,
                borderRadius: '50%',
                background: '#00cfff',
                border: '4px solid #ffffff',
              }}
            />
          </div>
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <div
              style={{
                width: 60,
                height: 60,
                borderRadius: '50%',
                background: '#ff0055',
                border: '4px solid #ffffff',
              }}
            />
            <div
              style={{
                width: 80,
                height: 4,
                background: '#ffffff',
              }}
            />
            <div
              style={{
                width: 60,
                height: 60,
                borderRadius: '50%',
                background: '#00ff88',
                border: '4px solid #ffffff',
              }}
            />
          </div>
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <div
              style={{
                width: 60,
                height: 60,
                borderRadius: '50%',
                background: '#00cfff',
                border: '4px solid #ffffff',
              }}
            />
            <div
              style={{
                width: 80,
                height: 4,
                background: '#ffffff',
              }}
            />
            <div
              style={{
                width: 60,
                height: 60,
                borderRadius: '50%',
                background: '#ff0055',
                border: '4px solid #ffffff',
              }}
            />
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
