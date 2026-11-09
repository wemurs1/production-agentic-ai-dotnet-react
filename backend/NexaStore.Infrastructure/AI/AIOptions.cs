namespace NexaStore.Infrastructure.AI;

public sealed class AIOptions
{
    public const string SectionName = "AI";
    public bool Enabled { get; init; } = true;
    public string Provider { get; init; } = "ollama";
    public string EndPoint { get; init; } = "http://localhost:11434";
    public string Model { get; init; } = "qwen3.5:4b";
    public float Temperature { get; init; } = 0.3f;
    public int MaxOutputTokens { get; init; } = 4096;

    public void Validate()
    {
        if (!Enabled)
        {
            return;
        }

        if (!string.Equals(Provider, "Ollama", StringComparison.OrdinalIgnoreCase))
        {
            throw new InvalidOperationException($"Unsupported AI provider '{Provider}'. Phase 02 supports only Ollama");
        }

        if (!Uri.TryCreate(EndPoint, UriKind.Absolute, out _))
        {
            throw new InvalidOperationException("AI:EndPoint must be an absolute URI");
        }

        ArgumentException.ThrowIfNullOrWhiteSpace(Model);

        if (Temperature is < 0 or > 2)
        {
            throw new InvalidOperationException("AI:Temperature must be between 0 and 2");
        }

        if (MaxOutputTokens is < 64 or > 4096)
        {
            throw new InvalidOperationException("AI:MaxOutputTokens must be between 64 and 4096");
        }
    }
}
