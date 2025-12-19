-- Migration: Create courses table with templated structure
-- Description: Courses table optimized for templated dynamic pages

CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Basic Info
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  short_description TEXT NOT NULL, -- Used for cards/previews
  language TEXT DEFAULT 'es' CHECK (language IN ('en', 'es')),

  -- Course Data (JSON structure matching automation-101 template)
  course_data JSONB NOT NULL DEFAULT '{}'::jsonb,

  -- SEO
  meta_title TEXT,
  meta_description TEXT,
  cover_image TEXT,

  -- Publishing
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  published_at TIMESTAMPTZ,

  -- Stats
  enrollment_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT slug_not_empty CHECK (slug <> ''),
  CONSTRAINT title_not_empty CHECK (title <> '')
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_courses_slug ON courses(slug);
CREATE INDEX IF NOT EXISTS idx_courses_status ON courses(status);
CREATE INDEX IF NOT EXISTS idx_courses_language ON courses(language);
CREATE INDEX IF NOT EXISTS idx_courses_published_at ON courses(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_courses_course_data ON courses USING GIN(course_data);

-- Trigger to auto-update updated_at
DROP TRIGGER IF EXISTS update_courses_updated_at ON courses;
CREATE TRIGGER update_courses_updated_at
  BEFORE UPDATE ON courses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

-- Public can read published courses
CREATE POLICY "Published courses are viewable by everyone"
  ON courses FOR SELECT
  USING (status = 'published');

-- Authenticated users (admin) can manage
CREATE POLICY "Authenticated users can manage courses"
  ON courses FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Function to increment view count
CREATE OR REPLACE FUNCTION increment_course_views(course_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE courses
  SET view_count = view_count + 1
  WHERE id = course_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION increment_course_views(UUID) TO anon;

-- Comments
COMMENT ON TABLE courses IS 'Courses with templated structure - course_data contains all sections';
COMMENT ON COLUMN courses.course_data IS 'JSONB containing hero, benefits, curriculum, logistics, outcomes, pricing, form config';
COMMENT ON COLUMN courses.slug IS 'URL-friendly identifier, e.g., automation-101';

/*
Expected course_data structure:
{
  "hero": {
    "badge": "NUEVO CURSO",
    "title": "AUTOMATIZACIÓN 101",
    "subtitle": "Tu inicio garantizado...",
    "description": "Formación de alto valor...",
    "valueStatement": "Curso sin coste directo..."
  },
  "benefits": [
    {
      "icon": "💡",
      "title": "Conceptos, no herramientas",
      "description": "Aprenderás los principios fundamentales..."
    }
  ],
  "curriculum": {
    "label": "TEMARIO DEL CURSO",
    "description": "4 semanas de formación práctica:",
    "items": [
      {
        "title": "Semana 1: Fundamentos",
        "description": "Entiende el modelo Trigger..."
      }
    ]
  },
  "logistics": {
    "startDate": "Miércoles 14 de enero de 2026",
    "schedule": "Cada miércoles a las 19:00...",
    "scheduleDetail": "Horarios LATAM: 13:00 Ciudad de México...",
    "duration": "4 sesiones en vivo",
    "hours": "4 horas de contenido práctico",
    "modality": "Modalidad virtual",
    "tools": "Low-code/no-code (como Zapier)",
    "capacity": {
      "number": "30 participantes",
      "reason": "Para garantizar la calidad...",
      "waitlistText": "Si se supera la demanda..."
    }
  },
  "donation": {
    "label": "Tu compromiso hace la diferencia",
    "amount": "€5/$5",
    "title": "Donación sugerida a FreeCodeCamp",
    "text": "Este curso tiene un valor de mercado...",
    "transparencyText": "Por motivos de transparencia...",
    "link": "https://www.freecodecamp.org/espanol/donate/",
    "linkText": "Link de donación a FreeCodeCamp"
  },
  "outcomes": {
    "label": "LO QUE APRENDERÁS",
    "description": "Al terminar este curso, serás capaz de:",
    "items": [
      "Identificar oportunidades de automatización...",
      "Diseñar procesos automatizados..."
    ]
  },
  "pricing": {
    "label": "PRECIO E INSCRIPCIÓN",
    "title": "Acceso basado en donación",
    "options": [
      {
        "title": "Acceso abierto",
        "amount": "TÚ DECIDES",
        "description": "Este curso es de acceso libre..."
      }
    ]
  },
  "commitment": {
    "title": "El compromiso de honor",
    "checkboxLabel": "Me comprometo a hacer una donación...",
    "amountSuggestion": "Donación sugerida: €5/$5...",
    "note": "Este compromiso solo aplica..."
  },
  "form": {
    "enabled": true,
    "endpoint": "/api/courses/automation-101/signup",
    "fields": ["firstName", "lastName", "email", "country", "birthYear"],
    "requiresTerms": true,
    "requiresCommitment": true
  }
}
*/
