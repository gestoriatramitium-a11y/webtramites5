const SERVICES = {
  'prop-nota-simple': { tag: 'Registro de la Propiedad', title: 'Nota Simple Informativa', price: 35 },
  'prop-inscripcion': { tag: 'Registro de la Propiedad', title: 'Inscripción de Escritura', price: 85 },
  'prop-certificacion': { tag: 'Registro de la Propiedad', title: 'Certificación Registral', price: 65 },
  'prop-cancelacion': { tag: 'Registro de la Propiedad', title: 'Cancelación de Carga', price: 120 },
  'prop-anotacion': { tag: 'Registro de la Propiedad', title: 'Anotación Preventiva', price: 90 },
  'civil-nacimiento': { tag: 'Registro Civil', title: 'Certificado de Nacimiento', price: 30 },
  'civil-matrimonio': { tag: 'Registro Civil', title: 'Certificado de Matrimonio', price: 30 },
  'civil-defuncion': { tag: 'Registro Civil', title: 'Certificado de Defunción', price: 30 },
  'civil-fe-vida': { tag: 'Registro Civil', title: 'Fe de Vida y Estado', price: 45 },
  'civil-cambio-nombre': { tag: 'Registro Civil', title: 'Cambio de Nombre', price: 150 },
  'merc-denominacion': { tag: 'Registro Mercantil', title: 'Denominación Social', price: 40 },
  'merc-deposito': { tag: 'Registro Mercantil', title: 'Depósito de Cuentas Anuales', price: 120 },
  'merc-certificacion': { tag: 'Registro Mercantil', title: 'Certificación Registral', price: 55 },
  'merc-inscripcion': { tag: 'Registro Mercantil', title: 'Inscripción de Escritura', price: 140 },
  'merc-nota': { tag: 'Registro Mercantil', title: 'Nota Simple Mercantil', price: 35 }
};

function jsonResponse(statusCode, payload) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store'
    },
    body: JSON.stringify(payload)
  };
}

function parseJson(event) {
  try {
    return JSON.parse(event.body || '{}');
  } catch (_) {
    return null;
  }
}

function isEmail(value) {
  return typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function cleanText(value, max = 180) {
  return String(value || '')
    .replace(/[<>]/g, '')
    .replace(/[\r\n]+/g, ' ')
    .trim()
    .slice(0, max);
}

function formDataToText(formData) {
  if (!formData || typeof formData !== 'object') return '';
  return Object.entries(formData)
    .map(([key, value]) => `${key}: ${String(value || '').trim()}`)
    .join('\n')
    .slice(0, 7000);
}

async function sendEmailJS(templateParams) {
  const serviceId = process.env.EMAILJS_SERVICE_ID;
  const templateId = process.env.EMAILJS_TEMPLATE_ID;
  const publicKey = process.env.EMAILJS_PUBLIC_KEY;
  const privateKey = process.env.EMAILJS_PRIVATE_KEY;

  if (!serviceId || !templateId || !publicKey) {
    throw new Error('Faltan variables EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID o EMAILJS_PUBLIC_KEY.');
  }

  const body = {
    service_id: serviceId,
    template_id: templateId,
    user_id: publicKey,
    template_params: templateParams
  };

  if (privateKey) body.accessToken = privateKey;

  const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(`EmailJS ha devuelto ${response.status}: ${text}`);
  }

  return true;
}

module.exports = {
  SERVICES,
  jsonResponse,
  parseJson,
  isEmail,
  cleanText,
  formDataToText,
  sendEmailJS
};
