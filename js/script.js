        document.addEventListener('DOMContentLoaded', () => {
            const canvas = document.getElementById('game-canvas');
            const ctx = canvas.getContext('2d');
            const scoreElement = document.getElementById('score');
            const highScoreElement = document.getElementById('high-score');
            const finalScoreElement = document.getElementById('final-score');
            const gameOverScreen = document.getElementById('game-over');
            const startBtn = document.getElementById('start-btn');
            const restartBtn = document.getElementById('restart-btn');
            
            const gridSize = 20;
            const tileCount = canvas.width / gridSize;
            let score = 0;
            let highScore = localStorage.getItem('snakeHighScore') || 0;
            highScoreElement.textContent = highScore;
            
            let snake = [];
            let food = {};
            let direction = 'right';
            let nextDirection = 'right';
            let gameSpeed = 150;
            let gameLoop;
            let isGameRunning = false;
            
            function initGame() {
                snake = [
                    {x: 10, y: 10},
                    {x: 9, y: 10},
                    {x: 8, y: 10}
                ];
                
                direction = 'right';
                nextDirection = 'right';
                score = 0;
                scoreElement.textContent = score;
                gameSpeed = 150;
                
                placeFood();
                isGameRunning = true;
                gameOverScreen.classList.add('hidden');
                
                if (gameLoop) clearInterval(gameLoop);
                gameLoop = setInterval(gameUpdate, gameSpeed);
            }
            
            function placeFood() {
                let validPosition = false;
                
                while (!validPosition) {
                    food = {
                        x: Math.floor(Math.random() * tileCount),
                        y: Math.floor(Math.random() * tileCount)
                    };
                    
                    validPosition = true;
                    for (let segment of snake) {
                        if (segment.x === food.x && segment.y === food.y) {
                            validPosition = false;
                            break;
                        }
                    }
                }
            }
            
            function gameUpdate() {
                // Update direction
                direction = nextDirection;
                
                // Move snake
                const head = {x: snake[0].x, y: snake[0].y};
                
                switch (direction) {
                    case 'up': head.y--; break;
                    case 'down': head.y++; break;
                    case 'left': head.x--; break;
                    case 'right': head.x++; break;
                }
                
                // Check wall collision
                if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
                    gameOver();
                    return;
                }
                
                // Check self collision
                for (let segment of snake) {
                    if (segment.x === head.x && segment.y === head.y) {
                        gameOver();
                        return;
                    }
                }
                
                // Add new head
                snake.unshift(head);
                
                // Check food collision
                if (head.x === food.x && head.y === food.y) {
                    score += 10;
                    scoreElement.textContent = score;
                    
                    // Increase speed slightly as score goes up
                    gameSpeed = Math.max(50, gameSpeed - 2);
                    clearInterval(gameLoop);
                    gameLoop = setInterval(gameUpdate, gameSpeed);
                    
                    placeFood();
                } else {
                    // Remove tail if no food eaten
                    snake.pop();
                }
                
                drawGame();
            }
            
            function drawGame() {
                // Clear canvas
                ctx.fillStyle = 'black';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                
                // Draw grid lines
                ctx.strokeStyle = 'rgba(0, 255, 170, 0.1)';
                ctx.lineWidth = 1;
                
                for (let i = 0; i < tileCount; i++) {
                    // Vertical lines
                    ctx.beginPath();
                    ctx.moveTo(i * gridSize, 0);
                    ctx.lineTo(i * gridSize, canvas.height);
                    ctx.stroke();
                    
                    // Horizontal lines
                    ctx.beginPath();
                    ctx.moveTo(0, i * gridSize);
                    ctx.lineTo(canvas.width, i * gridSize);
                    ctx.stroke();
                }
                
                // Draw snake body with gradient effect
                for (let i = 0; i < snake.length; i++) {
                    const segment = snake[i];
                    const intensity = 1 - (i / snake.length) * 0.7; // Fade effect for tail
                    
                    // Body segments with rounded corners
                    ctx.beginPath();
                    const radius = gridSize / 4;
                    const x = segment.x * gridSize;
                    const y = segment.y * gridSize;
                    
                    // Draw rounded rectangle
                    ctx.moveTo(x + radius, y);
                    ctx.lineTo(x + gridSize - radius, y);
                    ctx.quadraticCurveTo(x + gridSize, y, x + gridSize, y + radius);
                    ctx.lineTo(x + gridSize, y + gridSize - radius);
                    ctx.quadraticCurveTo(x + gridSize, y + gridSize, x + gridSize - radius, y + gridSize);
                    ctx.lineTo(x + radius, y + gridSize);
                    ctx.quadraticCurveTo(x, y + gridSize, x, y + gridSize - radius);
                    ctx.lineTo(x, y + radius);
                    ctx.quadraticCurveTo(x, y, x + radius, y);
                    ctx.closePath();
                    
                    // Gradient fill from head to tail
                    const colorValue = Math.floor(170 + 85 * intensity);
                    ctx.fillStyle = `rgb(0, ${colorValue}, ${Math.floor(colorValue * 0.9)})`;
                    ctx.fill();
                    
                    // Glow effect
                    ctx.shadowColor = `rgba(0, ${colorValue}, ${Math.floor(colorValue * 0.9)}, ${intensity * 0.7})`;
                    ctx.shadowBlur = 10 * intensity;
                }
                
                // Draw head with special styling
                if (snake.length > 0) {
                    const head = snake[0];
                    const x = head.x * gridSize;
                    const y = head.y * gridSize;
                    
                    // Head shape (more rounded)
                    ctx.beginPath();
                    const headRadius = gridSize / 3;
                    ctx.moveTo(x + headRadius, y);
                    ctx.lineTo(x + gridSize - headRadius, y);
                    ctx.quadraticCurveTo(x + gridSize, y, x + gridSize, y + headRadius);
                    ctx.lineTo(x + gridSize, y + gridSize - headRadius);
                    ctx.quadraticCurveTo(x + gridSize, y + gridSize, x + gridSize - headRadius, y + gridSize);
                    ctx.lineTo(x + headRadius, y + gridSize);
                    ctx.quadraticCurveTo(x, y + gridSize, x, y + gridSize - headRadius);
                    ctx.lineTo(x, y + headRadius);
                    ctx.quadraticCurveTo(x, y, x + headRadius, y);
                    ctx.closePath();
                    
                    // Head color (brighter)
                    ctx.fillStyle = '#00ffcc';
                    ctx.fill();
                    
                    // Eyes (direction based)
                    ctx.fillStyle = 'red';
                    const eyeSize = gridSize / 7;
                    
                    switch(direction) {
                        case 'up':
                            // Eyes at top of head
                            ctx.beginPath();
                            ctx.arc(x + gridSize/3, y + gridSize/3, eyeSize, 0, Math.PI * 2);
                            ctx.arc(x + gridSize*2/3, y + gridSize/3, eyeSize, 0, Math.PI * 2);
                            ctx.fill();
                            break;
                        case 'down':
                            // Eyes at bottom of head
                            ctx.beginPath();
                            ctx.arc(x + gridSize/3, y + gridSize*2/3, eyeSize, 0, Math.PI * 2);
                            ctx.arc(x + gridSize*2/3, y + gridSize*2/3, eyeSize, 0, Math.PI * 2);
                            ctx.fill();
                            break;
                        case 'left':
                            // Eyes at left side
                            ctx.beginPath();
                            ctx.arc(x + gridSize/3, y + gridSize/3, eyeSize, 0, Math.PI * 2);
                            ctx.arc(x + gridSize/3, y + gridSize*2/3, eyeSize, 0, Math.PI * 2);
                            ctx.fill();
                            break;
                        case 'right':
                            // Eyes at right side
                            ctx.beginPath();
                            ctx.arc(x + gridSize*2/3, y + gridSize/3, eyeSize, 0, Math.PI * 2);
                            ctx.arc(x + gridSize*2/3, y + gridSize*2/3, eyeSize, 0, Math.PI * 2);
                            ctx.fill();
                            break;
                    }
                    
                    // Glow effect for head
                    ctx.shadowColor = 'rgba(0, 255, 204, 0.7)';
                    ctx.shadowBlur = 15;
                }
                
                // Reset shadow
                ctx.shadowColor = 'transparent';
                ctx.shadowBlur = 0;
                
                // Draw food
                ctx.fillStyle = '#ff00aa';
                ctx.beginPath();
                ctx.arc(
                    food.x * gridSize + gridSize/2, 
                    food.y * gridSize + gridSize/2, 
                    gridSize/2, 
                    0, 
                    Math.PI * 2
                );
                ctx.fill();
                ctx.shadowColor = 'rgba(255, 0, 170, 0.7)';
                ctx.shadowBlur = 15;
                ctx.fill();
                ctx.shadowColor = 'transparent';
            }
            
            function gameOver() {
                clearInterval(gameLoop);
                isGameRunning = false;
                
                if (score > highScore) {
                    highScore = score;
                    localStorage.setItem('snakeHighScore', highScore);
                    highScoreElement.textContent = highScore;
                }
                
                finalScoreElement.textContent = score;
                gameOverScreen.classList.remove('hidden');
            }
            
            // Event listeners
            document.addEventListener('keydown', (e) => {
                if (!isGameRunning) return;
                
                switch (e.key) {
                    case 'ArrowUp':
                    case 'w':
                    case 'W':
                        if (direction !== 'down') nextDirection = 'up';
                        break;
                    case 'ArrowDown':
                    case 's':
                    case 'S':
                        if (direction !== 'up') nextDirection = 'down';
                        break;
                    case 'ArrowLeft':
                    case 'a':
                    case 'A':
                        if (direction !== 'right') nextDirection = 'left';
                        break;
                    case 'ArrowRight':
                    case 'd':
                    case 'D':
                        if (direction !== 'left') nextDirection = 'right';
                        break;
                }
            });
            
            startBtn.addEventListener('click', initGame);
            restartBtn.addEventListener('click', initGame);
            
            // Draw initial empty grid
            drawGame();
        });