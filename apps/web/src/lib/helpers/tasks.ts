import type { Dispatch, SetStateAction } from "react"
import { apiFetch } from "../api"
import type { Task } from "../types"

type SetString = Dispatch<SetStateAction<string>>
type SetTasks = Dispatch<SetStateAction<Task[]>>

export async function loadTasks({
  token,
  setTasks,
  setError,
}: {
  token: string
  setTasks: SetTasks
  setError: SetString
}): Promise<void> {
  setError("")
  try {
    const res = await apiFetch<{ tasks: Task[] }>("/tasks", { method: "GET" }, token)
    setTasks(res.tasks)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Load tasks failed"
    setError(message || "Load tasks failed")
  }
}

export async function createTask({
  token,
  taskTitle,
  setTaskTitle,
  setTasks,
  setError,
}: {
  token: string
  taskTitle: string
  setTaskTitle: SetString
  setTasks: SetTasks
  setError: SetString
}): Promise<void> {
  setError("")
  try {
    const res = await apiFetch<{ task: Task }>(
      "/tasks",
      { method: "POST", body: JSON.stringify({ title: taskTitle }) },
      token
    )
    setTaskTitle("")
    setTasks((prev) => [res.task, ...prev])
  } catch (error) {
    const message = error instanceof Error ? error.message : "Create task failed"
    setError(message || "Create task failed")
  }
}

export async function toggleTask({
  token,
  task,
  setTasks,
  setError,
}: {
  token: string
  task: Task
  setTasks: SetTasks
  setError: SetString
}): Promise<void> {
  setError("")
  try {
    const res = await apiFetch<{ task: Task }>(
      `/tasks/${task.id}`,
      { method: "PATCH", body: JSON.stringify({ done: !task.done }) },
      token
    )
    setTasks((prev) => prev.map((t) => (t.id === task.id ? res.task : t)))
  } catch (error) {
    const message = error instanceof Error ? error.message : "Update task failed"
    setError(message || "Update task failed")
  }
}

export async function deleteTask({
  token,
  id,
  setTasks,
  setError,
}: {
  token: string
  id: string
  setTasks: SetTasks
  setError: SetString
}): Promise<void> {
  setError("")
  try {
    await apiFetch<null>(`/tasks/${id}`, { method: "DELETE" }, token)
    setTasks((prev) => prev.filter((t) => t.id !== id))
  } catch (error) {
    const message = error instanceof Error ? error.message : "Delete task failed"
    setError(message || "Delete task failed")
  }
}
