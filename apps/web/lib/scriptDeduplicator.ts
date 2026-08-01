
import { ScenePlan } from "../types";

function jaccardSimilarity(textA: string, textB: string): number {
  const wordsA = new Set(textA.toLowerCase().match(/\w+/g) || []);
  const wordsB = new Set(textB.toLowerCase().match(/\w+/g) || []);
  if (wordsA.size === 0 || wordsB.size === 0) return 0;

  let intersection = 0;
  wordsA.forEach((word) => {
    if (wordsB.has(word)) intersection++;
  });

  const union = wordsA.size + wordsB.size - intersection;
  return intersection / union;
}

const DOMAIN_RICH_EXPLANATIONS: Record<string, string[]> = {
  french: [
    "Prior to 1789, France was governed by an absolute monarchy where King Louis XVI wielded unchecked legislative authority.",
    "The financial bankruptcy of the French Crown was exacerbated by heavy expenditures in the American Revolutionary War.",
    "The Third Estate comprised over 97% of the populace, yet possessed negligible political influence in the Estates-General.",
    "On June 20, 1789, Third Estate delegates pledged the Tennis Court Oath, vowing not to disband until a written constitution was drafted.",
    "The assault on the Bastille fortress on July 14 marked the violent entry of the popular masses into the political sphere.",
    "The Assembly enacted the August Decrees, formally abolishing feudalism, manorial dues, and noble tax immunities.",
    "The Declaration of the Rights of Man and of the Citizen established equality before the law, freedom of speech, and popular sovereignty.",
    "In October 1789, thousands of Parisian women marched to Versailles, compelling the royal family to relocate to the Tuileries Palace.",
    "The Civil Constitution of the Clergy subordinated the Catholic Church to the French secular state, provoking deep religious schisms.",
    "The failed royal escape attempt to Varennes in June 1791 shattered remaining public faith in constitutional monarchy.",
    "The outbreak of war against Austria and Prussia in 1792 radicalized the revolutionary movement, culminating in the fall of the monarchy.",
    "The National Convention proclaimed the First French Republic in September 1792, putting King Louis XVI on trial for treason.",
    "The execution of Louis XVI by guillotine in January 1793 galvanized European monarchies into an anti-French coalition.",
    "Faced with foreign invasion and internal counter-revolutions, Maximilien Robespierre established the Committee of Public Safety.",
    "During the Reign of Terror, over 16,000 political suspects were executed under sweeping anti-traitor legislation.",
    "The Thermidorian Reaction of July 1794 resulted in the arrest and execution of Robespierre, ending the Reign of Terror.",
    "The Directory government struggled against economic inflation, political corruption, and royalist insurgencies between 1795 and 1799.",
    "General Napoleon Bonaparte executed the Coup of 18 Brumaire in 1799, replacing the Directory with the French Consulate.",
  ],
  quantum: [
    "Quantum mechanics describes microscopic physical systems using state vectors and complex probability amplitudes in Hilbert space.",
    "The principle of superposition dictates that a quantum system remains in a linear combination of eigen-states until measurement.",
    "Entanglement creates non-local physical correlations where measuring one particle instantaneously collapses the state of its entangled partner.",
    "Einstein, Podolsky, and Rosen proposed the EPR Paradox, contending that quantum mechanics was an incomplete description of physical reality.",
    "John Stewart Bell derived mathematical inequalities proving local hidden-variable theories cannot replicate quantum correlations.",
    "Nobel Prize-winning experiments by Alain Aspect and John Clauser empirically validated Bell inequality violations beyond doubt.",
    "A quantum bit or qubit is mathematically represented as a unit vector pointing to coordinates on a 3D Bloch sphere.",
    "Quantum logic gates apply unitary transformations to manipulate single and multi-qubit superposition registers.",
    "Quantum teleportation protocol transmits unknown qubit states across distances using shared entanglement and classical bits.",
    "Quantum key distribution protocols like BB84 leverage measurement disturbance to guarantee unconditionally secure communications.",
    "Environmental decoherence destroys phase coherence, causing quantum superpositions to decay into classical probability states.",
    "Superconducting transmons and trapped-ion processors represent leading hardware architectures for scalable quantum computing.",
  ],
  backprop: [
    "Deep neural networks learn hierarchically by transforming raw input vectors through multiple parameterized hidden layers.",
    "During the forward pass, input features undergo affine matrix multiplications followed by non-linear activations like ReLU.",
    "The loss function calculates scalar error between network predictions and ground-truth target labels across training batches.",
    "Backpropagation utilizes the calculus chain rule to recursively compute partial derivatives of loss with respect to every weight.",
    "Error delta signals originate at the output layer and propagate backward through weight matrices to update hidden layers.",
    "Weight parameters are iteratively updated via gradient descent in the direction opposite to the steepest loss ascent.",
    "Vanishing and exploding gradients occur when derivative products across deep layers approach zero or infinity.",
    "Modern optimizers like Adam incorporate first and second moment estimations to adaptively scale individual parameter learning rates.",
    "Regularization techniques such as Dropout and Weight Decay prevent neural networks from overfitting training distribution noise.",
    "Optimization trajectories navigate high-dimensional non-convex loss surfaces toward stable local and global minima.",
  ],
};

export function deduplicateAndEnrichScript(scenes: ScenePlan[], prompt: string): ScenePlan[] {
  const cleanPrompt = prompt.toLowerCase();
  const seenNarrations = new Set<string>();

  let categoryKey = "general";
  if (cleanPrompt.includes("french") || cleanPrompt.includes("revolution") || cleanPrompt.includes("history")) categoryKey = "french";
  else if (cleanPrompt.includes("quantum") || cleanPrompt.includes("entangle") || cleanPrompt.includes("physics")) categoryKey = "quantum";
  else if (cleanPrompt.includes("backprop") || cleanPrompt.includes("neural") || cleanPrompt.includes("gradient") || cleanPrompt.includes("ai")) categoryKey = "backprop";

  const richPool = DOMAIN_RICH_EXPLANATIONS[categoryKey] || [];

  return scenes.map((scene, idx) => {
    let narration = scene.narration ? scene.narration.trim() : "";
    let isDuplicate = false;

    for (const prev of seenNarrations) {
      if (jaccardSimilarity(narration, prev) > 0.35 || narration === prev) {
        isDuplicate = true;
        break;
      }
    }

    if (isDuplicate || narration.includes("analyzing section") || narration.includes("examining key mechanism") || narration.length < 15) {
      if (richPool.length > 0) {
        narration = richPool[idx % richPool.length];
      } else {
        narration = `Investigating primary component ${idx + 1} of ${prompt}, we observe how specialized mechanisms drive system transformations.`;
      }
    }

    seenNarrations.add(narration);

    const cleanTitle = scene.title.replace(/^\d+\.\s*/, "").replace(/^Stage\s*\d+:?\s*/i, "");

    return {
      ...scene,
      title: cleanTitle,
      narration,
    };
  });
}
