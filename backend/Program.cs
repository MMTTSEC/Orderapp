using OrchardCore.Logging;
using RestRoutes;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

builder.Host.UseNLogHost();

builder.Services.AddOrchardCms();

// SSE hub and background monitor
builder.Services.AddSingleton<OrderSseHub>();
builder.Services.AddHostedService<OrderMonitorService>();

var app = builder.Build();

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error");
    app.UseHsts();
}

// our mods
app.MapRestRoutes();

app.UseStaticFiles();

app.UseOrchardCore();

app.MapGet("/api/sse/orders", async (HttpContext context, OrderSseHub hub) =>
{
    context.Response.Headers.CacheControl = "no-cache";
    context.Response.Headers.Connection = "keep-alive";
    context.Response.Headers["X-Accel-Buffering"] = "no"; // disable buffering on some proxies
    context.Response.ContentType = "text/event-stream";

    var client = hub.Connect();
    try
    {
        // send an initial snapshot immediately if available
        if (hub.TryGetLatestSnapshot(out var snapshotJson))
        {
            await context.Response.WriteAsync($"data: {snapshotJson}\n\n");
            await context.Response.Body.FlushAsync();
        }

        // stream updates
        await foreach (var message in client.Reader.ReadAllAsync(context.RequestAborted))
        {
            await context.Response.WriteAsync($"data: {message}\n\n");
            await context.Response.Body.FlushAsync();
        }
    }
    finally
    {
        hub.Disconnect(client.Id);
    }
});

app.Run();