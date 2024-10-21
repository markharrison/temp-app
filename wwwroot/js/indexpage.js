const GameState = {
    Disconnected: "Disconnected",
    NotStarted: "NotStarted",
    Waiting: "Waiting",
    InProgress: "InProgress",
    Completed: "Completed"
};
let currentState = GameState.Disconnected;

let connectionId;

function randomString(length) {
    var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz".split("");

    if (!length) {
        length = Math.floor(Math.random() * chars.length);
    }

    var str = "";
    for (var i = 0; i < length; i++) {
        str += chars[Math.floor(Math.random() * chars.length)];
    }
    return str;
}

function doToast(vTitle, vText) {
    var vHtml = "";
    var vId = "idToast" + randomString(8);
    var vDate = new Date();
    var vTime = vDate.toLocaleTimeString();

    vHtml = vHtml + "<div id='" + vId + "' class='toast fade hide'><div class='toast-header'>";
    vHtml = vHtml + "<strong class='mr-auto'>" + vTitle + "</strong><small class='text-muted'>&nbsp;" + vTime + "</small>";
    vHtml = vHtml + "<button type='button' class='btn-close ms-auto mb-1' data-bs-dismiss='toast' ></button>";
    vHtml = vHtml + "</div><div class='toast-body'>" + vText + "</div></div>";

    $("#idToaster").append(vHtml);
    $("#" + vId).on("hidden.bs.toast", function (event) {
        $("#" + event.currentTarget.id).remove();
    });
    $("#" + vId).toast({ delay: 10000 }).toast("show");
}

function setCookie(strCookieName, strCookieValue) {
    var myDate = new Date();
    myDate.setMonth(myDate.getMonth() + 12);
    document.cookie = strCookieName + "=" + strCookieValue + ";expires=" + myDate;
}

function getCookie(name) {
    var value = "; " + document.cookie;
    var parts = value.split("; " + name + "=");
    if (parts.length === 2) return parts.pop().split(";").shift();
}

function UpdateState(gameState) {

    const gameCode = $("#idCodeInput").val().toLowerCase();

    connection.invoke("UpdateGameState", gameCode, gameState).catch(function (err) {
        return console.error(err.toString());
    });

}

function toggleUIState() {

    switch (currentState) {
        case GameState.Disconnected:
            $("#idButtonDiv").show();
            $("#idGameStatusDiv").text("Disconnected");
            $("#idSettingsMenu").show();
            $("#idGameRoomsMenu").show();
            $("#idAboutMenu").show();
            $("#idCodeInput").prop("disabled", true);
            $("#idStartBtn").hide();
            $("#idRestartBtn").hide();
            $("#idCancelBtn").hide();
            $("#idGameDiv").hide();
            $("#idMsgDiv").hide();
            break;
        case GameState.NotStarted:
            $("#idButtonDiv").show();
            $("#idGameStatusDiv").text("Ready to play");
            $("#idSettingsMenu").show();
            $("#idGameRoomsMenu").show();
            $("#idAboutMenu").show();
            $("#idCodeInput").prop("disabled", false);
            $("#idStartBtn").show();
            $("#idRestartBtn").hide();
            $("#idCancelBtn").hide();
            $("#idGameDiv").hide();
            $("#idMsgDiv").hide();
            break;
        case GameState.Waiting:
            $("#idButtonDiv").show();
            $("#idGameStatusDiv").text("Waiting for opponent");
            $("#idSettingsMenu").hide();
            $("#idGameRoomsMenu").hide();
            $("#idAboutMenu").hide();
            $("#idCodeInput").prop("disabled", true);
            $("#idStartBtn").hide();
            $("#idRestartBtn").hide();
            $("#idCancelBtn").show();
            $("#idGameDiv").hide();
            $("#idMsgDiv").hide();
            break;
        case GameState.InProgress:
            $("#idButtonDiv").hide();
            $("#idGameStatusDiv").text("Game in progress");
            $("#idSettingsMenu").hide();
            $("#idGameRoomsMenu").hide();
            $("#idAboutMenu").hide();
            $("#idCodeInput").prop("disabled", true);
            $("#idStartBtn").hide();
            $("#idRestartBtn").hide();
            $("#idCancelBtn").hide();
            $("#idGameDiv").show();
            $("#idMsgDiv").show();
            break;
        case GameState.Completed:
            $("#idButtonDiv").show();
            $("#idSettingsMenu").show();
            $("#idGameRoomsMenu").show();
            $("#idAboutMenu").show();
            $("#idCodeInput").prop("disabled", false);
            $("#idStartBtn").hide();
            $("#idRestartBtn").show();
            $("#idCancelBtn").hide();
            $("#idGameDiv").show();
            $("#idMsgDiv").show();
            break;
        default:
            console.error("Unknown game state: " + currentState);
            break;
    }

}

$(document).ready(function () {

    // check if configuration is required - if so redirect to "/Settings"
    let name = getCookie("pxname");
    let color = getCookie("pxcolor");
    let coloralt = getCookie("pxcoloralt");

    if (name === undefined || color === undefined || coloralt === undefined) {
        alert("Please configure your settings first");
        window.location.href = "/Settings";
        return;
    }

    name = name.replace(/%20/g, " ");

    const playerData = {
        name: name,
        color: color,
        coloralt: coloralt
    };

    connection = new signalR.HubConnectionBuilder()
        .withUrl("/gameHub") // Adjust the URL to match your hub endpoint
        .configureLogging(signalR.LogLevel.Information) // Set the logging level to Information
        .withAutomaticReconnect() // Enable automatic reconnect
        .build();

    connection.start().then(function () {
        doToast("Networking", "Connected");
        connectionId = connection.connectionId;
        currentState = GameState.NotStarted;
        toggleUIState();

        const gameCode = $("#idCodeInput").val().toLowerCase();
        if (gameCode !== "") {
            $("#idStartBtn").click();

        }

    }).catch(function (err) {
        doNetworkStatus(err.toString());
    });

    connection.onreconnecting((error) => {
        doToast("Networking", "Reconnecting...");
        currentState = GameState.Disconnected;
        toggleUIState();
    });

    connection.onreconnected((connectionId) => {
        doToast("Networking", "Reconnected");
        currentState = GameState.NotStarted;
        toggleUIState();
    });

    // Handle the close event
    connection.onclose((error) => {
        doToast("Networking", "Disconnected");
        currentState = GameState.Disconnected;
        toggleUIState();
    });

    // Start game
    $("#idStartBtn").click(function () {
        $("#idGameLog").html("");
        const gameCode = $("#idCodeInput").val().toLowerCase();
        if (gameCode !== "") {
            connection.invoke("ConnectGame", gameCode, playerData).catch(function (err) {
                return console.error(err.toString());
            });
            toggleUIState();
        }
    });

    // Restart
    $("#idRestartBtn").click(function () {
        const gameCode = $("#idCodeInput").val().toLowerCase();
        connection.invoke("EndGame", gameCode).catch(function (err) {
            return console.error(err.toString());
        });
    });


    // Send message
    $("#idMsgBtn").click(function () {
        const gameCode = $("#idCodeInput").val().toLowerCase();
        const idMsgInput = $("#idMsgInput").val();
        if (idMsgInput !== "") {
            $("#idMsgInput").val("");
            connection.invoke("SendMessage", gameCode, idMsgInput).catch(function (err) {
                return console.error(err.toString());
            });
        }
    });

    // End game
    $("#idCancelBtn").click(function () {
        const gameCode = $("#idCodeInput").val().toLowerCase();
        connection.invoke("EndGame", gameCode).catch(function (err) {
            return console.error(err.toString());
        });
    });

    connection.on("NotifyGameStateUpdated", function (gameState) {
        currentState = GameState.InProgress;
        toggleUIState();
        updateGame(gameState);
    });

    connection.on("NotifyMessage", function (msg) {
        doToast("Message", msg);
    });

    connection.on("NotifyGameCreated", function (gameCode) {
        $("#idCodeInput").val(gameCode);
        currentState = GameState.Waiting;
        toggleUIState();
    });

    connection.on("NotifyGameJoined", function (gameCode, gameState) {
        $("#idCodeInput").val(gameCode);


        try {
            let gameStateJson = JSON.parse(gameState);

            doToast("Game:" + gameCode, "Started: " + gameStateJson.Players[0].Name + " v " + gameStateJson.Players[1].Name);

            currentState = GameState.InProgress;
            toggleUIState();

            startGame(playerName, gameState);

        }
        catch (e) {
            doToast("Error", "Invalid game data received.");
            currentState = GameState.NotStarted;
            toggleUIState();
        }

    });

    connection.on("NotifyGameEnded", function (gameCode) {
        doToast("Game: " + gameCode, "Game ended");
        currentState = GameState.NotStarted;
        toggleUIState();
    });

    connection.on("NotifyError", function (error) {

        doToast("Error", error);
        currentState = GameState.NotStarted;
        toggleUIState();
    });

    document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible") {
            doToast("Debug","Page became visible again");
            const gameCode = $("#idCodeInput").val().toLowerCase();
            if (gameCode !== "") {
                connection.invoke("ConnectGame", gameCode, playerData).catch(function (err) {
                    return console.error(err.toString());
                });
                toggleUIState();
            }
        } else {
            const gameCode = $("#idCodeInput").val().toLowerCase();
            const idMsgInput = "Opponent is distracted";

            $("#idMsgInput").val("");
            connection.invoke("SendMessage", gameCode, idMsgInput).catch(function (err) {
                return console.error(err.toString());
            });

        }
    });




});



