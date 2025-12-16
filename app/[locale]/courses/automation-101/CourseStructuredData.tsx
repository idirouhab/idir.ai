export default function CourseStructuredData({ locale }: { locale: string }) {
  const isSpanish = locale === 'es';

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: isSpanish ? 'Automatización 101 con Idir' : 'Automation 101 with Idir',
    description: isSpanish
      ? 'Curso práctico de automatización desde cero. 4 sesiones en vivo para aprender los fundamentos de la automatización con herramientas no-code.'
      : 'Practical automation course from scratch. 4 live sessions to learn automation fundamentals with no-code tools.',
    provider: {
      '@type': 'Organization',
      name: 'idir.ai',
      url: 'https://idir.ai',
      sameAs: [
        'https://www.linkedin.com/in/idirouhabmeskine/',
        'https://twitter.com/idirouhabmesk',
      ],
    },
    instructor: {
      '@type': 'Person',
      name: 'Idir Ouhabmeskine',
      url: 'https://idir.ai',
      sameAs: [
        'https://www.linkedin.com/in/idirouhabmeskine/',
        'https://twitter.com/idirouhabmesk',
      ],
    },
    inLanguage: locale === 'es' ? 'es-ES' : 'en-US',
    courseMode: 'online',
    educationalLevel: 'Beginner',
    isAccessibleForFree: true,
    hasCourseInstance: [
      {
        '@type': 'CourseInstance',
        courseMode: 'online',
        courseWorkload: 'PT4H',
        startDate: '2026-01-14T19:00:00+01:00',
        endDate: '2026-02-04T20:00:00+01:00',
        courseSchedule: {
          '@type': 'Schedule',
          repeatFrequency: 'P1W',
          repeatCount: 4,
          byDay: 'Wednesday',
          startTime: '19:00:00',
          duration: 'PT1H',
        },
        location: {
          '@type': 'VirtualLocation',
          url: 'https://idir.ai/es/courses/automation-101',
        },
        maximumAttendeeCapacity: 30,
        eventStatus: 'https://schema.org/EventScheduled',
      },
    ],
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'EUR',
      availability: 'https://schema.org/InStock',
      url: `https://idir.ai/${locale}/courses/automation-101`,
      category: 'Free',
    },
    teaches: isSpanish
      ? [
          'Fundamentos de la automatización',
          'Modelo Trigger-Acción-Condición',
          'Herramientas no-code como Zapier y n8n',
          'Lógica condicional en automatizaciones',
          'Integración de IA en flujos automatizados',
        ]
      : [
          'Automation fundamentals',
          'Trigger-Action-Condition model',
          'No-code tools like Zapier and n8n',
          'Conditional logic in automations',
          'AI integration in automated workflows',
        ],
    about: isSpanish
      ? [
          {
            '@type': 'DefinedTerm',
            name: 'Automatización',
            description: 'Proceso de hacer que tareas repetitivas se ejecuten automáticamente',
          },
          {
            '@type': 'DefinedTerm',
            name: 'No-Code',
            description: 'Herramientas que permiten crear automatizaciones sin programar',
          },
          {
            '@type': 'DefinedTerm',
            name: 'Inteligencia Artificial',
            description: 'Uso de IA para potenciar automatizaciones',
          },
        ]
      : [
          {
            '@type': 'DefinedTerm',
            name: 'Automation',
            description: 'Process of making repetitive tasks run automatically',
          },
          {
            '@type': 'DefinedTerm',
            name: 'No-Code',
            description: 'Tools that allow creating automations without programming',
          },
          {
            '@type': 'DefinedTerm',
            name: 'Artificial Intelligence',
            description: 'Using AI to power up automations',
          },
        ],
    audience: {
      '@type': 'EducationalAudience',
      educationalRole: 'student',
    },
    timeRequired: 'PT4H',
    numberOfLessons: 4,
    assesses: isSpanish
      ? 'Capacidad para identificar y automatizar tareas repetitivas usando herramientas no-code'
      : 'Ability to identify and automate repetitive tasks using no-code tools',
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
