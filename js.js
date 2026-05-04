var gameCards = [];
var flippedCards = [];
var matchedCards = [];
var timer;
var timeElapsed = 0;
var lockBoard = false;
var isSoundEnabled = true; // Ses varsayılan olarak açık
// Ses dosyalarını yükle
var correctSound = new Audio('sounds/correct.mp3');  // Doğru eşleşme sesi
var wrongSound = new Audio('sounds/wrong.mp3');  // Yanlış eşleşme sesi


function startGame() {
    document.getElementById("oyun").style = "display: block;";
    document.getElementById("tz").innerHTML = "Yeni bir rekora hazır mısın?";
    document.getElementById("acilis").style = "display: none;";
    prepareGameCards();
    shuffle(gameCards);
    createBoard();
    resetGame();
    startTimer();
}

// Çerez oluşturma
function setCookie(name, value, days) {
    let expires = "";
    if (days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + encodeURIComponent(value) + expires + "; path=/";
}

function toggleSound() {
    isSoundEnabled = !isSoundEnabled; // Mevcut durumu tersine çevir

    // Seçenekler menüsünde ses durumu bildiren bir metin veya buton yazısı ekleyebilirsiniz
    const soundStatusText = document.getElementById('sound-status');
    soundStatusText.innerHTML = isSoundEnabled ? "Sesi Kapat" : "Sesi Aç";
}

// Çerez okuma
function getCookie(name) {
    const nameEQ = name + "=";
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
        let cookie = cookies[i];
        while (cookie.charAt(0) === ' ') cookie = cookie.substring(1, cookie.length);
        if (cookie.indexOf(nameEQ) === 0) {
            return decodeURIComponent(cookie.substring(nameEQ.length, cookie.length));
        }
    }
    return null;
}

function playCorrectSound() {
    if (isSoundEnabled) { // Eğer ses açık ise
        correctSound.play().catch(e => console.error('Ses çalarken hata:', e));
    }
}

// Sesin yanlış eşleşme durumunda çalması
function playWrongSound() {
    if (isSoundEnabled) { // Eğer ses açık ise
        wrongSound.play().catch(e => console.error('Ses çalarken hata:', e));
    }
}

// Çerez silme
function deleteCookie(name) {
    document.cookie = name + "=; Max-Age=-99999999; path=/";
}


function prepareGameCards() {
    // Shuffle the cards array
    shuffle(cards);

    // Select the first 6 cards (for example)
    var selectedCards = cards.slice(0, 6);

    // Clear the gameCards array
    gameCards = [];

    // Prepare gameCards with the selected cards
    selectedCards.forEach(function(card) {
        // Add word and meaning as separate cards
        gameCards.push({ type: 'word', content: card.word, image: '' });
        gameCards.push({ type: 'meaning', content: card.meaning, image: card.image });
    });
}

function toggleOptionsMenu() {
    const menu = document.getElementById('options-menu');
    if (menu.style.transform === 'translateY(0%)') {
        menu.style.transform = 'translateY(-100%)'; // Yukarı kaydır
        setTimeout(() => menu.style.display = 'none', 500); // Animasyon bitince gizle
    } else {
        menu.style.display = 'block';
        setTimeout(() => menu.style.transform = 'translateY(0%)', 10); // Görünür hale getir
    }
}

function createBoard() {
    var board = document.getElementById('game-board');
    board.innerHTML = ''; // Clear the board

    gameCards.forEach(function(card, index) {
        var cardElement = document.createElement('div');
        cardElement.className = 'card';
        cardElement.dataset.type = card.type;
        cardElement.dataset.content = card.content;
        cardElement.dataset.image = card.image;

        // Display either the word or the meaning on the card
        if (card.type === 'word') {
            cardElement.innerHTML = card.content; // Display the word
        } else if (card.type === 'meaning') {
            if (visible_image == true){
            cardElement.innerHTML = card.content; // Display the meaning
            }
        }

        // You can also show the image

        var img = document.createElement('img');
        if(card.image !== '') {
        img.src = 'images/' + card.image + ".png"; // Assuming images are stored in the 'images' folder
        img.style.display = ''; // Initially hide the image
        }else {
            img.style.display = 'none'; // Initially hide the image
        }
        cardElement.appendChild(img);
        // Add click event
        cardElement.onclick = flipCard;
        board.appendChild(cardElement);
    });
}

function flipCard() {
    if (lockBoard || this.className.includes('matched') || flippedCards.length === 2) {
        return;
    }

    // Show both text and image when flipped
    var img = this.querySelector('img');
    img.style.display = 'block'; // Show the image

    if (flippedCards.includes(this)) {
        this.classList.remove('selected');
        img.style.display = 'block'; // Hide image if card is flipped back
        flippedCards = flippedCards.filter(card => card !== this);
        return;
    }

    this.classList.add('selected');
    flippedCards.push(this);

    if (flippedCards.length === 2) {
        checkMatch();
    }
}

function checkMatch() {
    var card1 = flippedCards[0];
    var card2 = flippedCards[1];

    // Kart bilgilerini al
    var wordCard = card1.dataset.type === 'word' ? card1 : card2;
    var meaningCard = card1.dataset.type === 'meaning' ? card1 : card2;

    var matchedCard = cards.find(c => c.word === wordCard.dataset.content && c.meaning === meaningCard.dataset.content);

    if (matchedCard) {
        matchedCards.push(card1, card2);
        $(card1).animate({ opacity: 0.0 }, 500);
        $(card2).animate({ opacity: 0.0 }, 500);

        card1.classList.add('true');
        card2.classList.add('true');

        playCorrectSound();

        setTimeout(() => {
            card1.classList.add('matched');
            card2.classList.add('matched');
        }, 300);

        flippedCards = [];

        if (matchedCards.length === gameCards.length) {
            showWinScreen();
            clearInterval(timer);
        }
    } else {
        card1.classList.add('wrong');
        card2.classList.add('wrong');
        timeElapsed += 10; // Yanlış eşleşme süresini uzatır
        lockBoard = true;

        $(card1).addClass("shake");
        $(card2).addClass("shake");

        playWrongSound();

        setTimeout(() => {
            card1.classList.remove("wrong", "shake", "selected");
            card2.classList.remove("wrong", "shake", "selected");
            flippedCards = [];
            lockBoard = false;
        }, 500);
    }
}


function showWinScreen() {
    document.getElementById('acilis').style.display = 'block';
    document.getElementById("oyun").style = "display: none;";
    totalTime = parseFloat(document.getElementById("timer").innerText, 10);

    const currentRecord = getCookie("rekor");
    if (currentRecord === null) {
        setCookie("rekor", totalTime, 365);
    } else {
        if (totalTime < parseFloat(currentRecord, 10)) {
            setCookie("rekor", totalTime, 365);
            document.getElementById("tzx").innerHTML = "Yeni rekor: " + getCookie("rekor");
        }
    else {
            document.getElementById("tzx").innerHTML = getCookie("rekor") + " saniye olan rekorunu kırmaya çalış.";
        }
    }
    console.log(getCookie("rekor"));
    
}


function shuffle(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}

function startTimer() {
    timeElapsed = 0;
    document.getElementById('timer').innerText = (timeElapsed / 10).toFixed(1);
    timer = setInterval(function() {
        timeElapsed++;
        document.getElementById('timer').innerText = (timeElapsed / 10).toFixed(1);
    }, 100);
}
function resetGame() {
    flippedCards = [];
    matchedCards = [];
    clearInterval(timer);
    timeElapsed = 0;
    document.getElementById('timer').innerText = gamename;
}


function toggleFullScreen() {
    if (!document.fullscreenElement &&    // Eğer tam ekran modunda değilse
        !document.mozFullScreenElement && // Firefox için
        !document.webkitFullscreenElement && // Webkit tabanlı tarayıcılar (Chrome, Safari)
        !document.msFullscreenElement) {  // Internet Explorer/Edge
      // Tam ekran moduna geç
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen();
      } else if (document.documentElement.mozRequestFullScreen) { // Firefox için
        document.documentElement.mozRequestFullScreen();
      } else if (document.documentElement.webkitRequestFullscreen) { // Chrome/Safari için
        document.documentElement.webkitRequestFullscreen();
      } else if (document.documentElement.msRequestFullscreen) { // IE/Edge için
        document.documentElement.msRequestFullscreen();
      }
    } else { 
      // Tam ekran modundan çık
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.mozCancelFullScreen) { // Firefox için
        document.mozCancelFullScreen();
      } else if (document.webkitExitFullscreen) { // Webkit tabanlı tarayıcılar
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) { // IE/Edge için
        document.msExitFullscreen();
      }
    }
  }
  
