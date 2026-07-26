import { useEffect, useMemo, useState } from 'react'
import './App.css'

type Tab = 'hoy' | 'tareas' | 'calendario' | 'cerebro' | 'yo' | 'progreso'
type Block = 'mañana' | 'trabajo' | 'tarde' | 'post-6' | 'noche'
type Category = 'fitness' | 'ia' | 'sueño' | 'mente' | 'nutrición' | 'trabajo' | 'hobby' | 'skincare' | 'hidratación' | 'digestión' | 'meal-prep' | 'productividad'
type ResourceSource = 'GitHub' | 'Hacker News' | 'arXiv'
type NotificationStatus = NotificationPermission | 'unsupported'

type Activity = {
  id: string
  block: Block
  title: string
  detail: string
  minutes: number
  category: Category
  essential: boolean
  heavyDay: boolean
  time?: string
  tip?: string
  custom?: boolean
  date?: string
  days?: number[]
}

type Resource = {
  id: string
  title: string
  url: string
  source: ResourceSource
  meta: string
}

type DailyReminder = {
  id: string
  time: string
  title: string
  body: string
}

type DailyState = {
  date: string
  completed: Record<string, boolean>
  sleepHours: number
  anxiety: number
  energy: number
  workEnd: string
  heavyDay: boolean
  steps: number
  deepWork: number
  workout: 'gym' | 'casa' | 'caminar' | 'descanso'
  wins: string[]
  rescueProblem: string
  activities: Activity[]
  storagePersisted: 'desconocido' | 'activo' | 'básico' | 'no-soportado'
  resources: Resource[]
  birthDate: string
  mainGoal: string
  wakeTime: string
  sleepTime: string
  currentPriority: string
}

type HistoryEntry = DailyState & { progress: number; completedCount: number }

const survivalRoutine: Activity[] = [
  { id: 'survival-breathe', block: 'mañana', title: 'Respirar sin móvil', detail: 'Sentarse en la cama y respirar hondo 3 veces.', minutes: 2, category: 'mente', essential: true, heavyDay: true, time: '07:00', tip: 'No mirar el móvil al despertar baja la fricción mental del día.' },
  { id: 'survival-water', block: 'mañana', title: 'Vaso de agua preparado', detail: '400 ml de agua con pizca de sal marina.', minutes: 2, category: 'nutrición', essential: true, heavyDay: true, time: '07:05', tip: 'Hidratación y electrolitos reducen señales físicas que se confunden con ansiedad.' },
  { id: 'survival-light', block: 'mañana', title: 'Luz en ventana', detail: '2 minutos de luz natural, aunque esté nublado.', minutes: 2, category: 'sueño', essential: true, heavyDay: true, time: '07:10', tip: 'La luz ayuda a cortar melatonina residual y estabilizar energía.' },
  { id: 'survival-breakfast', block: 'mañana', title: 'Desayuno antiansiedad', detail: '2 huevos duros + puñado de nueces.', minutes: 15, category: 'nutrición', essential: true, heavyDay: true, time: '07:15', tip: 'Proteína y grasa reducen picos de hambre y antojos tempranos.' },
  { id: 'survival-kit', block: 'mañana', title: 'Kit de rescate laboral', detail: 'Manzana verde, almendras y botella de 1 litro.', minutes: 5, category: 'nutrición', essential: true, heavyDay: true, time: '07:30', tip: 'Preparar comida antes del estrés elimina decisiones impulsivas.' },
  { id: 'survival-water-work', block: 'trabajo', title: 'Rellenar botella cada hora', detail: 'Levantarse 2 minutos a llenar agua.', minutes: 2, category: 'trabajo', essential: true, heavyDay: true, time: '08:30', tip: 'Sed, ansiedad y hambre emocional se sienten parecido.' },
  { id: 'survival-lunch', block: 'trabajo', title: 'Comida fuera del escritorio', detail: 'Proteína + verdura primero; solo mitad de arroz o papa.', minutes: 30, category: 'nutrición', essential: true, heavyDay: true, time: '13:00', tip: 'El orden de alimentos ayuda a controlar glucosa y saciedad.' },
  { id: 'survival-3pm', block: 'tarde', title: 'Ataque 3 PM', detail: 'Manzana + almendras + 10 sentadillas en baño.', minutes: 5, category: 'fitness', essential: true, heavyDay: true, time: '15:30', tip: 'Fibra, grasa y movimiento cortan el bajón sin azúcar.' },
  { id: 'survival-before-home', block: 'post-6', title: 'Escudo antes de salir', detail: 'Yogur griego natural o almendras antes de irte.', minutes: 3, category: 'nutrición', essential: true, heavyDay: true, time: '18:00', tip: 'Llegar sin hambre reduce delivery y atracón.' },
  { id: 'survival-walk-home', block: 'post-6', title: 'Caminar antes de entrar', detail: '15 minutos alrededor de la manzana.', minutes: 15, category: 'fitness', essential: true, heavyDay: true, time: '18:30', tip: 'Esta caminata decide si estudias o caes al sofá.' },
  { id: 'survival-shower', block: 'post-6', title: 'Ducha de contraste', detail: '2 min caliente + 30 s fría al final.', minutes: 5, category: 'mente', essential: false, heavyDay: false, time: '18:45', tip: 'Un cambio térmico suave ayuda a cortar ansiedad acumulada.' },
  { id: 'survival-dinner', block: 'noche', title: 'Cena antiatracón', detail: 'Proteína + verduras frescas o congeladas.', minutes: 20, category: 'nutrición', essential: true, heavyDay: true, time: '19:30', tip: 'Brócoli o coliflor congelada al microondas: bajo esfuerzo, alta saciedad.' },
  { id: 'survival-study', block: 'noche', title: 'Pomodoro para ansiosos', detail: '2 ciclos: 25 min estudio + 5 min descanso activo.', minutes: 60, category: 'ia', essential: false, heavyDay: false, time: '20:00', tip: 'Para al terminar. La consistencia vale más que exprimir dopamina.' },
  { id: 'survival-phone-out', block: 'noche', title: 'Móvil fuera', detail: 'Cargar el teléfono fuera de la habitación.', minutes: 1, category: 'sueño', essential: true, heavyDay: true, time: '22:00', tip: 'Menos luz, menos ansiedad subconsciente.' },
  { id: 'survival-dump', block: 'noche', title: 'Cuaderno de descarga', detail: 'Escribir preocupaciones sin filtro.', minutes: 5, category: 'mente', essential: true, heavyDay: true, time: '22:10', tip: 'Vaciar la cabeza en papel reduce rumiación nocturna.' },
  { id: 'survival-breath-night', block: 'noche', title: 'Respiración 4-2-6', detail: 'Inhala 4, mantén 2, exhala 6. Cinco veces.', minutes: 3, category: 'mente', essential: true, heavyDay: true, time: '22:20', tip: 'Exhalar más largo activa el freno del sistema nervioso.' },
  { id: 'survival-sleep', block: 'noche', title: 'Dormir sí o sí', detail: 'Luz apagada. Descanso pasivo también cuenta.', minutes: 480, category: 'sueño', essential: true, heavyDay: true, time: '23:00', tip: 'Dormir regula hambre y antojos del día siguiente.' },
]

const emergencyPlan = [
  { craving: 'Snacks crocantes', action: 'Pepino en rodajas con limón y sal.', reason: 'Crujiente, salado, volumen alto y casi sin calorías.' },
  { craving: 'Dulce o helado', action: 'Hielo picado o cubos de hielo lentamente.', reason: 'Frío y masticación bajan urgencia oral en minutos.' },
  { craving: 'Comer por estrés', action: 'Cronómetro de 10 minutos antes de decidir.', reason: 'El pico de hambre emocional suele bajar si no lo alimentas al instante.' },
]

const weeklyRules = [
  'Cero azúcares añadidos antes de las 6 PM.',
  'Caminar 15 minutos antes de entrar a casa.',
  'Cumplir 5 de 7 días gana. Si fallas, reinicias sin culpa.',
]

const progressivePlan = [
  'Semana 1: huevos en desayuno + caminata de 15 min al llegar. Ignora lo demás.',
  'Semana 2: añade kit de rescate + cena proteica.',
  'Semana 3: añade 1 hora Pomodoro. No más.',
]

const dailyReminders: DailyReminder[] = [
  { id: 'morning', time: '06:00', title: 'Buenos días', body: 'Empieza simple: agua, luz natural y una acción mínima.' },
  { id: 'happy-hour', time: '18:00', title: 'Hora feliz', body: 'Antes de entrar en automático: camina, respira y protege la tarde.' },
  { id: 'sleep', time: '22:30', title: 'A dormir', body: 'Móvil fuera, luces bajas y descarga mental. Mañana se continúa.' },
]

const scientificRoutine: Activity[] = [
  { id: 'chrono-alarm', block: 'mañana', title: 'Levantarse sin snooze', detail: 'Cortar sueño fragmentado y niebla mental.', minutes: 1, category: 'sueño', essential: true, heavyDay: true, time: '06:00', tip: 'No uses repetición. El sueño fragmentado aumenta la niebla mental.' },
  { id: 'chrono-sun', block: 'mañana', title: 'Luz solar directa', detail: 'Salir 10 minutos, incluso si está nublado.', minutes: 10, category: 'sueño', essential: true, heavyDay: true, time: '06:05', tip: 'La luz natural frena melatonina y sincroniza el reloj biológico.' },
  { id: 'chrono-water', block: 'mañana', title: 'Agua con pizca de sal', detail: '400-500 ml al despertar.', minutes: 2, category: 'nutrición', essential: true, heavyDay: true, time: '06:15', tip: 'Durante la noche pierdes agua por respiración y sudor.' },
  { id: 'chrono-mobility', block: 'mañana', title: 'Movilidad dinámica', detail: 'Sin ejercicio intenso en ayunas.', minutes: 10, category: 'fitness', essential: true, heavyDay: true, time: '06:20', tip: 'Activa el cuerpo sin elevar cortisol de más.' },
  { id: 'chrono-protein', block: 'mañana', title: 'Desayuno proteico', detail: '30-40g proteína y grasas saludables.', minutes: 20, category: 'nutrición', essential: false, heavyDay: false, time: '07:00', tip: 'Prioriza proteína para saciedad y dopamina estable.' },
  { id: 'chrono-nsdr', block: 'tarde', title: 'NSDR o micro-siesta', detail: '10-20 minutos. Nunca más de 25.', minutes: 20, category: 'mente', essential: false, heavyDay: false, time: '14:00', tip: 'Si trabajas, haz respiración profunda 10 minutos.' },
  { id: 'chrono-walk', block: 'tarde', title: 'Movimiento anti-bajón', detail: 'Caminar 5 min o 10 sentadillas.', minutes: 5, category: 'fitness', essential: true, heavyDay: true, time: '15:00', tip: 'Reactivar flujo sanguíneo ayuda contra el bajón de las 3 PM.' },
  { id: 'chrono-deep-task', block: 'tarde', title: 'Tarea cognitiva compleja', detail: 'Programación, análisis o informes.', minutes: 120, category: 'trabajo', essential: false, heavyDay: false, time: '14:00', tip: 'La tarde puede ser un segundo pico analítico.' },
  { id: 'chrono-warm-light', block: 'post-6', title: 'Luz cálida', detail: 'Cambiar iluminación a ámbar.', minutes: 1, category: 'sueño', essential: true, heavyDay: true, time: '18:30', tip: 'Indica al cerebro que el día termina.' },
  { id: 'chrono-blue-filter', block: 'post-6', title: 'Filtro azul', detail: 'Modo nocturno en dispositivos.', minutes: 1, category: 'sueño', essential: true, heavyDay: true, time: '18:35', tip: 'Ideal: teléfono cargando lejos.' },
  { id: 'chrono-screenless', block: 'post-6', title: 'Hobby sin pantalla', detail: 'Leer, hablar, caminar o actividad manual.', minutes: 60, category: 'hobby', essential: false, heavyDay: false, time: '19:00', tip: 'Reduce rumiación mental.' },
  { id: 'chrono-shower', block: 'noche', title: 'Ducha caliente', detail: '10 minutos para facilitar enfriamiento corporal.', minutes: 10, category: 'sueño', essential: false, heavyDay: false, time: '21:15', tip: 'Al salir, el cuerpo baja temperatura y facilita dormir.' },
  { id: 'chrono-dump', block: 'noche', title: 'Brain dump', detail: 'Escribir preocupaciones y pendientes.', minutes: 5, category: 'mente', essential: true, heavyDay: true, time: '21:30', tip: 'Saca la ansiedad de la cabeza al papel.' },
  { id: 'chrono-breath', block: 'noche', title: 'Respiración 4-7-8', detail: '3 ciclos antes de dormir.', minutes: 3, category: 'mente', essential: true, heavyDay: true, time: '22:00', tip: 'Activa el sistema parasimpático.' },
  { id: 'chrono-bed', block: 'noche', title: 'Acostarse en oscuridad', detail: 'Regularidad por encima de perfección.', minutes: 1, category: 'sueño', essential: true, heavyDay: true, time: '22:30', tip: 'La consistencia horaria es la regla de oro.' },
]

const baseActivities: Activity[] = [
  { id: 'deep-ai', block: 'mañana', title: 'IA profunda', detail: 'Código, matemáticas o paper. Sin navegación libre.', minutes: 45, category: 'ia', essential: true, heavyDay: false, time: '06:30', tip: 'La incomodidad de no entender es parte del entrenamiento.' },
  { id: 'lut', block: 'trabajo', title: 'La única tarea', detail: 'Define la acción que hará que el día valga.', minutes: 5, category: 'trabajo', essential: true, heavyDay: true, time: '08:15', tip: 'Antes de apagar incendios, decide qué importa.' },
  { id: 'ai-extension', block: 'trabajo', title: 'IA como extensión', detail: 'Automatiza o mejora una tarea repetitiva.', minutes: 15, category: 'ia', essential: false, heavyDay: false, time: '11:00', tip: 'Si se repite dos veces, merece prompt o script.' },
  { id: 'gym-home', block: 'post-6', title: 'Entreno gym/casa', detail: 'Fuerza, caminata o rutina corta.', minutes: 45, category: 'fitness', essential: true, heavyDay: false, time: '18:45', tip: 'En día pesado bastan 10 minutos.' },
  { id: 'three-wins', block: 'noche', title: 'Tres victorias', detail: 'Cuerpo, trabajo e IA. Una línea basta.', minutes: 5, category: 'mente', essential: true, heavyDay: true, time: '21:45', tip: 'La gratitud por el esfuerzo arraiga identidad.' },
]

const categories: Category[] = ['fitness', 'ia', 'sueño', 'mente', 'nutrición', 'trabajo', 'hobby', 'skincare', 'hidratación', 'digestión', 'meal-prep', 'productividad']

const kokoroWeekdayRoutine: Activity[] = [
  { id: 'kokoro-water-bathroom', block: 'mañana', title: 'Agua + baño intestinal', detail: '500 ml de agua y sentarte al baño sin prisa para entrenar el horario.', minutes: 10, category: 'digestión', essential: true, heavyDay: true, time: '05:30', days: [1, 2, 3, 4, 5], tip: 'El intestino aprende por horario: agua, calma y repetición.' },
  { id: 'kokoro-sun-breath', block: 'mañana', title: 'Sol + respiración 4-6', detail: '5-10 minutos de luz natural y 8 respiraciones lentas.', minutes: 10, category: 'mente', essential: true, heavyDay: true, time: '05:35', days: [1, 2, 3, 4, 5], tip: 'Luz exterior temprano regula energía, sueño y estado de ánimo.' },
  { id: 'kokoro-skincare-am', block: 'mañana', title: 'Skincare AM FPS 50+', detail: 'Limpieza, vitamina C, hidratante y protector solar.', minutes: 13, category: 'skincare', essential: true, heavyDay: true, time: '05:45', days: [1, 2, 3, 4, 5], tip: 'Ciudad + sol: el FPS es parte de la salud diaria.' },
  { id: 'kokoro-pack-gym', block: 'mañana', title: 'Mochila gimnasio lista', detail: 'Ropa, tuppers, agua, bloqueador, toalla y cargador.', minutes: 7, category: 'productividad', essential: true, heavyDay: true, time: '05:58', days: [1, 2, 3, 4, 5], tip: 'Por la mañana no se decide: se ejecuta.' },
  { id: 'kokoro-yoga-pilates', block: 'mañana', title: 'Yoga/Pilates antes del trabajo', detail: '45 minutos mente-cuerpo al 70% de esfuerzo.', minutes: 45, category: 'fitness', essential: true, heavyDay: false, time: '06:10', days: [1, 2, 3, 4, 5], tip: 'Activar no es destruirte. Debes salir con energía.' },
  { id: 'kokoro-postgym-skincare', block: 'mañana', title: 'Ducha + reaplicar FPS', detail: 'Ducha rápida, cambio y protector solar de nuevo.', minutes: 20, category: 'skincare', essential: true, heavyDay: true, time: '06:55', days: [1, 2, 3, 4, 5], tip: 'Si sudaste, limpia y reaplica.' },
  { id: 'kokoro-fiber-breakfast', block: 'mañana', title: 'Desayuno fibra/probiótico', detail: 'Overnight oats con avena, yogur, chía, linaza, fruta con cáscara o kiwi.', minutes: 20, category: 'digestión', essential: true, heavyDay: true, time: '07:15', days: [1, 2, 3, 4, 5], tip: 'Fibra + agua + probiótico es el trío anti estreñimiento.' },
  { id: 'kokoro-ceo-start', block: 'trabajo', title: 'Arranque CEO + Eisenhower', detail: 'Clasifica urgente/importante, bloquea agenda y define la tarea que hace valer el día.', minutes: 15, category: 'productividad', essential: true, heavyDay: true, time: '08:30', days: [1, 2, 3, 4, 5], tip: 'Toda reunión termina con responsable, fecha y siguiente acción.' },
  { id: 'kokoro-critical-pm', block: 'trabajo', title: 'Bloque crítico PM Telco', detail: 'KPIs, agentes TV, capacitación, escalaciones y bloqueos operativos.', minutes: 75, category: 'trabajo', essential: true, heavyDay: false, time: '08:45', days: [1, 2, 3, 4, 5], tip: 'Aquí va lo que exige cabeza fresca.' },
  { id: 'kokoro-active-pause-1', block: 'trabajo', title: 'Pausa activa + agua', detail: '250 ml de agua, cuello, hombros, espalda y 2 minutos caminando.', minutes: 10, category: 'hidratación', essential: true, heavyDay: true, time: '10:00', days: [1, 2, 3, 4, 5], tip: 'Pausas cada 90 minutos sostienen energía.' },
  { id: 'kokoro-ai-study-work', block: 'trabajo', title: 'Estudio IA PM #1', detail: '45 min no negociables: Copilot, Jira, Confluence, automatización o prompts PM.', minutes: 45, category: 'ia', essential: true, heavyDay: false, time: '10:10', days: [1, 2, 3, 4, 5], tip: 'Output: 1 nota, 1 prompt, 1 aplicación para Megacable.' },
  { id: 'kokoro-fiber-snack-1', block: 'trabajo', title: 'Merienda fibra #1', detail: 'Kiwi/yogur, manzana con cáscara/almendras, papaya/chía o hummus/zanahoria.', minutes: 15, category: 'digestión', essential: true, heavyDay: true, time: '10:55', days: [1, 2, 3, 4, 5], tip: 'No llegar vacío al almuerzo evita comer pesado.' },
  { id: 'kokoro-light-lunch', block: 'trabajo', title: 'Almuerzo estratégico', detail: 'Proteína magra, carbo complejo moderado, verduras cocidas/crudas y aceite de oliva.', minutes: 40, category: 'nutrición', essential: true, heavyDay: true, time: '12:30', days: [1, 2, 3, 4, 5], tip: 'Evita fritos, refresco y comida corrida pesada.' },
  { id: 'kokoro-digestive-walk', block: 'trabajo', title: 'Caminata digestiva', detail: '15 minutos después de comer para glucosa, digestión y motilidad intestinal.', minutes: 15, category: 'digestión', essential: true, heavyDay: true, time: '13:10', days: [1, 2, 3, 4, 5], tip: 'Si no puedes salir, camina pasillos o escaleras.' },
  { id: 'kokoro-admin-block', block: 'tarde', title: 'Bloque administrativo', detail: 'Correos, reportes, seguimiento de capacitación, asistencia y documentación.', minutes: 95, category: 'trabajo', essential: false, heavyDay: false, time: '13:25', days: [1, 2, 3, 4, 5], tip: 'Deja tareas profundas fuera del bajón.' },
  { id: 'kokoro-anti-crash', block: 'tarde', title: 'Protocolo anti bajón', detail: 'Agua, snack proteína/fibra, respiración 4-6 y 10 sentadillas lentas.', minutes: 15, category: 'mente', essential: true, heavyDay: true, time: '15:00', days: [1, 2, 3, 4, 5], tip: 'Cuando llegue el bajón, no improvisar.' },
  { id: 'kokoro-followup-block', block: 'tarde', title: 'Seguimiento operativo', detail: 'Cerrar pendientes, revisar agentes, escalar lo necesario y preparar entregables.', minutes: 90, category: 'trabajo', essential: true, heavyDay: false, time: '15:15', days: [1, 2, 3, 4, 5], tip: 'Si toma menos de 2 minutos, hazlo. Si no, agenda.' },
  { id: 'kokoro-work-shutdown', block: 'post-6', title: 'Shutdown laboral', detail: 'Primera tarea de mañana, cerrar correo/laptop y salir sin abrir frentes nuevos.', minutes: 20, category: 'productividad', essential: true, heavyDay: true, time: '17:40', days: [1, 2, 3, 4, 5], tip: 'El trabajo queda estacionado. Mañana continúa.' },
  { id: 'kokoro-commute-reset', block: 'post-6', title: 'Traslado sin correos', detail: 'Música ligera, silencio o respiración 4-6. No responder trabajo.', minutes: 40, category: 'mente', essential: true, heavyDay: true, time: '18:00', days: [1, 2, 3, 4, 5], tip: 'La transición evita que el trabajo invada la noche.' },
  { id: 'kokoro-light-dinner', block: 'noche', title: 'Cena ligera alta en fibra', detail: 'Sopa/ensalada/bowl con proteína, verduras y chía/aceite de oliva si aplica.', minutes: 30, category: 'digestión', essential: true, heavyDay: true, time: '18:55', days: [1, 2, 3, 4, 5], tip: 'Cenar antes de las 8 PM protege digestión y sueño.' },
  { id: 'kokoro-pack-tomorrow', block: 'noche', title: 'Preparar mañana', detail: 'Ropa gym, ropa trabajo, tuppers, agua, bloqueador, toalla, cargador y audífonos.', minutes: 15, category: 'productividad', essential: true, heavyDay: true, time: '19:25', days: [1, 2, 3, 4, 5], tip: 'Este bloque protege el entrenamiento de mañana.' },
  { id: 'kokoro-ai-study-home', block: 'noche', title: 'Estudio IA PM #2', detail: 'Pomodoro 25/5/15: curso, proyecto personal, lectura técnica o aplicación al trabajo.', minutes: 45, category: 'ia', essential: true, heavyDay: false, time: '19:40', days: [1, 2, 3, 4, 5], tip: 'Output: 1 aprendizaje, 1 aplicación, 1 siguiente paso.' },
  { id: 'kokoro-skincare-pm', block: 'noche', title: 'Skincare PM completo', detail: 'Doble limpieza, tónico, sérum, hidratante y contorno opcional.', minutes: 20, category: 'skincare', essential: true, heavyDay: true, time: '20:25', days: [1, 2, 3, 4, 5], tip: 'Retinol lunes/jueves; niacinamida los demás días.' },
  { id: 'kokoro-journal-breath', block: 'noche', title: 'Diario + respiración', detail: '3 cosas buenas, 1 mejora, 1 pendiente, 1 cosa que soltar y 5 min respiración.', minutes: 15, category: 'mente', essential: true, heavyDay: true, time: '21:10', days: [1, 2, 3, 4, 5], tip: 'Vaciar la mente es parte del descanso.' },
  { id: 'kokoro-screens-off', block: 'noche', title: 'Pantallas fuera', detail: 'Celular fuera de cama, no molestar, luz baja y habitación fresca.', minutes: 5, category: 'sueño', essential: true, heavyDay: true, time: '21:25', days: [1, 2, 3, 4, 5], tip: 'Dormir antes de las 10 protege todo el sistema.' },
  { id: 'kokoro-sleep', block: 'noche', title: 'Dormir 10 PM', detail: 'Luces apagadas. Objetivo: 7.5-8 horas.', minutes: 480, category: 'sueño', essential: true, heavyDay: true, time: '22:00', days: [1, 2, 3, 4, 5], tip: 'Sin sueño no hay rutina estricta que aguante.' },
]

const kokoroSundayRoutine: Activity[] = [
  { id: 'kokoro-sunday-move', block: 'mañana', title: 'Movimiento suave domingo', detail: 'Yoga, caminata o estiramientos 20-40 minutos.', minutes: 40, category: 'fitness', essential: false, heavyDay: false, time: '08:00', days: [0], tip: 'Mantén el hábito sin exigir ritmo laboral.' },
  { id: 'kokoro-sunday-fiber-breakfast', block: 'mañana', title: 'Desayuno alto en fibra', detail: 'Avena, chía, fruta con cáscara, yogur natural o papaya.', minutes: 30, category: 'digestión', essential: true, heavyDay: true, time: '09:00', days: [0], tip: 'Domingo también cuida digestión.' },
  { id: 'kokoro-meal-prep', block: 'trabajo', title: 'Meal prep 2 horas', detail: 'Preparar desayunos, almuerzos, meriendas y cenas base de lunes a viernes.', minutes: 120, category: 'meal-prep', essential: true, heavyDay: true, time: '10:00', days: [0], tip: 'La semana saludable se gana el domingo.' },
  { id: 'kokoro-sunday-ai', block: 'tarde', title: 'Estudio IA semanal', detail: '1 hora: revisar tema semanal y definir mini-proyecto aplicable a PM Telco.', minutes: 60, category: 'ia', essential: false, heavyDay: false, time: '17:00', days: [0], tip: 'Cierra con 1 entregable pequeño.' },
  { id: 'kokoro-week-review', block: 'post-6', title: 'Revisión semanal', detail: 'Agenda, prioridades, pendientes PM, ropa y tuppers del lunes.', minutes: 30, category: 'productividad', essential: true, heavyDay: true, time: '18:30', days: [0], tip: 'Lunes no debe empezar en modo persecución.' },
  { id: 'kokoro-sunday-sleep', block: 'noche', title: 'Dormir temprano domingo', detail: 'Pantallas fuera 9:30 PM y dormir 10 PM.', minutes: 480, category: 'sueño', essential: true, heavyDay: true, time: '22:00', days: [0], tip: 'El lunes se protege desde domingo.' },
]

const kokoroRoutine = [...kokoroWeekdayRoutine, ...kokoroSundayRoutine]

const kokoroMealPrep = [
  'Comprar avena, chía, linaza, kiwi, papaya, manzana con cáscara y frutos rojos.',
  'Comprar brócoli, espárragos, espinaca, calabacita, zanahoria, pepino y champiñones.',
  'Preparar proteína magra: pollo, pavo, huevo, atún, salmón, tofu o yogur natural.',
  'Cocer quinoa/arroz integral/camote y mantener carbohidrato moderado en tuppers.',
  'Armar 5 desayunos overnight oats, 5 almuerzos, 5 meriendas y cenas base ligeras.',
]

const kokoroSkincare = [
  'AM: limpieza suave, vitamina C, hidratante y protector solar FPS 50+.',
  'Post-gym: limpiar si sudaste y reaplicar FPS 50+.',
  'PM: agua micelar o bálsamo, limpiador suave, tónico, sérum e hidratante.',
  'Retinol lunes y jueves; niacinamida o hidratante los demás días.',
  'Doble limpieza diaria si hubo contaminación, sudor o protector solar.',
]

const kokoroAiPlan = [
  'Semana 1: minutas, resúmenes y follow-ups con IA.',
  'Semana 2: Copilot, ChatGPT y prompts para Project Management.',
  'Semana 3: automatización de reportes y dashboards.',
  'Semana 4: IA para capacitación de agentes TV.',
  'Semana 5: análisis de tickets, quejas y voz del cliente.',
  'Semana 6: AI-driven Project Management aplicado a Telco.',
]

const defaultState: DailyState = {
  date: todayKey(),
  completed: {},
  sleepHours: 7.5,
  anxiety: 3,
  energy: 3,
  workEnd: '18:00',
  heavyDay: false,
  steps: 4000,
  deepWork: 0,
  workout: 'gym',
  wins: ['', '', ''],
  rescueProblem: '',
  activities: [...survivalRoutine, ...scientificRoutine, ...baseActivities],
  storagePersisted: 'desconocido',
  resources: [],
  birthDate: '',
  mainGoal: 'Construir una vida estable con cuerpo, mente e IA.',
  wakeTime: '06:15',
  sleepTime: '22:45',
  currentPriority: 'Cumplir el siguiente paso, no todo el sistema.',
}

const tabs: { id: Tab; label: string }[] = [
  { id: 'hoy', label: 'Hoy' },
  { id: 'tareas', label: 'Tareas' },
  { id: 'calendario', label: 'Calendario' },
  { id: 'cerebro', label: 'Cerebro' },
  { id: 'yo', label: 'Yo' },
  { id: 'progreso', label: 'Progreso' },
]

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('hoy')
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [state, setState] = useState<DailyState>(() => loadState())
  const [notificationStatus, setNotificationStatus] = useState<NotificationStatus>(() => getNotificationStatus())

  const visibleActivities = useMemo(
    () => sortActivities(filterActivitiesForDate(state.activities, state.date, state.heavyDay)),
    [state.activities, state.date, state.heavyDay],
  )

  const completedCount = visibleActivities.filter((activity) => state.completed[activity.id]).length
  const progress = visibleActivities.length ? Math.round((completedCount / visibleActivities.length) * 100) : 0
  const deepMinutes = visibleActivities
    .filter((activity) => state.completed[activity.id] && activity.category === 'ia')
    .reduce((sum, activity) => sum + activity.minutes, state.deepWork)
  const insights = getInsights(state, progress, deepMinutes, history)

  useEffect(() => {
    persistState(state, progress, completedCount).then(setHistory).catch(() => undefined)
  }, [state, progress, completedCount])

  useEffect(() => {
    loadHistory().then(setHistory).catch(() => undefined)
  }, [])

  useEffect(() => {
    if (notificationStatus !== 'granted') return undefined
    return scheduleDailyNotifications(dailyReminders)
  }, [notificationStatus])

  function toggleActivity(id: string) {
    hapticClick()
    setState((current) => ({
      ...current,
      completed: { ...current.completed, [id]: !current.completed[id] },
    }))
  }

  function upsertActivity(activity: Activity) {
    hapticClick()
    setState((current) => ({
      ...current,
      activities: current.activities.some((item) => item.id === activity.id)
        ? current.activities.map((item) => (item.id === activity.id ? activity : item))
        : [activity, ...current.activities],
    }))
  }

  function loadKokoroRoutine() {
    hapticClick()
    setState((current) => ({
      ...current,
      activities: mergeActivityLists(current.activities, kokoroRoutine),
      mainGoal: 'Salud primero: ejercicio, comida sana, skincare, hidratación e IA aplicada a Project Management.',
      wakeTime: '05:30',
      sleepTime: '22:00',
      currentPriority: 'Cumplir la ruta Kokoro del día sin improvisar.',
      workEnd: '18:00',
    }))
  }

  function changeActiveDate(date: string) {
    hapticClick()
    const savedEntry = history.find((entry) => entry.date === date)
    setState((current) => savedEntry
      ? { ...defaultState, ...savedEntry, activities: mergeActivities(savedEntry.activities), resources: savedEntry.resources ?? [], birthDate: current.birthDate, mainGoal: current.mainGoal, wakeTime: current.wakeTime, sleepTime: current.sleepTime, currentPriority: current.currentPriority }
      : { ...current, date, completed: {}, wins: ['', '', ''], rescueProblem: '' })
  }

  function deleteActivity(id: string) {
    hapticClick()
    setState((current) => {
      const { [id]: _removed, ...completed } = current.completed
      return { ...current, completed, activities: current.activities.filter((activity) => activity.id !== id) }
    })
  }

  function updateWin(index: number, value: string) {
    setState((current) => {
      const wins = [...current.wins]
      wins[index] = value
      return { ...current, wins }
    })
  }

  async function requestPersistentStorage() {
    hapticClick()
    if (!navigator.storage?.persist) {
      setState((current) => ({ ...current, storagePersisted: 'no-soportado' }))
      return
    }
    const granted = await navigator.storage.persist()
    setState((current) => ({ ...current, storagePersisted: granted ? 'activo' : 'básico' }))
  }

  async function requestDailyNotifications() {
    hapticClick()
    if (!('Notification' in window)) {
      setNotificationStatus('unsupported')
      return
    }
    const permission = await Notification.requestPermission()
    setNotificationStatus(permission)
  }

  return (
    <main className="app-shell">
      <div className="paper-grain" />
      <div className="ambient-orb ambient-orb-a" aria-hidden="true" />
      <div className="ambient-orb ambient-orb-b" aria-hidden="true" />
      <header className="topbar">
        <div>
          <p className="caption">El Método del 1%</p>
          <h1>1 MODE<span aria-hidden="true" /></h1>
          <p className="topbar-copy">Rituales mínimos para cuerpo, mente e IA.</p>
        </div>
        <div className="topbar-actions">
          <span>{progress}% hoy</span>
          <button className={`seal-button ${state.heavyDay ? 'is-on' : ''}`} type="button" onClick={() => { hapticClick(); setState((current) => ({ ...current, heavyDay: !current.heavyDay })) }}>
            {state.heavyDay ? 'Día pesado' : 'Normal'}
          </button>
        </div>
      </header>

      <section className="page-card page-entry" key={activeTab}>
        {activeTab === 'hoy' && <TodayView completedCount={completedCount} progress={progress} state={state} activities={visibleActivities} insights={insights} onToggle={toggleActivity} setState={setState} updateWin={updateWin} upsertActivity={upsertActivity} changeActiveDate={changeActiveDate} />}
        {activeTab === 'tareas' && <TasksView activeDate={state.date} activities={state.activities} upsertActivity={upsertActivity} deleteActivity={deleteActivity} loadKokoroRoutine={loadKokoroRoutine} />}
        {activeTab === 'calendario' && <CalendarView history={history} state={state} progress={progress} completedCount={completedCount} changeActiveDate={changeActiveDate} />}
        {activeTab === 'cerebro' && <BrainView state={state} setState={setState} history={history} progress={progress} completedCount={completedCount} deepMinutes={deepMinutes} insights={insights} />}
        {activeTab === 'yo' && <YouView state={state} setState={setState} history={history} requestPersistentStorage={requestPersistentStorage} notificationStatus={notificationStatus} requestDailyNotifications={requestDailyNotifications} />}
        {activeTab === 'progreso' && <ProgressView progress={progress} state={state} completedCount={completedCount} insights={insights} history={history} />}
      </section>

      <nav className="bottom-nav" aria-label="Navegación principal">
        {tabs.map((tab) => <button key={tab.id} className={activeTab === tab.id ? 'active' : ''} type="button" onClick={() => { hapticClick(); setActiveTab(tab.id) }}>{tab.label}</button>)}
      </nav>
    </main>
  )
}

function TodayView({ completedCount, progress, state, activities, insights, onToggle, setState, updateWin, upsertActivity, changeActiveDate }: {
  completedCount: number
  progress: number
  state: DailyState
  activities: Activity[]
  insights: string[]
  onToggle: (id: string) => void
  setState: React.Dispatch<React.SetStateAction<DailyState>>
  updateWin: (index: number, value: string) => void
  upsertActivity: (activity: Activity) => void
  changeActiveDate: (date: string) => void
}) {
  return (
    <>
      <section className="daily-console">
        <div>
          <p className="caption">Día activo</p>
          <input type="date" value={state.date} onChange={(event) => changeActiveDate(event.target.value)} />
        </div>
        <div>
          <p className="caption">Día de vida</p>
          <strong>{lifeDayText(state.birthDate, state.date)}</strong>
        </div>
      </section>
      <div className="hero-grid">
        <div className="progress-ring" style={{ '--progress': `${progress * 3.6}deg` } as React.CSSProperties}>
          <strong>{progress}%</strong>
          <span>{completedCount}/{activities.length}</span>
        </div>
        <div>
          <p className="caption">{formatDateKey(state.date)}</p>
          <h2>{state.heavyDay ? 'Solo lo esencial permanece.' : 'Un día. Una versión mejor.'}</h2>
          <p className="soft-copy">Despertar sugerido: {state.wakeTime}. Prioridad: {state.currentPriority}. Dormir: {state.sleepTime}.</p>
        </div>
      </div>

      <InsightCard text={insights[0]} />
      <QuickTaskForm activeDate={state.date} upsertActivity={upsertActivity} />

      <div className="metric-grid status-strip">
        <Metric label="Sueño" value={`${state.sleepHours} h`} helper="Señal de carga" />
        <Metric label="Ansiedad" value={`${state.anxiety}/5`} helper="No dirige. Informa." />
        <Metric label="Energía" value={`${state.energy}/5`} helper="Ajusta el ritmo" />
        <Metric label="Pasos" value={state.steps.toLocaleString('es-MX')} helper="Movimiento" />
      </div>

      {(['mañana', 'trabajo', 'tarde', 'post-6', 'noche'] as Block[]).map((block) => (
        <section className="ritual-block" key={block}>
          <p className="caption">{blockLabel(block)}</p>
          {activities.filter((activity) => activity.block === block).map((activity) => <ActivityRow key={activity.id} activity={activity} done={Boolean(state.completed[activity.id])} onToggle={onToggle} />)}
          {!activities.some((activity) => activity.block === block) && <p className="empty-copy">Sin tareas en este módulo.</p>}
        </section>
      ))}

      <section className="journal-card">
        <p className="caption">Tres victorias</p>
        {['Cuerpo', 'Trabajo', 'IA'].map((label, index) => <label key={label}><span>{label}</span><input value={state.wins[index]} placeholder="Una línea basta" onChange={(event) => updateWin(index, event.target.value)} /></label>)}
      </section>

      <div className="split-actions">
        <button className="primary-action" type="button" onClick={() => { hapticClick(); setState((current) => ({ ...current, heavyDay: true })) }}>Día pesado</button>
        <button className="secondary-action" type="button" onClick={() => { hapticClick(); setState((current) => ({ ...current, completed: {} })) }}>Limpiar hoy</button>
      </div>
    </>
  )
}

function QuickTaskForm({ activeDate, upsertActivity }: { activeDate: string; upsertActivity: (activity: Activity) => void }) {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState<Activity>(() => newActivity(activeDate))
  const [scope, setScope] = useState<'dia' | 'rutina'>('dia')
  const [error, setError] = useState('')

  function save() {
    if (!draft.title.trim()) {
      setError('Ponle nombre a la tarea para guardarla.')
      return
    }
    upsertActivity({ ...draft, title: draft.title.trim(), detail: draft.detail.trim() || 'Tarea concreta.', date: scope === 'dia' ? activeDate : undefined, custom: true })
    setDraft(newActivity(activeDate))
    setScope('dia')
    setError('')
    setOpen(false)
  }

  if (!open) return <button className="quick-add-button" type="button" onClick={() => { hapticClick(); setOpen(true) }}>+ Nueva tarea</button>

  return (
    <section className="form-card quick-task-card">
      <p className="caption">Nueva tarea rápida</p>
      <label><span>Nombre</span><input value={draft.title} placeholder="Ej. Caminar 10 minutos" onChange={(event) => setDraft({ ...draft, title: event.target.value })} /></label>
      <div className="two-columns">
        <label><span>Hora</span><input type="time" value={draft.time ?? ''} onChange={(event) => setDraft({ ...draft, time: event.target.value })} /></label>
        <label><span>Bloque</span><select value={draft.block} onChange={(event) => setDraft({ ...draft, block: event.target.value as Block })}>{(['mañana', 'trabajo', 'tarde', 'post-6', 'noche'] as Block[]).map((block) => <option key={block} value={block}>{blockLabel(block)}</option>)}</select></label>
      </div>
      <div className="two-columns">
        <label><span>Tipo</span><select value={scope} onChange={(event) => setScope(event.target.value as 'dia' | 'rutina')}><option value="dia">Solo este día</option><option value="rutina">Rutina permanente</option></select></label>
        <label><span>Categoría</span><select value={draft.category} onChange={(event) => setDraft({ ...draft, category: event.target.value as Category })}>{categories.map((category) => <option key={category} value={category}>{category}</option>)}</select></label>
      </div>
      <label className="inline-check"><input type="checkbox" checked={draft.heavyDay} onChange={(event) => setDraft({ ...draft, heavyDay: event.target.checked })} /> Aparece en día pesado</label>
      {error && <p className="error-copy">{error}</p>}
      <div className="split-actions">
        <button className="primary-action" type="button" onClick={save}>Guardar</button>
        <button className="secondary-action" type="button" onClick={() => { hapticClick(); setOpen(false); setError('') }}>Cancelar</button>
      </div>
    </section>
  )
}

function TasksView({ activeDate, activities, upsertActivity, deleteActivity, loadKokoroRoutine }: { activeDate: string; activities: Activity[]; upsertActivity: (activity: Activity) => void; deleteActivity: (id: string) => void; loadKokoroRoutine: () => void }) {
  const [draft, setDraft] = useState<Activity>(newActivity(activeDate))
  const [scope, setScope] = useState<'dia' | 'rutina'>('rutina')
  const [error, setError] = useState('')
  const [loadedMessage, setLoadedMessage] = useState('')
  const sortedActivities = sortActivities(activities)
  const kokoroLoaded = kokoroRoutine.every((activity) => activities.some((item) => item.id === activity.id))

  function save() {
    if (!draft.title.trim()) {
      setError('Ponle nombre a la tarea para guardarla.')
      return
    }
    upsertActivity({ ...draft, title: draft.title.trim(), detail: draft.detail.trim() || 'Actividad personal.', date: scope === 'dia' ? activeDate : undefined, custom: true })
    setDraft(newActivity(activeDate))
    setScope('rutina')
    setError('')
  }

  return (
    <>
      <SectionTitle caption="Tareas" title="Organiza tus acciones" />
      <section className="kokoro-loader">
        <div>
          <p className="caption">Plan Kokoro</p>
          <h2>Rutina estricta salud + PM Telco</h2>
          <p className="soft-copy">Carga la ruta diaria con ejercicio antes del trabajo, comida anti estreñimiento, skincare, hidratación 3L, estudio IA PM y descanso 10 PM.</p>
        </div>
        <button className="primary-action" type="button" onClick={() => { loadKokoroRoutine(); setLoadedMessage('Rutina Kokoro cargada sin duplicar tareas.') }}>{kokoroLoaded ? 'Recargar Kokoro' : 'Cargar Rutina Kokoro'}</button>
        {(loadedMessage || kokoroLoaded) && <p className="success-copy">{loadedMessage || 'Rutina Kokoro activa.'}</p>}
      </section>

      <section className="form-card">
        <p className="caption">Nueva tarea</p>
        <label><span>Nombre</span><input value={draft.title} placeholder="Ej. Estudiar embeddings" onChange={(event) => setDraft({ ...draft, title: event.target.value })} /></label>
        <label><span>Detalle</span><input value={draft.detail} placeholder="Qué harás exactamente" onChange={(event) => setDraft({ ...draft, detail: event.target.value })} /></label>
        <div className="two-columns">
          <label><span>Bloque</span><select value={draft.block} onChange={(event) => setDraft({ ...draft, block: event.target.value as Block })}>{(['mañana', 'trabajo', 'tarde', 'post-6', 'noche'] as Block[]).map((block) => <option key={block} value={block}>{blockLabel(block)}</option>)}</select></label>
          <label><span>Minutos</span><input type="number" min="1" value={draft.minutes} onChange={(event) => setDraft({ ...draft, minutes: Number(event.target.value) })} /></label>
        </div>
        <div className="two-columns">
          <label><span>Categoría</span><select value={draft.category} onChange={(event) => setDraft({ ...draft, category: event.target.value as Category })}>{categories.map((category) => <option key={category} value={category}>{category}</option>)}</select></label>
          <label><span>Hora</span><input type="time" value={draft.time ?? ''} onChange={(event) => setDraft({ ...draft, time: event.target.value })} /></label>
        </div>
        <label><span>Tipo</span><select value={scope} onChange={(event) => setScope(event.target.value as 'dia' | 'rutina')}><option value="rutina">Rutina permanente</option><option value="dia">Solo {formatDateKey(activeDate)}</option></select></label>
        <label className="inline-check"><input type="checkbox" checked={draft.heavyDay} onChange={(event) => setDraft({ ...draft, heavyDay: event.target.checked })} /> Cuenta en día pesado</label>
        {error && <p className="error-copy">{error}</p>}
        <button className="primary-action" type="button" onClick={save}>Guardar actividad</button>
      </section>

      <section className="ritual-block">
        <p className="caption">Plantillas activas</p>
        <p className="soft-copy">Modo Supervivencia está primero: desayuno simple, kit de rescate, caminata antes de entrar a casa y sueño sin móvil. La regla: hábitos de uno en uno.</p>
      </section>

      <KokoroReference />

      {(['mañana', 'trabajo', 'tarde', 'post-6', 'noche'] as Block[]).map((block) => {
        const blockActivities = sortedActivities.filter((activity) => activity.block === block)
        return (
          <section className="module-board" key={block}>
            <div className="module-board-header">
              <p className="caption">Módulo</p>
              <h2>{blockLabel(block)}</h2>
              <span>{blockActivities.length} piezas</span>
            </div>
            {blockActivities.map((activity) => (
              <article className="editable-row" key={activity.id}>
                <div><p className="caption">{activity.time ?? 'Sin hora'} · {activity.category}{activity.essential ? ' · esencial' : ''}{activity.date ? ' · solo fecha' : ' · rutina'}</p><strong>{activity.title}</strong><small>{activity.detail}</small></div>
                <div className="row-actions"><button type="button" onClick={() => { hapticClick(); setDraft(activity); setScope(activity.date ? 'dia' : 'rutina') }}>Editar</button><button type="button" onClick={() => deleteActivity(activity.id)}>Borrar</button></div>
              </article>
            ))}
          </section>
        )
      })}
    </>
  )
}

function KokoroReference() {
  return (
    <section className="kokoro-reference">
      <article>
        <p className="caption">Meal Prep Domingo</p>
        <h2>2 horas que compran la semana</h2>
        {kokoroMealPrep.map((item) => <p key={item}>{item}</p>)}
      </article>
      <article>
        <p className="caption">Skincare</p>
        <h2>Ciudad + sol + disciplina</h2>
        {kokoroSkincare.map((item) => <p key={item}>{item}</p>)}
      </article>
      <article>
        <p className="caption">IA para PM Telco</p>
        <h2>Aprendizaje aplicable</h2>
        {kokoroAiPlan.map((item) => <p key={item}>{item}</p>)}
      </article>
      <article>
        <p className="caption">Hidratación 3L</p>
        <h2>Agua por horario</h2>
        {['500 ml al despertar.', '250 ml en cada pausa de trabajo.', '250 ml con protocolo anti bajón.', '250 ml al llegar a casa.', 'Evitar llegar a la noche con déficit de agua.'].map((item) => <p key={item}>{item}</p>)}
      </article>
    </section>
  )
}

function CalendarView({ history, state, progress, completedCount, changeActiveDate }: { history: HistoryEntry[]; state: DailyState; progress: number; completedCount: number; changeActiveDate: (date: string) => void }) {
  const [monthCursor, setMonthCursor] = useState(() => startOfMonth(new Date()))
  const [selectedDate, setSelectedDate] = useState(todayKey())
  const historyMap = new Map(history.map((entry) => [entry.date, entry]))
  const currentEntry: HistoryEntry = { ...state, progress, completedCount }
  const selectedEntry = selectedDate === state.date ? currentEntry : historyMap.get(selectedDate)
  const days = getCalendarDays(monthCursor)
  const monthLabel = new Intl.DateTimeFormat('es-MX', { month: 'long', year: 'numeric' }).format(monthCursor)

  function moveMonth(offset: number) {
    hapticClick()
    setMonthCursor((current) => new Date(current.getFullYear(), current.getMonth() + offset, 1))
  }

  return (
    <>
      <SectionTitle caption="Calendario" title="Registro interno" />
      <section className="calendar-panel">
        <div className="calendar-controls">
          <button type="button" onClick={() => moveMonth(-1)}>Anterior</button>
          <strong>{monthLabel}</strong>
          <button type="button" onClick={() => moveMonth(1)}>Siguiente</button>
        </div>
        <div className="calendar-weekdays">
          {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((day, index) => <span key={`${day}-${index}`}>{day}</span>)}
        </div>
        <div className="calendar-grid">
          {days.map((day) => {
            const dateKey = dateToKey(day)
            const entry = dateKey === state.date ? currentEntry : historyMap.get(dateKey)
            const isCurrentMonth = day.getMonth() === monthCursor.getMonth()
            const isSelected = selectedDate === dateKey
            return (
              <button
                className={`calendar-day ${isCurrentMonth ? '' : 'muted'} ${entry ? 'has-entry' : ''} ${isSelected ? 'selected' : ''}`}
                key={dateKey}
                style={{ '--day-progress': `${entry?.progress ?? 0}%` } as React.CSSProperties}
                type="button"
                onClick={() => { hapticClick(); setSelectedDate(dateKey) }}
              >
                <span>{day.getDate()}</span>
                <em>{entry ? `${entry.progress}%` : ''}</em>
              </button>
            )
          })}
        </div>
      </section>
      <section className="calendar-readout">
        <p className="caption">Día seleccionado</p>
        <h2>{formatDateKey(selectedDate)}</h2>
        <button className="primary-action" type="button" onClick={() => changeActiveDate(selectedDate)}>Usar este día</button>
        {selectedEntry ? (
          <div className="metric-grid">
            <Metric label="Progreso" value={`${selectedEntry.progress}%`} helper={`${selectedEntry.completedCount} acciones`} />
            <Metric label="Sueño" value={`${selectedEntry.sleepHours} h`} helper="Registro local" />
            <Metric label="Pasos" value={selectedEntry.steps.toLocaleString('es-MX')} helper="Movimiento" />
            <Metric label="Día pesado" value={selectedEntry.heavyDay ? 'activo' : 'no'} helper="Carga del sistema" />
          </div>
        ) : <p className="soft-copy">Todavía no hay registro para este día.</p>}
      </section>
    </>
  )
}

function BrainView({ state, setState, history, progress, completedCount, deepMinutes, insights }: { state: DailyState; setState: React.Dispatch<React.SetStateAction<DailyState>>; history: HistoryEntry[]; progress: number; completedCount: number; deepMinutes: number; insights: string[] }) {
  const weakBlock = getWeakBlock(state)
  return (
    <>
      <SectionTitle caption="Cerebro" title="Dos cerebros conectados" />
      <section className="brain-board">
        <div className="brain-panel user-brain">
          <p className="caption">Cerebro usuario</p>
          <h2>Señales</h2>
          <BrainSignal label="Sueño" value={`${state.sleepHours} h`} />
          <BrainSignal label="Ansiedad" value={`${state.anxiety}/5`} />
          <BrainSignal label="Energía" value={`${state.energy}/5`} />
          <BrainSignal label="Pasos" value={state.steps.toLocaleString('es-MX')} />
          <BrainSignal label="Victorias" value={String(state.wins.filter(Boolean).length)} />
        </div>
        <div className="brain-bridge" aria-hidden="true">
          <span />
          <strong>{progress}%</strong>
          <span />
        </div>
        <div className="brain-panel system-brain">
          <p className="caption">Cerebro sistema</p>
          <h2>Decisiones</h2>
          <BrainSignal label="Tareas" value={`${completedCount} hechas`} />
          <BrainSignal label="Bloque débil" value={blockLabel(weakBlock)} />
          <BrainSignal label="IA profunda" value={`${deepMinutes}m`} />
          <BrainSignal label="Día pesado" value={state.heavyDay ? 'activo' : 'no'} />
          <BrainSignal label="Recursos" value={String(state.resources.length)} />
        </div>
      </section>
      <section className="rule-card">
        <p className="caption">Cómo funciona</p>
        <p>Tu cuerpo y mente envían señales. El sistema acomoda tareas, progreso y recomendaciones para que el siguiente paso sea más claro.</p>
        <p>{insights[0]}</p>
      </section>
      <div className="brain-modules">
        <BodyView state={state} setState={setState} history={history} />
        <MindView state={state} setState={setState} insights={insights} />
        <AiView state={state} setState={setState} deepMinutes={deepMinutes} />
      </div>
    </>
  )
}

function BrainSignal({ label, value }: { label: string; value: string }) {
  return <article className="brain-signal"><span>{label}</span><strong>{value}</strong></article>
}

function YouView({ state, setState, history, requestPersistentStorage, notificationStatus, requestDailyNotifications }: {
  state: DailyState
  setState: React.Dispatch<React.SetStateAction<DailyState>>
  history: HistoryEntry[]
  requestPersistentStorage: () => void
  notificationStatus: NotificationStatus
  requestDailyNotifications: () => void
}) {
  const week = history.slice(-7)
  const avgSleep = average(week.map((entry) => entry.sleepHours)) || state.sleepHours
  const avgAnxiety = average(week.map((entry) => entry.anxiety)) || state.anxiety
  const avgEnergy = average(week.map((entry) => entry.energy)) || state.energy
  const avgSteps = average(week.map((entry) => entry.steps)) || state.steps
  const heavyDays = week.filter((entry) => entry.heavyDay).length
  const winsCount = state.wins.filter(Boolean).length

  return (
    <>
      <SectionTitle caption="Yo" title="Lo que la app conoce de ti" />
      <section className="form-card profile-card">
        <p className="caption">Perfil editable</p>
        <label><span>Fecha de nacimiento</span><input type="date" value={state.birthDate} onChange={(event) => setState((current) => ({ ...current, birthDate: event.target.value }))} /></label>
        <label><span>Meta principal</span><input value={state.mainGoal} onChange={(event) => setState((current) => ({ ...current, mainGoal: event.target.value }))} /></label>
        <div className="two-columns">
          <label><span>Despertar normal</span><input type="time" value={state.wakeTime} onChange={(event) => setState((current) => ({ ...current, wakeTime: event.target.value }))} /></label>
          <label><span>Dormir normal</span><input type="time" value={state.sleepTime} onChange={(event) => setState((current) => ({ ...current, sleepTime: event.target.value }))} /></label>
        </div>
        <label><span>Prioridad actual</span><input value={state.currentPriority} onChange={(event) => setState((current) => ({ ...current, currentPriority: event.target.value }))} /></label>
      </section>

      <section className="knowledge-grid">
        <Metric label="Día de vida" value={lifeDayText(state.birthDate, state.date)} helper="Según tu fecha" />
        <Metric label="Sueño promedio" value={`${avgSleep.toFixed(1)} h`} helper="Semana reciente" />
        <Metric label="Ansiedad" value={`${avgAnxiety.toFixed(1)}/5`} helper="Señal reciente" />
        <Metric label="Energía" value={`${avgEnergy.toFixed(1)}/5`} helper="Señal reciente" />
        <Metric label="Pasos promedio" value={Math.round(avgSteps).toLocaleString('es-MX')} helper="Movimiento" />
        <Metric label="Días pesados" value={String(heavyDays)} helper="Últimos 7 registros" />
        <Metric label="Bloque débil" value={blockLabel(getWeakBlock(state))} helper="Según tareas" />
        <Metric label="Recursos IA" value={String(state.resources.length)} helper="Biblioteca" />
        <Metric label="Victorias hoy" value={String(winsCount)} helper="Identidad escrita" />
      </section>

      <StorageCard status={state.storagePersisted} requestPersistentStorage={requestPersistentStorage} />
      <NotificationCard status={notificationStatus} requestDailyNotifications={requestDailyNotifications} />
    </>
  )
}

function BodyView({ state, setState, history }: { state: DailyState; setState: React.Dispatch<React.SetStateAction<DailyState>>; history: HistoryEntry[] }) {
  const avgSteps = average(history.map((entry) => entry.steps)) || state.steps
  return (
    <>
      <SectionTitle caption="Cuerpo" title="Atleta en recuperación" />
      <div className="metric-grid">
        <Metric label="Pasos" value={state.steps.toLocaleString('es-MX')} helper="Meta inicial: 8,000" />
        <Metric label="Promedio" value={Math.round(avgSteps).toLocaleString('es-MX')} helper="Historial local" />
        <Metric label="Entreno" value={state.workout} helper="Gym y casa cuentan" />
      </div>
      <div className="form-card">
        <label><span>Pasos de hoy</span><input type="number" value={state.steps} onChange={(event) => setState((current) => ({ ...current, steps: Number(event.target.value) }))} onBlur={hapticClick} /></label>
        <label><span>Tipo de entrenamiento</span><select value={state.workout} onChange={(event) => { hapticClick(); setState((current) => ({ ...current, workout: event.target.value as DailyState['workout'] })) }}><option value="gym">Gym</option><option value="casa">Casa</option><option value="caminar">Caminar</option><option value="descanso">Descanso</option></select></label>
      </div>
      <InsightCard text="No se persigue la báscula cada día. Se persigue la repetición que cambia el cuerpo." />
    </>
  )
}

function MindView({ state, setState, insights }: { state: DailyState; setState: React.Dispatch<React.SetStateAction<DailyState>>; insights: string[] }) {
  return (
    <>
      <SectionTitle caption="Mente" title="Emociones como datos" />
      <div className="metric-grid">
        <Metric label="Sueño" value={`${state.sleepHours} h`} helper="Objetivo: 7.5 h" />
        <Metric label="Ansiedad" value={`${state.anxiety}/5`} helper="No dirige. Informa." />
        <Metric label="Energía" value={`${state.energy}/5`} helper="Ajusta la carga" />
      </div>
      <div className="form-card sliders">
        <label><span>Sueño</span><input type="range" min="4" max="9" step="0.5" value={state.sleepHours} onChange={(event) => setState((current) => ({ ...current, sleepHours: Number(event.target.value) }))} onPointerUp={hapticClick} /></label>
        <label><span>Ansiedad</span><input type="range" min="1" max="5" value={state.anxiety} onChange={(event) => setState((current) => ({ ...current, anxiety: Number(event.target.value) }))} onPointerUp={hapticClick} /></label>
        <label><span>Energía</span><input type="range" min="1" max="5" value={state.energy} onChange={(event) => setState((current) => ({ ...current, energy: Number(event.target.value) }))} onPointerUp={hapticClick} /></label>
        <label><span>Fin de trabajo</span><input type="time" value={state.workEnd} onChange={(event) => setState((current) => ({ ...current, workEnd: event.target.value }))} onBlur={hapticClick} /></label>
      </div>
      <InsightCard text={insights[1] ?? insights[0]} />
      <EmergencyPlan />
    </>
  )
}

function AiView({ state, setState, deepMinutes }: { state: DailyState; setState: React.Dispatch<React.SetStateAction<DailyState>>; deepMinutes: number }) {
  const [query, setQuery] = useState('machine learning agents')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const rescueSteps = state.rescueProblem.trim() ? ['Define la versión más pequeña del problema.', 'Abre editor o libreta. Escribe 5 líneas.', 'Marca un error, una duda o un siguiente paso.'] : []

  async function searchWeb() {
    setLoading(true)
    setError('')
    try {
      const resources = await fetchFreeResources(query)
      setState((current) => ({ ...current, resources }))
    } catch {
      setError('No se pudo traer información. Revisa conexión e intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  function resourceToActivity(resource: Resource) {
    setState((current) => ({
      ...current,
      activities: [{ id: `resource-${Date.now()}`, block: 'mañana', title: `Estudiar: ${resource.title.slice(0, 42)}`, detail: resource.url, minutes: 25, category: 'ia', essential: false, heavyDay: false, custom: true, tip: `Fuente: ${resource.source}` }, ...current.activities],
    }))
  }

  return (
    <>
      <SectionTitle caption="IA" title="Aprendiz de por vida" />
      <div className="metric-grid">
        <Metric label="Zona profunda" value={`${deepMinutes}m`} helper="Código o matemáticas" />
        <Metric label="Fuentes" value="3" helper="GitHub, HN, arXiv" />
      </div>
      <section className="rescue-card">
        <p className="caption">No sé por dónde empezar</p>
        <textarea value={state.rescueProblem} placeholder="El problema más pequeño que tengo es..." onChange={(event) => setState((current) => ({ ...current, rescueProblem: event.target.value }))} />
        {rescueSteps.map((step, index) => <p key={step} className="rescue-step">{index + 1}. {step}</p>)}
      </section>
      <section className="form-card">
        <p className="caption">Biblioteca web gratis</p>
        <label><span>Búsqueda</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="agents, rag, computer vision..." /></label>
        <button className="primary-action" type="button" onClick={searchWeb}>{loading ? 'Buscando...' : 'Traer recursos'}</button>
        {error && <p className="error-copy">{error}</p>}
      </section>
      {state.resources.map((resource) => (
        <article className="resource-card" key={resource.id}>
          <p className="caption">{resource.source}</p>
          <a href={resource.url} target="_blank" rel="noreferrer">{resource.title}</a>
          <small>{resource.meta}</small>
          <button type="button" onClick={() => resourceToActivity(resource)}>Convertir en actividad</button>
        </article>
      ))}
      <InsightCard text="La web trae señales. El sistema decide la siguiente acción concreta." />
    </>
  )
}

function ProgressView({ progress, state, completedCount, insights, history }: { progress: number; state: DailyState; completedCount: number; insights: string[]; history: HistoryEntry[] }) {
  const week = history.slice(-7)
  const avgProgress = average(week.map((entry) => entry.progress)) || progress
  const avgSleep = average(week.map((entry) => entry.sleepHours)) || state.sleepHours
  const weakBlock = getWeakBlock(state)
  return (
    <>
      <SectionTitle caption="Progreso" title="Sistema sobre motivación" />
      <div className="metric-grid">
        <Metric label="Hoy" value={`${progress}%`} helper={`${completedCount} acciones`} />
        <Metric label="Semana" value={`${Math.round(avgProgress)}%`} helper="Promedio local" />
        <Metric label="Sueño" value={`${avgSleep.toFixed(1)} h`} helper="Promedio reciente" />
        <Metric label="Día pesado" value={state.heavyDay ? 'activo' : 'no'} helper="Sin culpa" />
        <Metric label="Bloque débil" value={blockLabel(weakBlock)} helper="Ajuste sugerido" />
        <Metric label="Recursos" value={String(state.resources.length)} helper="Biblioteca IA" />
      </div>
      <section className="achievement-list">
        {['El Estoico Madrugador', 'El 1% Diario', 'No Dos Veces'].map((name, index) => <div key={name} className="achievement"><span>{index + 1}</span><div><strong>{name}</strong><small>Inspirado en Clear, Sharma y Fridman.</small></div></div>)}
      </section>
      <section className="rule-card">
        <p className="caption">Reglas semanales</p>
        {weeklyRules.map((rule) => <p key={rule}>{rule}</p>)}
      </section>
      <section className="rule-card">
        <p className="caption">Adaptación progresiva</p>
        {progressivePlan.map((step) => <p key={step}>{step}</p>)}
      </section>
      <InsightCard text={insights[2] ?? 'La identidad no se define por un error, sino por cómo respondes al error.'} />
    </>
  )
}

function EmergencyPlan() {
  return (
    <section className="emergency-card">
      <p className="caption">Plan B · comida emocional</p>
      <h2>Cuando gane la ansiedad</h2>
      <p className="soft-copy">No luches con fuerza de voluntad. Cambia la mecánica del impulso durante 10 minutos.</p>
      {emergencyPlan.map((item) => (
        <article className="emergency-row" key={item.craving}>
          <strong>{item.craving}</strong>
          <span>{item.action}</span>
          <small>{item.reason}</small>
        </article>
      ))}
    </section>
  )
}

function ActivityRow({ activity, done, onToggle }: { activity: Activity; done: boolean; onToggle: (id: string) => void }) {
  return <button className={`habit-row ${done ? 'done' : ''}`} type="button" onClick={() => onToggle(activity.id)}><span className="checkmark">{done ? '✓' : ''}</span><span><strong>{activity.title}</strong><small>{activity.time ? `${activity.time} · ` : ''}{activity.detail}</small>{activity.tip && <small className="tip-copy">{activity.tip}</small>}</span><em>{activity.minutes}m</em></button>
}

function StorageCard({ status, requestPersistentStorage }: { status: DailyState['storagePersisted']; requestPersistentStorage: () => void }) {
  return <aside className="storage-card"><div><p className="caption">Guardado</p><p>{storageText(status)}</p></div><button type="button" onClick={requestPersistentStorage}>Permitir</button></aside>
}

function NotificationCard({ status, requestDailyNotifications }: { status: NotificationStatus; requestDailyNotifications: () => void }) {
  return (
    <aside className="notification-card">
      <div>
        <p className="caption">Notificaciones</p>
        <p>{notificationText(status)}</p>
        <small>6:00 Buenos días · 18:00 Hora feliz · 22:30 A dormir</small>
      </div>
      <button type="button" onClick={requestDailyNotifications} disabled={status === 'granted' || status === 'unsupported'}>{status === 'granted' ? 'Activas' : 'Activar'}</button>
    </aside>
  )
}

function SectionTitle({ caption, title }: { caption: string; title: string }) {
  return <div className="section-title"><p className="caption">{caption}</p><h2>{title}</h2></div>
}

function Metric({ label, value, helper }: { label: string; value: string; helper: string }) {
  return <article className="metric-card"><p className="caption">{label}</p><strong>{value}</strong><small>{helper}</small></article>
}

function InsightCard({ text }: { text: string }) {
  return <aside className="insight-card"><p className="caption">Observación</p><p>{text}</p></aside>
}

function getInsights(state: DailyState, progress: number, deepMinutes: number, history: HistoryEntry[]) {
  const insights = []
  const week = history.slice(-7)
  const avgProgress = average(week.map((entry) => entry.progress))
  if (state.sleepHours < 7 && state.anxiety >= 4) insights.push('Sueño bajo y ansiedad alta. Activa día pesado: luz natural, caminata corta, cena simple y brain dump.')
  if (state.anxiety >= 4 && state.workEnd >= '18:00') insights.push('Llegada a casa peligrosa. Come yogur o almendras antes de salir, camina 15 minutos antes de entrar y luego ducha corta.')
  if (state.sleepHours < 7) insights.push('Dormiste poco. Hoy no necesitas heroicidad; necesitas proteger el ritmo circadiano.')
  if (state.anxiety >= 4) insights.push('La ansiedad está alta. No negocies con ella: agua, respiración y una caminata de 10 minutos.')
  if (state.energy <= 2) insights.push('La energía está baja. Reduce la carga, pero conserva la identidad: una acción pequeña también cuenta.')
  if (state.workEnd > '18:45' || state.heavyDay) insights.push('Trabajaste más de lo normal. Día pesado recomendado: solo lo esencial permanece.')
  if (state.steps < 4000) insights.push('Tus pasos están bajos. La medicina mínima de hoy: 10 minutos caminando después de comer.')
  if (!state.completed['survival-breakfast']) insights.push('La base de supervivencia hoy es el desayuno antiansiedad. Huevos o proteína primero; todo lo demás puede esperar.')
  if (!state.completed['survival-walk-home'] && state.workEnd >= '18:00') insights.push('No entres directo a casa si vienes ansioso. La caminata de 15 minutos es el interruptor del día.')
  if (deepMinutes === 0) insights.push('La IA todavía no recibió atención profunda. Abre editor o papel durante 15 minutos.')
  if (avgProgress && avgProgress < 45) insights.push('La semana muestra demasiada fricción. Borra o reduce actividades; el sistema debe ser inevitable.')
  if (progress >= 80) insights.push('El sistema está respondiendo. Protege este ritmo; no agregues dificultad hoy.')
  insights.push('No necesitas motivación perfecta. Necesitas que el siguiente paso sea inevitable.')
  return insights
}

async function fetchFreeResources(query: string): Promise<Resource[]> {
  const safeQuery = encodeURIComponent(query.trim() || 'machine learning')
  const [github, hn, arxiv] = await Promise.allSettled([fetchGitHub(safeQuery), fetchHackerNews(safeQuery), fetchArxiv(safeQuery)])
  return [github, hn, arxiv].flatMap((result) => (result.status === 'fulfilled' ? result.value : [])).slice(0, 12)
}

async function fetchGitHub(query: string): Promise<Resource[]> {
  const response = await fetch(`https://api.github.com/search/repositories?q=${query}&sort=stars&order=desc&per_page=4`)
  const data = await response.json()
  return (data.items ?? []).map((item: { id: number; full_name: string; html_url: string; stargazers_count: number; language?: string }) => ({ id: `gh-${item.id}`, title: item.full_name, url: item.html_url, source: 'GitHub' as const, meta: `${item.stargazers_count} estrellas · ${item.language ?? 'código'}` }))
}

async function fetchHackerNews(query: string): Promise<Resource[]> {
  const response = await fetch(`https://hn.algolia.com/api/v1/search?query=${query}&tags=story&hitsPerPage=4`)
  const data = await response.json()
  return (data.hits ?? []).map((item: { objectID: string; title?: string; story_title?: string; url?: string; points?: number }) => ({ id: `hn-${item.objectID}`, title: item.title ?? item.story_title ?? 'Historia técnica', url: item.url ?? `https://news.ycombinator.com/item?id=${item.objectID}`, source: 'Hacker News' as const, meta: `${item.points ?? 0} puntos` }))
}

async function fetchArxiv(query: string): Promise<Resource[]> {
  const response = await fetch(`https://export.arxiv.org/api/query?search_query=all:${query}&start=0&max_results=4`)
  const xml = await response.text()
  const doc = new DOMParser().parseFromString(xml, 'text/xml')
  return Array.from(doc.querySelectorAll('entry')).map((entry, index) => ({ id: `arxiv-${index}-${entry.querySelector('id')?.textContent ?? Date.now()}`, title: entry.querySelector('title')?.textContent?.replace(/\s+/g, ' ').trim() ?? 'Paper', url: entry.querySelector('id')?.textContent ?? 'https://arxiv.org', source: 'arXiv' as const, meta: entry.querySelector('published')?.textContent?.slice(0, 10) ?? 'paper' }))
}

function loadState(): DailyState {
  try {
    const saved = localStorage.getItem('one-mode-state')
    const parsed = saved ? JSON.parse(saved) : {}
    const mergedActivities = mergeActivities(parsed.activities ?? [])
    return { ...defaultState, ...parsed, activities: mergedActivities, resources: parsed.resources ?? [] }
  } catch {
    return defaultState
  }
}

function mergeActivities(saved: Activity[]) {
  return mergeActivityLists(defaultState.activities, saved)
}

function mergeActivityLists(base: Activity[], incoming: Activity[]) {
  const map = new Map([...base, ...incoming].map((activity) => [activity.id, activity]))
  return sortActivities(Array.from(map.values()))
}

function sortActivities(activities: Activity[]) {
  const blockOrder: Record<Block, number> = { mañana: 0, trabajo: 1, tarde: 2, 'post-6': 3, noche: 4 }
  return [...activities].sort((a, b) => {
    const blockDiff = blockOrder[a.block] - blockOrder[b.block]
    if (blockDiff) return blockDiff
    const timeDiff = (a.time ?? '99:99').localeCompare(b.time ?? '99:99')
    if (timeDiff) return timeDiff
    if (a.essential !== b.essential) return a.essential ? -1 : 1
    if (a.heavyDay !== b.heavyDay) return a.heavyDay ? -1 : 1
    return a.title.localeCompare(b.title)
  })
}

function filterActivitiesForDate(activities: Activity[], date: string, heavyDay: boolean) {
  const dayOfWeek = parseDateKey(date).getDay()
  return activities.filter((activity) => {
    const belongsToDate = !activity.date || activity.date === date
    const belongsToWeekday = !activity.days || activity.days.includes(dayOfWeek)
    const belongsToLoad = !heavyDay || activity.heavyDay || activity.essential
    return belongsToDate && belongsToWeekday && belongsToLoad
  })
}

async function persistState(state: DailyState, progress: number, completedCount: number) {
  localStorage.setItem('one-mode-state', JSON.stringify(state))
  const entry: HistoryEntry = { ...state, progress, completedCount }
  await idbPut('daily-history', entry.date, entry)
  return loadHistory()
}

async function loadHistory(): Promise<HistoryEntry[]> {
  const records = await idbAll<HistoryEntry>('daily-history')
  return records.sort((a, b) => a.date.localeCompare(b.date)).slice(-30)
}

function idbOpen(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('one-mode-db', 1)
    request.onupgradeneeded = () => request.result.createObjectStore('daily-history')
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

async function idbPut(store: string, key: string, value: unknown) {
  const db = await idbOpen()
  return new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(store, 'readwrite')
    transaction.objectStore(store).put(value, key)
    transaction.oncomplete = () => resolve()
    transaction.onerror = () => reject(transaction.error)
  })
}

async function idbAll<T>(store: string): Promise<T[]> {
  const db = await idbOpen()
  return new Promise((resolve, reject) => {
    const request = db.transaction(store, 'readonly').objectStore(store).getAll()
    request.onsuccess = () => resolve(request.result as T[])
    request.onerror = () => reject(request.error)
  })
}

function newActivity(date = todayKey()): Activity {
  return { id: `custom-${Date.now()}`, block: 'mañana', title: '', detail: '', minutes: 15, category: 'ia', essential: false, heavyDay: false, time: '06:30', custom: true, date }
}

function getWeakBlock(state: DailyState): Block {
  const blocks: Block[] = ['mañana', 'trabajo', 'tarde', 'post-6', 'noche']
  return blocks.map((block) => {
    const list = state.activities.filter((activity) => activity.block === block)
    const done = list.filter((activity) => state.completed[activity.id]).length
    return { block, ratio: list.length ? done / list.length : 1 }
  }).sort((a, b) => a.ratio - b.ratio)[0]?.block ?? 'noche'
}

function blockLabel(block: Block) {
  return ({ mañana: 'Mañana', trabajo: 'Trabajo', tarde: 'Tarde', 'post-6': 'Post-6 PM', noche: 'Noche' })[block]
}

function storageText(status: DailyState['storagePersisted']) {
  if (status === 'activo') return 'Guardado persistente activo en este dispositivo.'
  if (status === 'básico') return 'Guardado local básico. El navegador puede limpiarlo si falta espacio.'
  if (status === 'no-soportado') return 'Este navegador no permite pedir persistencia, pero se guarda localmente.'
  return 'Tus datos se guardan en este dispositivo. Puedes pedir almacenamiento persistente.'
}

function notificationText(status: NotificationStatus) {
  if (status === 'granted') return 'Recordatorios diarios activos en este dispositivo.'
  if (status === 'denied') return 'El navegador bloqueó las notificaciones. Puedes cambiarlas en permisos del sitio.'
  if (status === 'unsupported') return 'Este navegador no soporta notificaciones web.'
  return 'Activa recordatorios suaves para los tres momentos clave del día.'
}

function getNotificationStatus(): NotificationStatus {
  if (typeof Notification === 'undefined') return 'unsupported'
  return Notification.permission
}

function scheduleDailyNotifications(reminders: DailyReminder[]) {
  let cancelled = false
  const timers: number[] = []

  reminders.forEach((reminder) => {
    const scheduleNext = () => {
      const timer = window.setTimeout(() => {
        if (cancelled) return
        showDailyNotification(reminder).catch(() => undefined)
        scheduleNext()
      }, getDelayUntil(reminder.time))
      timers.push(timer)
    }
    scheduleNext()
  })

  return () => {
    cancelled = true
    timers.forEach((timer) => window.clearTimeout(timer))
  }
}

async function showDailyNotification(reminder: DailyReminder) {
  const options: NotificationOptions = {
    body: reminder.body,
    icon: './icon.svg',
    badge: './icon.svg',
    tag: `one-mode-${reminder.id}`,
  }

  if ('serviceWorker' in navigator) {
    const registration = await navigator.serviceWorker.ready
    await registration.showNotification(reminder.title, options)
    return
  }

  new Notification(reminder.title, options)
}

function getDelayUntil(time: string) {
  const [hours, minutes] = time.split(':').map(Number)
  const now = new Date()
  const next = new Date(now)
  next.setHours(hours, minutes, 0, 0)
  if (next <= now) next.setDate(next.getDate() + 1)
  return next.getTime() - now.getTime()
}

function average(values: number[]) {
  const filtered = values.filter((value) => Number.isFinite(value))
  return filtered.length ? filtered.reduce((sum, value) => sum + value, 0) / filtered.length : 0
}

function hapticClick() {
  navigator.vibrate?.(10)
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

function getCalendarDays(month: Date) {
  const first = startOfMonth(month)
  const startOffset = (first.getDay() + 6) % 7
  const start = new Date(first)
  start.setDate(first.getDate() - startOffset)
  return Array.from({ length: 42 }, (_, index) => {
    const day = new Date(start)
    day.setDate(start.getDate() + index)
    return day
  })
}

function dateToKey(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function lifeDayText(birthDate: string, activeDate: string) {
  if (!birthDate) return 'Configura nacimiento'
  const start = parseDateKey(birthDate)
  const end = parseDateKey(activeDate)
  const diff = Math.floor((end.getTime() - start.getTime()) / 86400000) + 1
  return diff > 0 ? `Día ${diff.toLocaleString('es-MX')}` : 'Fecha inválida'
}

function parseDateKey(date: string) {
  const [year, month, day] = date.split('-').map(Number)
  return new Date(year, month - 1, day)
}

function todayKey() {
  return new Date().toISOString().slice(0, 10)
}

function formatDateKey(date: string) {
  return new Intl.DateTimeFormat('es-MX', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(parseDateKey(date))
}

export default App
