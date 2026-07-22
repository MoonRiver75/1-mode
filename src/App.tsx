import { useEffect, useMemo, useState } from 'react'
import './App.css'

type Tab = 'hoy' | 'actividades' | 'cuerpo' | 'mente' | 'ia' | 'progreso'
type Block = 'mañana' | 'trabajo' | 'tarde' | 'post-6' | 'noche'
type Category = 'fitness' | 'ia' | 'sueño' | 'mente' | 'nutrición' | 'trabajo' | 'hobby'
type ResourceSource = 'GitHub' | 'Hacker News' | 'arXiv'

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
}

type Resource = {
  id: string
  title: string
  url: string
  source: ResourceSource
  meta: string
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
}

const tabs: { id: Tab; label: string }[] = [
  { id: 'hoy', label: 'Hoy' },
  { id: 'actividades', label: 'Ritual' },
  { id: 'cuerpo', label: 'Cuerpo' },
  { id: 'mente', label: 'Mente' },
  { id: 'ia', label: 'IA' },
  { id: 'progreso', label: 'Progreso' },
]

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('hoy')
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [state, setState] = useState<DailyState>(() => loadState())

  const visibleActivities = useMemo(
    () => (state.heavyDay ? state.activities.filter((activity) => activity.heavyDay || activity.essential) : state.activities),
    [state.activities, state.heavyDay],
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

  function toggleActivity(id: string) {
    setState((current) => ({
      ...current,
      completed: { ...current.completed, [id]: !current.completed[id] },
    }))
  }

  function upsertActivity(activity: Activity) {
    setState((current) => ({
      ...current,
      activities: current.activities.some((item) => item.id === activity.id)
        ? current.activities.map((item) => (item.id === activity.id ? activity : item))
        : [activity, ...current.activities],
    }))
  }

  function deleteActivity(id: string) {
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
    if (!navigator.storage?.persist) {
      setState((current) => ({ ...current, storagePersisted: 'no-soportado' }))
      return
    }
    const granted = await navigator.storage.persist()
    setState((current) => ({ ...current, storagePersisted: granted ? 'activo' : 'básico' }))
  }

  return (
    <main className="app-shell">
      <div className="paper-grain" />
      <header className="topbar">
        <div>
          <p className="caption">El Método del 1%</p>
          <h1>1 MODE<span aria-hidden="true" /></h1>
        </div>
        <button className="seal-button" type="button" onClick={() => setState((current) => ({ ...current, heavyDay: !current.heavyDay }))}>
          {state.heavyDay ? 'Día pesado' : 'Normal'}
        </button>
      </header>

      <section className="page-card page-entry">
        {activeTab === 'hoy' && <TodayView completedCount={completedCount} progress={progress} state={state} activities={visibleActivities} insights={insights} onToggle={toggleActivity} setState={setState} updateWin={updateWin} requestPersistentStorage={requestPersistentStorage} />}
        {activeTab === 'actividades' && <ActivitiesView activities={state.activities} upsertActivity={upsertActivity} deleteActivity={deleteActivity} />}
        {activeTab === 'cuerpo' && <BodyView state={state} setState={setState} history={history} />}
        {activeTab === 'mente' && <MindView state={state} setState={setState} insights={insights} />}
        {activeTab === 'ia' && <AiView state={state} setState={setState} deepMinutes={deepMinutes} />}
        {activeTab === 'progreso' && <ProgressView progress={progress} state={state} completedCount={completedCount} insights={insights} history={history} />}
      </section>

      <nav className="bottom-nav" aria-label="Navegación principal">
        {tabs.map((tab) => <button key={tab.id} className={activeTab === tab.id ? 'active' : ''} type="button" onClick={() => setActiveTab(tab.id)}>{tab.label}</button>)}
      </nav>
    </main>
  )
}

function TodayView({ completedCount, progress, state, activities, insights, onToggle, setState, updateWin, requestPersistentStorage }: {
  completedCount: number
  progress: number
  state: DailyState
  activities: Activity[]
  insights: string[]
  onToggle: (id: string) => void
  setState: React.Dispatch<React.SetStateAction<DailyState>>
  updateWin: (index: number, value: string) => void
  requestPersistentStorage: () => void
}) {
  return (
    <>
      <div className="date-line">{formatDate()}</div>
      <div className="hero-grid">
        <div className="progress-ring" style={{ '--progress': `${progress * 3.6}deg` } as React.CSSProperties}>
          <strong>{progress}%</strong>
          <span>{completedCount}/{activities.length}</span>
        </div>
        <div>
          <p className="caption">Ritmo del día</p>
          <h2>{state.heavyDay ? 'Solo lo esencial permanece.' : 'Un día. Una versión mejor.'}</h2>
          <p className="soft-copy">Despertar sugerido: 6:15 AM. Luz natural temprano. Pantallas cálidas después de las 6 PM. Dormir: 10:45 PM.</p>
        </div>
      </div>

      <StorageCard status={state.storagePersisted} requestPersistentStorage={requestPersistentStorage} />
      <InsightCard text={insights[0]} />

      {(['mañana', 'trabajo', 'tarde', 'post-6', 'noche'] as Block[]).map((block) => (
        <section className="ritual-block" key={block}>
          <p className="caption">{blockLabel(block)}</p>
          {activities.filter((activity) => activity.block === block).map((activity) => <ActivityRow key={activity.id} activity={activity} done={Boolean(state.completed[activity.id])} onToggle={onToggle} />)}
        </section>
      ))}

      <section className="journal-card">
        <p className="caption">Tres victorias</p>
        {['Cuerpo', 'Trabajo', 'IA'].map((label, index) => <label key={label}><span>{label}</span><input value={state.wins[index]} placeholder="Una línea basta" onChange={(event) => updateWin(index, event.target.value)} /></label>)}
      </section>

      <div className="split-actions">
        <button className="primary-action" type="button" onClick={() => setState((current) => ({ ...current, heavyDay: true }))}>Día pesado</button>
        <button className="secondary-action" type="button" onClick={() => setState((current) => ({ ...current, completed: {} }))}>Limpiar hoy</button>
      </div>
    </>
  )
}

function ActivitiesView({ activities, upsertActivity, deleteActivity }: { activities: Activity[]; upsertActivity: (activity: Activity) => void; deleteActivity: (id: string) => void }) {
  const [draft, setDraft] = useState<Activity>(newActivity())

  function save() {
    if (!draft.title.trim()) return
    upsertActivity({ ...draft, title: draft.title.trim(), detail: draft.detail.trim() || 'Actividad personal.', custom: true })
    setDraft(newActivity())
  }

  return (
    <>
      <SectionTitle caption="Ritual" title="Tus actividades" />
      <section className="form-card">
        <p className="caption">Nueva actividad</p>
        <label><span>Nombre</span><input value={draft.title} placeholder="Ej. Estudiar embeddings" onChange={(event) => setDraft({ ...draft, title: event.target.value })} /></label>
        <label><span>Detalle</span><input value={draft.detail} placeholder="Qué harás exactamente" onChange={(event) => setDraft({ ...draft, detail: event.target.value })} /></label>
        <div className="two-columns">
          <label><span>Bloque</span><select value={draft.block} onChange={(event) => setDraft({ ...draft, block: event.target.value as Block })}>{(['mañana', 'trabajo', 'tarde', 'post-6', 'noche'] as Block[]).map((block) => <option key={block} value={block}>{blockLabel(block)}</option>)}</select></label>
          <label><span>Minutos</span><input type="number" min="1" value={draft.minutes} onChange={(event) => setDraft({ ...draft, minutes: Number(event.target.value) })} /></label>
        </div>
        <div className="two-columns">
          <label><span>Categoría</span><select value={draft.category} onChange={(event) => setDraft({ ...draft, category: event.target.value as Category })}>{(['fitness', 'ia', 'sueño', 'mente', 'nutrición', 'trabajo', 'hobby'] as Category[]).map((category) => <option key={category} value={category}>{category}</option>)}</select></label>
          <label><span>Hora</span><input type="time" value={draft.time ?? ''} onChange={(event) => setDraft({ ...draft, time: event.target.value })} /></label>
        </div>
        <label className="inline-check"><input type="checkbox" checked={draft.heavyDay} onChange={(event) => setDraft({ ...draft, heavyDay: event.target.checked })} /> Cuenta en día pesado</label>
        <button className="primary-action" type="button" onClick={save}>Guardar actividad</button>
      </section>

      <section className="ritual-block">
        <p className="caption">Plantillas activas</p>
        <p className="soft-copy">Modo Supervivencia está primero: desayuno simple, kit de rescate, caminata antes de entrar a casa y sueño sin móvil. La regla: hábitos de uno en uno.</p>
      </section>

      {activities.map((activity) => (
        <article className="editable-row" key={activity.id}>
          <div><p className="caption">{blockLabel(activity.block)} · {activity.category}</p><strong>{activity.title}</strong><small>{activity.detail}</small></div>
          <div className="row-actions"><button type="button" onClick={() => setDraft(activity)}>Editar</button><button type="button" onClick={() => deleteActivity(activity.id)}>Borrar</button></div>
        </article>
      ))}
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
        <label><span>Pasos de hoy</span><input type="number" value={state.steps} onChange={(event) => setState((current) => ({ ...current, steps: Number(event.target.value) }))} /></label>
        <label><span>Tipo de entrenamiento</span><select value={state.workout} onChange={(event) => setState((current) => ({ ...current, workout: event.target.value as DailyState['workout'] }))}><option value="gym">Gym</option><option value="casa">Casa</option><option value="caminar">Caminar</option><option value="descanso">Descanso</option></select></label>
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
        <label><span>Sueño</span><input type="range" min="4" max="9" step="0.5" value={state.sleepHours} onChange={(event) => setState((current) => ({ ...current, sleepHours: Number(event.target.value) }))} /></label>
        <label><span>Ansiedad</span><input type="range" min="1" max="5" value={state.anxiety} onChange={(event) => setState((current) => ({ ...current, anxiety: Number(event.target.value) }))} /></label>
        <label><span>Energía</span><input type="range" min="1" max="5" value={state.energy} onChange={(event) => setState((current) => ({ ...current, energy: Number(event.target.value) }))} /></label>
        <label><span>Fin de trabajo</span><input type="time" value={state.workEnd} onChange={(event) => setState((current) => ({ ...current, workEnd: event.target.value }))} /></label>
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
  const map = new Map([...defaultState.activities, ...saved].map((activity) => [activity.id, activity]))
  return Array.from(map.values())
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

function newActivity(): Activity {
  return { id: `custom-${Date.now()}`, block: 'mañana', title: '', detail: '', minutes: 15, category: 'ia', essential: false, heavyDay: false, time: '06:30', custom: true }
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

function average(values: number[]) {
  const filtered = values.filter((value) => Number.isFinite(value))
  return filtered.length ? filtered.reduce((sum, value) => sum + value, 0) / filtered.length : 0
}

function todayKey() {
  return new Date().toISOString().slice(0, 10)
}

function formatDate() {
  return new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date())
}

export default App
