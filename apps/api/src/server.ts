import Fastify from "fastify";
import cors from "@fastify/cors";
import { AgentSwarmOrchestrator } from "@vidren/agent-core";

const fastify = Fastify({ logger: true });
const orchestrator = new AgentSwarmOrchestrator();

// Enable CORS for frontend Next.js app
fastify.register(cors, {
  origin: "*",
});

// Health check endpoint
fastify.get("/health", async () => {
  return { status: "ok", service: "VidRen AI API Gateway", version: "2.0.0" };
});

// Server-Sent Events (SSE) streaming synthesis endpoint
fastify.post("/api/v1/synthesize", async (request, reply) => {
  const body = request.body as { prompt: string; workspaceId?: string };

  if (!body || !body.prompt) {
    reply.status(400).send({ error: "Missing required 'prompt' parameter in request body." });
    return;
  }

  reply.raw.setHeader("Content-Type", "text/event-stream");
  reply.raw.setHeader("Cache-Control", "no-cache");
  reply.raw.setHeader("Connection", "keep-alive");

  try {
    const generator = orchestrator.synthesizeStream({
      userPrompt: body.prompt,
      workspaceId: body.workspaceId,
    });

    for await (const chunk of generator) {
      reply.raw.write(`data: ${JSON.stringify(chunk)}\n\n`);
      // Simulate real-time streaming delay for smooth client visualization
      await new Promise((resolve) => setTimeout(resolve, 150));
    }

    reply.raw.write(`data: [DONE]\n\n`);
    reply.raw.end();
  } catch (err: any) {
    reply.raw.write(`data: ${JSON.stringify({ type: "error", content: err.message })}\n\n`);
    reply.raw.end();
  }
});

const start = async () => {
  try {
    const port = process.env.PORT ? parseInt(process.env.PORT) : 4000;
    await fastify.listen({ port, host: "0.0.0.0" });
    console.log(`VidRen AI API Gateway streaming server listening on port ${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
