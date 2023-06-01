let playerHealth = 10;
let enemyHealth = 6;
let isPlayerTurn = true;
let playergold = 0;

document.getElementById("statMenu").style.display = "none";  
let statMenuHidden = true;

let countStage = 0;

const goblin = { hp: 5, name: "Goblin", image: "goblin.jpg", minDamage:1, maxDamage: 2, goldVal:2}
const vampire = { hp: 7, name: "Vampire", image: "vampire.jpg", minDamage: 3, maxDamage: 5, goldVal: 5 }
const wizard = { hp: 8, name: "Wizard", image: "wizard.jpg", minDamage: 4, maxDamage: 7, goldVal: 10 }

const stage = [goblin, vampire, wizard]




function displayStatus() {
    document.getElementById('playerHealth').innerText = "HP: " + playerHealth;
    document.getElementById('enemyHealth').innerText = stage[countStage].name + " HP: " + enemyHealth;
    document.getElementById('enemyImage').src = stage[countStage].image;

    document.getElementById('statTitle').innerText = stage[countStage].name + "'s Stats";

    document.getElementById('statHealth').innerText = "Health: " + stage[countStage].hp;
    document.getElementById('statAttack').innerText = "Damage: " + stage[countStage].minDamage + " - " + stage[countStage].maxDamage;
    document.getElementById('statGold').innerText = "Gold: " + stage[countStage].goldVal;

}

function playerAttack(noise) {
    if (isPlayerTurn) {
        damage2enemy = Math.round(noise / 10)
        enemyHealth -= damage2enemy;
        document.getElementById('notification').innerText = "You deal " + damage2enemy + " to the " + stage[countStage].name;
        displayStatus();
        isPlayerTurn = false;
        checkGameOver();
    } else {
        document.getElementById('notification').innerText = " to the player."    
    }
}


function enemyTurn() {
    if (!isPlayerTurn) {
        damage2player = Math.floor(Math.random() * (stage[countStage].maxDamage - stage[countStage].minDamage + 1)) + stage[countStage].minDamage
        playerHealth -= damage2player;
        document.getElementById('notification').innerText = "The " + stage[countStage].name + " deals " + damage2player + " damage to You."

        displayStatus();
        checkGameOver();
        isPlayerTurn = true;
    }
    else {
        document.getElementById('notification').innerText = "It is your turn"    

    }
}

function checkGameOver() {
    if (playerHealth <= 0) {
        console.log("You are defeated. Game over!");
        countStage = 0
        resetGame();
    } else if (enemyHealth <= 0) {
        document.getElementById('notification').innerText = "you defeted the" + stage[countStage].name
        countStage += 1;
        resetGame();
    }
}

function resetGame() {
    //playerHealth = 10;
    enemyHealth = stage[countStage].hp;
    isPlayerTurn = true;
    console.log("Game reset.");
    displayStatus();
}

function showStats() {
    if (statMenuHidden) {
        document.getElementById("statMenu").style.display = "initial"
        statMenuHidden = false
    }
    else {
        document.getElementById("statMenu").style.display = "none"
        statMenuHidden = true
    }
}

// Start the game
displayStatus();

// Variables to store the audio stream and analyzer node
let audioStream, analyzer;
let highestDecibel = 0;

// Function to request microphone access and start recording
function startRecording() {
    if (isPlayerTurn) {
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(function (stream) {
                audioStream = stream;
                const audioContext = new AudioContext();
                const source = audioContext.createMediaStreamSource(stream);
                analyzer = audioContext.createAnalyser();
                source.connect(analyzer);
                analyzer.fftSize = 32;
                highestDecibel = 0; // Reset highest decibel
                getDecibels();
                setTimeout(stopRecording, 5000); // Stop recording after 5 seconds
            })
            .catch(function (err) {
                console.error('Error accessing microphone:', err);
            });
    }
    else {
        enemyTurn()
    }

}

// Function to stop recording and release the audio stream
function stopRecording() {
    if (audioStream) {
        audioStream.getTracks().forEach(track => track.stop());
        audioStream = null;
        analyzer = null;
        playerAttack(highestDecibel);
    }
}

// Function to measure decibels continuously
function getDecibels() {
    const dataArray = new Uint8Array(analyzer.fftSize);
    analyzer.getByteTimeDomainData(dataArray);
    let values = 0;
    const length = dataArray.length;
    for (let i = 0; i < length; i++) {
        values += Math.abs(dataArray[i] - 128);
    }
    const average = values / length;
    const decibels = 20 * Math.log10(average);

    if (decibels > highestDecibel) {
        highestDecibel = decibels;
    }

    document.getElementById('decibel').innerText = highestDecibel.toFixed(2) + ' dB';

    if (audioStream) {
        requestAnimationFrame(getDecibels);
    }
}
