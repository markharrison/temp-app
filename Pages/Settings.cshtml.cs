using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.Http;
using System;
using System.ComponentModel.DataAnnotations;

namespace Pathinox.Pages
{
    public class SettingsModel : PageModel
    {
        private readonly ILogger<SettingsModel> _logger;

        public SettingsModel(ILogger<SettingsModel> logger)
        {
            _logger = logger;
        }

        [BindProperty]
        [Required(ErrorMessage = "Name is required.")]
        public string? Name { get; set; }

        [BindProperty]
        [Required(ErrorMessage = "Preferred color is required.")]
        public string? Color { get; set; }

        [BindProperty]
        [Required(ErrorMessage = "Alternative color is required.")]
        [CustomValidation(typeof(SettingsModel), nameof(ValidateColors))]
        public string? ColorAlt { get; set; }

        [BindProperty]
        [Required]
        public string? Theme { get; set; }


        public static ValidationResult ValidateColors(string colorAlt, ValidationContext context)
        {
            var instance = context.ObjectInstance as SettingsModel;
            if (instance != null && instance.Color == colorAlt)
            {
                return new ValidationResult("Alternative color cannot be the same as the preferred color.");
            }
            return ValidationResult.Success!;
        }

        public void OnGet()
        {

            var nameCookie = HttpContext.Request.Cookies["pxname"];
            var colorCookie = HttpContext.Request.Cookies["pxcolor"];
            var coloraltCookie = HttpContext.Request.Cookies["pxcoloralt"];
            var themeCookie = HttpContext.Request.Cookies["pxtheme"];

            Name = (!string.IsNullOrEmpty(nameCookie)) ? nameCookie.Replace("%20", " ") : "Player Name";
            Color = (!string.IsNullOrEmpty(colorCookie)) ? colorCookie : "Red";
            ColorAlt = (!string.IsNullOrEmpty(coloraltCookie)) ? coloraltCookie : "Blue";
            Theme = (!string.IsNullOrEmpty(themeCookie)) ? themeCookie : "Light";

        }

        public IActionResult OnPost()
        {
            if (!ModelState.IsValid)
            {
                return Page();
            }   

            var options = new CookieOptions
            {
                Expires = DateTime.Now.AddYears(1)
            };


            Name = System.Text.RegularExpressions.Regex.Replace(Name ?? string.Empty, @"[^a-zA-Z0-9\s]", string.Empty);
            Name = Name.Trim();
            Name = string.Join(" ", Name.Split(' ').Select(word => char.ToUpper(word[0]) + word.Substring(1).ToLower()));
            Name = Name.Length > 20 ? Name[..20] : Name;

            HttpContext.Response.Cookies.Append("pxname", Name ?? string.Empty, options);
            HttpContext.Response.Cookies.Append("pxcolor", Color ?? string.Empty, options);
            HttpContext.Response.Cookies.Append("pxcoloralt", ColorAlt ?? string.Empty, options);
            HttpContext.Response.Cookies.Append("pxtheme", Theme ?? string.Empty, options);

            return Redirect("/");
        }
    }
}