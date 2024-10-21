using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using System.Threading.Tasks.Dataflow;

namespace Pathinox.Pages
{
    public class GameRoomsModel : PageModel
    {
        public string strHtml;
        IConfiguration _config;
        private readonly GameRoomsState _gameRoomState;

        public GameRoomsModel(IConfiguration config, GameRoomsState gameRoomState)
        {
            _config = config;
            _gameRoomState = gameRoomState;
            strHtml = "";

        }

        public void OnGet()
        {

            strHtml += "<table>";

            strHtml += "<tr><td>Timestamp</td><td>&nbsp;&nbsp;</td><td>Game</td><td>&nbsp;&nbsp;</td><td>Player 1</td><td>&nbsp;&nbsp;</td><td>Player 2</td></tr>";

            foreach (var room in _gameRoomState.GameRooms)
            {
                GameState gameState = room.Value;
                var gameCode = room.Key;
                string timeStamp = gameState.Timestamp.ToString("dd/MMM HH:mm:ss");
                var player1 = gameState.Players[0].Name;
                var player2 = (gameState.Players.Count >= 2) ? gameState.Players[1].Name : $"None <button onclick=\"location.href='./?join={gameCode}'\">Join</button>";

                strHtml += $"<tr><td>{timeStamp}</td><td>&nbsp;&nbsp;</td><td>{gameCode}</td><td>&nbsp;&nbsp;</td><td>{player1}</td><td>&nbsp;&nbsp;</td><td>{player2}</td></tr>";
            }

            strHtml += "</table>";

            strHtml += "<br/>";



        }
    }
}
