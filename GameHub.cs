using Microsoft.AspNetCore.SignalR;
using System.Diagnostics.Eventing.Reader;
using System.Drawing;
using System.Text.Json;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace Pathinox
{
    public class GameHub : Hub
    {
        private static readonly object _lock = new object();
        private readonly ILogger<GameHub> _logger;
        private readonly GameRoomsState _gameRoomsState;

        public GameHub(ILogger<GameHub> logger, GameRoomsState gameRoomsState)
        {
            _gameRoomsState = gameRoomsState;
            _logger = logger;
        }

        public async Task ConnectGame(string gameCode, object playerData)
        {
            var playerDataString = playerData?.ToString();
            if (string.IsNullOrEmpty(playerDataString))
            {
                await Clients.Caller.SendAsync("NotifyError", "Invalid player data");
                return;
            }
            var jsonElement = JsonSerializer.Deserialize<JsonElement>(playerDataString);
            var playerName = jsonElement.GetProperty("name").GetString() ?? "Unknown";
            playerName = string.Join(" ", playerName.Split(' ').Select(word => char.ToUpper(word[0]) + word.Substring(1).ToLower()));
            var playerColor = jsonElement.GetProperty("color").GetString() ?? "Unknown";
            var playerColorAlt = jsonElement.GetProperty("coloralt").GetString() ?? "Unknown";

            gameCode = Regex.Replace(gameCode, "[^a-zA-Z0-9]", "").ToLower();
            if (string.IsNullOrEmpty(gameCode))
            {
                await Clients.Caller.SendAsync("NotifyError", "Invalid game code.");
                return;
            }

            bool bCreategame = false;
            bool bJoin = false;
            bool bReconnect = false;
            bool bError = false;
            string errorMsg = string.Empty;
            string oldConnectionId = string.Empty;

            lock (_lock)
            {
                if (!_gameRoomsState.GameRooms.ContainsKey(gameCode))
                {
                    ConnectGameCreateNew(gameCode, playerName, playerColor, playerColorAlt);
                    bCreategame = true;
                }
                else
                {
                    TimeSpan timeDifference = DateTime.Now - _gameRoomsState.GameRooms[gameCode].Timestamp;
                    if (timeDifference.TotalHours > 1)
                    {
                        _gameRoomsState.GameRooms.Remove(gameCode, out _);
                        ConnectGameCreateNew(gameCode, playerName, playerColor, playerColorAlt);
                        bCreategame = true;
                    }
                    else
                    {
                        var gameState = _gameRoomsState.GameRooms[gameCode];
                        var turn = gameState.Turn;
                        var player = gameState.Players.FirstOrDefault(p => p.Name == playerName);
                        if (player != null)
                        {

                            bReconnect = true;
                            oldConnectionId = player.ConnectionId;
                            player.ConnectionId = Context.ConnectionId;
                            player.ConnectionState = "Active";
                        }
                        else
                        {
                            if (_gameRoomsState.GameRooms[gameCode].Players.Count < 2)
                            {
                                if (playerName == _gameRoomsState.GameRooms[gameCode].Players[0].Name)
                                {
                                    bError = true;
                                    errorMsg = $"Player name '{playerName}' already in use.";
                                }
                                else
                                {
                                    bJoin = true;
                                    ConnectGameAddPlayer(gameCode, playerName, playerColor, playerColorAlt);
                                }
                            }
                            else
                            {
                                bError = true;
                                errorMsg = $"Game full - code: {gameCode}";
                            }
                        }
                    }

                }
            }

            // End of lock

            if (bError)
            {
                await Clients.Caller.SendAsync("NotifyError", errorMsg);
                return;
            }

            if (bCreategame)
            {
                await ConnectGameCreated(gameCode);
                return;
            }

            if (bJoin)
            {
                await ConnectGameJoined(gameCode);
                return;
            }

            if (bReconnect)
            {
                await ConnectReconnect(gameCode, playerName, oldConnectionId);
                return;
            }

        }




        private void ConnectGameCreateNew(string gameCode, string playerName, string playerColor, string playerColorAlt)
        {
            _gameRoomsState.GameRooms[gameCode] = new GameState
            {
                GameCode = gameCode,
                Timestamp = DateTime.Now,
                Winner = "",
                Players = new List<GamePlayer>
                {
                    new GamePlayer
                    {
                        ConnectionId = Context.ConnectionId,
                        ConnectionState = "Active",
                        Name = playerName,
                        Color = playerColor,
                        ColorAlt = playerColorAlt,
                        Counters = 16
                    }
                },
                Turn = ""
            };
        }

        private bool ConnectGameAddPlayer(string gameCode, string playerName, string playerColor, string playerColorAlt)
        {
            var gameState = _gameRoomsState.GameRooms[gameCode];
            if (gameState.Players.Count < 2)
            {
                gameState.Players.Add(new GamePlayer
                {
                    ConnectionState = "Active",
                    ConnectionId = Context.ConnectionId,
                    Name = playerName,
                    Color = playerColor,
                    ColorAlt = playerColorAlt,
                    Counters = 16
                });
                return false;
            }
            return true;
        }

        private async Task ConnectReconnect(string gameCode, string playerName, string oldConnectionId)
        {
            if (Context.ConnectionId != oldConnectionId)
            {
                await Groups.RemoveFromGroupAsync(oldConnectionId, gameCode);
                await Clients.Client(oldConnectionId).SendAsync("NotifyError", $"{playerName} reconnected elsewhere.");
                await Groups.AddToGroupAsync(Context.ConnectionId, gameCode);
            }

            if (_gameRoomsState.GameRooms[gameCode].Turn == "")
            {
                await Clients.Caller.SendAsync("NotifyGameCreated", gameCode);
            }
            else
            {
                var gameState = _gameRoomsState.GameRooms[gameCode];
                var gameStateJson = JsonSerializer.Serialize(gameState);
                await Clients.Group(gameCode).SendAsync("NotifyGameStateUpdated", gameStateJson);

            }

        }

        private async Task ConnectGameCreated(string gameCode)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, gameCode);
            await Clients.Caller.SendAsync("NotifyGameCreated", gameCode);
        }

        private async Task ConnectGameJoined(string gameCode)
        {
            var gameState = _gameRoomsState.GameRooms[gameCode];
            if (gameState.Players[0].Color == gameState.Players[1].Color)
            {
                var temp = gameState.Players[1].Color;
                gameState.Players[1].Color = gameState.Players[1].ColorAlt;
                gameState.Players[1].ColorAlt = temp;
            }

            gameState.Turn = new Random().Next(2) == 0 ? gameState.Players[0].Name : gameState.Players[1].Name;
            var gameStateJson = JsonSerializer.Serialize(gameState);

            await Groups.AddToGroupAsync(Context.ConnectionId, gameCode);
            await Clients.Group(gameCode).SendAsync("NotifyGameJoined", gameCode, gameStateJson);
        }

        public async Task SendMessage(string gameCode, string msg)
        {
            gameCode = gameCode.ToLower();
            if (_gameRoomsState.GameRooms.ContainsKey(gameCode))
            {
                await Clients.OthersInGroup(gameCode).SendAsync("NotifyMessage", msg);
            }
            else
            {
                await Clients.Caller.SendAsync("NotifyError", $"Game closed: {gameCode}");
            }
        }


        public async Task UpdateGameState(string gameCode, string state)
        {
            gameCode = gameCode.ToLower();
            if (!_gameRoomsState.GameRooms.ContainsKey(gameCode))
            {
                await Clients.Caller.SendAsync("NotifyError", $"Game closed: {gameCode}");
                return;
            }

            var gameState = JsonSerializer.Deserialize<GameState>(state);
            var existingGameState = _gameRoomsState.GameRooms[gameCode];
            if (gameState == null || existingGameState == null)
            {
                await Clients.Caller.SendAsync("NotifyError", "Invalid game state.");
                return;
            }
            else
            {
                for (int i = 0; i < existingGameState.Players.Count; i++)
                {
                    existingGameState.Players[i].Counters = gameState.Players[i].Counters;
                }
                existingGameState.Turn = gameState.Turn;
                existingGameState.Winner = gameState.Winner;
                for (int i = 0; i < gameState.Board.Length; i++)
                {
                    for (int j = 0; j < gameState.Board[i].Length; j++)
                    {
                        existingGameState.Board[i][j] = gameState.Board[i][j];
                    }
                }
            }

            await Clients.Group(gameCode).SendAsync("NotifyGameStateUpdated", state);
        }


        public async Task EndGame(string gameCode)
        {
            gameCode = gameCode.ToLower();
            if (_gameRoomsState.GameRooms.ContainsKey(gameCode))
            {
                _gameRoomsState.GameRooms.Remove(gameCode, out _);
                await Clients.Group(gameCode).SendAsync("NotifyGameEnded", gameCode);

            }
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            foreach (var room in _gameRoomsState.GameRooms)
            {
                GameState gameState = room.Value;
                foreach (GamePlayer player in gameState.Players)
                {
                    if (player.ConnectionId == Context.ConnectionId)
                    {
                        var gameCode = room.Key;
                        player.ConnectionState = "Disconnected";
                        break;
                    }
                }
            }

            await base.OnDisconnectedAsync(exception);

        }
    }
}


