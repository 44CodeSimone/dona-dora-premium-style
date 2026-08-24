import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  return {
    createClient: vi.fn(),
    from: vi.fn(),
    getClaims: vi.fn(),
    getRequest: vi.fn(),
    next: vi.fn(),
  };
});

vi.mock("@tanstack/react-start", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@tanstack/react-start")>()),
  createMiddleware: () => ({
    server: (handler: (args: any) => Promise<unknown>) => ({ handler }),
  }),
}));

vi.mock("@tanstack/react-start/server", () => ({ getRequest: mocks.getRequest }));
vi.mock("@supabase/supabase-js", () => ({ createClient: mocks.createClient }));
vi.mock("@/integrations/supabase/client.server", () => ({ supabaseAdmin: { from: mocks.from } }));

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { assertAdmin } from "../admin.functions";
import { getOrdersForAuthenticatedCustomer } from "../account.functions";
import { createOrderForAuthenticatedCustomer, orderSchema } from "../site.functions";

const originalEnv = {
  publishableKey: process.env.SUPABASE_PUBLISHABLE_KEY,
  url: process.env.SUPABASE_URL,
};

function query(result: unknown) {
  const builder: any = {
    eq: vi.fn(() => builder),
    in: vi.fn(() => builder),
    insert: vi.fn(() => builder),
    limit: vi.fn(() => builder),
    maybeSingle: vi.fn(async () => result),
    order: vi.fn(() => builder),
    select: vi.fn(() => builder),
    single: vi.fn(async () => result),
    then: (resolve: (value: unknown) => unknown, reject: (reason: unknown) => unknown) =>
      Promise.resolve(result).then(resolve, reject),
  };
  return builder;
}

beforeAll(() => {
  process.env.SUPABASE_URL = "https://example.supabase.co";
  process.env.SUPABASE_PUBLISHABLE_KEY = "test-publishable-key";
});

afterAll(() => {
  if (originalEnv.url === undefined) delete process.env.SUPABASE_URL;
  else process.env.SUPABASE_URL = originalEnv.url;
  if (originalEnv.publishableKey === undefined) delete process.env.SUPABASE_PUBLISHABLE_KEY;
  else process.env.SUPABASE_PUBLISHABLE_KEY = originalEnv.publishableKey;
});

beforeEach(() => {
  mocks.createClient.mockReset();
  mocks.from.mockReset();
  mocks.getClaims.mockReset();
  mocks.getRequest.mockReset();
  mocks.next.mockReset();
});

describe("Authentication, authorization, and identity invariants (P1.2)", () => {
  it("INV-12. The real auth boundary rejects a request without a Bearer token", async () => {
    mocks.getRequest.mockReturnValue(new Request("https://dona-dora.test/api/orders"));

    await expect((requireSupabaseAuth as any).handler({ next: mocks.next })).rejects.toThrow(
      "Unauthorized: No authorization header provided",
    );
    expect(mocks.createClient).not.toHaveBeenCalled();
    expect(mocks.next).not.toHaveBeenCalled();
  });

  it("INV-12. The real auth boundary forwards only verified claims and user identity", async () => {
    const claims = { sub: "2e4b35fa-07e6-4e0c-bd51-6f92b10491d1", email: "simone@donadora.com.br" };
    mocks.getRequest.mockReturnValue(
      new Request("https://dona-dora.test/api/orders", { headers: { authorization: "Bearer verified-token" } }),
    );
    mocks.createClient.mockReturnValue({ auth: { getClaims: mocks.getClaims } });
    mocks.getClaims.mockResolvedValue({ data: { claims }, error: null });
    mocks.next.mockImplementation(async ({ context }) => context);

    await expect((requireSupabaseAuth as any).handler({ next: mocks.next })).resolves.toEqual({
      claims,
      supabase: expect.any(Object),
      userId: claims.sub,
    });
    expect(mocks.getClaims).toHaveBeenCalledWith("verified-token");
  });

  it("INV-13. createOrder persists the authenticated email, never a client-supplied email", async () => {
    const product = {
      id: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
      name: "Vestido Luxe Dourado",
      price: 350,
      promo: false,
      promo_price: null,
      available: true,
      stock: 10,
      sizes: [],
      colors: [],
    };
    const products = query({ data: [product], error: null });
    const inserted = query({ data: { id: "order-1" }, error: null });
    mocks.from.mockReturnValueOnce(products).mockReturnValueOnce(inserted);

    const parsed = orderSchema.parse({
      customer_name: "Simone VIP",
      customer_whatsapp: "11999998888",
      customer_email: "hacker@malicious.com",
      items: [{ product_id: product.id, qty: 1 }],
    });
    expect(parsed).not.toHaveProperty("customer_email");

    await createOrderForAuthenticatedCustomer(parsed, {
      claims: { email: "simone@donadora.com.br" },
    });

    expect(inserted.insert).toHaveBeenCalledWith(
      expect.objectContaining({ customer_email: "simone@donadora.com.br" }),
    );
    expect(inserted.insert).not.toHaveBeenCalledWith(
      expect.objectContaining({ customer_email: "hacker@malicious.com" }),
    );
  });

  it("Customer order history is isolated by the authenticated email", async () => {
    const orders = query({ data: [], error: null });
    mocks.from.mockReturnValue(orders);

    await getOrdersForAuthenticatedCustomer({ claims: { email: "customer-a@donadora.com.br" } });

    expect(mocks.from).toHaveBeenCalledWith("orders");
    expect(orders.eq).toHaveBeenCalledWith("customer_email", "customer-a@donadora.com.br");
    expect(orders.eq).not.toHaveBeenCalledWith("customer_email", "customer-b@donadora.com.br");
  });

  it("RBAC rejects a non-admin", async () => {
    const roles = query({ data: null, error: null });
    mocks.from.mockReturnValue(roles);

    await expect(
      assertAdmin("customer-id"),
    ).rejects.toThrow("Forbidden: admin required");

    expect(mocks.from).toHaveBeenCalledTimes(1);
    expect(mocks.from).toHaveBeenCalledWith("user_roles");
    expect(roles.eq).toHaveBeenNthCalledWith(1, "user_id", "customer-id");
    expect(roles.eq).toHaveBeenNthCalledWith(2, "role", "admin");
  });

  it("RBAC permits a verified admin", async () => {
    const roles = query({ data: { role: "admin" }, error: null });
    mocks.from.mockReturnValue(roles);

    await expect(assertAdmin("admin-id")).resolves.toBeUndefined();

    expect(mocks.from).toHaveBeenNthCalledWith(1, "user_roles");
  });
});
