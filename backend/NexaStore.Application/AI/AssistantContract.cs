namespace NexaStore.Application.AI;

public sealed record AssistantMessageDto(string Role, string Content);
public sealed record AssistantChatRequest(IReadOnlyList<AssistantMessageDto> Messages);
public sealed record AssistantStatusDto(bool Enabled, string Provider, string Model, string Phase);
public interface INexaAssistantService
{
    IAsyncEnumerable<string> StreamResponseAsync(IReadOnlyList<AssistantMessageDto> messages, CancellationToken cancellationToken = default);
}