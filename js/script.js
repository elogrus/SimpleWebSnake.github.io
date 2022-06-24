const canvas = document.querySelector("#field");
const ctx = canvas.getContext("2d");
ctx.fillStyle = "#8BC34A";
const frameDelay = 100;

let pointer = document.querySelector("#pointer");
let gg = document.querySelector("#gg");
let button = gg.querySelector("#reload");
button.addEventListener("click", () => window.location.reload());

// Содержат в себе объекты вида {x,y}
let snakePiecesList = [
    { x: 250, y: 250 },
    { x: 250, y: 275 },
];
let applesList = [];
let collectedApples = 0;
// Направление движения головы змеи
// Принимает значения: top (вверх), bottom (вниз), left (налево), rigth (направо)
let direction = "top";
let weakDirection = null;

let cutSnakePromise = new Promise(() => {});
document.addEventListener("keydown", changeDirection);

function changeDirection(event) {
    switch (event) {
        case "left":
            if (direction == "right") return;
            weakDirection = "left";
            return;
        case "top":
            if (direction == "bottom") return;
            weakDirection = "top";
            return;
        case "right":
            if (direction == "left") return;
            weakDirection = "right";
            return;
        case "bottom":
            if (direction == "top") return;
            weakDirection = "bottom";
            return;
    }
    switch (event.keyCode) {
        case 37:
            if (direction == "right") return;
            weakDirection = "left";
            return;
        case 38:
            if (direction == "bottom") return;
            weakDirection = "top";
            return;
        case 39:
            if (direction == "left") return;
            weakDirection = "right";
            return;
        case 40:
            if (direction == "top") return;
            weakDirection = "bottom";
            return;
    }
}

snakePiecesList.forEach((piece) => {
    if (piece == snakePiecesList[0]) {
        ctx.fillStyle = "#689F38";
        ctx.fillRect(piece.x, piece.y, 25, 25);
        ctx.fillStyle = "#8BC34A";
    } else {
        ctx.fillRect(piece.x, piece.y, 25, 25);
    }
});

function createApple() {
    let x = Math.random() * 500;
    x = x - (x % 25);
    let y = Math.random() * 500;
    y = y - (y % 25);
    let isCollusionSnake = false;
    for (piece of snakePiecesList) {
        if (piece.y == y && piece.x == x) isCollusionSnake = true;
    }
    if (isCollusionSnake) {
        createApple();
    } else {
        ctx.fillStyle = "red";
        ctx.fillRect(x, y, 25, 25);
        ctx.fillStyle = "#8BC34A";
        applesList.push({ x: x, y: y });
    }
}

// Удаляет яблоко из листа
function removeApple(needToRemoveApple) {
    let removed = applesList.splice(
        applesList.findIndex(
            (apple) =>
                apple.x == needToRemoveApple.x &&
                apple.y == needToRemoveApple.y,
            1,
        ),
    );
    console.log("removed: " + removed);
}

// Возвращает яблоко, которое нужно удалить. Если таких нет, то false
function needRemoveApple() {
    let head = snakePiecesList[0];
    let isCollusionHead = false;
    let needToRemoveApple;
    for (apple of applesList) {
        if (apple.x == head.x && apple.y == head.y) {
            isCollusionHead = true;
            needToRemoveApple = apple;
        }
    }

    if (isCollusionHead) return needToRemoveApple;
    return false;
}

// Если яблоко было сгенерировано, вернет true, иначе false
function generateApple() {
    let needToRemoveApple = needRemoveApple();
    if (needToRemoveApple) {
        addPoint(1);
        removeApple(needToRemoveApple);
        createApple();
        return true;
    }
    return false;
}

// Если нужно обрезать змею, вернет стартовый кусок, иначе false;
function needCutSnake() {
    for (piece of snakePiecesList) {
        if (
            piece != snakePiecesList[0] &&
            piece.x == snakePiecesList[0].x &&
            piece.y == snakePiecesList[0].y
        ) {
            return piece;
        }
    }
    return false;
}

function cutSnake(startPiece) {
    let removed;
    let startPieceIndex = snakePiecesList.findIndex((findPiece) => {
        return (
            findPiece != snakePiecesList[0] &&
            findPiece.x == startPiece.x &&
            findPiece.y == startPiece.y
        );
    });
    removed = snakePiecesList.splice(startPieceIndex);
    setPoint(getPoints() - removed.length + 1);
    for (piece of removed) {
        ctx.clearRect(piece.x, piece.y, 25, 25);
    }
}

function exitGame() {
    clearInterval(gameTimer);
    gg.setAttribute("hidden", "false");
    document.querySelector(".game_wrapper").style.cursor = "default";
}

function addPoint(num) {
    let pointsNow = parseInt(pointer.innerHTML);
    pointer.innerHTML = pointsNow + num + " points";
}

function setPoint(num) {
    let pointsNow = parseInt(pointer.innerHTML);
    pointer.innerHTML = num + " points";
}

function getPoints() {
    return parseInt(pointer.innerHTML);
}

// Возвращает true, если столкнулся со стеной, иначе false
function isWallCollusion() {
    if (
        snakePiecesList[0].x < 0 ||
        snakePiecesList[0].y < 0 ||
        snakePiecesList[0].x > 475 ||
        snakePiecesList[0].y > 475
    )
        return true;
    return false;
}

function drawGameFrame() {
    if (isWallCollusion()) {
        for (piece of snakePiecesList) {
            ctx.fillStyle = "#942424";
            ctx.fillRect(piece.x, piece.y, 25, 25);
        }
        exitGame();
    }
    let needToCutPiece = needCutSnake();
    if (needToCutPiece) cutSnake(needToCutPiece);

    // Генерация яблока
    let eatenApple = generateApple();

    // Сменить направление, если оно было сменено
    if (weakDirection) direction = weakDirection;

    // Отрисовка змеи
    if (!eatenApple) {
        ctx.clearRect(
            snakePiecesList[snakePiecesList.length - 1].x,
            snakePiecesList[snakePiecesList.length - 1].y,
            25,
            25,
        ); // Убираю последний кусок змеи
        snakePiecesList.pop();
    }

    switch (
        direction // Рисую голову змеи взависимости от направления движения
    ) {
        case "top":
            snakePiecesList.unshift({
                x: snakePiecesList[0].x,
                y: snakePiecesList[0].y - 25,
            });
            break;
        case "bottom":
            snakePiecesList.unshift({
                x: snakePiecesList[0].x,
                y: snakePiecesList[0].y + 25,
            });
            break;
        case "right":
            snakePiecesList.unshift({
                x: snakePiecesList[0].x + 25,
                y: snakePiecesList[0].y,
            });
            break;
        case "left":
            snakePiecesList.unshift({
                x: snakePiecesList[0].x - 25,
                y: snakePiecesList[0].y,
            });
            break;
    }
    ctx.fillStyle = "#689F38";
    ctx.fillRect(snakePiecesList[0].x, snakePiecesList[0].y, 25, 25);
    ctx.fillStyle = "#8BC34A"; // Перекрашиваю часть перед новой головой (бывшую голову)
    ctx.fillRect(snakePiecesList[1].x, snakePiecesList[1].y, 25, 25);
}
//--------------------------------------//

createApple();

let timerWrapper = document.querySelector("#timer");
let timerNumber = timerWrapper.querySelector(".info");

let i = 3;

function countTimer() {
    if (i == 0) {
        timerWrapper.setAttribute("hidden", "true");
        clearInterval(preGameTimer);
    }

    timerNumber.style.transition = "none";
    timerNumber.style.transform = "scale(0.2)";

    timerNumber.getBoundingClientRect();

    timerNumber.style.transition = "transform 1s";
    timerNumber.style.transform = "scale(1)";

    timerNumber.innerHTML = String(i);
    i--;
}

countTimer();
let preGameTimer = setInterval(() => {
    countTimer();
}, 1000);
let gameTimer;

setTimeout(() => {
    gameTimer = setInterval(() => {
        drawGameFrame();
    }, 100);
}, 3000);
