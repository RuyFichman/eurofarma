import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'

const mocks = vi.hoisted(() => ({ record: vi.fn() }))

vi.mock('../../lib/db/queries/notification-delivery-status-events', () => ({
  recordZapiDeliveryStatusEvent: mocks.record,
}))

import { POST } from '../../app/api/whatsapp/zapi/status/[secret]/route'
import { extractZapiDeliveryStatusEvents } from '../../lib/whatsapp/zapi-status-payload'

const secret = 'local-test-secret'
const instanceId = 'zapi-instance'

function payload(overrides: Record<string, unknown> = {}) {
  return {
    type: 'MessageStatusCallback',
    instanceId,
    status: 'RECEIVED',
    ids: ['zapi-message-1'],
    isGroup: false,
    phone: '5511999998888',
    ...overrides,
  }
}

function request(body: unknown): NextRequest {
  return new NextRequest(
    `https://nutrilink.test/api/whatsapp/zapi/status/${secret}`,
    {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    },
  )
}

function post(body: unknown, routeSecret = secret) {
  return POST(request(body), {
    params: Promise.resolve({ secret: routeSecret }),
  })
}

describe('callback de status da Z-API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubEnv('ZAPI_WEBHOOK_SECRET', secret)
    vi.stubEnv('ZAPI_INSTANCE_ID', instanceId)
    mocks.record.mockResolvedValue(undefined)
  })

  afterEach(() => vi.unstubAllEnvs())

  it('mapeia os estados conhecidos sem preservar telefone', () => {
    expect(
      extractZapiDeliveryStatusEvents(payload({ status: 'SENT' }), instanceId),
    ).toEqual([
      {
        providerMessageId: 'zapi-message-1',
        status: 'SENT',
        errorCode: null,
      },
    ])
    expect(
      extractZapiDeliveryStatusEvents(
        payload({ status: 'RECEIVED' }),
        instanceId,
      ),
    ).toEqual([
      {
        providerMessageId: 'zapi-message-1',
        status: 'DELIVERED',
        errorCode: null,
      },
    ])
    expect(
      extractZapiDeliveryStatusEvents(payload({ status: 'READ' }), instanceId),
    ).toEqual([
      {
        providerMessageId: 'zapi-message-1',
        status: 'READ',
        errorCode: null,
      },
    ])
    expect(
      extractZapiDeliveryStatusEvents(
        payload({ status: 'DELIVERED' }),
        instanceId,
      ),
    ).toEqual([
      {
        providerMessageId: 'zapi-message-1',
        status: 'DELIVERED',
        errorCode: null,
      },
    ])
    expect(
      extractZapiDeliveryStatusEvents(
        payload({ status: 'FAILED' }),
        instanceId,
      ),
    ).toEqual([
      {
        providerMessageId: 'zapi-message-1',
        status: 'FAILED',
        errorCode: null,
      },
    ])
  })

  it('descarta grupo, instância diferente e payload que não é status', () => {
    expect(
      extractZapiDeliveryStatusEvents(payload({ isGroup: true }), instanceId),
    ).toEqual([])
    expect(
      extractZapiDeliveryStatusEvents(
        payload({ instanceId: 'other' }),
        instanceId,
      ),
    ).toEqual([])
    expect(
      extractZapiDeliveryStatusEvents(
        payload({ type: 'ReceivedCallback' }),
        instanceId,
      ),
    ).toEqual([])
  })

  it('registra cada id do callback como evento append-only', async () => {
    const response = await post(
      payload({ ids: ['zapi-sent-1', 'zapi-sent-2'] }),
    )

    expect(response.status).toBe(200)
    expect(mocks.record).toHaveBeenNthCalledWith(1, {
      providerMessageId: 'zapi-sent-1',
      status: 'DELIVERED',
      errorCode: null,
    })
    expect(mocks.record).toHaveBeenNthCalledWith(2, {
      providerMessageId: 'zapi-sent-2',
      status: 'DELIVERED',
      errorCode: null,
    })
  })

  it('recusa segredo incorreto antes de registrar o callback', async () => {
    expect((await post(payload(), 'wrong-secret')).status).toBe(401)
    expect(mocks.record).not.toHaveBeenCalled()
  })
})
