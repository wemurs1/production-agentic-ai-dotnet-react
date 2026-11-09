using Microsoft.Extensions.AI;
using Microsoft.Extensions.Logging;
using NexaStore.Application.AI;
using System.Runtime.CompilerServices;

namespace NexaStore.Infrastructure.AI;

public sealed class OllamaNexaAssistantService(
    IChatClient chatClient,
    AIOptions options,
    ILogger<OllamaNexaAssistantService> logger) : INexaAssistantService
{

    public async IAsyncEnumerable<string> StreamResponseAsync(
        IReadOnlyList<AssistantMessageDto> messages,
        string responseStyle = AssistantResponseStyles.Balanced,
        [EnumeratorCancellation] CancellationToken cancellationToken = default)
    {
        var chatMessages = new List<ChatMessage>(messages.Count + 1)
            {
                new(ChatRole.System, AssistantPromptFactory.Create(responseStyle))
            };

        chatMessages.AddRange(messages.Select(message => new ChatMessage(
            string.Equals(message.Role, "assistant", StringComparison.OrdinalIgnoreCase)
            ? ChatRole.Assistant
            : ChatRole.User,
            message.Content.Trim())));

        logger.LogInformation($"Starting local AI response for a conversation with {messages.Count} messages");
        await foreach (var update in chatClient.GetStreamingResponseAsync(
            chatMessages,
            new ChatOptions
            {
                Temperature = options.Temperature,
                MaxOutputTokens = options.MaxOutputTokens
            },
            cancellationToken: cancellationToken))
        {
            if (!string.IsNullOrEmpty(update.Text))
            {
                yield return update.Text;
            }
        }
    }
}
