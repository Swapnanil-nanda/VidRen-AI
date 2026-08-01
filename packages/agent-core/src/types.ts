import { VidRenDocumentAST } from "@vidren/dsl";

export interface AgentContext {
  userPrompt: string;
  workspaceId?: string;
  documentId?: string;
  ragCitations?: { source: string; content: string }[];
}

export interface PlanStep {
  sceneId: string;
  title: string;
  conceptSummary: string;
  recommendedWidgets: string[];
}

export interface PlanOutput {
  topic: string;
  learningGoals: string[];
  steps: PlanStep[];
}

export interface StreamChunk {
  type: "plan" | "ast_token" | "reflection" | "complete" | "error";
  content?: string;
  data?: any;
}
