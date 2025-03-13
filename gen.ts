import ollama from "ollama";
import modelsData from "./models_data.ts";

const qnaRegex = /<description>.*?<\/description>/gs;
const qnaText = Deno.readTextFileSync("qna.txt");
const qnaData = qnaText.replace(qnaRegex, "").trim().split(";;;").map((pair) =>
  pair.trim().split(";;").map((el) => el.trim()).filter(Boolean)
).filter(Boolean).filter((pair) => pair.length === 3);

console.log("Starting generation...\n");

for (const model of modelsData) {
  console.log(`\n::: model: ${model.name}, ${model.params}B`);

  const displayName = model.name.replace("latest", `${model.params}b`);

  let questionNumber = 0;
  for (const [question, shortAnswer, longAnswer] of qnaData) {
    questionNumber++;
    console.log("- Question:", questionNumber, question);
    // console.log("- Short answer:", shortAnswer);
    // console.log("- long answer:", longAnswer);

    const res = await ollama.generate({
      model: model.name,
      prompt: question,
      options: {
        num_ctx: 16 * 1024,
      },
    });
    const regex = /<think>.*?<\/think>/gs;
    const completion = res.response.replace(regex, "").trim();
    // console.log("- Completion:", completion);

    const row = displayName + ";;;" + Object.values(model).join(";;;") + ";;;" +
      question + ";;;" +
      shortAnswer + ";;;" +
      longAnswer + ";;;" + completion + ";;;;\n";
    Deno.writeTextFileSync("gen.out.txt", row, { append: true });
  }
}

const resText = Deno.readTextFileSync("gen.out.txt");
const resData = resText.split(";;;;").map((row) =>
  row.trim().split(";;;").map((el) => el.trim()).filter(Boolean)
).filter(Boolean).filter((row) => row.length === 9).reduce((acc, it) => {
  const [
    displayName,
    name,
    run_type,
    params,
    quant,
    question,
    shortAnswer,
    longAnswer,
    completion,
  ] = it;
  return [...acc, {
    displayName,
    name,
    run_type,
    params,
    quant,
    question,
    shortAnswer,
    longAnswer,
    completion,
  }];
}, [] as Record<string, string>[]);
Deno.writeTextFileSync("gen.out.json", JSON.stringify(resData, null, 2), {
  append: false,
});

console.log("\nGeneration complete!\n");
