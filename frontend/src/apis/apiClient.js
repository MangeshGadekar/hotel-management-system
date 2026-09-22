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
    console.log("response", response)
    const duration = performance.now() - start;

    console.log("request", init)

    console.log(
        `${request.method} ${request.url} - ${response.status} (${Math.round(duration)}ms)`,
    );

    return response;
  },
});