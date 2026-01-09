// Implemented Genkit flow for visualizing mathematical equations as graphs.

'use server';

/**
 * @fileOverview Visualizes a mathematical equation as a graph.
 *
 * - visualizeEquation - A function that handles the equation visualization process.
 * - VisualizeEquationInput - The input type for the visualizeEquation function.
 * - VisualizeEquationOutput - The return type for the visualizeEquation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const VisualizeEquationInputSchema = z.object({
  equation: z.string().describe('The mathematical equation to visualize (e.g., y = x^2).'),
});
export type VisualizeEquationInput = z.infer<typeof VisualizeEquationInputSchema>;

const VisualizeEquationOutputSchema = z.object({
  visualizationType: z
    .enum(['chart.js', 'canvas', 'suggestions'])
    .describe(
      'The method used for visualization: chart.js for a standard chart, canvas for more custom plots, or suggestions if the equation cannot be plotted directly.'
    ),
  graphData: z.string().optional().describe('Data for the graph, format depends on visualizationType.'),
  errorMessage: z.string().optional().describe('Error message if the equation is invalid or cannot be plotted.'),
  suggestions: z.array(z.string()).optional().describe('Alternative suggestions for the equation if it is invalid.'),
});
export type VisualizeEquationOutput = z.infer<typeof VisualizeEquationOutputSchema>;

export async function visualizeEquation(input: VisualizeEquationInput): Promise<VisualizeEquationOutput> {
  return visualizeEquationFlow(input);
}

const visualizeEquationPrompt = ai.definePrompt({
  name: 'visualizeEquationPrompt',
  input: {schema: VisualizeEquationInputSchema},
  output: {schema: VisualizeEquationOutputSchema},
  prompt: `You are a graphing calculator AI. You take a mathematical equation as input and determine how best to visualize it.  You can choose to use chart.js, canvas, or offer correction suggestions.

Equation: {{{equation}}}

If the equation is plottable, return visualizationType and graphData. If the equation is not valid, return visualizationType as suggestions and provide suggestions. If there is any error, set errorMessage.

Ensure that graphData contains proper data based on visualizationType.
`,
});

const visualizeEquationFlow = ai.defineFlow(
  {
    name: 'visualizeEquationFlow',
    inputSchema: VisualizeEquationInputSchema,
    outputSchema: VisualizeEquationOutputSchema,
  },
  async input => {
    try {
      const {output} = await visualizeEquationPrompt(input);
      return output!;
    } catch (error: any) {
      console.error('Error visualizing equation:', error);
      return {
        visualizationType: 'suggestions',
        suggestions: ['Check the equation syntax.', 'Try a simpler equation.'],
        errorMessage: error.message || 'Failed to visualize equation.',
      };
    }
  }
);
