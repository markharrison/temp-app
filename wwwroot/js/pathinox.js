class PathinoxState {
    constructor() {
        this.state = {};
    }

    setBoardCell(row, col, value) {
        if (row >= 0 && row < 8 && col >= 0 && col < 8) {
            this.state.Board[row][col] = value;
        } else {
            console.error("Invalid board position");
        }
    }

    getBoardCell(row, col) {
        if (row >= 0 && row < 8 && col >= 0 && col < 8) {
            return this.state.Board[row][col];
        } else {
            console.error("Invalid board position");
            return null;
        }
    }

    switchTurn() {
        this.state.Turn = (this.state.Turn === this.state.Players[0].Name) ? this.state.Players[1].Name : this.state.Players[0].Name;
    }


    getStateAsJsonString() {
        return JSON.stringify(this.state);
    }

    getStateAsObject() {
        return this.state;
    }

    loadStateFromJsonString(json) {
        this.state = JSON.parse(json);
    }

    loadStateFromObject(jsonObject) {
        this.state = jsonObject;
    }

    getConnectionId1() {
        return this.state.Players[0].ConnectionId;
    }

    getGameCode() {
        return this.state.GamCode;
    }

    getWinner() {
        return this.state.Winner;
    }
    setWinner(winner) {
        this.state.Winner = winner;
    }
    getTurn() {
        return this.state.Turn;
    }

    getPlayerName1() {
        return this.state.Players[0].Name;
    }

    getPlayerName2() {
        return this.state.Players[1].Name;
    }

    getPlayerColor1() {
        return this.state.Players[0].Color;
    }

    getPlayerColor2() {
        return this.state.Players[1].Color;
    }

    getPlayerColor() {
        return (this.state.Turn === this.state.Players[0].Name)
            ? this.state.Players[0].Color
            : this.state.Players[1].Color;
    }

    getOpponentColor() {
        return (this.state.Turn === this.state.Players[0].Name)
            ? this.state.Players[1].Color
            : this.state.Players[0].Color;
    }

    getPlayerCounters1() {
        return this.state.Players[0].Counters;
    }

    getPlayerCounters2() {
        return this.state.Players[1].Counters;
    }

    getPlayerCounters() {
        return (this.state.Turn === this.state.Players[0].Name)
            ? this.state.Players[0].Counters
            : this.state.Players[1].Counters;
    }

    incrementOpponentCounter() {
        if (this.state.Turn === this.state.Players[0].Name) {
            this.state.Players[1].Counters++;
        }
        else {
            this.state.Players[0].Counters++;
        }
    }

    incrementPlayerCounter() {
        if (this.state.Turn === this.state.Players[0].Name) {
            this.state.Players[0].Counters++;
        }
        else {
            this.state.Players[1].Counters++;
        }

    }

    decrementPlayerCounter() {
        if (this.state.Turn === this.state.Players[0].Name) {
            if (this.state.Players[0].Counters > 0) this.state.Players[0].Counters--;
        }
        else {
            if (this.state.Players[1].Counters > 0) this.state.Players[1].Counters--;
        }

    }

}

let px = new PathinoxState();
let playerName;
let playerDirection;

function getCountersHtml(number, color) {
    let html;
    if (number === 0) {
        html = "None";
    }
    else {
        html = `<span style='color: ${color};'>`;
        for (let i = 0; i < number; i++) {
            html += "&#9632;";
        }
        html += "</span>";
    }
    let fontsize = (window.innerWidth <= 440) ? "12px" : "14px";
    html = `<span style='font-size: ${fontsize};'>${html}</span>`;

    return html;
}

function getPlayersHtml(playerNum) {
    let html;
    let playerColor = (playerNum == 1) ? px.getPlayerColor1() : px.getPlayerColor2();
    let playerName = (playerNum == 1) ? px.getPlayerName1() : px.getPlayerName2();
    let playerCounters = (playerNum == 1) ? px.getPlayerCounters1() : px.getPlayerCounters2();

    html = `<span style="color: ${playerColor}; text-shadow: 1px 1px 1px black;font-weight: bold;">${playerName}</span><br>` + getCountersHtml(playerCounters, playerColor);

    return html;
}

function drawBoard() {
    let screenWidth = window.innerWidth;

    let cellSize = (screenWidth <= 440) ? 42 : 50;

    let boardContainer = document.getElementById("idBoardDiv");
    boardContainer.innerHTML = ""; // Clear any existing board

    // Create the player info container
    const playerInfoContainer = document.createElement("div");
    playerInfoContainer.style.display = "flex";
    playerInfoContainer.style.justifyContent = "flex-start";
    playerInfoContainer.style.marginBottom = "10px";
    playerInfoContainer.style.width = `calc(8 * ${cellSize}px + 2 * 6px)`;

    // Create the Player 1 info area
    const player1Info = document.createElement("div");
    player1Info.id = "player1Info";
    player1Info.style.width = "200px";
    player1Info.style.textAlign = "left";
    player1Info.style.marginRight = "10px";
    player1Info.style.fontSize = "16px";
    player1Info.innerHTML = getPlayersHtml(1);

    // Create the Player 2 info area
    const player2Info = document.createElement("div");
    player2Info.id = "player2Info";
    player2Info.style.width = "200px";
    player2Info.style.textAlign = "left";
    player2Info.style.fontSize = "16px";
    player2Info.innerHTML = getPlayersHtml(2);

    // Append player info areas to the player info container
    playerInfoContainer.appendChild(player1Info);
    playerInfoContainer.appendChild(player2Info);

    // Create the outer border container
    const outerBorderContainer = document.createElement("div");
    outerBorderContainer.style.display = "flex";
    outerBorderContainer.style.justifyContent = "center";
    outerBorderContainer.style.alignItems = "center";
    outerBorderContainer.style.borderTop = "7px solid " + px.getPlayerColor1();
    outerBorderContainer.style.borderBottom = "7px solid " + px.getPlayerColor1();
    outerBorderContainer.style.borderLeft = "7px solid " + px.getPlayerColor2();
    outerBorderContainer.style.borderRight = "7px solid " + px.getPlayerColor2();
    outerBorderContainer.style.padding = "6px";
    outerBorderContainer.style.boxSizing = "border-box";
    outerBorderContainer.style.height = `calc(8 * ${cellSize}px + 2 * 6px)`;
    outerBorderContainer.style.width = `calc(8 * ${cellSize}px + 2 * 6px)`;

    // Create the board container
    const innerBoardContainer = document.createElement("div");
    innerBoardContainer.style.display = "inline-block";

    for (let row = 0; row < 8; row++) {
        const rowDiv = document.createElement("div");
        rowDiv.className = "board-row";
        rowDiv.style.display = "flex";

        for (let col = 0; col < 8; col++) {
            const cellDiv = document.createElement("div");
            cellDiv.className = "board-cell";
            cellDiv.style.width = `${cellSize}px`;
            cellDiv.style.height = `${cellSize}px`;
            cellDiv.style.border = "1px solid #999999";
            cellDiv.style.backgroundColor = px.getBoardCell(row, col) === "0" ? "lightgray" : px.getBoardCell(row, col);
            cellDiv.dataset.row = row;
            cellDiv.dataset.col = col;

            if (currentState != GameState.Completed && playerName == px.getTurn()) {

                if (px.getPlayerCounters() == 0) {
                    if (px.getBoardCell(row, col) === px.getPlayerColor()) {
                        cellDiv.addEventListener("click", function () {
                            handleRemoveCellClick(row, col);
                        });
                    }
                }
                else {
                    if (px.getBoardCell(row, col) === "0") {
                        cellDiv.addEventListener("click", function () {
                            handleAddCellClick(row, col);
                        });
                    }
                }

            }

            rowDiv.appendChild(cellDiv);
        }

        innerBoardContainer.appendChild(rowDiv);
    }

    // Append the inner board container to the outer border container
    outerBorderContainer.appendChild(innerBoardContainer);

    // Append the player info container and the outer border container to the main board container
    boardContainer.appendChild(playerInfoContainer);
    boardContainer.appendChild(outerBorderContainer);
}




function debug() {
    //let strx = px.getStateAsJsonString();
    //$("#idDebugDiv").text(strx);
}

function turnMessage() {
    let turnMsg = "Players turn: " + px.getTurn();
    if (px.getPlayerCounters() == 0) turnMsg += " - remove a counter first";
    $("#idGameStatusDiv").text(turnMsg);
}

function removeAllClickHandlers() {
    const cells = document.querySelectorAll(".board-cell");
    cells.forEach(cell => {
        const newCell = cell.cloneNode(true);
        cell.parentNode.replaceChild(newCell, cell);
    });
}

function handleRemoveCellClick(row, col) {

    removeAllClickHandlers();

    px.incrementPlayerCounter();

    px.setBoardCell(row, col, "0");

    turnMessage();
    drawBoard();

    debug();
}

function handleAddCellClick(row, col) {

    removeAllClickHandlers();

    let myColor = px.getPlayerColor();
    let oppColor = px.getOpponentColor();

    px.decrementPlayerCounter();

    px.setBoardCell(row, col, myColor);
    processGameLogic(row, col, myColor, oppColor);

    px.switchTurn();

    debug();

    UpdateState(px.getStateAsJsonString());

}

function updateGame(gameStateJson) {

    px.loadStateFromJsonString(gameStateJson);

    if (px.getWinner() != "") {
        currentState = GameState.Completed;
        toggleUIState();
        $("#idGameStatusDiv").html(px.getWinner() + " wins!!&nbsp;<span style='font-size:3em;'>&#x1F3C6;</span>");
    }
    else {
        const isPlayer1 = connectionId == px.getConnectionId1();
        playerName = isPlayer1 ? px.getPlayerName1() : px.getPlayerName2();
        playerDirection = isPlayer1 ? "NS" : "WE";
        turnMessage();
    }

    drawBoard();
    debug();

}

function startGame(pName, gameStateJson) {

    try {

        px.loadStateFromJsonString(gameStateJson);

        const isPlayer1 = connectionId == px.getConnectionId1();
        playerName = isPlayer1 ? px.getPlayerName1() : px.getPlayerName2();
        playerDirection = isPlayer1 ? "NS" : "WE";

        turnMessage();
        drawBoard();

        debug();

    }
    catch (e) {
    }
}


function checkWinConditionNS(myColor) {
    const visited = Array.from({ length: 8 }, () => Array(8).fill(false));

    const dfs = (row, col) => {
        if (row < 0 || row >= 8 || col < 0 || col >= 8 || visited[row][col] || px.getBoardCell(row, col) !== myColor) {
            return false;
        }
        if (row === 7) {
            return true; //  
        }

        visited[row][col] = true;

        return dfs(row + 1, col) || dfs(row - 1, col) || dfs(row, col + 1) || dfs(row, col - 1);
    };

    for (let col = 0; col < 8; col++) {
        if (px.getBoardCell(0, col) === myColor && dfs(0, col)) {
            return true;
        }
    }

    return false;
}

function checkWinConditionWE(myColor) {
    const visited = Array.from({ length: 8 }, () => Array(8).fill(false));

    const dfs = (row, col) => {
        if (row < 0 || row >= 8 || col < 0 || col >= 8 || visited[row][col] || px.getBoardCell(row, col) !== myColor) {
            return false;
        }
        if (col === 7) {
            return true;
        }

        visited[row][col] = true;

        return dfs(row + 1, col) || dfs(row - 1, col) || dfs(row, col + 1) || dfs(row, col - 1);
    };

    for (let row = 0; row < 8; row++) {
        if (px.getBoardCell(row, 0) === myColor && dfs(row, 0)) {
            return true;
        }
    }

    return false;
}

function removeBlackCells() {

    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            if (px.getBoardCell(row, col) === "black") {
                px.setBoardCell(row, col, "0");
            }
        }
    }

}


function processGameLogic(row, col, myColor, oppColor) {

    removeBlackCells();

    if (row >= 2 && px.getBoardCell(row - 1, col) === oppColor && px.getBoardCell(row - 2, col) === myColor) {
        px.setBoardCell(row - 1, col, "black");
        px.incrementOpponentCounter();
    }

    if (row <= 5 && px.getBoardCell(row + 1, col) === oppColor && px.getBoardCell(row + 2, col) === myColor) {
        px.setBoardCell(row + 1, col, "black");
        px.incrementOpponentCounter();
    }

    if (col >= 2 && px.getBoardCell(row, col - 1) === oppColor && px.getBoardCell(row, col - 2) === myColor) {
        px.setBoardCell(row, col - 1, "black");
        px.incrementOpponentCounter();
    }

    if (col <= 5 && px.getBoardCell(row, col + 1) === oppColor && px.getBoardCell(row, col + 2) === myColor) {
        px.setBoardCell(row, col + 1, "black");
        px.incrementOpponentCounter();
    }

    if ((playerDirection === "NS" && checkWinConditionNS(myColor)) ||
        (playerDirection === "WE" && checkWinConditionWE(myColor))) {
        currentState = GameState.Completed;
        drawBoard();
        toggleUIState();
        px.setWinner(playerName);
        $("#idGameStatusDiv").text(playerName + " won !");

    }

}


