using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace Pathinox.Pages
{
    public class IndexModel : PageModel
    {
        public string JoinValue { get; private set; } = string.Empty;

        private readonly ILogger<IndexModel> _logger;

        public IndexModel(ILogger<IndexModel> logger)
        {
            _logger = logger;
        }

        public void OnGet()
        {
            JoinValue = Request.Query.FirstOrDefault(q => string.Equals(q.Key, "join", StringComparison.OrdinalIgnoreCase)).Value.ToString();


        }
    }
}
