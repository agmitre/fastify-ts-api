// apps/api/src/routes/tasks/ts

import { FastifyPluginAsync } from "fastify";
import z from "zod";
import { prisma } from "../lib/prisma.js"

//validation
const CreateTaskBodySchema = z.object({
    title: z.string().min(1).max(255),
})
const UpdateTaskBodySchema = z.object({
    title: z.string().min(1).max(255).optional(),
    done: z.boolean().optional()
}).refine((data) => Object.keys(data).length > 0, { message: "At least one field must be provided" }) //both optional but atleast one


export const taskRoutes: FastifyPluginAsync = async (app) => {
    // List tasks for current user
    app.get("/tasks", { preHandler: app.requireAuth }, async (request) => {
        const userId = request.user.sub

        const tasks = await prisma.task.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
            select: {
                id: true,
                title: true,
                done: true,
                createdAt: true,
                updatedAt: true
            }
        })

        return { tasks }
    })

    // Create task for current user
    app.post("/tasks", { preHandler: app.requireAuth }, async (request, reply) => {
        const parsed = CreateTaskBodySchema.safeParse(request.body)
        if (!parsed.success) {
            return reply.code(400).send({
                error: "INVALID_BODY",
                message: "Request body validation failed",
                details: parsed.error.flatten()
            })
        }

        const userId = request.user.sub
        const task = await prisma.task.create({
            data: {
                userId,
                title: parsed.data.title.trim(),
            },
            select: {
                id: true,
                title: true,
                done: true,
                createdAt: true,
                updatedAt: true,
            }
        })

        return reply.code(201).send({ task })
    })

    //update task
    app.patch("/tasks/:id", { preHandler: app.requireAuth }, async (request, reply) => {
        const parsed = UpdateTaskBodySchema.safeParse(request.body)
        if (!parsed.success) {
            return reply.code(400).send({
                error: "INVALID_BODY",
                message: "Request body validation failed",
                details: parsed.error.flatten()
            })
        }

        const taskId = (request.params as any).id as string
        const userId = request.user.sub

        //check if it exists and ownership
        const existing = await prisma.task.findFirst({
            where: { id: taskId, userId },
            select: { id: true }
        })

        if (!existing) {
            return reply.code(404).send({
                error: "TASK_NOT_FOUND",
                message: "Task not found",
            })
        }

        const task = await prisma.task.update({
            where: { id: taskId },
            data: parsed.data,
            select: {
                id: true,
                title: true,
                done: true,
                createdAt: true,
                updatedAt: true,
            }
        })

        return { task }
    })

    //delete task
    app.delete("/tasks/:id", { preHandler: app.requireAuth }, async (request, reply) => {
        const taskId = (request.params as any).id as string
        const userId = request.user.sub

        const existing = await prisma.task.findFirst({
            where: { id: taskId, userId },
            select: { id: true }
        })
        if (!existing) {
            return reply.code(404).send({
                error: "TASK_NOT_FOUND",
                message: "Task not found"
            })
        }

        await prisma.task.delete({
            where: { id: taskId }
        })

        return reply.code(204).send()
    })
}