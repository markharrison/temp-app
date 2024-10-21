using System.Collections.Concurrent;
using System.Numerics;

namespace Pathinox
{

    public class GamePlayer
    {
        required public string ConnectionId { get; set; }
        required public string ConnectionState { get; set; }
        required public string Name { get; set; }
        required public string Color { get; set; }
        required public string ColorAlt { get; set; }
        required public int Counters { get; set; }

    }

    public class GameState
    {
        required public string GameCode { get; set; }
        required public DateTime Timestamp { get; set; }
        required public string Winner { get; set; }
        public List<GamePlayer> Players { get; set; } = new List<GamePlayer>();
        required public string Turn { get; set; }
        public string[][] Board { get; set; }
        public GameState()
        {
            Board = new string[8][];
            for (int i = 0; i < 8; i++)
            {
                Board[i] = new string[8];
                for (int j = 0; j < 8; j++)
                {
                    Board[i][j] = "0";
                }
            }
        }
    }


    public class GameRoomsState
    {
        private readonly ConcurrentDictionary<string, GameState> _gameRooms = new ConcurrentDictionary<string, GameState>();
        public ConcurrentDictionary<string, GameState> GameRooms => _gameRooms;
    }
}
