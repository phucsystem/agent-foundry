import { describe, it, expect, beforeEach } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "../mocks/server";
import { apiClient, apiPost, setAccessToken } from "@/lib/api-client";

const API_BASE = "http://localhost:8000";

describe("apiClient", () => {
  beforeEach(() => {
    setAccessToken(null);
  });

  it("fetches data from endpoint", async () => {
    server.use(
      http.get(`${API_BASE}/api/test`, () => {
        return HttpResponse.json({ message: "ok" });
      })
    );

    const result = await apiClient<{ message: string }>("/api/test");
    expect(result.message).toBe("ok");
  });

  it("appends query params when provided", async () => {
    server.use(
      http.get(`${API_BASE}/api/search`, ({ request }) => {
        const url = new URL(request.url);
        return HttpResponse.json({ query: url.searchParams.get("q") });
      })
    );

    const result = await apiClient<{ query: string }>("/api/search", {
      params: { q: "hello" },
    });
    expect(result.query).toBe("hello");
  });

  it("includes auth header when access token is set", async () => {
    setAccessToken("my-token");

    server.use(
      http.get(`${API_BASE}/api/protected`, ({ request }) => {
        const authHeader = request.headers.get("Authorization");
        return HttpResponse.json({ auth: authHeader });
      })
    );

    const result = await apiClient<{ auth: string }>("/api/protected");
    expect(result.auth).toBe("Bearer my-token");
  });

  it("throws on non-ok response", async () => {
    server.use(
      http.get(`${API_BASE}/api/fail`, () => {
        return new HttpResponse("Not found", { status: 404 });
      })
    );

    await expect(apiClient("/api/fail")).rejects.toThrow("API error 404");
  });
});

describe("apiPost", () => {
  beforeEach(() => {
    setAccessToken(null);
  });

  it("posts JSON body to endpoint", async () => {
    server.use(
      http.post(`${API_BASE}/api/create`, async ({ request }) => {
        const body = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json({ received: body });
      })
    );

    const result = await apiPost<{ received: { name: string } }>(
      "/api/create",
      { name: "test" }
    );
    expect(result.received.name).toBe("test");
  });

  it("includes auth header when token is set", async () => {
    setAccessToken("post-token");

    server.use(
      http.post(`${API_BASE}/api/auth-post`, ({ request }) => {
        return HttpResponse.json({
          auth: request.headers.get("Authorization"),
        });
      })
    );

    const result = await apiPost<{ auth: string }>("/api/auth-post", {});
    expect(result.auth).toBe("Bearer post-token");
  });

  it("throws on non-ok response", async () => {
    server.use(
      http.post(`${API_BASE}/api/fail-post`, () => {
        return new HttpResponse("Server error", { status: 500 });
      })
    );

    await expect(apiPost("/api/fail-post", {})).rejects.toThrow(
      "API error 500"
    );
  });
});
