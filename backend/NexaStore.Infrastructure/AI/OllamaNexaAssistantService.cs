using System.Runtime.CompilerServices;
using Microsoft.Extensions.AI;
using Microsoft.Extensions.Logging;
using NexaStore.Application.AI;

namespace NexaStore.Infrastructure.AI;

public sealed class OllamaNexaAssistantService(IChatClient chatClient, ILogger<OllamaNexaAssistantService> logger) : INexaAssistantService
{
    private const string SystemPrompt = """
You are Nexa AI, the concise and trustworthy shopping assistant for NexaStore,
a technology marketplace for developers, creators, and AI builders.

This is an introductory conversational phase. You do not yet have access to
prices, stock, specifications, policies, order status, or customer information.
When current NexaStore facts are required, clearly explain that live grounding
will arrive in later phases and directr the customer to the normal store pages.

You may explain general computing concepts and help users clarify requirements.
Keep answers practical, transparent, and reasonably brief.
""";

    public async IAsyncEnumerable<string> StreamResponseAsync(
        IReadOnlyList<AssistantMessageDto> messages, 
        [EnumeratorCancellation] CancellationToken cancellationToken = default)
    {
        var chatMessages = new List<ChatMessage>(messages.Count + 1)
        {
            new(ChatRole.System, SystemPrompt)
        };

        chatMessages.AddRange(messages.Select(message => new ChatMessage(
            string.Equals(message.Role, "assistant", StringComparison.OrdinalIgnoreCase) ? ChatRole.Assistant : ChatRole.User,
            message.Content.Trim()
        )));

        logger.LogInformation("Starting a local AI response for a conversation with {MessageCount} messages", messages.Count);

        await foreach (var update in chatClient.GetStreamingResponseAsync(chatMessages, cancellationToken: cancellationToken))
        {
            if (!string.IsNullOrEmpty(update.Text))
            {
                yield return update.Text;
            }
        }
    }
}
