export const CATEGORIES = [
  { id: "gastronomia", label: "Gastronomía", keywords: ["gastronomía", "cocina", "cocinar", "chef", "receta", "comida", "culinario"] },
  { id: "educacion", label: "Educación", keywords: ["educación", "aprendizaje", "enseñanza", "curso", "pedagogía", "docente", "aula", "formación"] },
  { id: "software", label: "Software", keywords: ["software", "programación", "desarrollo", "app", "aplicación", "código", "codigo", "frontend", "backend", "fullstack"] },
  { id: "hardware", label: "Hardware", keywords: ["hardware", "electrónica", "circuito", "arduino", "robot", "componente", "pcb"] },
  { id: "ciberseguridad", label: "Ciberseguridad", keywords: ["seguridad", "ciberseguridad", "hacking", "hacker", "protección", "privacidad", "ethical", "pentesting"] },
  { id: "marketing", label: "Marketing y Negocios", keywords: ["marketing", "negocio", "emprendimiento", "ventas", "publicidad", "branding", "mercadeo", "startup", "ecommerce"] },
  { id: "diseno", label: "Diseño", keywords: ["diseño", "diseñador", "figma", "ux", "ui", "gráfico", "ilustración", "visual", "creative"] },
  { id: "finanzas", label: "Finanzas", keywords: ["finanzas", "inversión", "ahorro", "contabilidad", "economía", "presupuesto", "trading"] },
  { id: "musica", label: "Música", keywords: ["música", "musical", "instrumento", "producción musical", "audio", "sonido", "composición"] },
  { id: "salud", label: "Salud y Bienestar", keywords: ["salud", "bienestar", "fitness", "ejercicio", "meditación", "nutrición", "yoga", "mindfulness"] },
  { id: "idiomas", label: "Idiomas", keywords: ["idioma", "inglés", "español", "lenguaje", "traducción", "bilingüe"] },
  { id: "inteligencia-artificial", label: "Inteligencia Artificial", keywords: ["inteligencia artificial", "ia", "machine learning", "deep learning", "gpt", "red neuronal", "chatbot", "llm"] },
];

export function detectProductCategories(product: { title: string; description: string; category?: string | null }): string[] {
  if (product.category) return [product.category];

  const text = `${product.title} ${product.description}`.toLowerCase();
  const matched: string[] = [];
  for (const cat of CATEGORIES) {
    if (cat.keywords.some((k) => text.includes(k))) {
      matched.push(cat.id);
    }
  }
  return matched.length > 0 ? matched : ["otros"];
}
