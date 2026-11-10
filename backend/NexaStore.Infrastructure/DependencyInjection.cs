using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.AI;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using NexaStore.Application.Abstractions;
using NexaStore.Application.AI;
using NexaStore.Infrastructure.AI;
using NexaStore.Infrastructure.Persistence;
using NexaStore.Infrastructure.Persistence.Repositories;
using NexaStore.Infrastructure.Persistence.Seeding;
using OllamaSharp;

namespace NexaStore.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddLocalAI(this IServiceCollection services, AIOptions options)
    {
        ArgumentNullException.ThrowIfNull(options);
        options.Validate();
        services.AddSingleton(options);
        if (!options.Enabled)
        {
            services.AddScoped<INexaAssistantService, DisabledNexaAssistantService>();
            return services;
        }

        services.AddSingleton<IChatClient>(provider =>
        {
            var httpCLient = new HttpClient { BaseAddress = new Uri(options.EndPoint), Timeout = TimeSpan.FromMinutes(10) };

            var ollamaClient = new OllamaApiClient(httpCLient, options.Model);

            return new ChatClientBuilder(ollamaClient)
                .UseFunctionInvocation(
                    provider.GetRequiredService<ILoggerFactory>(),
                    client =>
                    {
                        client.AllowConcurrentInvocation = false;
                        client.IncludeDetailedErrors = false;
                        client.MaximumConsecutiveErrorsPerRequest = 0;
                        client.MaximumIterationsPerRequest = 5;
                        client.TerminateOnUnknownCalls = true;
                    }
                )
                .Build();
        });

        services.AddScoped<AIToolActivityTracker>();

        services.AddScoped<NexaStoreAITools>();

        services.AddScoped<INexaAssistantService, OllamaNexaAssistantService>();
        return services;
    }

    public static IServiceCollection AddInfrastructure(this IServiceCollection services, string connectionString)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(connectionString);
        return services.AddInfrastructure(options =>
            options.UseNpgsql(connectionString, npgsql =>
            {
                npgsql.MigrationsAssembly(typeof(NexaStoreDbContext).Assembly.FullName);
                npgsql.EnableRetryOnFailure(5, TimeSpan.FromSeconds(5), null);
            }));
    }

    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        Action<DbContextOptionsBuilder> configureDatabase)
    {
        services.AddDbContext<NexaStoreDbContext>(configureDatabase);
        services.AddScoped<DevelopmentDataSeeder>();
        services.AddScoped<IProductRepository, ProductRepository>();
        services.AddScoped<ICustomerRepository, CustomerRepository>();
        services.AddScoped<ICartRepository, CartRepository>();
        services.AddScoped<IOrderRepository, OrderRepository>();
        services.AddScoped<IInventoryRepository, InventoryRepository>();
        services.AddScoped<IUnitOfWork>(provider => provider.GetRequiredService<NexaStoreDbContext>());

        return services;
    }
}
