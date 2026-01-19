import { useEffect, useState, type ReactNode } from "react"
import { Button, InputField, TembokLogo } from "@tembok/ui-react"
import type { Task, User } from "./lib/types"
import { login } from "./lib/helpers/auth"

export default function App() {

  const [activePanel, setActivePanel] = useState('login')

  const [token, setToken] = useState<string>(() => localStorage.getItem("token") || "")
  const [me, setMe] = useState<User | null>(null)

  const [error, setError] = useState<string>("");


  const [regEmail, setRegEmail] = useState("");
  const [regUsername, setRegUsername] = useState("");
  const [regPassword, setRegPassword] = useState("");

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [tasks, setTasks] = useState<Task[]>([]);

  //set initial token
  useEffect(() => {
    localStorage.setItem("token", token)
    if (!token) {
      setMe(null)
      setTasks([])
    }
  }), [token]


  return (
    <div className="relative min-h-svh">
      <div className="absolute inset-0" />
      <ArtPanel panel={activePanel} />
      <div className="relative z-10 flex min-h-svh w-full justify-between gap-8 px-6 py-8">
        <RegisterPanel panel={activePanel} setPanel={setActivePanel} />
        <LoginPanel panel={activePanel} setPanel={setActivePanel} />
      </div>
    </div>
  )
}


function ArtPanel({ panel }: { panel: string }) {
  return (
    <div
      className={`absolute top-0 z-20 h-full min-h-svh w-[45svw] p-2 transition-all delay-50
      ${panel == "login" ? "translate-x-0" : "translate-x-[calc(100svw-100%)]"}`}
    >
      <div className="flex h-full flex-col justify-between rounded-xl bg-bg-dark p-6 shadow-xl">
        <TembokLogo />
        <div className="space-y-3">
          <div className="text-xs uppercase tracking-[0.35em] text-fg-muted">
            fastify auth starter
          </div>
          <div className="text-3xl font-semibold leading-tight">
            A focused login playground for the Tembok stack.
          </div>
          <div className="text-sm text-fg-muted">
            Explore sign-in, registration, and token flows without wiring a backend yet.
          </div>
        </div>
        <div className="flex items-center justify-between text-xs text-fg-muted">
          <div>Fastify + TypeScript</div>
          <div>UI-only auth demo</div>
        </div>
      </div>
    </div>
  )
}

function LoginPanel({ panel, setPanel }: { panel: string, setPanel: Function }) {
  return (
    <div
      className={`flex w-1/2 items-center transition-opacity duration-300
      ${panel === "login" ? "opacity-100" : "pointer-events-none opacity-0"}`}
    >
      <PanelCard title="Welcome back" subtitle="Log in to continue testing your API.">
        <div className="space-y-4">
          <InputField
            label="Email"
            type="email"
            placeholder="you@company.com"
            value="test@example.com"
            onChange={() => { }}
          />
          <InputField
            label="Password"
            type="password"
            placeholder="********"
            value="password123"
            onChange={() => { }}
          />
          <div className="flex items-center justify-between text-xs text-slate-500">
            <label className="flex items-center gap-2">
              <input type="checkbox" className="h-4 w-4 rounded border-slate-300" />
              Remember me
            </label>
            <button className="text-slate-600 underline-offset-4 hover:underline">
              Forgot password?
            </button>
          </div>
          <div className="space-y-3 *:flex *:items-center *:w-full *:justify-center">
            <Button className="w-full">Log in</Button>
            <Button intent="ghost" className="w-full" onClick={() => setPanel("register")}>
              Create a new account
            </Button>
          </div>
        </div>
      </PanelCard>
    </div>
  )
}

function RegisterPanel({ panel, setPanel }: { panel: string, setPanel: Function }) {
  return (
    <div
      className={`flex w-1/2 items-center justify-end transition-opacity duration-300 border
      ${panel === "register" ? "opacity-100" : "pointer-events-none opacity-0"}`}
    >
      <PanelCard title="Create your account" subtitle="Set up an account and start testing.">
        <div className="space-y-4">
          <InputField
            label="Email"
            type="email"
            placeholder="you@company.com"
            value=""
            onChange={() => { }}
         />
          <InputField
            label="Password"
            type="password"
            placeholder="Create a password"
            value=""
            onChange={() => { }}
         />
          <InputField
            label="Username"
            type="text"
            placeholder="tembok.dev"
            value=""
            onChange={() => { }}
            className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-slate-400"
          />
          <label className="flex items-center gap-2 text-xs text-slate-500">
            <input type="checkbox" className="mt-1 h-4 w-4 rounded border-slate-300" />
            I agree to the terms and that we can reach out about updates.
          </label>
          <div className="space-y-3 *:flex *:items-center *:w-full *:justify-center">
            <Button className="w-full">Create account</Button>
            <Button intent="ghost" className="w-full " onClick={() => setPanel("login")}>
              I already have an account
            </Button>
          </div>
        </div>
      </PanelCard>
    </div>
  )
}

function PanelCard({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle: string
  children: ReactNode
}) {
  return (
    <div className="w-full max-w-md p-8">
      <div className="space-y-2">
        <div className="text-2xl font-semibold text-slate-900">{title}</div>
        <div className="text-sm text-slate-500">{subtitle}</div>
      </div>
      <div className="mt-6">{children}</div>
    </div>
  )
}
