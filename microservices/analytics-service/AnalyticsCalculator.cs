namespace ExamApp.Analytics;

public sealed record AnalyticsSummary(int TotalAttempts, double AverageScore, double PassRate, double HighestScore, double LowestScore);
public sealed record AnalyticsRequest(IReadOnlyList<double>? Scores, double PassingScore = 60);

public static class AnalyticsCalculator
{
    public static AnalyticsSummary Summarize(IEnumerable<double> sourceScores, double passingScore)
    {
        var scores = sourceScores.ToArray();
        if (scores.Length == 0)
        {
            throw new ArgumentException("At least one score is required.", nameof(sourceScores));
        }
        if (scores.Any(score => !double.IsFinite(score) || score is < 0 or > 100))
        {
            throw new ArgumentOutOfRangeException(nameof(sourceScores), "Scores must be between 0 and 100.");
        }
        if (!double.IsFinite(passingScore) || passingScore is < 0 or > 100)
        {
            throw new ArgumentOutOfRangeException(nameof(passingScore), "Passing score must be between 0 and 100.");
        }

        var passingAttempts = scores.Count(score => score >= passingScore);
        return new AnalyticsSummary(
            scores.Length,
            Math.Round(scores.Average(), 2, MidpointRounding.AwayFromZero),
            Math.Round((double)passingAttempts / scores.Length * 100, 2, MidpointRounding.AwayFromZero),
            scores.Max(),
            scores.Min());
    }
}
