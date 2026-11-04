using FluentValidation;

namespace NexaStore.Application.AI;

public class AssistantChatRequestValidator : AbstractValidator<AssistantChatRequest>
{
    private static readonly string[] AllowedRoles = ["user", "assistant"];

    public AssistantChatRequestValidator()
    {
        RuleFor(request => request.Messages)
            .NotEmpty()
            .Must(messages => messages.Count <= 20)
            .WithMessage("A conversation can contain at most 20 messages.");

        RuleForEach(request => request.Messages).ChildRules(message =>
        {
            message.RuleFor(item => item.Role)
                .NotEmpty()
                .Must(role => AllowedRoles.Contains(role, StringComparer.OrdinalIgnoreCase))
                .WithMessage("Role must be either 'user' or 'assistant'.");

            message.RuleFor(item => item.Content)
                .NotEmpty()
                .MaximumLength(4000);
        });

        RuleFor(request => request.Messages)
            .Must(messages => messages.Count > 0 && string.Equals(messages[^1].Role, "user", StringComparison.OrdinalIgnoreCase))
            .WithMessage("The final conversation message must be from the user.");
    }
}
