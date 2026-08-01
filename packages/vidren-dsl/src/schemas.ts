import { z } from "zod";
import { MindMapNode } from "./types";

export const AnimationTypeSchema = z.enum([
  "hand-drawn-stroke",
  "fade-in",
  "draw-path",
  "scale-up",
  "none",
]);

export const ElementAnimationSchema = z.object({
  type: AnimationTypeSchema,
  durationMs: z.number().optional(),
  delayMs: z.number().optional(),
});

export const BaseElementASTSchema = z.object({
  id: z.string(),
  type: z.string(),
  title: z.string().optional(),
  animation: ElementAnimationSchema.optional(),
  style: z
    .object({
      color: z.string().optional(),
      backgroundColor: z.string().optional(),
      borderColor: z.string().optional(),
      width: z.union([z.string(), z.number()]).optional(),
      height: z.union([z.string(), z.number()]).optional(),
    })
    .optional(),
});

export const TypographyElementSchema = BaseElementASTSchema.extend({
  type: z.literal("typography"),
  variant: z.enum(["h1", "h2", "h3", "body", "callout", "quote"]),
  content: z.string(),
});

export const KaTeXMathElementSchema = BaseElementASTSchema.extend({
  type: z.literal("katex"),
  expression: z.string(),
  explanation: z.string().optional(),
  variables: z
    .record(
      z.object({
        min: z.number(),
        max: z.number(),
        default: z.number(),
        label: z.string(),
      })
    )
    .optional(),
});

// Recursive Zod schema for MindMap nodes
export const MindMapNodeSchema: z.ZodType<MindMapNode> = z.lazy(() =>
  z.object({
    id: z.string(),
    label: z.string(),
    description: z.string().optional(),
    children: z.array(MindMapNodeSchema).optional(),
    color: z.string().optional(),
  })
);

export const MindMapElementSchema = BaseElementASTSchema.extend({
  type: z.literal("mindmap"),
  root: MindMapNodeSchema,
});

export const InteractiveChartElementSchema = BaseElementASTSchema.extend({
  type: z.literal("chart"),
  chartType: z.enum(["bar", "line", "pie", "radar", "surface-3d"]),
  data: z.array(z.record(z.union([z.string(), z.number()]))),
  xAxisKey: z.string().optional(),
  yAxisKey: z.string().optional(),
  formula: z.string().optional(),
  controls: z
    .array(
      z.object({
        name: z.string(),
        label: z.string(),
        min: z.number(),
        max: z.number(),
        step: z.number().optional(),
        defaultValue: z.number(),
      })
    )
    .optional(),
});

export const CodePlaygroundElementSchema = BaseElementASTSchema.extend({
  type: z.literal("code-playground"),
  language: z.enum(["typescript", "javascript", "python", "html", "css"]),
  code: z.string(),
  output: z.string().optional(),
  isExecutable: z.boolean().optional(),
});

export const QuizOptionSchema = z.object({
  id: z.string(),
  text: z.string(),
  isCorrect: z.boolean(),
  explanation: z.string().optional(),
});

export const QuizWidgetElementSchema = BaseElementASTSchema.extend({
  type: z.literal("quiz"),
  question: z.string(),
  options: z.array(QuizOptionSchema),
  hint: z.string().optional(),
});

export const PhysicsSimulationElementSchema = BaseElementASTSchema.extend({
  type: z.literal("physics-simulation"),
  simType: z.enum(["pendulum", "projectile", "spring-mass", "orbital"]),
  initialParams: z.object({
    gravity: z.number().optional(),
    mass: z.number().optional(),
    length: z.number().optional(),
    damping: z.number().optional(),
    velocity: z.number().optional(),
    angle: z.number().optional(),
  }),
});

export const VidRenElementASTSchema = z.discriminatedUnion("type", [
  TypographyElementSchema,
  KaTeXMathElementSchema,
  MindMapElementSchema,
  InteractiveChartElementSchema,
  CodePlaygroundElementSchema,
  QuizWidgetElementSchema,
  PhysicsSimulationElementSchema,
]);

export const VidRenSceneASTSchema = z.object({
  sceneId: z.string(),
  title: z.string(),
  description: z.string().optional(),
  theme: z.enum(["chalkboard", "dark-glass", "paper-light", "blueprint"]).optional(),
  elements: z.array(VidRenElementASTSchema),
});

export const VidRenDocumentASTSchema = z.object({
  version: z.literal("2.0"),
  metadata: z.object({
    id: z.string(),
    title: z.string(),
    author: z.string().optional(),
    createdAt: z.string().optional(),
    tags: z.array(z.string()).optional(),
  }),
  scenes: z.array(VidRenSceneASTSchema),
});
