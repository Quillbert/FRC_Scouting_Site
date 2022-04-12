class Match {
	constructor() {
		this.run = false;
		this.red = [];
		this.blue = [];
		this.redscore = 0;
		this.bluescore = 0;
		this.redauto = 0;
		this.blueauto = 0;
		this.redend = 0;
		this.blueend = 0;
		this.redcargo = 0;
		this.bluecargo = 0;
		this.redfouls = 0;
		this.redrank = 0;
		this.bluerank = 0;
	}

	toString() {
		return "" + this.run + " " + this.red + " " + this.blue + " " + this.redscore + " " + this.bluescore;
	}
}

module.exports = Match;
