export type LexicoNivel = "basico" | "medio" | "avanzado";

export type LexicoEntry = {
  term: string;
  en: string;
  def: string;
  nivel: LexicoNivel;
};

export const LEXICO: LexicoEntry[] = [
  {
    term: "Looksmaxxing",
    en: "Looksmaxxing",
    def: "Proceso de optimizar la apariencia física al máximo.",
    nivel: "basico",
  },
  {
    term: "Mewing",
    en: "Mewing",
    def: "Técnica de postura lingual para moldear el paladar y la mandíbula.",
    nivel: "basico",
  },
  {
    term: "Chad",
    en: "Chad",
    def: "Individuo con rasgos físicos y actitud dominante percibidos como altamente atractivos.",
    nivel: "basico",
  },
  {
    term: "Mogger",
    en: "Mogger",
    def: "Persona cuya presencia física eclipsa visualmente a quienes la rodean.",
    nivel: "medio",
  },
  {
    term: "PSL",
    en: "PSL Score",
    def: "Escala de atractivo facial basada en criterios de Looks/Estatus/Dinero.",
    nivel: "medio",
  },
  {
    term: "NT",
    en: "NormalTward",
    def: "Individuo con rasgos físicos dentro de la media.",
    nivel: "basico",
  },
  {
    term: "Ascensión",
    en: "Ascension",
    def: "Proceso de mejorar significativamente tu puntuación de atractivo.",
    nivel: "basico",
  },
  {
    term: "Cope",
    en: "Cope",
    def: "Mecanismo de negación o justificación de la realidad de uno mismo.",
    nivel: "basico",
  },
  {
    term: "Canthal Tilt",
    en: "Canthal Tilt",
    def: "Ángulo de los ojos: positivo se considera más atractivo.",
    nivel: "avanzado",
  },
  {
    term: "Framemaxxing",
    en: "Framemaxxing",
    def: "Maximizar el desarrollo del armazón óseo y muscular del cuerpo.",
    nivel: "medio",
  },
  {
    term: "Genética",
    en: "Genetics",
    def: "Base ósea y rasgos heredados. El techo de tu looksmax natural.",
    nivel: "medio",
  },
  {
    term: "Moggar",
    en: "To Mog",
    def: "Superar visualmente a alguien en un espacio compartido sin esfuerzo consciente.",
    nivel: "medio",
  },
];
