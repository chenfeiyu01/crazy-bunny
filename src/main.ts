import { Game } from './Game';

const gameContainer = document.getElementById('game-container')!;

const game = new Game(gameContainer);
game.start();
