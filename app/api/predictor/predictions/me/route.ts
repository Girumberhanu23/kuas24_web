import { proxyPredictorRequest } from "../../../../lib/predictor-proxy";

export async function GET(request: Request) {
  return proxyPredictorRequest(request, "predictions/me", "GET");
}
