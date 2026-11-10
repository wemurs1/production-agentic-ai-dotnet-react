namespace NexaStore.Application.AI;

public sealed record AssistantMessageDto(
    string Role,
    string Content);

public sealed record AssistantChatRequest(
    IReadOnlyList<AssistantMessageDto> Messages,
    string ResponseStyle = AssistantResponseStyles.Balanced);

public static class AssistantResponseStyles
{
    public const string Concise = "concise";
    public const string Balanced = "balanced";
    public const string Detailed = "detailed";
    public static readonly IReadOnlyList<string> All = [Concise, Balanced, Detailed];
}

public sealed record AssistantStatusDto(
    bool Enabled,
    string Provider,
    string Model,
    IReadOnlyList<string> Capabilities,
    IReadOnlyList<string> ResponseStyles);

public sealed record AssistantStreamUpdate(
    string Type,
    string? Content = null,
    string? ToolName = null,
    string? ToolLabel = null)
{
    public static AssistantStreamUpdate Delta(string content) => new("delta", Content: content);
    public static AssistantStreamUpdate Tool(string name, string label) => new("tool", ToolName: name, ToolLabel: label);
};

public interface INexaAssistantService
{
    IAsyncEnumerable<AssistantStreamUpdate> StreamResponseAsync(
        IReadOnlyList<AssistantMessageDto> messages,
        string responseStyle = AssistantResponseStyles.Balanced,
        CancellationToken cancellationToken = default);
}