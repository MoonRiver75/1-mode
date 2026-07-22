import { useEffect, useMemo, useState } from 'react'
import './App.css'

type Tab = 'hoy' | 'cuerpo' | 'mente' | 'ia' | 'progreso'
type Block = 'mañana' | 'trabajo' | 'noche'

type Habit = {
  id: string
  block: Block
  title: string
  detail: string
  minutes?: number
  essential?: boolean
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
}

const habits: Habit[] = [
  { id: 'water', block: 'mañana', title: 'Agua y respiración', detail: '7 minutos. Inhala 4, sostén 7, exhala 8.', minutes: 7, essential: true },
  { id: 'deep-ai', block: 'mañana', title: 'IA profunda', detail: 'Código, matemáticas o paper. Sin navegación libre.', minutes: 45, essential: true },
  { id: 'move-am', block: 'mañana', title: 'Movimiento ligero', detail: 'Flexiones, movilidad o caminata corta.', minutes: 15, essential: true },
  { id: 'lut', block: 'trabajo', title: 'La única tarea', detail: 'Define la acción que hará que el día valga.', minutes: 5, essential: true },
  { id: 'ai-extension', block: 'trabajo', title: 'IA como extensión', detail: 'Automatiza o mejora una tarea repetitiva.', minutes: 15 },
  { id: 'walk-food', block: 'trabajo', title: 'Caminata consciente', detail: '10 minutos después de comer.', minutes: 10, essential: true },
  { id: 'protein', block: 'noche', title: 'Cena proteica', detail: 'Simple, temprana y suficiente.', minutes: 30, essential: true },
  { id: 'review-code', block: 'noche', title: 'Revisión de IA', detail: 'Repetición, notas o código de la mañana.', minutes: 30 },
  { id: 'three-wins', block: 'noche', title: 'Tres victorias', detail: 'Cuerpo, trabajo e IA. Una línea basta.', minutes: 5, essential: true },
  { id: 'screens-off', block: 'noche', title: 'Pantallas fuera', detail: '10:15 PM. El sueño protege el sistema.', minutes: 1, essential: true },
]

const defaultState: DailyState = {
  date: new Date().toISOString().slice(0, 10),
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
}

const tabs: { id: Tab; label: string }[] = [
  { id: 'hoy', label: 'Hoy' },
  { id: 'cuerpo', label: 'Cuerpo' },
  { id: 'mente', label: 'Mente' },
  { id: 'ia', label: 'IA' },
  { id: 'progreso', label: 'Progreso' },
]

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('hoy')
  const [state, setState] = useState<DailyState>(() => {
    const saved = localStorage.getItem('one-mode-state')
    return saved ? { ...defaultState, ...JSON.parse(saved) } : defaultState
  })

  useEffect(() => {
    localStorage.setItem('one-mode-state', JSON.stringify(state))
  }, [state])

  const visibleHabits = useMemo(
    () => (state.heavyDay ? habits.filter((habit) => habit.essential) : habits),
    [state.heavyDay],
  )

  const completedCount = visibleHabits.filter((habit) => state.completed[habit.id]).length
  const progress = Math.round((completedCount / visibleHabits.length) * 100)
  const deepMinutes = visibleHabits
    .filter((habit) => state.completed[habit.id] && habit.id === 'deep-ai')
    .reduce((sum, habit) => sum + (habit.minutes ?? 0), state.deepWork)

  const insights = getInsights(state, progress, deepMinutes)

  function toggleHabit(id: string) {
    setState((current) => ({
      ...current,
      completed: { ...current.completed, [id]: !current.completed[id] },
    }))
  }

  function updateWin(index: number, value: string) {
    setState((current) => {
      const wins = [...current.wins]
      wins[index] = value
      return { ...current, wins }
    })
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
        {activeTab === 'hoy' && (
          <TodayView
            completedCount={completedCount}
            progress={progress}
            state={state}
            habits={visibleHabits}
            insights={insights}
            onToggle={toggleHabit}
            setState={setState}
            updateWin={updateWin}
          />
        )}
        {activeTab === 'cuerpo' && <BodyView state={state} setState={setState} />}
        {activeTab === 'mente' && <MindView state={state} setState={setState} insights={insights} />}
        {activeTab === 'ia' && <AiView state={state} setState={setState} deepMinutes={deepMinutes} />}
        {activeTab === 'progreso' && <ProgressView progress={progress} state={state} completedCount={completedCount} insights={insights} />}
      </section>

      <nav className="bottom-nav" aria-label="Navegación principal">
        {tabs.map((tab) => (
          <button key={tab.id} className={activeTab === tab.id ? 'active' : ''} type="button" onClick={() => setActiveTab(tab.id)}>
            {tab.label}
          </button>
        ))}
      </nav>
    </main>
  )
}

function TodayView({ completedCount, progress, state, habits, insights, onToggle, setState, updateWin }: {
  completedCount: number
  progress: number
  state: DailyState
  habits: Habit[]
  insights: string[]
  onToggle: (id: string) => void
  setState: React.Dispatch<React.SetStateAction<DailyState>>
  updateWin: (index: number, value: string) => void
}) {
  return (
    <>
      <div className="date-line">{formatDate()}</div>
      <div className="hero-grid">
        <div className="progress-ring" style={{ '--progress': `${progress * 3.6}deg` } as React.CSSProperties}>
          <strong>{progress}%</strong>
          <span>{completedCount}/{habits.length}</span>
        </div>
        <div>
          <p className="caption">Ritmo del día</p>
          <h2>{state.heavyDay ? 'Solo lo esencial permanece.' : 'Un día. Una versión mejor.'}</h2>
          <p className="soft-copy">Despertar sugerido: 6:15 AM. Pantallas fuera: 10:15 PM. Dormir: 10:45 PM.</p>
        </div>
      </div>

      <InsightCard text={insights[0]} />

      {(['mañana', 'trabajo', 'noche'] as Block[]).map((block) => (
        <section className="ritual-block" key={block}>
          <p className="caption">{block}</p>
          {habits.filter((habit) => habit.block === block).map((habit) => (
            <button key={habit.id} className={`habit-row ${state.completed[habit.id] ? 'done' : ''}`} type="button" onClick={() => onToggle(habit.id)}>
              <span className="checkmark">{state.completed[habit.id] ? '✓' : ''}</span>
              <span>
                <strong>{habit.title}</strong>
                <small>{habit.detail}</small>
              </span>
              {habit.minutes && <em>{habit.minutes}m</em>}
            </button>
          ))}
        </section>
      ))}

      <section className="journal-card">
        <p className="caption">Tres victorias</p>
        {['Cuerpo', 'Trabajo', 'IA'].map((label, index) => (
          <label key={label}>
            <span>{label}</span>
            <input value={state.wins[index]} placeholder="Una línea basta" onChange={(event) => updateWin(index, event.target.value)} />
          </label>
        ))}
      </section>

      <button className="primary-action" type="button" onClick={() => setState((current) => ({ ...current, heavyDay: true }))}>
        Activar día pesado
      </button>
    </>
  )
}

function BodyView({ state, setState }: { state: DailyState; setState: React.Dispatch<React.SetStateAction<DailyState>> }) {
  return (
    <>
      <SectionTitle caption="Cuerpo" title="Atleta en recuperación" />
      <div className="metric-grid">
        <Metric label="Pasos" value={state.steps.toLocaleString('es-MX')} helper="Meta inicial: 8,000" />
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
      </div>
      <InsightCard text={insights[1] ?? insights[0]} />
    </>
  )
}

function AiView({ state, setState, deepMinutes }: { state: DailyState; setState: React.Dispatch<React.SetStateAction<DailyState>>; deepMinutes: number }) {
  const rescueSteps = state.rescueProblem.trim()
    ? ['Define la versión más pequeña del problema.', 'Abre editor o libreta. Escribe 5 líneas.', 'Marca un error, una duda o un siguiente paso.']
    : []

  return (
    <>
      <SectionTitle caption="IA" title="Aprendiz de por vida" />
      <div className="metric-grid">
        <Metric label="Zona profunda" value={`${deepMinutes}m`} helper="Código o matemáticas" />
        <Metric label="Regla" value="sin web" helper="Solo editor y papel" />
      </div>
      <section className="rescue-card">
        <p className="caption">No sé por dónde empezar</p>
        <textarea value={state.rescueProblem} placeholder="El problema más pequeño que tengo es..." onChange={(event) => setState((current) => ({ ...current, rescueProblem: event.target.value }))} />
        {rescueSteps.length > 0 && rescueSteps.map((step, index) => <p key={step} className="rescue-step">{index + 1}. {step}</p>)}
      </section>
      <InsightCard text="La confusión no es una señal de fracaso. Es la puerta de entrada al aprendizaje real." />
    </>
  )
}

function ProgressView({ progress, state, completedCount, insights }: { progress: number; state: DailyState; completedCount: number; insights: string[] }) {
  return (
    <>
      <SectionTitle caption="Progreso" title="Sistema sobre motivación" />
      <div className="metric-grid">
        <Metric label="Hoy" value={`${progress}%`} helper={`${completedCount} acciones`} />
        <Metric label="Día pesado" value={state.heavyDay ? 'activo' : 'no'} helper="Sin culpa" />
        <Metric label="Pasos" value={String(state.steps)} helper="Proceso visible" />
      </div>
      <section className="achievement-list">
        {['El Estoico Madrugador', 'El 1% Diario', 'No Dos Veces'].map((name, index) => (
          <div key={name} className="achievement">
            <span>{index + 1}</span>
            <div><strong>{name}</strong><small>Inspirado en Clear, Sharma y Fridman.</small></div>
          </div>
        ))}
      </section>
      <InsightCard text={insights[2] ?? 'La identidad no se define por un error, sino por cómo respondes al error.'} />
    </>
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

function getInsights(state: DailyState, progress: number, deepMinutes: number) {
  const insights = []
  if (state.sleepHours < 7) insights.push('Dormiste poco. Hoy gana quien conserva energía: entrenamiento corto, cena simple y pantallas fuera temprano.')
  if (state.anxiety >= 4) insights.push('La ansiedad está alta. No negocies con ella: agua, respiración y una caminata de 10 minutos.')
  if (state.energy <= 2) insights.push('La energía está baja. Reduce la carga, pero conserva la identidad: una acción pequeña también cuenta.')
  if (state.workEnd > '18:45' || state.heavyDay) insights.push('Trabajaste más de lo normal. Día pesado recomendado: solo lo esencial permanece.')
  if (deepMinutes === 0) insights.push('La IA todavía no recibió atención profunda. Abre editor o papel durante 15 minutos.')
  if (progress >= 80) insights.push('El sistema está respondiendo. Protege este ritmo; no agregues dificultad hoy.')
  insights.push('No necesitas motivación perfecta. Necesitas que el siguiente paso sea inevitable.')
  return insights
}

function formatDate() {
  return new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date())
}

export default App
