using aoe.Models;

namespace aoe.Services.Systems
{
    public class CheatingDetectionService
    {
        public (
            bool suspicious,
            double score,
            List<string> reasons
        )
        Analyze(
            Result result,
            int questionCount)
        {
            double suspiciousScore = 0;

            List<string> reasons =
                new();

            double avgSeconds =
                questionCount == 0
                ? 999
                : (double)result.TimeSpentSeconds
                    / questionCount;

            // ===== TOO FAST =====
            if (avgSeconds <= 3)
            {
                suspiciousScore += 40;

                reasons.Add(
                    "Answered too fast");
            }

            // ===== HIGH SCORE + FAST =====
            if (result.Score >= 90
                && avgSeconds <= 5)
            {
                suspiciousScore += 30;

                reasons.Add(
                    "High accuracy in very short time");
            }

            // ===== TAB SWITCH =====
            if (result.TabSwitchCount >= 5)
            {
                suspiciousScore += 20;

                reasons.Add(
                    "Too many tab switches");
            }

            // ===== EXTREME TAB SWITCH =====
            if (result.TabSwitchCount >= 15)
            {
                suspiciousScore += 30;

                reasons.Add(
                    "Extreme tab switching");
            }

            // ===== FINAL =====
            bool suspicious =
                suspiciousScore >= 50;

            return
            (
                suspicious,
                suspiciousScore,
                reasons
            );
        }
    }
}