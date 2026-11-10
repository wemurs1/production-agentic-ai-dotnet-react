using System.Collections.Concurrent;
using NexaStore.Application.AI;

namespace NexaStore.Infrastructure.AI;

public sealed class AIToolActivityTracker
{
    private readonly ConcurrentQueue<AssistantStreamUpdate> _activities = new();

    public void Record(string toolName, string label) => _activities.Enqueue(AssistantStreamUpdate.Tool(toolName, label));

    public IEnumerable<AssistantStreamUpdate> Drain()
    {
        while (_activities.TryDequeue(out var activity))
        {
            yield return activity;
        }
    }
}
