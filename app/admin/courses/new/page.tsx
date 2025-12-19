'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminPageWrapper from '@/components/admin/AdminPageWrapper';
import { generateCourseSlug } from '@/lib/courses';

const DEFAULT_COURSE_DATA = {
  hero: {
    badge: "NUEVO CURSO",
    title: "Mi Curso",
    subtitle: "Descripción corta del curso",
    description: "Descripción más larga con detalles",
    valueStatement: "Valor que ofrece el curso"
  },
  benefits: [
    { icon: "💡", title: "Beneficio 1", description: "Descripción del beneficio" },
    { icon: "🎯", title: "Beneficio 2", description: "Descripción del beneficio" }
  ],
  curriculum: {
    label: "TEMARIO DEL CURSO",
    description: "X semanas de formación práctica",
    items: [
      { title: "Semana 1: Tema", description: "Descripción del tema" }
    ]
  },
  logistics: {
    startDate: "Fecha de inicio",
    schedule: "Horario",
    scheduleDetail: "Detalle de horarios",
    duration: "X sesiones",
    hours: "X horas",
    modality: "Virtual",
    tools: "Herramientas necesarias",
    capacity: {
      number: "X participantes",
      reason: "Razón del límite",
      waitlistText: "Política de lista de espera"
    }
  },
  donation: {
    label: "Tu compromiso hace la diferencia",
    amount: "€5/$5",
    title: "Donación sugerida",
    text: "Texto explicativo",
    transparencyText: "Transparencia",
    link: "https://example.com",
    linkText: "Link de donación"
  },
  outcomes: {
    label: "LO QUE APRENDERÁS",
    description: "Al terminar este curso:",
    items: ["Resultado 1", "Resultado 2"]
  },
  pricing: {
    label: "PRECIO E INSCRIPCIÓN",
    title: "Acceso basado en donación",
    options: [
      { title: "Opción 1", amount: "GRATIS", description: "Descripción" }
    ]
  },
  commitment: {
    title: "El compromiso de honor",
    checkboxLabel: "Me comprometo a...",
    amountSuggestion: "Donación sugerida: €5/$5",
    note: "Nota adicional"
  },
  form: {
    enabled: true,
    endpoint: "/api/courses/mi-curso/signup",
    fields: ["firstName", "lastName", "email", "country", "birthYear"],
    requiresTerms: true,
    requiresCommitment: true
  }
};

export default function NewCoursePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    short_description: '',
    language: 'es' as 'en' | 'es',
    status: 'draft' as 'draft' | 'published',
    meta_title: '',
    meta_description: '',
    course_data: JSON.stringify(DEFAULT_COURSE_DATA, null, 2)
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Parse course_data JSON
      const courseData = JSON.parse(formData.course_data);

      const response = await fetch('/api/admin/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          course_data: courseData,
          published_at: formData.status === 'published' ? new Date().toISOString() : null,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create course');
      }

      router.push('/admin/courses');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTitleChange = (title: string) => {
    setFormData(prev => ({
      ...prev,
      title,
      slug: generateCourseSlug(title)
    }));
  };

  return (
    <AdminPageWrapper title="New Course">
      <div className="max-w-4xl">
        <div className="mb-6">
          <h1 className="text-3xl font-black text-white mb-2">Create New Course</h1>
          <p className="text-gray-400">Fill in the course details and JSON structure below</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-6">
            <h2 className="text-xl font-bold text-white mb-4">Basic Information</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  placeholder="Mi Curso Increíble"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Slug * <span className="text-gray-500">(auto-generated)</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-emerald-500 font-mono"
                  placeholder="mi-curso-increible"
                />
                <p className="text-xs text-gray-500 mt-1">URL: /{formData.language}/courses/{formData.slug}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Short Description * <span className="text-gray-500">(for cards/previews)</span>
                </label>
                <textarea
                  required
                  value={formData.short_description}
                  onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  placeholder="Una breve descripción del curso..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Language *
                  </label>
                  <select
                    value={formData.language}
                    onChange={(e) => setFormData({ ...formData, language: e.target.value as 'en' | 'es' })}
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="es">Español</option>
                    <option value="en">English</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Status *
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as 'draft' | 'published' })}
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* SEO */}
          <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-6">
            <h2 className="text-xl font-bold text-white mb-4">SEO (Optional)</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Meta Title
                </label>
                <input
                  type="text"
                  value={formData.meta_title}
                  onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  placeholder="Mi Curso | idir.ai"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Meta Description
                </label>
                <textarea
                  value={formData.meta_description}
                  onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  placeholder="Descripción para motores de búsqueda..."
                />
              </div>
            </div>
          </div>

          {/* Course Data (JSON) */}
          <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-6">
            <h2 className="text-xl font-bold text-white mb-2">Course Structure (JSON) *</h2>
            <p className="text-sm text-gray-400 mb-4">
              Edit the JSON below to customize your course sections, benefits, curriculum, etc.
            </p>

            <textarea
              required
              value={formData.course_data}
              onChange={(e) => setFormData({ ...formData, course_data: e.target.value })}
              rows={20}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-emerald-500 font-mono text-sm"
              placeholder="Course JSON structure..."
              spellCheck={false}
            />

            <p className="text-xs text-gray-500 mt-2">
              💡 Tip: Use the default structure above as a template and modify it for your course
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4 text-red-200">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 bg-gray-700 text-white font-bold rounded-lg hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-emerald-500 text-white font-bold rounded-lg hover:bg-emerald-600 transition-colors disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Course'}
            </button>
          </div>
        </form>
      </div>
    </AdminPageWrapper>
  );
}
