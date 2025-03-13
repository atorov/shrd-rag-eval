const evalText = Deno.readTextFileSync('eval.json');
const evalData = JSON.parse(evalText) as {
  displayName: string;
  name: string;
  run_type: string;
  params: string;
  quant: string;
  question: string;
  shortAnswer: string;
  longAnswer: string;
  completion: string;
  evalItem: {
    correctness: number;
    completeness: number;
    coherenceAndClarity: number;
    relevance: number;
  };
}[];

type GroupedEvalData = {
  [displayName: string]: {
    evalItems: {
      correctness: number;
      completeness: number;
      coherenceAndClarity: number;
      relevance: number;
      totalScore: number;
    };
  };
};

function groupEvalDataByDisplayName(data: typeof evalData): GroupedEvalData {
  const result: GroupedEvalData = {};

  // Organize data by displayName
  const groupedByName = data.reduce<Record<string, typeof evalData>>(
    (acc, item) => {
      if (!acc[item.displayName]) {
        acc[item.displayName] = [];
      }
      acc[item.displayName].push(item);
      return acc;
    },
    {}
  );

  // Calculate averages for each group
  Object.entries(groupedByName).forEach(([displayName, items]) => {
    const count = items.length;

    // Sum up all metrics
    const sums = items.reduce(
      (acc, item) => ({
        correctness: acc.correctness + item.evalItem.correctness,
        completeness: acc.completeness + item.evalItem.completeness,
        coherenceAndClarity:
          acc.coherenceAndClarity + item.evalItem.coherenceAndClarity,
        relevance: acc.relevance + item.evalItem.relevance,
      }),
      {
        correctness: 0,
        completeness: 0,
        coherenceAndClarity: 0,
        relevance: 0,
      }
    );

    // Calculate averages (0-5 scale)
    const correctnessAvg = sums.correctness / count;
    const completenessAvg = sums.completeness / count;
    const coherenceAndClarityAvg = sums.coherenceAndClarity / count;
    const relevanceAvg = sums.relevance / count;

    // Convert from 0-5 scale to 0-100 scale and round to whole numbers
    const correctnessScaled = Math.round((correctnessAvg / 5) * 100);
    const completenessScaled = Math.round((completenessAvg / 5) * 100);
    const coherenceAndClarityScaled = Math.round(
      (coherenceAndClarityAvg / 5) * 100
    );
    const relevanceScaled = Math.round((relevanceAvg / 5) * 100);

    // Calculate total score (excluding completeness) on 0-100 scale and round to whole number
    const totalScore = Math.round(
      (correctnessScaled + coherenceAndClarityScaled + relevanceScaled) / 3
    );

    result[displayName] = {
      evalItems: {
        correctness: correctnessScaled,
        completeness: completenessScaled,
        coherenceAndClarity: coherenceAndClarityScaled,
        relevance: relevanceScaled,
        totalScore: totalScore,
      },
    };
  });

  return result;
}

const summary = groupEvalDataByDisplayName(evalData);
const sortedSummary = Object.entries(summary)
  .sort((a, b) => b[1].evalItems.totalScore - a[1].evalItems.totalScore)
  .reduce((acc, [displayName, data]) => {
    acc[displayName] = data;
    return acc;
  }, {} as GroupedEvalData);

// Convert the sorted summary to CSV
function convertToCSV(data: GroupedEvalData): string {
  // CSV header
  const csvHeader =
    'Model,Correctness,Completeness,Coherence and Clarity,Relevance,Total Score\n';
  // CSV rows
  const csvRows = Object.entries(data)
    .map(([displayName, model]) => {
      const {
        correctness,
        completeness,
        coherenceAndClarity,
        relevance,
        totalScore,
      } = model.evalItems;
      return `"${displayName}",${correctness},${completeness},${coherenceAndClarity},${relevance},${totalScore}`;
    })
    .join('\n');

  return csvHeader + csvRows;
}
console.log(sortedSummary);

// Generate CSV string from the sorted summary
const csvContent = convertToCSV(sortedSummary);
Deno.writeTextFileSync('model_evaluation_summary.csv', csvContent);
console.log(csvContent);
