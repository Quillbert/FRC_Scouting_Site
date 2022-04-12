class Team {
	constructor(num) {
		this.id = num;
		this.scores = [];
		this.autoscores = [];
		this.margins = [];
		this.endgames = [];
		this.cargoscores = [];
		this.foulpoints = [];
		this.rankingpoints = [];
	}

	toString() {
		return "" +
		this.id + " " + 
		this.scores + " " +
		this.margins;
	}

	mean(arr) {
		let sum = 0;
		for(let i = 0; i < arr.length; i++) {
			sum += arr[i];
		}
		return sum/arr.length;
	}

	median(arr) {
		let copy = [...arr];
		copy.sort(function(a, b) {return a-b});
		if(copy.length % 2 === 0) {
			return (copy[(copy.length/2)-1]+copy[copy.length/2])/2;
		} else {
			return copy[copy.length/2-.5];
		}
	}

	stdev(arr) {
		let m = this.mean(arr);
		let d = [];
		for(let i = 0; i < arr.length; i++) {
			let diff = (arr[i]-m);
			d.push(diff*diff);
		}
		return Math.sqrt(this.mean(d));
	}

	out() {
		let o = "<td>" +
		this.id + "</td><td>" +
		this.mean(this.rankingpoints) + "</td><td>" +
		this.mean(this.scores) + "</td><td>" +
		this.median(this.scores) + "</td><td>" +
		this.stdev(this.scores) + "</td><td>" +
		this.mean(this.margins) + "</td><td>" +
		this.median(this.margins) + "</td><td>" +
		this.stdev(this.margins) + "</td><td>" +
		this.mean(this.autoscores) + "</td><td>" +
		this.median(this.autoscores) + "</td><td>" +
		this.stdev(this.autoscores) + "</td><td>" +
		this.mean(this.endgames) + "</td><td>" +
		this.median(this.endgames) + "</td><td>" +
		this.stdev(this.endgames) + "</td><td>" +
		this.mean(this.cargoscores) + "</td><td>" +
		this.median(this.cargoscores) + "</td><td>" +
		this.stdev(this.cargoscores) + "</td><td>" +
		this.mean(this.foulpoints) + "</td><td>" +
		this.median(this.foulpoints) + "</td><td>" +
		this.stdev(this.foulpoints) + "</td>";
		
		return o;
	}
}

module.exports = Team;
