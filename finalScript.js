let playerHealth = 10;
let enemyHealth = 6;
let isPlayerTurn = true;

function displayStatus() {
    document.getElementById('playerHealth').innerText = "Player Health: " + playerHealth;
    document.getElementById('enemyHealth').innerText = "Enemy Health: " + enemyHealth;
}

function playerAttack(noise) {
    if (isPlayerTurn) {
        enemyHealth -= Math.round(noise / 10);
        console.log("Player attacks the enemy and deals 1 damage.");
        displayStatus();
        checkGameOver();
        isPlayerTurn = false;
        enemyTurn();
    } else {
        console.log("It's not your turn to attack.");
    }
}

function enemyTurn() {
    if (!isPlayerTurn) {
        playerHealth -= 1;
        console.log("The enemy attacks and deals 1 damage to the player.");
        displayStatus();
        checkGameOver();
        isPlayerTurn = true;
    }
}

function checkGameOver() {
    if (playerHealth <= 0) {
        console.log("You are defeated. Game over!");
        resetGame();
    } else if (enemyHealth <= 0) {
        console.log("Congratulations! You have defeated the enemy. You win!");
        resetGame();
    }
}

function resetGame() {
    playerHealth = 10;
    enemyHealth = 6;
    isPlayerTurn = true;
    console.log("Game reset.");
    displayStatus();
}

// Start the game
displayStatus();

// Variables to store the audio stream and analyzer node
let audioStream, analyzer;
let highestDecibel = 0;

// Function to request microphone access and start recording
function startRecording() {
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

function itemMenu() {
    const sideMenu = document.getElementById('sideMenu');
    sideMenu.classList.toggle('open');
}
