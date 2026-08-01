import { VideoProject, VideoTargetDuration, DURATION_CONFIGS, RendererType, ThreeDModelType } from "../types";
import { validateVideoProject } from "./schema";
import { getApiKey } from "./geminiClient";
import { deduplicateAndEnrichScript } from "./scriptDeduplicator";
import { autoExtendSceneDurations } from "./speechDurationEstimator";

export interface PlannerConfig {
  apiKey?: string;
  model?: string;
  targetDuration?: VideoTargetDuration;
  provider?: "gemini" | "groq" | "openrouter";
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function getGroqApiKey(): string | null {
  return process.env.NEXT_PUBLIC_GROQ_API_KEY || null;
}

// 1. French Revolution & History Curriculum (25 Full Scenes for Deep Dive)
const HISTORICAL_CURRICULUM = [
  { title: "The Ancien Régime & Absolute Monarchy", purpose: "Feudal structure of 18th century France", narration: "Under King Louis XVI, French society was rigidly divided into Three Estates, creating massive social inequality and financial strain.", renderer: "hierarchy" as RendererType },
  { title: "Financial Collapse & Tax Inequality", purpose: "Economic crisis of 1788-1789", narration: "Compounded by war debts and crop failures, the peasantry bore the heaviest tax burden while nobility and clergy enjoyed exemptions.", renderer: "chart" as RendererType },
  { title: "Convocation of the Estates-General", purpose: "May 5, 1789 assembly at Versailles", narration: "Louis XVI summoned representatives of all three estates for the first time in 175 years to resolve the fiscal emergency.", renderer: "hierarchy" as RendererType },
  { title: "The Third Estate Demand Equality", purpose: "Voting disputes between Estates", narration: "Representing 97 percent of the population, Third Estate delegates demanded vote-by-head rather than vote-by-estate.", renderer: "comparison" as RendererType },
  { title: "The Tennis Court Oath", purpose: "Founding of the National Assembly", narration: "Locked out of their hall, delegates gathered at a nearby tennis court, swearing not to separate until France had a constitution.", renderer: "timeline" as RendererType },
  { title: "Establishment of National Assembly", purpose: "Sovereignty shifts to the people", narration: "Declaring themselves the National Assembly, the Third Estate asserted supreme legislative power over the nation.", renderer: "process" as RendererType },
  { title: "Storming of the Bastille", purpose: "July 14, 1789 symbolic fall of royal tyranny", narration: "Revolutionaries stormed the medieval fortress of Bastille, seizing gunpowder and creating the National Guard.", renderer: "timeline" as RendererType },
  { title: "The Great Fear & Peasant Revolts", purpose: "Rural insurrections across France", narration: "Peasants destroyed feudal registries, prompting the Assembly to formally abolish feudal privileges.", renderer: "process" as RendererType },
  { title: "Declaration of the Rights of Man", purpose: "August 26, 1789 human rights charter", narration: "Proclaiming liberty, equality, and fraternity, the declaration enshrined freedom of speech and popular sovereignty.", renderer: "equation" as RendererType },
  { title: "Women's March on Versailles", purpose: "October 1789 Parisian bread march", narration: "Market women marched to Versailles, forcing King Louis XVI and the royal family to relocate to Paris.", renderer: "timeline" as RendererType },
  { title: "Civil Constitution of the Clergy", purpose: "Reorganization of the Church", narration: "The Assembly subordinated the Roman Catholic Church to the French government, dividing public sentiment.", renderer: "architecture" as RendererType },
  { title: "Flight to Varennes & Royal Betrayal", purpose: "June 1791 royal escape attempt", narration: "Louis XVI attempted to flee France to rally foreign armies, destroying public trust in the constitutional monarchy.", renderer: "timeline" as RendererType },
  { title: "Legislative Assembly & War Declaration", purpose: "1792 war against Austria and Prussia", narration: "Facing external invasions, France declared war on Austria, escalating revolutionary fervor across Europe.", renderer: "comparison" as RendererType },
  { title: "Insurrection of August 10, 1792", purpose: "Storming of Tuileries Palace", narration: "Armed revolutionaries stormed the Tuileries, imprisoning the royal family and suspending the monarch's power.", renderer: "timeline" as RendererType },
  { title: "September Massacres & First Republic", purpose: "September 1792 republic proclaimed", narration: "The National Convention formally abolished the monarchy, proclaiming France a unified democratic Republic.", renderer: "architecture" as RendererType },
  { title: "Trial & Execution of Louis XVI", purpose: "January 21, 1793 regicide", narration: "Convicted of high treason against the state, Louis XVI was executed by guillotine at the Place de la Révolution.", renderer: "timeline" as RendererType },
  { title: "Rise of the Jacobins & Robespierre", purpose: "Radical faction takes control", narration: "Maximilien Robespierre and the Jacobin faction seized leadership to defend the republic against internal and external enemies.", renderer: "hierarchy" as RendererType },
  { title: "Committee of Public Safety", purpose: "April 1793 executive war cabinet", narration: "Granted emergency dictatorial powers, the Committee mobilized the entire nation for military defence.", renderer: "process" as RendererType },
  { title: "The Reign of Terror", purpose: "1793-1794 period of mass executions", narration: "Over 16,000 citizens suspected of counter-revolutionary activity were executed under the Law of Suspects.", renderer: "chart" as RendererType },
  { title: "Execution of Marie Antoinette", purpose: "Elimination of political rivals", narration: "Former Queen Marie Antoinette and prominent Girondin leaders were sent to the guillotine during the Terror.", renderer: "timeline" as RendererType },
  { title: "Thermidorian Reaction & Fall of Robespierre", purpose: "July 1794 arrest of Robespierre", narration: "Fearing further purges, Convention members united to overthrow Robespierre, ending the Reign of Terror.", renderer: "process" as RendererType },
  { title: "Establishment of the Directory", purpose: "1795-1799 moderate government", narration: "A five-member executive Directory governed France, struggling against corruption and political instability.", renderer: "architecture" as RendererType },
  { title: "Coup of 18 Brumaire & Rise of Napoleon", purpose: "November 1799 consulate takeover", narration: "General Napoleon Bonaparte overthrew the Directory, establishing the French Consulate and declaring himself First Consul.", renderer: "timeline" as RendererType },
  { title: "The Napoleonic Code & Legal Legacy", purpose: "Codification of civil law", narration: "Napoleon established a unified legal system that institutionalized equality before the law and property rights.", renderer: "equation" as RendererType },
  { title: "Global Impact & Enduring Legacy", purpose: "Enduring influence of 1789", narration: "The French Revolution reshaped global politics, spreading democratic ideals, secular law, and human rights worldwide.", renderer: "hero3d" as RendererType },
];

// 2. Backpropagation & AI Neural Network Curriculum (25 Full Scenes for Deep Dive)
const BACKPROPAGATION_CURRICULUM = [
  { title: "Neural Network Architecture & Node Layers", purpose: "Input, hidden, and output layer connections", narration: "A deep neural network consists of interconnected node layers that transform raw input features into prediction probabilities.", renderer: "architecture" as RendererType },
  { title: "Affine Weight Multiplications & Biases", purpose: "Computing layer inputs z = Wx + b", narration: "Each layer computes affine transformations by multiplying input vectors by weight matrices and adding bias vectors.", renderer: "equation" as RendererType },
  { title: "Non-Linear Activation Functions", purpose: "ReLU, Sigmoid, and GELU non-linearities", narration: "Activation functions introduce non-linearity, enabling deep networks to learn complex non-convex decision boundaries.", renderer: "process" as RendererType },
  { title: "Forward Pass Traversal", purpose: "Signal flow from input to final prediction", narration: "During the forward pass, data flows progressively from the input layer through hidden units to produce the output prediction.", renderer: "process" as RendererType },
  { title: "Ground-Truth Target Comparison", purpose: "Evaluating model predictions against true labels", narration: "Model predictions are compared against true ground-truth targets to quantify prediction accuracy.", renderer: "comparison" as RendererType },
  { title: "Loss Function & Scalar Error Formulation", purpose: "Quantifying model error L(y, y_hat)", narration: "The loss function measures the scalar discrepancy between predicted network outputs and ground truth targets.", renderer: "equation" as RendererType },
  { title: "Mean Squared Error vs Cross-Entropy", purpose: "Loss functions for regression vs classification", narration: "Regression tasks employ Mean Squared Error while classification tasks use Cross-Entropy loss functions.", renderer: "chart" as RendererType },
  { title: "Gradient Vector Concept & Direction", purpose: "Steepest ascent direction in weight space", narration: "The gradient vector contains partial derivatives pointing in the direction of steepest loss increase.", renderer: "hero3d" as RendererType },
  { title: "The Chain Rule of Multivariable Calculus", purpose: "Decomposing composite function derivatives", narration: "Backpropagation relies on the calculus chain rule to decompose total loss gradient into layer-by-layer partial derivatives.", renderer: "equation" as RendererType },
  { title: "Output Layer Partial Derivatives", purpose: "dL/da and dL/dz at final output", narration: "Gradients originate at the final layer by evaluating how changes in output activations alter total loss.", renderer: "equation" as RendererType },
  { title: "Hidden Layer Weight Gradients", purpose: "dL/dW = dL/da * da/dz * dz/dW", narration: "Each weight gradient represents how much a small change in weight parameter will decrease overall loss.", renderer: "equation" as RendererType },
  { title: "Error Delta Signal Backpropagation", purpose: "Recursive backward error propagation", narration: "Starting at the final layer, error signals propagate backward through weight matrices to update hidden layers.", renderer: "process" as RendererType },
  { title: "Gradient Descent Weight Update Rule", purpose: "w <- w - learning_rate * dL/dw", narration: "Weights are adjusted in the opposite direction of the gradient using the learning rate hyperparameter.", renderer: "simulation" as RendererType },
  { title: "Stochastic Gradient Descent (SGD)", purpose: "Batch and mini-batch gradient estimation", narration: "Stochastic gradient descent computes loss gradients over randomized mini-batches to accelerate training speed.", renderer: "chart" as RendererType },
  { title: "Momentum Acceleration Mechanics", purpose: "Accumulating velocity vectors along gradients", narration: "Momentum accumulates past gradient vectors to accelerate traversal through flat loss plateaus.", renderer: "simulation" as RendererType },
  { title: "RMSprop Second-Moment Scaling", purpose: "Scaling learning rates by uncentered variance", narration: "RMSprop scales learning rates inversely by the root mean square of recent gradient magnitudes.", renderer: "chart" as RendererType },
  { title: "Adam Adaptive Optimizer", purpose: "Combining first and second moment estimations", narration: "Modern optimizers like Adam use first and second gradient moments to adaptively scale individual parameter learning rates.", renderer: "chart" as RendererType },
  { title: "Vanishing Gradient Dynamics", purpose: "Saturating activations causing zero gradients", narration: "Saturating activations can cause gradients to shrink exponentially in deep layers, resolved by ReLU and Residual connections.", renderer: "comparison" as RendererType },
  { title: "Exploding Gradient Mitigation", purpose: "Gradient clipping thresholds", narration: "Unstable weight growth can cause exploding gradients, mitigated via norm clipping and layer normalization.", renderer: "process" as RendererType },
  { title: "Weight Initialization Schemes", purpose: "Xavier and He normal initialization", narration: "Proper weight initialization prevents initial signal attenuation or saturation across deep layers.", renderer: "architecture" as RendererType },
  { title: "L2 Regularization & Weight Decay", purpose: "Penalizing large weight magnitudes", narration: "Weight decay adds quadratic parameter penalties to the loss function, preventing overfitting.", renderer: "equation" as RendererType },
  { title: "Dropout Layer Deactivation", purpose: "Random unit suppression during training", narration: "Dropout randomly deactivates hidden nodes during training, forcing redundant feature representations.", renderer: "process" as RendererType },
  { title: "Batch Normalization Dynamics", purpose: "Normalizing intermediate layer activations", narration: "Batch Normalization standardizes hidden layer inputs across batches, stabilizing internal covariate shift.", renderer: "architecture" as RendererType },
  { title: "3D Loss Landscape Topology", purpose: "Navigating non-convex optimization spaces", narration: "Optimization trajectories navigate complex high-dimensional loss landscapes seeking local and global minima.", renderer: "hero3d" as RendererType },
  { title: "Global Minima & Synthesis", purpose: "Final convergence and generalization", narration: "Through continuous backpropagation iterations, deep neural networks converge to highly effective predictive representations.", renderer: "hero3d" as RendererType },
];

// 3. Quantum Physics Curriculum (25 Full Scenes for Deep Dive)
const QUANTUM_PHYSICS_CURRICULUM = [
  { title: "Fundamental Quantum Mechanics", purpose: "Wave-particle duality & Planck's constant", narration: "At microscopic scales, physical systems exhibit both wave-like and particle-like behaviors governed by Planck's quantum of action.", renderer: "simulation" as RendererType },
  { title: "Quantum Superposition & Wavefunctions", purpose: "Schrödinger equation state vectors", narration: "A quantum system exists in a linear superposition of all possible physical states until an observation forces collapse.", renderer: "equation" as RendererType },
  { title: "Concept of Quantum Entanglement", purpose: "Non-local physical correlations", narration: "Quantum entanglement links two or more particles such that measuring one instantaneously determines the quantum state of another.", renderer: "hero3d" as RendererType },
  { title: "Einstein's EPR Paradox", purpose: "Spooky action at a distance debate", narration: "Albert Einstein, Boris Podolsky, and Nathan Rosen questioned quantum completeness, arguing against instantaneous action at a distance.", renderer: "comparison" as RendererType },
  { title: "Bell's Theorem & Inequality Tests", purpose: "Proving non-locality empirically", narration: "John Stewart Bell formulated mathematical inequalities proving quantum correlations cannot be explained by local hidden variables.", renderer: "chart" as RendererType },
  { title: "Aspect & Clauser Experimental Proof", purpose: "2022 Nobel Prize physics confirmation", narration: "Experimental tests by Alain Aspect and John Clauser definitively confirmed quantum non-locality and Bell inequality violation.", renderer: "timeline" as RendererType },
  { title: "Qubit States & Bloch Sphere", purpose: "Quantum information units", narration: "Unlike classical binary bits, a quantum qubit is represented as a point on a 3D Bloch sphere vector space.", renderer: "hero3d" as RendererType },
  { title: "Quantum Logic Gates & Circuits", purpose: "Hadamard, CNOT, and Pauli gates", narration: "Quantum gates manipulate qubit superpositions via unitary matrix operations, creating entangled multi-qubit registers.", renderer: "architecture" as RendererType },
  { title: "Quantum Teleportation Mechanics", purpose: "Information transfer without particle transport", narration: "Entangled photon pairs allow an unknown quantum state to be reconstructed across distances using classical channels.", renderer: "process" as RendererType },
  { title: "Quantum Key Distribution", purpose: "Unbreakable cryptographic security", narration: "QKD protocols like BB84 leverage quantum measurement collapse to guarantee tamper-proof cryptographic communication.", renderer: "process" as RendererType },
  { title: "Quantum Decoherence & Environment", purpose: "Loss of quantum phase coherence", narration: "Environmental interaction causes fragile quantum superpositions to decay rapidly into classical probability distributions.", renderer: "simulation" as RendererType },
  { title: "Superconducting Qubits & Hardware", purpose: "Transmon qubits and cryogenic cooling", narration: "Superconducting circuits operating near absolute zero exploit Josephson junctions to build scalable quantum processors.", renderer: "hierarchy" as RendererType },
  { title: "Trapped Ion Quantum Processors", purpose: "Laser-manipulated atomic qubits", narration: "Trapped ion architectures use electromagnetic fields and precision lasers to manipulate individual atomic qubit states.", renderer: "architecture" as RendererType },
  { title: "Photonic Quantum Computing", purpose: "Optical waveguides and linear optics", narration: "Photonic processors encode quantum information into flying photons, operating at room temperature without cryogenics.", renderer: "process" as RendererType },
  { title: "Quantum Phase Estimation", purpose: "Eigenvalue estimation algorithms", narration: "Quantum Phase Estimation provides polynomial speedups for estimating energy eigenvalues in physical quantum chemistry.", renderer: "equation" as RendererType },
  { title: "Shor's Factoring Algorithm", purpose: "Exponential speedup in prime factorization", narration: "Shor's algorithm leverages quantum Fourier transforms to factor large composite integers in polynomial time.", renderer: "chart" as RendererType },
  { title: "Grover's Quantum Search", purpose: "Quadratic speedup in unstructured search", narration: "Grover's algorithm amplifies probability amplitudes to search unstructured databases with quadratic speedup.", renderer: "process" as RendererType },
  { title: "Variational Quantum Eigensolver (VQE)", purpose: "Hybrid quantum-classical optimization", narration: "VQE combines noisy intermediate-scale quantum devices with classical optimizers to model molecular ground states.", renderer: "comparison" as RendererType },
  { title: "Quantum Error Correction", purpose: "Surface codes and logical qubits", narration: "Surface codes combine multiple physical qubits into fault-tolerant logical qubits, protecting against phase and bit flips.", renderer: "hierarchy" as RendererType },
  { title: "Topological Qubits & Anyons", purpose: "Braiding non-Abelian anyons", narration: "Topological quantum computing encodes information into non-local braids of anyons, offering innate hardware protection.", renderer: "simulation" as RendererType },
  { title: "Quantum Simulation of Molecules", purpose: "Simulating complex chemical reactions", narration: "Quantum computers simulate complex protein folding and catalytic reactions beyond the reach of classical supercomputers.", renderer: "hero3d" as RendererType },
  { title: "Quantum Machine Learning (QML)", purpose: "Quantum kernel methods & neural networks", narration: "Quantum Machine Learning maps classical data into high-dimensional Hilbert feature spaces for enhanced classification.", renderer: "architecture" as RendererType },
  { title: "Quantum Supremacy Benchmarks", purpose: "Demonstrating quantum computational advantage", narration: "Quantum supremacy experiments demonstrate processors solving specialized sampling tasks millions of times faster than supercomputers.", renderer: "chart" as RendererType },
  { title: "Quantum Internet & Entangled Networks", purpose: "Global quantum repeater nodes", narration: "The future quantum internet links quantum computers via fiber-optic entangled repeaters, enabling distributed quantum processing.", renderer: "timeline" as RendererType },
  { title: "Future Horizons & Physical Frontiers", purpose: "Synthesis of quantum technology", narration: "As fault-tolerant quantum hardware matures, quantum technology promises to revolutionize material science, cryptography, and artificial intelligence.", renderer: "hero3d" as RendererType },
];

/** Dynamic topic analyzer for fallback planning */
function generateDynamicFallbackProject(prompt: string, targetDuration: VideoTargetDuration = "standard"): VideoProject {
  const lower = prompt.toLowerCase();
  const durConfig = DURATION_CONFIGS[targetDuration];

  const isFrenchRev = lower.includes("revolution") || lower.includes("french") || lower.includes("history") || lower.includes("bastille") || lower.includes("louis") || lower.includes("war");
  const isBackprop = lower.includes("backprop") || lower.includes("neural") || lower.includes("gradient") || lower.includes("chain rule") || lower.includes("deep learning") || lower.includes("loss");
  const isQuantum = lower.includes("quantum") || lower.includes("entangle") || lower.includes("superposition") || lower.includes("qubit") || lower.includes("physics");

  let sceneCount = 12;
  if (targetDuration === "deep_dive") sceneCount = 25;
  else if (targetDuration === "quick") sceneCount = 5;

  const sceneDur = durConfig.sceneDuration;

  const scenes = Array.from({ length: sceneCount }, (_, idx) => {
    const stepNum = idx + 1;

    let curr: { title: string; purpose: string; narration: string; renderer: RendererType } | null = null;
    if (isFrenchRev && idx < HISTORICAL_CURRICULUM.length) {
      curr = HISTORICAL_CURRICULUM[idx];
    } else if (isBackprop && idx < BACKPROPAGATION_CURRICULUM.length) {
      curr = BACKPROPAGATION_CURRICULUM[idx];
    } else if (isQuantum && idx < QUANTUM_PHYSICS_CURRICULUM.length) {
      curr = QUANTUM_PHYSICS_CURRICULUM[idx];
    }

    if (curr) {
      return {
        id: `scene-${Date.now()}-${stepNum}`,
        sceneNumber: stepNum,
        title: curr.title,
        purpose: curr.purpose,
        narration: curr.narration,
        duration: sceneDur,
        rendererType: curr.renderer,
        visualLanguage: {
          theme: "dark",
          primaryColor: "#6366F1",
          secondaryColor: "#8B5CF6",
          accentColor: "#38BDF8",
        },
        visualPrimitives: [
          {
            id: `vp-${stepNum}-1`,
            type: "box",
            label: curr.title.slice(0, 26),
            detail: curr.purpose.slice(0, 36),
            x: 0.3,
            y: 0.45,
          },
          {
            id: `vp-${stepNum}-2`,
            type: "node",
            label: `Key Mechanism`,
            detail: `Functional Property`,
            x: 0.7,
            y: 0.45,
          },
        ],
        animationBeats: [
          { timestamp: 0.1, action: "enter" as const, targetId: `vp-${stepNum}-1` },
          { timestamp: 0.5, action: "highlight" as const, targetId: `vp-${stepNum}-2` },
        ],
      };
    }

    let rType: RendererType = "process";
    if (idx % 4 === 0) rType = "timeline";
    else if (idx % 4 === 1) rType = "hierarchy";
    else if (idx % 4 === 2) rType = "architecture";
    else rType = "equation";

    const conversationalNarrations = [
      `Beginning with the core principles of ${prompt}, we observe how primary structural components interact within the system.`,
      `Examining the operational mechanics of ${prompt}, key functional transformations drive continuous system evolution.`,
      `Mathematical models and governing field equations provide the formal framework defining ${prompt}.`,
      `Experimental observations confirm theoretical predictions of ${prompt} across real-world environments.`,
      `Analyzing structural interdependencies, system parameters adapt to maintain equilibrium.`,
      `Advanced functional developments expand the practical capabilities of ${prompt} in modern applications.`,
    ];

    const uniqueTitle = `${prompt} — Component ${stepNum}`;
    const uniqueNarration = conversationalNarrations[idx % conversationalNarrations.length];

    return {
      id: `scene-${Date.now()}-${stepNum}`,
      sceneNumber: stepNum,
      title: uniqueTitle,
      purpose: `Operational aspect of ${prompt}`,
      narration: uniqueNarration,
      duration: sceneDur,
      rendererType: rType,
      visualLanguage: {
        theme: "dark",
        primaryColor: "#6366F1",
        secondaryColor: "#8B5CF6",
        accentColor: "#38BDF8",
      },
      visualPrimitives: [
        {
          id: `vp-${stepNum}-1`,
          type: "box",
          label: `${prompt.slice(0, 18)} Module`,
          detail: `Primary component`,
          x: 0.3,
          y: 0.45,
        },
        {
          id: `vp-${stepNum}-2`,
          type: "node",
          label: `System State`,
          detail: `Functional parameter`,
          x: 0.7,
          y: 0.45,
        },
      ],
      animationBeats: [
        { timestamp: 0.1, action: "enter" as const, targetId: `vp-${stepNum}-1` },
        { timestamp: 0.5, action: "highlight" as const, targetId: `vp-${stepNum}-2` },
      ],
    };
  });

  return {
    id: `project-${Date.now()}`,
    prompt,
    title: `${prompt} (${durConfig.label})`,
    learningObjective: `Comprehensive overview of ${prompt}`,
    audienceLevel: "intermediate",
    scenes,
    aspectRatio: "16:9",
    voiceover: "nova",
    bgMusic: "none",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

async function planWithGroq(prompt: string, apiKey: string, systemPrompt: string): Promise<VideoProject> {
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: "User Prompt: " + prompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    throw new Error(`Groq API Error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const rawJson = data.choices[0].message.content;
  return validateVideoProject(JSON.parse(rawJson), prompt);
}

function finalizeProject(proj: VideoProject, prompt: string, targetDuration: VideoTargetDuration = "standard"): VideoProject {
  const cleanScriptScenes = deduplicateAndEnrichScript(proj.scenes, prompt);

  // Enforce scene count by duration mode: Deep Dive = 20-25 scenes, Standard = 12-15 scenes, Quick = 5-6 scenes
  const targetCount = targetDuration === "deep_dive" ? 25 : targetDuration === "quick" ? 5 : 12;

  let finalScenes = cleanScriptScenes;

  // If AI generated fewer scenes than required for Deep Dive, expand to 25 full scenes!
  if (finalScenes.length < targetCount) {
    const fallbackProj = generateDynamicFallbackProject(prompt, targetDuration);
    finalScenes = fallbackProj.scenes;
  }

  // Auto-extend scene durations if narration script requires more speaking time!
  const extendedScenes = autoExtendSceneDurations(finalScenes);

  return {
    ...proj,
    scenes: extendedScenes,
  };
}

export async function planVideoProject(
  prompt: string,
  config: PlannerConfig = {}
): Promise<VideoProject> {
  const cleanPrompt = prompt.trim();
  const userKey = config.apiKey || getApiKey() || getGroqApiKey();
  const groqEnvKey = getGroqApiKey();
  const targetDuration = config.targetDuration || "standard";
  const durConfig = DURATION_CONFIGS[targetDuration];

  const systemPrompt = `
You are an expert educational video director, motion-graphics designer, and visual researcher.

Convert the user's topic ("${cleanPrompt}") into a visually rich, accurate, non-repetitive educational video plan.

Target Duration Mode: "${durConfig.label}" (${durConfig.description}).
Generate exactly ${durConfig.maxScenes} scenes. Each scene duration MUST be exactly ${durConfig.sceneDuration} seconds.

Return valid JSON only matching VideoProject structure.
`;

  // 1. Groq API Key
  if (userKey && userKey.startsWith("gsk_")) {
    try {
      const proj = await planWithGroq(cleanPrompt, userKey, systemPrompt);
      return finalizeProject(proj, cleanPrompt, targetDuration);
    } catch (err) {
      console.warn("Groq API error:", err);
    }
  }

  if (groqEnvKey) {
    try {
      const proj = await planWithGroq(cleanPrompt, groqEnvKey, systemPrompt);
      return finalizeProject(proj, cleanPrompt, targetDuration);
    } catch (err) {
      console.warn("Groq env key error:", err);
    }
  }

  // 2. Gemini API Key
  if (userKey && !userKey.startsWith("gsk_")) {
    const modelsToTry = [config.model || "gemini-2.0-flash", "gemini-1.5-flash"];

    for (const modelName of modelsToTry) {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${userKey}`;

      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          if (attempt > 0) {
            await sleep(1500 * attempt);
          }

          const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [
                {
                  role: "user",
                  parts: [{ text: systemPrompt + "\n\nUser Prompt: " + cleanPrompt }],
                },
              ],
              generationConfig: {
                response_mime_type: "application/json",
                temperature: 0.7,
              },
            }),
          });

          if (response.status === 429) {
            console.warn(`Gemini API 429 Rate Limit on ${modelName}, retrying...`);
            continue;
          }

          if (!response.ok) {
            throw new Error(`AI Planner API Error: ${response.status} ${response.statusText}`);
          }

          const data = await response.json();
          if (
            !data.candidates ||
            data.candidates.length === 0 ||
            !data.candidates[0].content ||
            !data.candidates[0].content.parts ||
            data.candidates[0].content.parts.length === 0
          ) {
            throw new Error("Invalid response from AI Planner: Empty candidate output.");
          }

          const rawJson = data.candidates[0].content.parts[0].text;
          const parsed = JSON.parse(rawJson);

          const validated = validateVideoProject(parsed, cleanPrompt);
          return finalizeProject(validated, cleanPrompt, targetDuration);
        } catch (err: any) {
          console.warn(`Gemini API model ${modelName} attempt ${attempt} failed:`, err);
        }
      }
    }
  }

  // 3. Fallback Dynamic Generator with Deep Dive 25-Scene Support
  const fallback = generateDynamicFallbackProject(cleanPrompt, targetDuration);
  return finalizeProject(fallback, cleanPrompt, targetDuration);
}
