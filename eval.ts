import ollama from "ollama";

const genText = Deno.readTextFileSync("gen.out.json");
const genData = JSON.parse(genText) as Record<string, string>[];

let index = 0;
const evalData = [] as typeof genData;
for await (const gen of genData) {
  console.log(
    "\n::: Itterating over gen: ",
    index + 1,
    "/",
    genData.length,
    gen.displayName,
  );
  console.log("Question:", gen.question);

  const res = await ollama.generate({
    model: "llama3.3:latest",
    prompt: `
You are an expert evaluator responsible for assessing AI-generated answers. Given a reference answer and a model-generated answer, evaluate the model's response using the following criteria:
1. Correctness (0-5): 
  - Does the answer contain factually correct information?  
  - Does it align with the reference answer in terms of key facts and details?  
2. Completeness (0-5):  
  - Does the answer cover all key aspects of the reference answer?  
  - Does it miss any important details or provide an incomplete explanation?  
3. Coherence & Clarity (0-5):  
  - Is the answer well-structured, readable, and easy to understand?  
  - Does it avoid ambiguity or unnecessary complexity?  
4. Relevance (0-5):  
  - Does the answer directly address the question?  
  - Does it stay on-topic without adding irrelevant information?  
## Instructions:  
- Provide only the evaluation result in **structured JSON format** with no explanations.  
- Do **not** include any additional text outside the JSON format.  
- Ensure that all numerical values are **integers between 0 and 5**.  
## Input Data:  
- Reference Answer:
"""
${gen.longAnswer}
"""
- Model Answer:
"""
${gen.completion}
"""
\`\`\`
## Example Output:
\`\`\`
{
  correctness": 5,
  "completeness": 4,
  "coherenceAndClarity": 5,
  "relevance": 5
}
\`\`\`
Ensure the output strictly follows the above format, with no additional text or explanation.
`,
    options: {
      num_ctx: 8 * 1024,
    },
    format: {
      "$schema": "https://json-schema.org/draft/2020-12/schema",
      "type": "object",
      "properties": {
        "correctness": {
          "type": "integer",
          "minimum": 0,
          "maximum": 5,
        },
        "completeness": {
          "type": "integer",
          "minimum": 0,
          "maximum": 5,
        },
        "coherenceAndClarity": {
          "type": "integer",
          "minimum": 0,
          "maximum": 5,
        },
        "relevance": {
          "type": "integer",
          "minimum": 0,
          "maximum": 5,
        },
      },
      "required": [
        "correctness",
        "completeness",
        "coherenceAndClarity",
        "relevance",
      ],
    },
  });

  const evalItem = JSON.parse(res.response);
  evalData.push({ ...gen, evalItem });
  Deno.writeTextFileSync(
    "eval.json",
    JSON.stringify(evalData, null, 2),
    { append: false },
  );

  index++;
}
