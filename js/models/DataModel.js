// Datos base sacados del PDF: pautas generales y lista de la compra.
// Además se incluyen ejemplos de opciones de comidas que el usuario puede modificar.

export const HELP_TEXT = [
  "Pautas generales:",
  "• Mínimo 2 L de agua/día.",
  "• Pesar alimentos en crudo salvo indicación.",
  "• Verduras/hortalizas: puedes aumentar si te quedas con hambre.",
  "• Cocinado recomendado: plancha (máx. 5 g AOVE), vapor, horno, wok.",
  "• Puedes añadir: especias, vinagres sin azúcar, tés/infusiones, edulcorantes, tomate natural, salsas 0 (sin abusar). Café solo o cortado OK.",
  "• Mejor fruta entera que en zumo/smoothie (más saciedad y fibra).",
  "• Alcohol: limitar al máximo; ideal eliminar. Si fin de semana, 2–3 cervezas total; evitar diario.",
  "• Puedes repartir una comida en dos si respetas el total.",
  "• 1 comida libre/semana (controlada).",
  "• Comunica dudas/cambios para adaptar el plan."
];

export const SHOPPING = {
  proteinas: ["Huevos", "Claras", "Pechuga de pollo", "Ternera", "Pescado blanco"],
  carbohidratos: [
    "Kiwi", "Plátano", "Arándanos", "Frutas del bosque", "Manzana", "Pera",
    "Pasta integral", "Patata", "Arroz basmati", "Arroz integral",
    "Vegetales", "Pan integral"
  ],
  grasas: ["Frutos secos", "Aguacate", "Aceite de oliva"]
};

export const DEFAULT_OPTIONS = {
  desayuno: [
    { name: "Smoothie (fruta + proteína)", notes: "Ej.: arándanos/frutos rojos + whey" },
    { name: "Bocadillo de atún", notes: "Pan integral + atún + tomate/verdura" },
    { name: "Bol de avena con fruta", notes: "Avena + fruta + (opcional) crema cacahuete" },
    { name: "Tortitas/arepas + proteína", notes: "Con huevo/claras; ajusta según tu plan" }
  ],
  comida: [
    { name: "Ensalada con pollo", notes: "Verdura libre + pechuga + (opcional) aguacate" },
    { name: "Pasta con atún", notes: "Pasta integral + atún + verduras" },
    { name: "Lentejas con pollo", notes: "Lentejas + pechuga + verduras" },
    { name: "Poke bowl", notes: "Arroz + salmón + verduras + (opcional) frutos secos" },
    { name: "Verdura con pescado", notes: "Verduras + pescado blanco; aceite medido" },
    { name: "Ensalada de patata", notes: "Patata + huevo/claras + verduras" },
    { name: "Ensalada de pasta", notes: "Pasta + proteína + verduras" }
  ],
  merienda: [
    { name: "Yogur con fruta", notes: "Fruta + yogur proteico/natural" },
    { name: "Queso fresco con fruta", notes: "Queso batido/queso fresco + fruta" },
    { name: "Batido con fruta", notes: "Fruta + whey + agua/leche según plan" },
    { name: "Cachas de avena", notes: "Avena + agua + whey (si aplica)" }
  ],
  cena: [
    { name: "Tortilla de calabacín", notes: "Huevo/claras + verdura" },
    { name: "Verduras con pollo", notes: "Verdura libre + pechuga + aceite medido" },
    { name: "Ensalada con atún", notes: "Verdura + atún + aceite medido" },
    { name: "Tortas de arroz con salmón", notes: "Tortas + salmón ahumado + aguacate (si toca)" }
  ]
};

export const MEALS = [
  { key: "desayuno", label: "Desayuno" },
  { key: "comida", label: "Comida" },
  { key: "merienda", label: "Merienda" },
  { key: "cena", label: "Cena" }
];
