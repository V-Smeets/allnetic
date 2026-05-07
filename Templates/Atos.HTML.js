"use strict";

class Item {

	#id;

	constructor(id) {
		this.#id = id;
	}

	get id() {
		return this.#id;
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
		console.log(`Period(${id}, ${startTime}, ${duration})`);
		this.#startTime = startTime;
		this.#duration = duration;
	}

}

class Task extends ListedItem {

	#name;
	#psp;
	#subTasks = {};
	#periods = {};

	constructor (id, name, psp) {
		super(id);
		console.log(`Task(${id}, ${name}, ${psp})`);
		this.#name = name;
		this.#psp = psp;
	}

	addTask(task) {
		this.#subTasks[task.id] = task;
	}

	addPeriod(period) {
		this.#periods[period.id] = period;
	}

}

class Project extends ListedItem {

	#name;
	#tasks = {};

	constructor(id, name) {
		super(id);
		console.log(`Project(${id}, ${name})`);
		this.#name = name;
	}

	addTask(task) {
		this.#tasks[task.id] = task;
	}

}

class Report {

	#projects = {};

	addProject(id, name) {
		console.log(`addProject(${id}, ${name})`);
		this.#projects[id] = new Project(id, name);
	}

	addTask(id, parentId, name, psp) {
		console.log(`addTask(${id}, ${parentId}, ${name}, ${psp})`);
		let parentItem = ListedItem.getItem(parentId);
		parentItem.addTask(new Task(id, name, psp));
	}

	addPeriod(id, parentId, startTime, duration) {
		console.log(`addPeriod(${id}, ${parentId}, ${startTime}, ${duration})`);
		let parentItem = ListedItem.getItem(parentId);
		parentItem.addPeriod(new Period(id, startTime, duration));
	}

	print(startDate, endDate) {
		console.log(`print(${startDate}, ${endDate})`);
		startDate.setHours(12, 0, 0, 0);
		endDate.setHours(13, 0, 0, 0);
		this.#printTable(startDate, endDate);
	}

	#printTable(startDate, endDate) {
		document.writeln("<table>");
		this.#printHeader(startDate, endDate);
		document.writeln("</table>");
	}

	#printHeader(startDate, endDate) {
		document.writeln("<thead>");
		document.writeln("<tr>");
		document.writeln("<th>PSP</th>");
		document.writeln("<th>Name</th>");
		for (let date = startDate; date.getTime() <= endDate.getTime(); date.setDate(date.getDate() + 1)) {
			document.writeln(`<th>${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}</th>`);
		}
		document.writeln("</tr>");
		document.writeln("</thead>");
	}

}
