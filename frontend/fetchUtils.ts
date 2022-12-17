export class FetchResponseError extends Error {
  response: Response;

  constructor(response: Response) {
    super(response.statusText);
    this.response = response;
  }
}

export async function fetchAndCheckStatus(...args: Parameters<typeof fetch>) {
  const response = await fetch(...args);

  if (response.status < 200 || response.status >= 400) {
    throw new FetchResponseError(response);
  }

  return response;
}

export async function fetchJSON(input: RequestInfo | URL, init?: RequestInit) {
  const response = await fetchAndCheckStatus(input, {
    ...init,
    headers: {
      Accept: "application/json",
      ...init?.headers,
    },
  });

  return await response.json();
}
