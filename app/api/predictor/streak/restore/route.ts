import { proxyPredictorRequest } from "../../../../lib/predictor-proxy";

export async function POST(request: Request) {
  return proxyPredictorRequest(request, "streak/restore", "POST");
}
