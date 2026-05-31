import type { IconName } from "@/types/icons";

export type ConsejoCategory =
  | "piel"
  | "gym"
  | "nutricion"
  | "estilo"
  | "mente"
  | "sueno"
  | "grooming";

export type ConsejoDelDia = {
  title: string;
  body: string;
  tags: string[];
};

export type ConsejoItem = {
  id: string;
  category: ConsejoCategory;
  catIcon: IconName;
  catLabel: string;
  title: string;
  body: string;
  tag: string;
};

/** Consejo destacado (rotación manual; sustituir cuando quieras refrescar la portada). */
export const consejoDelDia: ConsejoDelDia = {
  title: "FPS cada mañana, sin excusas",
  body: "Limpia con un gel suave, hidrata y cierra con protector solar amplio espectro FPS 30+ aunque no salgas. El fotoenvejecimiento y las manchas son lo que más penaliza la piel en cámara; la rutina de noche (retinoide solo si ya la toleras) no compensa omitir el sol.",
  tags: ["PIEL", "PREVENCIÓN"],
};

export const consejos: ConsejoItem[] = [
  {
    id: "postura-foto",
    category: "gym",
    catIcon: "dumbbell",
    catLabel: "Cuerpo",
    title: "Postura antes que otro día de gym",
    body: "Hombros atrás y abajo, pecho alto y cuello neutro cambian la mandíbula y el cuello en foto más que un extra de curl. Dos minutos de pared (talones, glúteos, omóplatos) antes de grabar.",
    tag: "POSTURA",
  },
  {
    id: "proteina-repartida",
    category: "nutricion",
    catIcon: "beef",
    catLabel: "Nutrición",
    title: "Proteína repartida, no solo al final del día",
    body: "Apunta a 1,6–2,2 g de proteína por kg de peso repartidos en 3–4 tomas con comida real. Hidratación constante y verduras en cada comida principan sobre batidos y suplementos milagro.",
    tag: "DIETA",
  },
  {
    id: "ajuste-ropa",
    category: "estilo",
    catIcon: "shirt",
    catLabel: "Estilo",
    title: "El ajuste manda más que la marca",
    body: "Hombros de camiseta en el hueso, pinzas que marquen cintura y pantalón con un solo break en el zapato. Un básico de 20 € bien cortado gana a diseñador en talla equivocada.",
    tag: "SILUETA",
  },
  {
    id: "progreso-fotos",
    category: "mente",
    catIcon: "brain",
    catLabel: "Mentalidad",
    title: "Documenta, no te compares al espejo del gym",
    body: "Misma luz, distancia y ángulo (de frente y perfil) cada 30 días. El espejo del día malo miente; una serie corta muestra si el protocolo funciona sin obsesionarte con un pico.",
    tag: "PROGRESO",
  },
  {
    id: "sueno-hinchazon",
    category: "sueno",
    catIcon: "hourglass",
    catLabel: "Descanso",
    title: "Sueño profundo, cara menos hinchada",
    body: "Prioriza 7–9 h con horario fijo. Cortisol alto y poco sueño se notan en ojeras, párpados y mandíbula blanda en cámara. Pantallas fuera 45–60 min antes y habitación oscura.",
    tag: "RECUPERACIÓN",
  },
  {
    id: "barba-simetria",
    category: "grooming",
    catIcon: "sparkles",
    catLabel: "Grooming",
    title: "Barba con líneas claras",
    body: "Mejillas al ras o con degradado simétrico; cuello con línea a dos dedos por encima de la nuez. Perfiladas cada 3–5 días evitan sombra irregular que achata el maxilar en vídeo.",
    tag: "BARBA",
  },
  {
    id: "piel-noche",
    category: "piel",
    catIcon: "microscope",
    catLabel: "Piel",
    title: "Introduce activos de uno en uno",
    body: "Tras limpiar por la noche: hidratante primero. Si usas retinoide o ácido, una novedad cada dos semanas y siempre FPS al día siguiente. Menos capas irritadas = mejor textura en close-up.",
    tag: "SKINCARE",
  },
  {
    id: "sonrisa-encias",
    category: "grooming",
    catIcon: "smile",
    catLabel: "Grooming",
    title: "Sonrisa limpia sin exagerar el blanco",
    body: "Hilo dental diario y revisión anual. Encías sanas y dientes sin placa marcan más en primer plano que un blanqueamiento agresivo casero que da sensibilidad en fotos.",
    tag: "DENTAL",
  },
];
