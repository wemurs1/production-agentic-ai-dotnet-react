namespace NexaStore.Application.AI;

public sealed record AssistantMessageDto(string Role, string Content);
public sealed record AssistantChatRequest(IReadOnlyList<AssistantMessageDto> Messages, string ResponseStyle = AssistantResponseStyles.Balanced);
public static class AssistantResponseStyles
{
    public const string Concise = "concise";
    public const string Balanced = "balanced";
    public const string Detailed = "detailed";

    public static readonly IReadOnlyList<string> All = [Concise, Balanced, Detailed];
}
public sealed record AssistantStatusDto(bool Enabled, string Provider, string Model, IReadOnlyList<string> Capabilities, IReadOnlyList<string> ResponseStyles);
public interface INexaAssistantService
{
    IAsyncEnumerable<string> StreamResponseAsync(
        IReadOnlyList<AssistantMessageDto> messages,
        string responseStyle = AssistantResponseStyles.Balanced,
        CancellationToken cancellationToken = default);
}