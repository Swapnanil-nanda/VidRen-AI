/**
 * VidRenDSL 2.0 AST Specification
 * Represents interactive, stateful, hand-drawn whiteboards, math formulas,
 * mind maps, dynamic charts, physics simulations, and code playgrounds.
 */

export type CanvasTheme = "chalkboard" | "dark-glass" | "paper-light" | "blueprint";

export type AnimationType = "hand-drawn-stroke" | "fade-in" | "draw-path" | "scale-up" | "none";

export interface ElementAnimation {
  type: AnimationType;
  durationMs?: number;
  delayMs?: number;
}

export interface BaseElementAST {
  id: string;
  type: string;
  title?: string;
  animation?: ElementAnimation;
  style?: {
    color?: string;
    backgroundColor?: string;
    borderColor?: string;
    width?: string | number;
    height?: string | number;
  };
}

export interface TypographyElement extends BaseElementAST {
  type: "typography";
  variant: "h1" | "h2" | "h3" | "body" | "callout" | "quote";
  content: string;
}

export interface KaTeXMathElement extends BaseElementAST {
  type: "katex";
  expression: string;
  explanation?: string;
  variables?: Record<string, { min: number; max: number; default: number; label: string }>;
}

export interface MindMapNode {
  id: string;
  label: string;
  description?: string;
  children?: MindMapNode[];
  color?: string;
}

export interface MindMapElement extends BaseElementAST {
  type: "mindmap";
  root: MindMapNode;
}

export interface ChartDataPoint {
  label: string;
  value: number;
  [key: string]: string | number;
}

export interface InteractiveChartElement extends BaseElementAST {
  type: "chart";
  chartType: "bar" | "line" | "pie" | "radar" | "surface-3d";
  data: ChartDataPoint[];
  xAxisKey?: string;
  yAxisKey?: string;
  formula?: string; // Formula evaluated against dynamic controls
  controls?: {
    name: string;
    label: string;
    min: number;
    max: number;
    step?: number;
    defaultValue: number;
  }[];
}

export interface CodePlaygroundElement extends BaseElementAST {
  type: "code-playground";
  language: "typescript" | "javascript" | "python" | "html" | "css";
  code: string;
  output?: string;
  isExecutable?: boolean;
}

export interface QuizOption {
  id: string;
  text: string;
  isCorrect: boolean;
  explanation?: string;
}

export interface QuizWidgetElement extends BaseElementAST {
  type: "quiz";
  question: string;
  options: QuizOption[];
  hint?: string;
}

export interface PhysicsSimulationElement extends BaseElementAST {
  type: "physics-simulation";
  simType: "pendulum" | "projectile" | "spring-mass" | "orbital";
  initialParams: {
    gravity?: number;
    mass?: number;
    length?: number;
    damping?: number;
    velocity?: number;
    angle?: number;
  };
}

export type VidRenElementAST =
  | TypographyElement
  | KaTeXMathElement
  | MindMapElement
  | InteractiveChartElement
  | CodePlaygroundElement
  | QuizWidgetElement
  | PhysicsSimulationElement;

export interface VidRenSceneAST {
  sceneId: string;
  title: string;
  description?: string;
  theme?: CanvasTheme;
  elements: VidRenElementAST[];
}

export interface VidRenDocumentAST {
  version: "2.0";
  metadata: {
    id: string;
    title: string;
    author?: string;
    createdAt?: string;
    tags?: string[];
  };
  scenes: VidRenSceneAST[];
}
