using OpenTelemetry;
using OpenTelemetry.Metrics;
using OpenTelemetry.Resources;
using OpenTelemetry.Trace;

namespace Pathinox
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            builder.Services.AddSingleton<GameRoomsState>();
            builder.Services.AddRazorPages();
            builder.Services.AddSignalR();
            builder.Services.AddOpenTelemetry()
                .ConfigureResource(c => c.AddService("Pathetix"));

            if (builder.Environment.IsDevelopment())
            {
                builder.Services.AddOpenTelemetry()
                    .WithMetrics(metrics =>
                    {
                        metrics.AddAspNetCoreInstrumentation()
                            .AddHttpClientInstrumentation()
                            .AddRuntimeInstrumentation();
                    })
                    .WithTracing(tracing =>
                    {
                        tracing.SetSampler(new AlwaysOnSampler());
                        tracing.AddAspNetCoreInstrumentation()
                            .AddHttpClientInstrumentation()
                            .AddSource("Microsoft.AspNetCore.SignalR.Server");
                    });
            }
            var useOtlpExporter = !string.IsNullOrWhiteSpace(builder.Configuration["OTEL_EXPORTER_OTLP_ENDPOINT"]);
            if (useOtlpExporter)
            {
                builder.Services.AddOpenTelemetry().UseOtlpExporter();
            }

            var app = builder.Build();

            if (!app.Environment.IsDevelopment())
            {
                app.UseExceptionHandler("/Error");
                app.UseHsts();
            }

            app.UseHttpsRedirection();

            app.UseRouting();

            app.UseAuthorization();

            app.MapStaticAssets();
            app.MapRazorPages()
               .WithStaticAssets();

            app.MapHub<GameHub>("/gamehub");

            app.Run();
        }
    }
}
