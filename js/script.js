// Array of birthday messages
const messages = [
    "Happy Birthday to the best mom ever! 🎂❤️",
    "You light up our lives like candles below.Click on them to turn them off 🕯️💖",
    "Wishing you all the love and happiness in the world! 🌟✨",
    "Thank you for everything, Mom! You're our superhero! 🦸‍♀️💪"
];

let messageIndex = 0;
const cake = document.getElementById('cake');
const messageBox = document.getElementById('message-box');
const confettiCanvas = document.getElementById('confetti-canvas');
const slideshow = document.getElementById('slideshow');
const slideshowImage = document.getElementById('slideshow-image');
const caption = document.getElementById('caption');
const balloon = document.getElementById('balloon');
const star = document.getElementById('star');

// Sound
const clickSound = new Audio('assets/Mama.mp3');

// Function to generate random colors
function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

// Cake click event
cake.addEventListener('click', () => {
    clickSound.play();

    if (messageIndex < messages.length) {
        messageBox.textContent = messages[messageIndex];
        messageBox.style.color = getRandomColor();
        messageIndex++;
    } else {
        messageBox.textContent = "🎉 Thanks Supermom! 🎉";
        messageBox.style.color = getRandomColor();
        slideshow.style.display = 'block'; // Show slideshow
        startSlideshow(); // Start the slideshow
        showBalloonAndStar(); // Show balloons and stars

        // Show final message after everything else
        setTimeout(() => {
            document.getElementById('final-message').style.display = 'block';
        }, 5000); // Delay to ensure it appears after the slideshow
    }

    launchConfetti();
});


// Confetti effect
const ctx = confettiCanvas.getContext('2d');
let confetti = [];

function random(min, max) {
    return Math.random() * (max - min) + min;
}

function createConfettiPiece() {
    return {
        x: random(0, window.innerWidth),
        y: random(-20, window.innerHeight),
        size: random(5, 10),
        color: `hsl(${random(0, 360)}, 100%, 70%)`,
        speedX: random(-2, 2),
        speedY: random(2, 5)
    };
}

function launchConfetti() {
    for (let i = 0; i < 100; i++) {
        confetti.push(createConfettiPiece());
    }
}

function drawConfetti() {
    ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    confetti.forEach((piece, i) => {
        ctx.fillStyle = piece.color;
        ctx.fillRect(piece.x, piece.y, piece.size, piece.size);

        piece.x += piece.speedX;
        piece.y += piece.speedY;

        if (piece.y > window.innerHeight) {
            confetti.splice(i, 1);
        }
    });
    requestAnimationFrame(drawConfetti);
}

confettiCanvas.width = window.innerWidth;
confettiCanvas.height = window.innerHeight;
drawConfetti();

// Slideshow functionality
const slideshowImages = [
    { src: 'assets/memo0.jpg', caption: 'Hard-worker + Friendship=Supermom' },
    { src: 'assets/memo1.jpg', caption: 'You on Duty is more than a hard-worker!' },
    { src: 'assets/memo2.jpg', caption: 'Family trips are meaningless without your presence!' },
    { src: 'assets/memo3.jpg', caption: 'Mom + dad = Joy!' },
    { src: 'assets/memo4.jpg', caption: 'The smile on your face says a lot mom!' },
    { src: 'assets/emo5.jpg', caption: 'What a picture, Supermom' },
    { src: 'assets/emo6.jpg', caption: 'Many Many Years Supermom' },
    { src: 'assets/memo7.jpg', caption: 'My fav couple!' },
    { src: 'assets/memo8.jpg', caption: 'May Allah always shower you with more blessings mom!' },
    { src: 'assets/memo9.jpg', caption: 'Happiness on its peak!!' },
    { src: 'assets/memo10.jpg', caption: 'You never bore!' },
    { src: 'assets/memo11.jpg', caption: 'The boss herself!' },
    { src: 'assets/memo13.jpg', caption: 'We just Love you!' },
   
    
];
let slideshowIndex = 0;

function startSlideshow() {
    setInterval(() => {
        slideshowIndex = (slideshowIndex + 1) % slideshowImages.length;
        slideshowImage.src = slideshowImages[slideshowIndex].src;
        caption.textContent = slideshowImages[slideshowIndex].caption;
    }, 3000); // Change image every 3 seconds
}

// Show balloons and stars
function showBalloonAndStar() {
    balloon.style.display = 'block';
    star.style.display = 'block';
}

// Balloon and star click/hover events
balloon.addEventListener('click', () => {
    alert("You always as bright as a star!");
});

star.addEventListener('mouseover', () => {
    alert("You found a hidden fun fact: You’re amazing!");
});

// Easter egg functionality
document.body.addEventListener('click', (event) => {
    if (event.target === document.body) {
        alert("You found a hidden Egg! We love you, Mom! Ramadhan Mubaraq");
    }
});

// Floating balloons
function createFloatingCharacter() {
    const character = document.createElement('div');
    character.className = 'floating-character2';
    character.textContent = '🎈';
    character.style.left = Math.random() * 100 + 'vw'; // Position randomly
    document.body.appendChild(character);
}
setInterval(createFloatingCharacter, 1000); // Create a new balloon every second

// Candles functionality
document.querySelectorAll('.candle').forEach((candle) => {
    candle.addEventListener('click', () => {
        candle.textContent = '💨'; // Blow out
        candle.classList.add('candle-blown-out'); // Add blown-out style
    });
});

