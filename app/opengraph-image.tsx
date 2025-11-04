import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'Idir Ouhab Meskine - Solutions Engineer at n8n';
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
          alignItems: 'flex-start',
          justifyContent: 'center',
          padding: '80px',
          position: 'relative',
        }}
      >
        {/* Corner accents */}
        <div
          style={{
            position: 'absolute',
            top: 30,
            left: 30,
            width: 40,
            height: 40,
            background: '#00ff88',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: 30,
            right: 30,
            width: 40,
            height: 40,
            background: '#ff0055',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: 30,
            left: 30,
            width: 40,
            height: 40,
            background: '#ff0055',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: 30,
            right: 30,
            width: 40,
            height: 40,
            background: '#00ff88',
          }}
        />

        {/* Content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
          }}
        >
          {/* Name */}
          <div
            style={{
              fontSize: 80,
              fontWeight: 900,
              color: '#ffffff',
              letterSpacing: '-2px',
              lineHeight: 1,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <span>IDIR</span>
            <span style={{ color: '#00ff88' }}>OUHAB MESKINE</span>
          </div>

          {/* Role */}
          <div
            style={{
              fontSize: 36,
              fontWeight: 700,
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <span>Solutions Engineer</span>
            <span style={{ color: '#00cfff' }}>@</span>
            <span style={{ color: '#00cfff' }}>n8n</span>
          </div>

          {/* Tags */}
          <div
            style={{
              display: 'flex',
              gap: '15px',
              marginTop: '20px',
            }}
          >
            <div
              style={{
                background: '#ff0055',
                color: '#000000',
                padding: '10px 25px',
                fontSize: 24,
                fontWeight: 900,
                textTransform: 'uppercase',
              }}
            >
              AI
            </div>
            <div
              style={{
                background: '#00ff88',
                color: '#000000',
                padding: '10px 25px',
                fontSize: 24,
                fontWeight: 900,
                textTransform: 'uppercase',
              }}
            >
              AUTOMATION
            </div>
            <div
              style={{
                background: '#00cfff',
                color: '#000000',
                padding: '10px 25px',
                fontSize: 24,
                fontWeight: 900,
                textTransform: 'uppercase',
              }}
            >
              SPEAKER
            </div>
          </div>

          {/* Website */}
          <div
            style={{
              fontSize: 28,
              color: '#666666',
              marginTop: '10px',
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
