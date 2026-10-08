// Makes the local SQLite database behave more like a real remote API,
// so loading states and failed mutations can be tested. Both are off by default.
const LATENCY_MS = Number(process.env.MOCK_LATENCY_MS ?? 0);
const FAILURE_RATE = Number(process.env.MOCK_FAILURE_RATE ?? 0);

export async function simulateLatency() {
  if (LATENCY_MS > 0) {
    await new Promise((resolve) => setTimeout(resolve, LATENCY_MS));
  }
}

export function simulateFailure() {
  if (Math.random() < FAILURE_RATE) {
    throw new Error("Simulated API failure (MOCK_FAILURE_RATE)");
  }
}
