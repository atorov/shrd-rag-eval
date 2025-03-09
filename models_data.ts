export default [
  {
    "name": "deepseek-r1:latest",
    "run_type": "local",
    "params": 7,
    "quant": true,
  },
  {
    "name": "llama3.2:1b",
    "run_type": "local",
    "params": 1,
    "quant": true,
  },
  {
    "name": "llama3.2:latest",
    "run_type": "local",
    "params": 3,
    "quant": true,
  },
  // {
  //   "name": "llama3.3:latest",
  //   "run_type": "local",
  //   "params": 70,
  //   "quant": true,
  // },
  {
    "name": "phi4:latest",
    "run_type": "local",
    "params": 14,
    "quant": true,
  },
  {
    "name": "qwen2.5:0.5b",
    "run_type": "local",
    "params": 0.5,
    "quant": true,
  },
  {
    "name": "qwen2.5:latest",
    "run_type": "local",
    "params": 7,
    "quant": true,
  },
  // {
  //   "name": "qwq",
  //   "run_type": "local",
  //   "params": 32,
  //   "quant": true,
  // },
] as const;
