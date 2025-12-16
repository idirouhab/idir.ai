# Flujo de Emails para Automatización 101

## Importante: Gestión de Aforo y Donaciones

El curso tiene un **aforo máximo de 30 participantes**. El workflow de n8n debe gestionar dos casos diferentes según el número de inscripciones.

## Webhook de Inscripción

**Endpoint**: `https://idir-test.app.n8n.cloud/webhook/course-101-signup`

**Datos recibidos**:
```json
{
  "firstName": "string",
  "lastName": "string",
  "email": "string",
  "country": "string",
  "birthYear": "string",
  "language": "es|en",
  "termsAccepted": true,
  "donationCommitment": true
}
```

## Lógica de Aforo en n8n

El workflow debe:

1. **Contar inscripciones actuales** para este curso
2. **Determinar el estado**:
   - Si inscripciones <= 30: **PLAZA CONFIRMADA**
   - Si inscripciones > 30: **LISTA DE ESPERA**
3. **Enviar email correspondiente** según el estado

## Email 1: Plaza Confirmada (Inscripciones 1-30)

### Asunto (ES):
`✅ Plaza confirmada - Automatización 101 con Idir`

### Asunto (EN):
`✅ Spot confirmed - Automation 101 with Idir`

### Contenido clave que DEBE incluir:

#### Español:
```
¡Hola [firstName]!

🎉 ¡Enhorabuena! Tu plaza en Automatización 101 está CONFIRMADA.

📅 Detalles del curso:
- Inicio: Miércoles 14 de enero de 2026
- Horario: 19:00 (CET/España)
- Duración: 4 sesiones de 1 hora (miércoles consecutivos)
- Formato: En vivo por Zoom

💎 Tu compromiso de donación:
Como confirmaste durante la inscripción, te pedimos que hagas una donación de €5/$5 (o la cantidad que consideres justa) a FreeCodeCamp ANTES de la primera sesión.

Este curso tiene un valor de mercado de €100, pero lo ofrezco sin coste directo a cambio de tu compromiso solidario con la educación gratuita.

⚠️ IMPORTANTE: La donación va directamente a FreeCodeCamp (ONG), NO al instructor. Por tanto, no se realizarán devoluciones. Solo dona si estás comprometido/a con el curso.

👉 Link de donación a FreeCodeCamp: https://www.freecodecamp.org/espanol/donate/

📌 Recordatorios importantes:
- Si no puedes asistir, por favor responde a este email para liberar tu plaza
- Añade las sesiones a tu calendario (enlaces abajo)
- Recibirás el link de Zoom 48 horas antes de la primera sesión

📆 [Botón: Añadir a Google Calendar]
📆 [Botón: Añadir a Apple Calendar]

¡Nos vemos el 14 de enero!

Idir
idir.ai
```

#### English:
```
Hi [firstName]!

🎉 Congratulations! Your spot in Automation 101 is CONFIRMED.

📅 Course details:
- Start: Wednesday, January 14, 2026
- Time: 19:00 (CET/Spain)
- Duration: 4 one-hour sessions (consecutive Wednesdays)
- Format: Live via Zoom

💎 Your donation commitment:
As you confirmed during enrollment, we ask that you make a donation of €5/$5 (or whatever amount you consider fair) to FreeCodeCamp BEFORE the first session.

This course has a market value of $100, but I offer it at no direct cost in exchange for your solidarity commitment to free education.

⚠️ IMPORTANT: The donation goes directly to FreeCodeCamp (NGO), NOT to the instructor. Therefore, no refunds will be made. Only donate if you are committed to the course.

👉 Donation link to FreeCodeCamp: https://www.freecodecamp.org/donate/

📌 Important reminders:
- If you can't attend, please reply to this email to free up your spot
- Add the sessions to your calendar (links below)
- You'll receive the Zoom link 48 hours before the first session

📆 [Button: Add to Google Calendar]
📆 [Button: Add to Apple Calendar]

See you on January 14!

Idir
idir.ai
```

## Email 2: Lista de Espera (Inscripciones 31+)

### Asunto (ES):
`⏳ En lista de espera - Automatización 101 con Idir`

### Asunto (EN):
`⏳ On waitlist - Automation 101 with Idir`

### Contenido clave que DEBE incluir:

#### Español:
```
¡Hola [firstName]!

Gracias por tu interés en Automatización 101.

📊 Estado de tu inscripción:
Debido a la alta demanda, el aforo de 30 participantes se ha completado. Has sido añadido/a a la **lista de espera**.

¿Qué significa esto?
- Serás notificado/a por email si se libera una plaza
- Tendrás prioridad para futuras ediciones del curso
- NO necesitas hacer ninguna donación mientras estés en lista de espera

⚠️ Importante:
El compromiso de donación a FreeCodeCamp **SOLO aplica si tu plaza es confirmada** en el futuro. No dones ahora.

📅 Próximos pasos:
1. Te contactaremos si se libera una plaza antes del 14 de enero
2. Si no hay plazas disponibles, te avisaremos sobre la próxima edición
3. Mantén este email para futuras referencias

Si tienes alguna pregunta, responde a este email.

Gracias por tu comprensión,

Idir
idir.ai
```

#### English:
```
Hi [firstName]!

Thank you for your interest in Automation 101.

📊 Your enrollment status:
Due to high demand, the capacity of 30 participants has been reached. You've been added to the **waitlist**.

What does this mean?
- You'll be notified by email if a spot becomes available
- You'll have priority for future course editions
- You do NOT need to make any donation while on the waitlist

⚠️ Important:
The donation commitment to FreeCodeCamp **ONLY applies if your spot is confirmed** in the future. Do not donate now.

📅 Next steps:
1. We'll contact you if a spot opens before January 14
2. If no spots are available, we'll notify you about the next edition
3. Keep this email for future reference

If you have any questions, reply to this email.

Thank you for your understanding,

Idir
idir.ai
```

## Recordatorio 48h Antes (Solo para Confirmados)

### Asunto (ES):
`🔔 Mañana empieza - Automatización 101 + Link de Zoom`

### Contenido clave:
```
¡Hola [firstName]!

Mañana empieza Automatización 101 🎉

🔗 Link de Zoom: [ENLACE]
⏰ Hora: 19:00 (CET)

💎 Recordatorio de donación:
Si aún no lo has hecho, te pedimos que completes tu donación a FreeCodeCamp antes de la sesión.

Recuerda: La donación va directamente a la ONG, no se realizarán devoluciones.

👉 Link de donación: https://www.freecodecamp.org/espanol/donate/

Nos vemos mañana,
Idir
```

## Base de Datos Sugerida

Para gestionar el aforo, n8n debería:

1. **Tabla: course_enrollments**
   - id
   - course_id (ej: "automation-101-jan-2026")
   - email (unique)
   - first_name
   - last_name
   - country
   - birth_year
   - language
   - status: "confirmed" | "waitlist"
   - donation_committed: boolean
   - created_at
   - enrollment_number (auto-increment por course_id)

2. **Lógica de asignación**:
   ```javascript
   if (enrollment_number <= 30) {
     status = "confirmed"
     sendConfirmedEmail()
   } else {
     status = "waitlist"
     sendWaitlistEmail()
   }
   ```

## Workflow Cuando se Libera una Plaza

Si alguien con plaza confirmada cancela:

1. Buscar el primer usuario en waitlist (por created_at ASC)
2. Cambiar su status a "confirmed"
3. Enviar email de "Plaza Confirmada" (mismo que Email 1)
4. Incluir nota: "¡Buenas noticias! Se ha liberado una plaza y ahora tu inscripción está confirmada."

## Enlaces de Calendario

Generar ICS o enlaces directos a:
- Google Calendar: `https://calendar.google.com/calendar/render?action=TEMPLATE&text=...`
- Apple Calendar: Adjuntar archivo .ics

**Eventos a crear** (4 sesiones):
- 14 enero 2026, 19:00-20:00 CET
- 21 enero 2026, 19:00-20:00 CET
- 28 enero 2026, 19:00-20:00 CET
- 4 febrero 2026, 19:00-20:00 CET

---

## Resumen Visual del Flujo

```
Inscripción recibida
       ↓
Contar inscripciones
       ↓
   ¿<= 30?
   ↙     ↘
  SÍ      NO
   ↓       ↓
CONFIRMADO LISTA ESPERA
   ↓           ↓
Email con   Email sin
donación    donación
```

**Clave**: Las personas en lista de espera NO deben sentir presión de donar hasta que su plaza sea confirmada.
