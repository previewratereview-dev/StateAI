import { vi, describe, it, expect, beforeEach } from 'vitest';

// Ensure the feature flag is enabled during tests
process.env.AUTO_CREATE_DEALS_ON_STATUS = 'true';

// Mocks for auth and supabase-admin
const requireAuthMock = vi.fn(async () => ({ id: 'user-1', role: 'sales' }));
vi.mock('@/lib/auth', () => ({ requireAuth: requireAuthMock }));

// We'll capture whether a deals.insert was called
let dealsInsertSpy: any = null;

const mockSupabaseAdmin = {
  from: vi.fn((table: string) => {
    if (table === 'contacts') {
      return {
        select: (sel?: string) => ({
          eq: (col: string, val: any) => ({
            single: async () => ({ data: { status: 'new', assigned_to: null, first_name: 'Test', last_name: 'User', company: 'Acme' }, error: null }),
          }),
        }),
        update: (payload: any) => ({ eq: async (col: string, val: any) => ({ error: null }) }),
      };
    }

    if (table === 'activities') {
      return {
        insert: async (payload: any) => ({ error: null }),
        select: (sel?: string, opts?: any) => ({ eq: async (col: string, val: any) => ({ count: 0 }) }),
      };
    }

    if (table === 'contact_status_history') {
      return {
        insert: async (payload: any) => ({ error: null }),
      };
    }

    if (table === 'deals') {
      dealsInsertSpy = vi.fn((payload: any) => ({
        select: () => ({ single: async () => ({ data: { id: 'new-deal-id', title: payload.title }, error: null }) }),
      }));
      return {
        select: (_sel?: string) => ({ eq: async (_col: string, _val: any) => ({ data: [] }) }),
        insert: dealsInsertSpy,
      };
    }

    // default
    return {
      select: (_sel?: string) => ({ eq: async (_col: string, _val: any) => ({ data: [] }) }),
      insert: async (_payload: any) => ({ error: null }),
      update: (_payload: any) => ({ eq: async (_col: string, _val: any) => ({ error: null }) }),
    };
  }),
};

vi.mock('@/lib/supabase-admin', () => ({ supabaseAdmin: mockSupabaseAdmin }));

// Import the function under test after mocking
import { updateContactStatus } from '@/app/actions/interactions';

describe('updateContactStatus auto-create', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    dealsInsertSpy = null;
  });

  it('creates a deal when contact moves to qualified and no active deals exist', async () => {
    const res = await updateContactStatus('contact-1', 'qualified');
    expect(res.success).toBe(true);
    expect(mockSupabaseAdmin.from).toHaveBeenCalled();
    expect(dealsInsertSpy).toBeTruthy();
    expect(dealsInsertSpy).toHaveBeenCalled();
  });
});
