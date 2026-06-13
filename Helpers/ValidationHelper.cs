using System.Text.RegularExpressions;

namespace aoe.Helpers
{
    public static class ValidationHelper
    {
        public static bool ValidEmail(string email)
        {
            return Regex.IsMatch(
                email,
                @"^[A-Za-z0-9._%+-]{1,20}@gmail\.com$"
            );
        }

        public static bool ValidPhone(string phone)
        {
            return Regex.IsMatch(phone, @"^[0-9]{1,11}$");
        }

        public static bool ValidName(string name)
        {
            return Regex.IsMatch(
                name,
                @"^[\p{L}\s]{1,50}$"
            );
        }

        public static bool ValidPassword(string password)
        {
            return password.Length <= 20 && !password.Contains(" ");
        }

        public static bool ValidRole(string role)
        {
            return role == "teacher" || role == "student";
        }
    }
}
