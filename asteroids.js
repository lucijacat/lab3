let canvas;
let ctx;
let canvasWidth = 1400;
let canvasHeight = 850;
let keys = [];
let ship;
let asteroids = [];
let stars = [];
let collided = false;
let asteroidRadiuses = [15, 20, 25, 30, 35];
let greys = ['rgb(128, 128, 128)', 'rgb(89, 89, 89)', 'rgb(118, 118, 118)', 'rgb(69, 69, 69)', 'rgb(177, 177, 177)'];
let gameOver = false;
let startTime;
let endTime;

let highScore;
let localStorageName = "HighScore";
 
document.addEventListener('DOMContentLoaded', SetupCanvas);
 
function SetupCanvas(){
    canvas = document.getElementById("my-canvas");
    ctx = canvas.getContext("2d");
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ship = new Ship();
    startTime = new Date().getTime();
 
    for(let i = 0; i < 8; i++){
        asteroids.push(new Asteroid());
    }

    for(let i = 0; i < 8; i++){
        stars.push(new Star());
    }

    // ako pritisnemo/otpustimo tipku pozivaju se fje
    document.body.addEventListener("keydown", HandleKeyDown);
    document.body.addEventListener("keyup", HandleKeyUp);
 
    // dohvat dosadasnjeg highscorea iz local storagea
    if (localStorage.getItem(localStorageName) == null) {
        highScore = 0;
    } else {
        highScore = localStorage.getItem(localStorageName);
    }

    Render();
}

// ako se tipka pritisne postavljamo ju na true, ako se otpusti na false
function HandleKeyDown(e){
    keys[e.keyCode] = true;
}

function HandleKeyUp(e){
    keys[e.keyCode] = false;
}

// definiramo ship(igraca)
class Ship {
    constructor() {
        this.visible = true;
        this.x = canvasWidth / 2;
        this.y = canvasHeight / 2;
        this.speed = 0.1;
        this.radius = 15;
        this.strokeColor = 'white';

    }

    // definiramo kretanje u ovisnosti o pritisnutim tipkama te ako izadjemo iz okvira vraca nas na suprotnu stranu
    Update() {
        if (keys[38]) {
            this.y -= this.speed*30;
        }
        
        if (keys[40]) {
            this.y += this.speed*30;
        }

        if (keys[39]) {
            this.x += this.speed*30;
        }

        if (keys[37]) {
            this.x -= this.speed*30;
        }

        if (this.x < this.radius) {
            this.x = canvas.width;
        }
        if (this.x > canvas.width) {
            this.x = this.radius;
        }
        if (this.y < this.radius) {
            this.y = canvas.height;
        }
        if (this.y > canvas.height) {
            this.y = this.radius;
        }
    }

    Draw() {
        ctx.fillStyle = 'red';
        ctx.shadowColor = 'red';
        ctx.shadowBlur = 10;
        ctx.fillRect(this.x, this.y, this.radius * 2, this.radius * 2);
    }
}

class Star {
    constructor() {
        this.visible = true;
        this.x = Math.floor(Math.random() * canvasWidth);
        this.y = Math.floor(Math.random() * canvasHeight);
        this.speed = 5;
        this.angle = Math.floor(Math.random() * 359);
    }

    Update() {
        let radians = this.angle / Math.PI * 180;
        this.x += Math.cos(radians) * this.speed;
        this.y += Math.sin(radians) * this.speed;

        // Handle wrapping for stars
        if (this.x < 0 || this.x > canvasWidth || this.y < 0 || this.y > canvasHeight) {
            this.x = Math.floor(Math.random() * canvasWidth);
            this.y = Math.floor(Math.random() * canvasHeight);
        }
    }

    Draw() {
        ctx.fillStyle = 'white';
        ctx.fillRect(this.x, this.y, 2, 2);
    }
}

 
class Asteroid{
    // generiramo random pocetnu lokaciju i kut kretanja asteroida, te slucajno odabiremo jednu od pet predefiniranih velicina i boja asteroida
    constructor() {
        this.visible = true;
        // pocetno izvan canvasa
        this.x = Math.random() < 0.5 ? -50 : canvasWidth + 50;
        this.y = Math.floor(Math.random() * canvasHeight);
        this.speed = 2;
        this.angle = Math.floor(Math.random() * 359);
        this.randomNum = Math.floor(Math.random() * 5);
        this.radius = asteroidRadiuses[this.randomNum];
    }

    // definiramo kretanje asteroida
    Update(){
        this.speed = this.speed*1.00001
        let radians = this.angle / Math.PI * 180;
        this.x += Math.cos(radians) * this.speed;
        this.y += Math.sin(radians) * this.speed;
        
        if (this.x < this.radius) {
            this.x = canvas.width;
        }
        if (this.x > canvas.width) {
            this.x = this.radius;
        }
        if (this.y < this.radius) {
            this.y = canvas.height;
        }
        if (this.y > canvas.height) {
            this.y = this.radius;
        }
    }

    Draw(){
        const asteroidColor = greys[this.randomNum];
        ctx.fillStyle = asteroidColor;
        ctx.shadowColor = 'gray';
        ctx.shadowBlur = 5;
        ctx.fillRect(this.x, this.y, this.radius * 2, this.radius * 2);
    }
}

function Render() {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    for (let j = 0; j < asteroids.length; j++) {
        asteroids[j].Update();
        asteroids[j].Draw();
    }

    for (let j = 0; j < stars.length; j++) {
        stars[j].Update();
        stars[j].Draw();
    }
    // provjeravamo je li se desila kolizija te ako je zavrsavamo igru te usporedjujemom score sa highscoreom
    if (ship.visible) {
        if (!collided) {
            for (let i = 0; i < asteroids.length; i++) {
                const asteroid = asteroids[i];
                if(ship.x < asteroid.x + asteroid.radius * 2 && ship.x + ship.radius * 2 > asteroid.x &&
                    ship.y < asteroid.y + asteroid.radius * 2 && ship.y + ship.radius * 2 > asteroid.y) {
                    endTime = new Date().getTime() - startTime;
                    if(highScore < endTime) {
                        highScore = endTime;
                        localStorage.setItem(localStorageName, endTime);
                    }
                    collided = true;
                    ship.visible = false; 
                }
            }
        }
        // dok se ne desi kolizija ispisujemo trenutno vrijeme i highscore
        let currentTime = new Date().getTime() - startTime;
        ctx.fillStyle = "white";
        ctx.font = "20px Arial";
        ctx.fillText(`Time: ${formatTime(currentTime)}`, 20, 30);
        ctx.fillText(`High score: ${formatTime(highScore)}`, 20, 60);

        ship.Update();
        ship.Draw();
    } else {
        // event listener ako se pritisne tipka za nastavak igre
        document.body.addEventListener("keydown", HandleRestart);

        // u slucaju kolizije ispisujemo game over i score i high score
        ctx.fillStyle = "white";
        ctx.font = "50px Arial";
        ctx.fillText("GAME OVER", canvasWidth / 2 - 150, canvasHeight / 2);
        ctx.fillText(`Time: ${formatTime(endTime)} | High Score: ${formatTime(highScore)}`, canvasWidth / 2 - 400, canvasHeight / 2 + 50);
        ctx.fillText("Press Space to Restart", canvasWidth / 2 - 250, canvasHeight / 2 + 100);
    }

    requestAnimationFrame(Render);
}


// ako se nakon game overa pritisne space tipka resetiramo igru(pokrecemo ponovno)
function HandleRestart(e) {
    if (e.keyCode === 32) { 
        gameOver = false;
        collided = false;
        ship.visible = true;
        ship.x = canvasWidth / 2;
        ship.y = canvasHeight / 2;
        startTime = new Date().getTime();
        highScore = localStorage.getItem(localStorageName);

        // reset asteroida
        asteroids = [];
        for (let i = 0; i < 8; i++) {
            asteroids.push(new Asteroid());
        }

        // uklanjamo event listener za space tipku
        document.body.removeEventListener("keydown", HandleRestart);
    }
}

// formatiramo vrijeme u min:sek:milisek
function formatTime(milliseconds) {
    let minutes = Math.floor(milliseconds / (60 * 1000));
    let seconds = Math.floor((milliseconds % (60 * 1000)) / 1000);
    let millisecondsPart = milliseconds % 1000;

    minutes = minutes < 10 ? "0" + minutes : minutes;
    seconds = seconds < 10 ? "0" + seconds : seconds;
    millisecondsPart = millisecondsPart < 10 ? "00" + millisecondsPart : millisecondsPart < 100 ? "0" + millisecondsPart : millisecondsPart;

    return `${minutes}:${seconds}:${millisecondsPart}`;
}