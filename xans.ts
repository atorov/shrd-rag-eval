const MODEL_DISPLAY_NAME = "YOUR MODEL DISPLAY NAME";

const xansText = Deno.readTextFileSync("xans.txt");
const xansData = xansText.split(";;;;").map((ans) => ans.trim()).filter(
  Boolean,
);

const genText = Deno.readTextFileSync("gen.out.json");
const genData = JSON.parse(genText) as Record<string, string>[];

let index = 0;
const updatedGenData = genData.map((gen) => {
  if (gen.displayName === MODEL_DISPLAY_NAME) {
    return {
      ...gen,
      completion: xansData[index++],
    };
  }
  return gen;
});

Deno.writeTextFileSync("gen.out.json", JSON.stringify(updatedGenData, null, 2));
