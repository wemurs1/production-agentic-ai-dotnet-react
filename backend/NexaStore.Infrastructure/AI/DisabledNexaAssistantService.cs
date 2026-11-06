using System.Runtime.CompilerServices;
using NexaStore.Application.AI;

namespace NexaStore.Infrastructure.AI;

public sealed class DisabledNexaAssistantService : INexaAssistantService
{
    public async IAsyncEnumerable<string> StreamResponseAsync(
        IReadOnlyList<AssistantMessageDto> messages,
        string responseStyle = AssistantResponseStyles.Balanced,
        [EnumeratorCancellation] CancellationToken cancellationToken = default)
    {
        await Task.Yield();
        cancellationToken.ThrowIfCancellationRequested();
        yield return "Nexa AI is disabled in this environment";
    }
}
