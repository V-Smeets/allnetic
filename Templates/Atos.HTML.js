"use strict";

class Item {

	#id;

	constructor(id) {
		this.#id = id;
	}

	get id() {
		return this.#id;
	}

	getDurationOnDate(date) {
		let dayStart = new Date(date);
		dayStart.setHours(0, 0, 0, 0);
		let dayEnd = new Date(date);
		dayEnd.setHours(23, 59, 59, 999);

		return this.getDurationBetweenTimes(dayStart, dayEnd);
	}

	getDurationBetweenTimes(dayStart, dayEnd) {
		throw new Error("Abstract method");
	}

}

class ListedItem extends Item {

	static #items = {};

	static getItem(id) {
		return ListedItem.#items[id];
	}

	constructor(id) {
		super(id);
		ListedItem.#items[id] = this;
	}

}

class Period extends Item {

	#startTime;
	#duration;

	constructor(id, startTime, duration) {
		super(id);
		this.#startTime = startTime;
		this.#duration = duration;
	}

	getStartTime() {
		return this.#startTime;
	}

	getDurationBetweenTimes(dayStart, dayEnd) {
		let duration = 0;
		if (this.#startTime >= dayStart && this.#startTime <= dayEnd) {
			duration += this.#duration;
		}
		return duration;
	}

}

class WorkTimes {

	#dayStart;
	#dayEnd;
	#workTimes = [];

	constructor(date) {
		this.#dayStart = new Date(date);
		this.#dayStart.setHours(0, 0, 0, 0);
		this.#dayEnd = new Date(date);
		this.#dayEnd.setHours(23, 59, 59, 999);
		this.#workTimes.length = 24 * 4;
		for (let index = 0; index < this.#workTimes.length; index++) {
			this.#workTimes[index] = 0;
		}
	}

	add(period) {
		let duration = period.getDurationBetweenTimes(this.#dayStart, this.#dayEnd);
		if (duration === 0) {
			return;
		}
		let startTime = period.getStartTime();
		let startSeconds = (startTime.getTime() - this.#dayStart.getTime()) / 1000;
		let startIndex = this.#toIndex(startSeconds);
		let endSeconds = startSeconds + duration;
		let endIndex = this.#toIndex(endSeconds);
		for (let index = startIndex; index <= endIndex; index++) {
			this.#workTimes[index] = 1;
		}
	}

	getFirstStartTime() {
		this.#calculateIndex();
		let index = this.#firstStartIndex;
		if (index < 0) {
			return undefined;
		}
		let seconds = this.#toSeconds(index);
		return new Date(this.#dayStart.getTime() + seconds * 1000);
	}

	getFirstEndTime() {
		this.#calculateIndex();
		let index = this.#firstEndIndex;
		if (index < 0) {
			return undefined;
		}
		let seconds = this.#toSeconds(index);
		return new Date(this.#dayStart.getTime() + seconds * 1000);
	}

	getSecondStartTime() {
		this.#calculateIndex();
		let index = this.#secondStartIndex;
		if (index < 0) {
			return undefined;
		}
		let seconds = this.#toSeconds(index);
		return new Date(this.#dayStart.getTime() + seconds * 1000);
	}

	getSecondEndTime() {
		this.#calculateIndex();
		let index = this.#secondEndIndex;
		if (index < 0) {
			return undefined;
		}
		let seconds = this.#toSeconds(index);
		return new Date(this.#dayStart.getTime() + seconds * 1000);
	}

	#toIndex(seconds) {
		return Math.floor((seconds + 7.5 * 60) / (15 * 60));
	}

	#toSeconds(index) {
		return index * (15 * 60);
	}

	#indexIsCalculated = false;
	#firstStartIndex = -1;
	#firstEndIndex = -1;
	#secondStartIndex = -1;
	#secondEndIndex = -1;

	#calculateIndex() {
		if (this.#indexIsCalculated) {
			return;
		}

		let previousValue = 0;
		for (let index = 0; index < this.#workTimes.length; index++) {
			let value = this.#workTimes[index];

			if (value == previousValue) {
				;
			} else if (value > previousValue) {
				if (this.#firstStartIndex < 0) {
					this.#firstStartIndex = index;
				} else if (index - this.#firstEndIndex < 4) {
					this.#firstEndIndex = -1;
				} else if (this.#secondStartIndex < 0) {
					this.#secondStartIndex = index;
				}
			} else if (value < previousValue) {
				if (this.#firstEndIndex < 0) {
					this.#firstEndIndex = index - 1;
				} else if (this.#secondStartIndex > 0) {
					this.#secondEndIndex = index - 1;
				}
			}

			previousValue = value;
		}

		this.#indexIsCalculated = true;
	}

}

class Task extends ListedItem {

	#name;
	#psp;
	#subTasks = {};
	#periods = {};

	constructor (id, name, psp) {
		super(id);
		this.#name = name;
		this.#psp = psp;
	}

	addTask(task) {
		this.#subTasks[task.id] = task;
	}

	addPeriod(period) {
		this.#periods[period.id] = period;
	}

	getName() {
		return this.#name;
	}

	getPSP() {
		return this.#psp;
	}

	getSubTasks() {
		return this.#subTasks;
	}

	getDurationBetweenTimes(dayStart, dayEnd) {
		let duration = 0;
		for (const [id, subTask] of Object.entries(this.#subTasks)) {
			duration += subTask.getDurationBetweenTimes(dayStart, dayEnd);
		}
		for (const [id, period] of Object.entries(this.#periods)) {
			duration += period.getDurationBetweenTimes(dayStart, dayEnd);
		}
		return duration;
	}

	updateWorkTimes(workTimes) {
		for (const [id, subTask] of Object.entries(this.#subTasks)) {
			subTask.updateWorkTimes(workTimes);
		}
		for (const [id, period] of Object.entries(this.#periods)) {
			workTimes.add(period);
		}
	}

}

class Project extends ListedItem {

	#name;
	#tasks = {};

	constructor(id, name) {
		super(id);
		this.#name = name;
	}

	addTask(task) {
		this.#tasks[task.id] = task;
	}

	getName() {
		return this.#name;
	}

	getTasks() {
		return this.#tasks;
	}

	updateWorkTimes(workTimes) {
		for (const [id, task] of Object.entries(this.#tasks)) {
			task.updateWorkTimes(workTimes);
		}
	}

}

class Report {

	#projects = {};

	addProject(id, name) {
		this.#projects[id] = new Project(id, name);
	}

	addTask(id, parentId, name, psp) {
		let parentItem = ListedItem.getItem(parentId);
		parentItem.addTask(new Task(id, name, psp));
	}

	addPeriod(id, parentId, startTime, duration) {
		let parentItem = ListedItem.getItem(parentId);
		parentItem.addPeriod(new Period(id, startTime, duration));
	}

	print(startDate, endDate) {
		startDate.setHours(12, 0, 0, 0);
		endDate.setHours(12, 0, 0, 0);
		this.#printTable(startDate, endDate);
	}

	#printTable(startDate, endDate) {
		document.writeln("<table>");
		this.#printHeader(startDate, endDate);
		this.#printBody(startDate, endDate, this.#projects);
		document.writeln("</table>");
	}

	#printHeader(startDate, endDate) {
		document.writeln("<thead>");
		document.writeln("<tr>");
		document.writeln("<th>Name</th>");
		document.writeln("<th>PSP</th>");
		let workTimesArray = [];
		let workTimesIndex = 0;
		for (let date = new Date(startDate); date.getTime() <= endDate.getTime(); date.setDate(date.getDate() + 1)) {
			document.writeln(`<th>${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}</th>`);
			let workTimes = new WorkTimes(date);
			workTimesArray[workTimesIndex++] = workTimes;
			for (const [id, project] of Object.entries(this.#projects)) {
				project.updateWorkTimes(workTimes);
			}
		}
		document.writeln("</tr>");
		document.writeln("<tr>");
		document.writeln("<th></th>");
		document.writeln("<th align=\"left\">1. start time</th>");
		for (let index = 0; index < workTimesArray.length; index++) {
			let workTimes = workTimesArray[index];
			let time = workTimes.getFirstStartTime();
			if (time === undefined) {
				document.writeln("<td></td>");
			} else {
				document.writeln(`<td align="right">${time.getHours()}:${time.getMinutes().toString().padStart(2, "0")}</td>`);
			}
		}
		document.writeln("</tr>");
		document.writeln("<tr>");
		document.writeln("<th></th>");
		document.writeln("<th align=\"left\">1. end time</th>");
		for (let index = 0; index < workTimesArray.length; index++) {
			let workTimes = workTimesArray[index];
			let time = workTimes.getFirstEndTime();
			if (time === undefined) {
				document.writeln("<td></td>");
			} else {
				document.writeln(`<td align="right">${time.getHours()}:${time.getMinutes().toString().padStart(2, "0")}</td>`);
			}
		}
		document.writeln("</tr>");
		document.writeln("<tr>");
		document.writeln("<th></th>");
		document.writeln("<th align=\"left\">2. start time</th>");
		for (let index = 0; index < workTimesArray.length; index++) {
			let workTimes = workTimesArray[index];
			let time = workTimes.getSecondStartTime();
			if (time === undefined) {
				document.writeln("<td></td>");
			} else {
				document.writeln(`<td align="right">${time.getHours()}:${time.getMinutes().toString().padStart(2, "0")}</td>`);
			}
		}
		document.writeln("</tr>");
		document.writeln("<tr>");
		document.writeln("<th></th>");
		document.writeln("<th align=\"left\">2. end time</th>");
		for (let index = 0; index < workTimesArray.length; index++) {
			let workTimes = workTimesArray[index];
			let time = workTimes.getSecondEndTime();
			if (time === undefined) {
				document.writeln("<td></td>");
			} else {
				document.writeln(`<td align="right">${time.getHours()}:${time.getMinutes().toString().padStart(2, "0")}</td>`);
			}
		}
		document.writeln("</tr>");
		document.writeln("</thead>");
	}

	#printBody(startDate, endDate, projects) {
		document.writeln("<tbody>");
		for (const [id, project] of Object.entries(projects).sort(this.#compareProjectEntries)) {
			this.#printProject(startDate, endDate, project);
		}
		document.writeln("</tbody>");
	}

	#printProject(startDate, endDate, project) {
		for (const [id, task] of Object.entries(project.getTasks()).sort(this.#compareTaskEntries)) {
			this.#printTask(startDate, endDate, task);
		}
	}

	#printTask(startDate, endDate, task) {
		document.writeln("<tr>");
		let name = task.getName();
		let slashIndex = name.indexOf("/");
		if (slashIndex >= 0) {
			name = name.substring(slashIndex + 1);
		}
		document.writeln(`<td>${name}</td>`);
		document.writeln(`<td>${task.getPSP()}</td>`);
		for (let date = new Date(startDate); date.getTime() <= endDate.getTime(); date.setDate(date.getDate() + 1)) {
			let duration = task.getDurationOnDate(date);
			let hours = Math.round(duration / 3600.0 * 4.0) / 4.0;
			if (hours > 0.0) {
				document.writeln(`<td align="right">${hours.toFixed(2)}</td>`);
			} else {
				document.writeln(`<td></td>`);
			}
		}
		document.writeln("</tr>");
		for (const [id, subTask] of Object.entries(task.getSubTasks())) {
			this.#printTask(startDate, endDate, subTask);
		}
	}

	#compareProjectEntries(a, b) {
		return a[1].getName().localeCompare(b[1].getName());
	}

	#compareTaskEntries(a, b) {
		return a[1].getName().localeCompare(b[1].getName());
	}

}
