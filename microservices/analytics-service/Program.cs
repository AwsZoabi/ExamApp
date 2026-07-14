using ExamApp.Analytics;

var builder = WebApplication.CreateBuilder(args);
var portText = Environment.GetEnvironmentVariable("PORT") ?? "5001";
if (!int.TryParse(portText, out var port) || port is < 1 or > 65535)
{
    throw new InvalidOperationException("PORT must be an integer between 1 and 65535.");
}

builder.WebHost.UseUrls($"http://0.0.0.0:{port}");
builder.Logging.ClearProviders();
builder.Logging.AddSimpleConsole(options => options.SingleLine = true);

var app = builder.Build();

app.Use(async (context, next) =>
{
    context.Response.Headers.CacheControl = "no-store";
    context.Response.Headers.XContentTypeOptions = "nosniff";
    await next();
});

app.MapGet("/health", () => Results.Ok(new { service = "examapp-analytics", status = "ok", version = "1.1.0", runtime = ".NET 9", port }));

app.MapGet("/api/analytics/overview", () =>
{
    var summary = AnalyticsCalculator.Summarize(SampleData.Attempts.Select(attempt => attempt.Score), SampleData.PassingScore);
    var attempts = SampleData.Attempts.Select(attempt => new
    {
        attempt.StudentId,
        attempt.StudentName,
        attempt.ExamTitle,
        attempt.Score,
        passed = attempt.Score >= SampleData.PassingScore,
    });
    return Results.Ok(new { service = "examapp-analytics", passingScore = SampleData.PassingScore, summary, attempts });
});

app.MapPost("/api/analytics/summary", (AnalyticsRequest request) =>
{
    if (request.Scores is null || request.Scores.Count == 0)
    {
        return Results.BadRequest(new { error = new { code = "INVALID_ANALYTICS_INPUT", message = "At least one score is required." } });
    }
    try
    {
        var summary = AnalyticsCalculator.Summarize(request.Scores, request.PassingScore);
        return Results.Ok(new { service = "examapp-analytics", passingScore = request.PassingScore, summary });
    }
    catch (ArgumentException error)
    {
        return Results.BadRequest(new { error = new { code = "INVALID_ANALYTICS_INPUT", message = error.Message } });
    }
});

app.MapFallback(() => Results.NotFound(new { error = new { code = "NOT_FOUND", message = "The requested analytics route does not exist." } }));
app.Run();

public partial class Program;
