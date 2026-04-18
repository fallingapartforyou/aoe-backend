namespace aoe.Helpers
{
    public static class ClassCodeGenerator
    {
        private static Random random = new Random();

        public static string Generate(int length = 8)
        {
            const string chars =
                "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

            return new string(
                Enumerable.Repeat(chars, length)
                    .Select(s => s[random.Next(s.Length)])
                    .ToArray()
            );
        }
    }
}
