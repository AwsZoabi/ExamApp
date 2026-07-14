namespace ExamApp.Analytics;

public sealed record ExamAttempt(int StudentId, string StudentName, string ExamTitle, double Score);

public static class SampleData
{
    public const double PassingScore = 60;
    public static readonly IReadOnlyList<ExamAttempt> Attempts =
    [
        new(201, "Maya Cohen", "React Basics", 92),
        new(202, "Adam Levi", "JavaScript Fundamentals", 84),
        new(203, "Noa David", "HTML and CSS", 76),
        new(204, "Liam Bar", "API Design", 64),
        new(205, "Ella Ron", "Docker Essentials", 58),
    ];
}
