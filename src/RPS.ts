import {
  SmartContract,
  State,
  state,
  method,
  Field,
  PublicKey,
  Circuit,
} from 'o1js';

enum RPS {
  Rock = 0,
  Paper = 1,
  Scissors = 2,
}

export class RockPaperScissors extends SmartContract {
  @state(PublicKey) player1 = State<PublicKey>();
  @state(PublicKey) player2 = State<PublicKey>();
  @state(Field) player1Choice = State<Field>();
  @state(Field) player2Choice = State<Field>();
  @state(PublicKey) winner = State<PublicKey>();
  @state(Field) gameActive = State<Field>();

  init() {
    super.init();
    this.player1.set(PublicKey.empty());
    this.player2.set(PublicKey.empty());
    this.player1Choice.set(Field(0));
    this.player2Choice.set(Field(0));
    this.winner.set(PublicKey.empty());
    this.gameActive.set(Field(0));
  }

  @method async joinGame(player: PublicKey) {
    if (this.gameActive.get().equals(Field(1))) {
      throw new Error('Game is already active.');
    }

    if (this.player1.get().equals(PublicKey.empty())) {
      this.player1.set(player);
    } else if (this.player2.get().equals(PublicKey.empty())) {
      this.player2.set(player);
      this.gameActive.set(Field(1)); // Activate the game when both players have joined
    } else {
      throw new Error('Game is already full.');
    }
  }

  @method async makeChoice(player: PublicKey, choice: Field) {
    if (!this.gameActive.get().equals(Field(1))) {
      throw new Error('Game is not active.');
    }

    if (
      !this.player1.get().equals(player) &&
      !this.player2.get().equals(player)
    ) {
      throw new Error('Player is not part of this game.');
    }

    if (player.equals(this.player1.get())) {
      this.player1Choice.set(choice);
    } else if (player.equals(this.player2.get())) {
      this.player2Choice.set(choice);
    } else {
      throw new Error('Player is not part of this game.');
    }
  }

  @method async revealChoices() {
    if (!this.gameActive.get().equals(Field(1))) {
      throw new Error('Game is not active.');
    }

    if (
      this.player1Choice.get().equals(Field(0)) ||
      this.player2Choice.get().equals(Field(0))
    ) {
      throw new Error('Both players must make a choice.');
    }

    const choice1 = this.player1Choice.get();
    const choice2 = this.player2Choice.get();

    // Rock Paper Scissors Logic
    if (choice1.equals(choice2)) {
      this.winner.set(PublicKey.empty()); // Tie
    } else if (
      (choice1.equals(Field(RPS.Rock)) &&
        choice2.equals(Field(RPS.Scissors))) ||
      (choice1.equals(Field(RPS.Paper)) && choice2.equals(Field(RPS.Rock))) ||
      (choice1.equals(Field(RPS.Scissors)) && choice2.equals(Field(RPS.Paper)))
    ) {
      this.winner.set(this.player1.get()); // Player 1 wins
    } else {
      this.winner.set(this.player2.get()); // Player 2 wins
    }

    this.resetGame();
  }

  @method async resetGame() {
    this.player1.set(PublicKey.empty());
    this.player2.set(PublicKey.empty());
    this.player1Choice.set(Field(0));
    this.player2Choice.set(Field(0));
    this.winner.set(PublicKey.empty());
    this.gameActive.set(Field(0));
  }
}
