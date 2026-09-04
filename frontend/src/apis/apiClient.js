import ky from "ky";
import ENV from "../config/ENV";

export const apiClient = ky.create({
  baseUrl: ENV.BASEAPI,
  headers: {
    'Content-Type': 'application/json'
  },
  fetch: async (request, init) => {
    const start = performance.now();
    const response = await fetch(request, init);
    const duration = performance.now() - start;

    console.log(
        `${request.method} ${request.url} - ${response.status} (${Math.round(duration)}ms)`,
    );

    return response;
  },
});