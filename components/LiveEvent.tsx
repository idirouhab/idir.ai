import { createClient } from '@supabase/supabase-js';
import { getTranslations } from 'next-intl/server';

type LiveEventData = {
  isActive: boolean;
  title: string;
  eventLanguage: string;
  eventDatetime: string;
  timezone: string;
  platform: string;
  platformUrl: string;
};

async function getLiveEventData(): Promise<LiveEventData | null> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Missing Supabase environment variables');
      return null;
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Get the active event (only one can be active)
    const { data, error } = await supabase
      .from('live_events')
      .select('*')
      .eq('is_active', true)
      .limit(1);

    if (error) {
      console.error('Error fetching live event:', error);
      return null;
    }

    // Return null if no active event
    if (!data || data.length === 0) {
      return null;
    }

    const row = data[0];

    // Transform database format to component format
    return {
      isActive: row.is_active,
      title: row.title,
      eventLanguage: row.event_language,
      eventDatetime: row.event_datetime,
      timezone: row.timezone,
      platform: row.platform,
      platformUrl: row.platform_url,
    };
  } catch (error) {
    console.error('Error in getLiveEventData:', error);
    return null;
  }
}

function formatEventDateTime(datetime: string, timezone: string, locale: string): { date: string; time: string; timezoneDisplay: string } {
  try {
    const date = new Date(datetime);

    // Format date
    const dateStr = new Intl.DateTimeFormat(locale === 'es' ? 'es-ES' : 'en-US', {
      dateStyle: 'long',
      timeZone: timezone,
    }).format(date);

    // Format time
    const timeStr = new Intl.DateTimeFormat(locale === 'es' ? 'es-ES' : 'en-US', {
      timeStyle: 'short',
      timeZone: timezone,
    }).format(date);

    // Get timezone abbreviation (e.g., "CET", "EST", "PST")
    const timezoneDisplay = new Intl.DateTimeFormat(locale === 'es' ? 'es-ES' : 'en-US', {
      timeZone: timezone,
      timeZoneName: 'short',
    }).formatToParts(date).find(part => part.type === 'timeZoneName')?.value || timezone;

    return { date: dateStr, time: timeStr, timezoneDisplay };
  } catch (error) {
    console.error('Error formatting date:', error);
    return { date: datetime, time: '', timezoneDisplay: timezone };
  }
}

export default async function LiveEvent({ locale }: { locale: string }) {
  const data = await getLiveEventData();

  // Don't render if data couldn't be fetched or event is not active
  if (!data || !data.isActive) return null;

  // Format the event date and time
  const { date, time, timezoneDisplay } = formatEventDateTime(data.eventDatetime, data.timezone, locale);

  // Get translations
  const t = await getTranslations('liveEvent');

  return (
    <section className="relative py-12 px-6 lg:px-8" style={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%)' }}>
      <div className="max-w-5xl mx-auto">
        <div className="border-4 border-[#ff0055] bg-black p-8 md:p-10 relative" style={{
          boxShadow: '0 0 40px rgba(255, 0, 85, 0.3)'
        }}>
          {/* Live Badge */}
          <div className="absolute -top-4 left-8 bg-[#ff0055] px-6 py-2 flex items-center gap-2">
            <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
            <span className="text-white font-black text-sm uppercase tracking-wider">{t('badge')}</span>
          </div>

          <div className="space-y-6">
            {/* Event Title */}
            <h2 className="text-3xl md:text-4xl font-black text-white leading-tight pt-4">
              {data.title}
            </h2>

            {/* Event Info Grid */}
            <div className="grid md:grid-cols-2 gap-4">
              {/* Date & Time */}
              <div className="flex items-start gap-3 text-white">
                <span className="text-2xl mt-1">📅</span>
                <div>
                  <div className="text-sm text-gray-400 uppercase tracking-wide">{t('dateTime')}</div>
                  <div className="font-bold text-lg">{date}</div>
                  <div className="font-bold text-xl text-[#00ff88]">{time} <span className="text-lg">({timezoneDisplay})</span></div>
                </div>
              </div>

              {/* Language */}
              <div className="flex items-start gap-3 text-white">
                <span className="text-2xl mt-1">🌍</span>
                <div>
                  <div className="text-sm text-gray-400 uppercase tracking-wide">{t('language')}</div>
                  <div className="font-bold text-xl text-[#00cfff]">{t(`languages.${data.eventLanguage}`)}</div>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <div className="pt-2">
              <a
                href={data.platformUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 px-8 py-4 bg-[#ff0055] text-white font-black text-lg uppercase tracking-wide hover:bg-[#ff1166] transition-all"
                style={{
                  boxShadow: '0 4px 20px rgba(255, 0, 85, 0.4)'
                }}
              >
                <span>{t('watchOn')} {data.platform}</span>
                <span className="text-2xl">→</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
