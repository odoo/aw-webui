import { callLLM, loadLLMConfig, saveLLMConfig } from '~/util/aiSummary';

describe('LLM config storage', () => {
  const values = new Map<string, string>();

  beforeAll(() => {
    Object.defineProperty(globalThis, 'localStorage', {
      value: {
        getItem: (key: string) => values.get(key) ?? null,
        setItem: (key: string, value: string) => values.set(key, value),
        clear: () => values.clear(),
      },
      configurable: true,
    });
  });
  beforeEach(() => values.clear());

  test('persists provider settings without the API key', () => {
    saveLLMConfig({ provider: 'openai', model: 'my-custom-model', apiKey: 'secret' });

    expect(loadLLMConfig()).toEqual({ provider: 'openai', model: 'my-custom-model' });
    expect(localStorage.getItem('aw-ai-summary-llm-config')).not.toContain('secret');
  });

  test('loads a saved legacy OpenAI default as the replacement model', () => {
    saveLLMConfig({ provider: 'openai', model: 'gpt-4o-mini' });

    expect(loadLLMConfig()).toEqual({ provider: 'openai', model: 'gpt-6-luna' });
  });

  test('does not migrate saved models for another provider', () => {
    saveLLMConfig({ provider: 'anthropic', model: 'custom-claude-model' });

    expect(loadLLMConfig()).toEqual({ provider: 'anthropic', model: 'custom-claude-model' });
  });

  test('discards a stale unsupported provider', () => {
    localStorage.setItem(
      'aw-ai-summary-llm-config',
      JSON.stringify({ provider: 'custom', model: 'local-model' })
    );

    expect(loadLLMConfig()).toEqual({});
  });
});

describe('callLLM', () => {
  const fetchMock = jest.fn();

  beforeAll(() => {
    Object.defineProperty(globalThis, 'fetch', {
      value: fetchMock,
      configurable: true,
    });
  });
  beforeEach(() => fetchMock.mockReset());

  test('sends OpenAI requests to the CSP-allowed endpoint', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ choices: [{ message: { content: 'Summary' } }] }),
    });

    await expect(
      callLLM({ provider: 'openai', apiKey: 'secret', model: '' }, 'Activity')
    ).resolves.toBe('Summary');
    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.openai.com/v1/chat/completions',
      expect.any(Object)
    );
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({
      model: 'gpt-6-luna',
      messages: [{ role: 'user', content: 'Activity' }],
      max_completion_tokens: 1024,
      reasoning_effort: 'none',
    });
  });

  test('keeps the requested custom OpenAI model', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ choices: [{ message: { content: 'Summary' } }] }),
    });

    await callLLM({ provider: 'openai', apiKey: 'secret', model: 'custom-model' }, 'Activity');

    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({
      model: 'custom-model',
      messages: [{ role: 'user', content: 'Activity' }],
      max_completion_tokens: 1024,
    });
  });

  test('sends Anthropic requests to the CSP-allowed endpoint', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ content: [{ text: 'Summary' }] }),
    });

    await expect(
      callLLM(
        { provider: 'anthropic', apiKey: 'secret', model: 'claude-haiku-4-5-20251001' },
        'Activity'
      )
    ).resolves.toBe('Summary');
    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.anthropic.com/v1/messages',
      expect.any(Object)
    );
  });
});
