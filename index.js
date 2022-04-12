const express = require('express');
const app = express();
const port = 80;

const https = require('https');
const fs = require('fs');

const key = process.env.FRC_API_KEY;
const keyBuf = Buffer.from(key);
const b64key = keyBuf.toString('base64');

const Match = require("./match.js");
const Team = require("./team.js");

app.get('/', (req, res) => {
		loadHome(res);
		});

app.get('/data/', (req, res) => {
	loadMeet(req.query.code, res);
});

app.listen(port, () => {
		console.log("server started");
		});


async function loadHome(res) {
	var result = JSON.parse(await getData('/events/'));
	var out = "<!DOCTYPE html><html><head><title>FRC Scouting Home</title></head><body>";
	out += "<h1>Event List</h1>";
	for(let e in result.Events) {
		e = result.Events[e];
		out += "<a href=\"data/?code=" + e.code + "\">" + e.name + "</a><br>"; 
	}
	out += "<br><a href=\"https://frc-events.firstinspires.org/services/API\">Event Data Provided By <i>FIRST</i>.</a>";
	out += "</body></html>";
	res.send(out);
}

async function loadMeet(meet, res) {
	var schedule = JSON.parse(await getData('/schedule/' + meet + '?tournamentLevel=Qualification'));
	var matches = JSON.parse(await getData('/scores/' + meet + '/Qualification'));

	var matchList = [];

	let matchSchedule = schedule.Schedule;

	for(let i in matchSchedule) {
		let match = matchSchedule[i];
		let m = new Match();
		matchList.push(m);
		let teams = match["teams"];
		m.red.push(teams[0]["teamNumber"]);
		m.red.push(teams[1]["teamNumber"]);
		m.red.push(teams[2]["teamNumber"]);
		m.blue.push(teams[3]["teamNumber"]);
		m.blue.push(teams[4]["teamNumber"]);
		m.blue.push(teams[5]["teamNumber"]);
	}

	let scores = matches["MatchScores"];

	for(let i in scores) {
		let m = matchList[i];
		m.run = true;
		let blue = scores[i]["alliances"][0];
		let red = scores[i]["alliances"][1];

		m.bluescore = blue["totalPoints"];
		m.redscore = red["totalPoints"];
		m.blueauto = blue["autoPoints"];
		m.redauto = red["autoPoints"];
		m.blueend = blue["endgamePoints"];
		m.redend = red["endgamePoints"];
		m.bluecargo = blue["teleopCargoPoints"];
		m.redcargo = red["teleopCargoPoints"];
		m.bluefouls = red["foulPoints"];
		m.redfouls = blue["foulPoints"];
		m.bluerank = blue["rp"];
		m.redrank = red["rp"];
	}

	teams = {}

	for (let i in matchList) {
		let match = matchList[i];
		if(!match.run) {
			break;
		}
		for(let i in match.red) {
			let t = match.red[i];
			if(teams[t] == null) {
				teams[t] = new Team(t);
			}
			teams[t].scores.push(match.redscore);
			teams[t].margins.push(match.redscore-match.bluescore);
			teams[t].autoscores.push(match.redauto);
			teams[t].endgames.push(match.redend);
			teams[t].cargoscores.push(match.redcargo);
			teams[t].foulpoints.push(match.redfouls);
			teams[t].rankingpoints.push(match.redrank);
		}
		for(let i in match.blue) {
			let t = match.blue[i];
			if(teams[t] == null) {
				teams[t] = new Team(t);
			}
			teams[t].scores.push(match.bluescore);
			teams[t].margins.push(match.bluescore-match.redscore);
			teams[t].autoscores.push(match.blueauto);
			teams[t].endgames.push(match.blueend);
			teams[t].cargoscores.push(match.bluecargo);
			teams[t].foulpoints.push(match.bluefouls);
			teams[t].rankingpoints.push(match.bluerank);
		}
	}


	let out = "<!DOCTYPE html><html><head><title>" + meet + " stats</title>"; 

	out += `<style>
		table, th, td {
			border-collapse: collapse;
			border: 1px solid black;
			padding: 2px;
		}
		thead {
			background-color: #aaaaaa;
		}
		tbody tr:nth-child(odd) {
			background-color: #ffffff;
		}
		tbody tr:nth-child(even) {
			background-color: #dddddd;
		}
	</style>`;


	out += "</head><body>";

	out += "<table id=\"data\"><thead>";
	out += "<tr>";
	out += "<th>Team #</th>";
	out += "<th>Average Ranking Points</th>";
	out += "<th>Average Alliance Score</th>";
	out += "<th>Median Alliance Score</th>";
	out += "<th>Alliance Score SD</th>";
	out += "<th>Average Point Margin</th>";
	out += "<th>Median Point Margin</th>";
	out += "<th>Point Margin SD</th>";
	out += "<th>Average Auto Score</th>";
	out += "<th>Median Auto Score</th>";
	out += "<th>Auto Score SD</th>";
	out += "<th>Average Endgame Score</th>";
	out += "<th>Median Endgame Score</th>";
	out += "<th>Endgame Score SD</th>";
	out += "<th>Average Teleop Cargo Score</th>";
	out += "<th>Median Teleop Cargo Score</th>";
	out += "<th>Teleop Cargo Score SD</th>";
	out += "<th>Average Foul Points</th>";
	out += "<th>Median Foul Points</th>";
	out += "<th>Foul Points SD</th>";
	out += "</tr></thead><tbody>";

	for(let i in teams) {
		out += "<tr>" + teams[i].out() + "</tr>";
	}

	out += "</tbody></table>"

	out += "<br><a href=\"https://frc-events.firstinspires.org/services/API\">Event Data Provided By <i>FIRST</i>.</a>";

	out += `
	<script>
		const table = document.getElementById('data');
		const headers = table.querySelectorAll('th');
		[].forEach.call(headers, function(header, index) {
			header.addEventListener('click', function () {
				sortColumn(index);
			});
		});

		const tableBody = table.querySelector('tbody');
		const rows = tableBody.querySelectorAll('tr');

		const directions = Array.from(headers).map(function (header) {
			return '';
		});

		const sortColumn = function(index) {
			const direction = directions[index] || 'asc';

			const multiplier = (direction === 'asc') ? 1 : -1;

			const newRows = Array.from(rows);

			newRows.sort(function(rowA, rowB) {
				const cellA = rowA.querySelectorAll('td')[index].innerHTML;
				const cellB = rowB.querySelectorAll('td')[index].innerHTML;

				const a = parseFloat(cellA);
				const b = parseFloat(cellB);

				switch(true) {
					case a > b:
						return 1 * multiplier;
					case a < b:
						return -1 * multiplier;
					case a === b:
						return 0;
				}
			});

			[].forEach.call(rows, function(row) {
				tableBody.removeChild(row);
			});

			newRows.forEach(function (newRow) {
				tableBody.appendChild(newRow);
			});

			directions[index] = direction === 'asc' ? 'desc': 'asc';
		};

	</script>`;

	out += "</body></html>";


	res.send(out);
}

function getData(path) {
	var options = {
		'method': 'GET',
		'hostname': 'frc-api.firstinspires.org',
		'path': '/v3.0/' + new Date().getFullYear() + path,
		'headers': {
			'Authorization': 'Basic ' + b64key
		}
	};

	return new Promise(function(resolve, reject) {
			var req = https.request(options, function (res) {
					var chunks = [];

					res.on("data", function(chunk) {
							chunks.push(chunk);
							});

					res.on("end", function(chunk) {
							var body = Buffer.concat(chunks);
							resolve(body.toString());
							});

					res.on("error", function(error) {
							console.error(error);	
							});
					});

			req.end();
			});
}
