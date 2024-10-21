using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace Pathinox.Pages
{
    public class AppConfigInfoModel : PageModel
    {
        public string strAppConfigInfoHtml;
        IConfiguration _config;
        private readonly GameRoomsState _gameRoomState;

        public AppConfigInfoModel(IConfiguration config, GameRoomsState gameRoomState)
        {
            _config = config;
            _gameRoomState = gameRoomState;
            strAppConfigInfoHtml = "";

        }

        public void OnGet()
        {
            string pw = HttpContext.Request.Query["pw"].ToString();
            if (string.IsNullOrEmpty(pw) || pw != _config.GetValue<string>("AdminPW"))
                return;

            try
            {
                strAppConfigInfoHtml += "OS Description: " + System.Runtime.InteropServices.RuntimeInformation.OSDescription + "<br/>";
                strAppConfigInfoHtml += "ASPNETCORE_ENVIRONMENT: " + _config.GetValue<string>("ASPNETCORE_ENVIRONMENT") + "<br/>";
                strAppConfigInfoHtml += "Framework Description: " + System.Runtime.InteropServices.RuntimeInformation.FrameworkDescription + "<br/>";
                strAppConfigInfoHtml += "Instrumentation Key: " + _config.GetValue<string>("ApplicationInsights:InstrumentationKey") + "<br/>";
                strAppConfigInfoHtml += "Build Identifier: " + _config.GetValue<string>("BuildIdentifier") + "<br/>";
                strAppConfigInfoHtml += "OTEL_EXPORTER_OTLP_ENDPOINT: " + _config.GetValue<string>("OTEL_EXPORTER_OTLP_ENDPOINT") + "<br/>";

                strAppConfigInfoHtml += "<br/>";

            }
            catch (Exception ex)
            {
                strAppConfigInfoHtml += ex.Message;
            }

        }
    }
}
