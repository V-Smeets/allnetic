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

	getName() {
		return this.#name;
	}

	getPSP() {
		return this.#psp;
	}

	getSubTasks() {
		return this.#subTasks;
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

	getName() {
		return this.#name;
	}

	getTasks() {
		return this.#tasks;
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
		this.#printBody(startDate, endDate, this.#projects);
		document.writeln("</table>");
	}

	#printHeader(startDate, endDate) {
		document.writeln("<thead>");
		document.writeln("<tr>");
		document.writeln("<th>Name</th>");
		document.writeln("<th>PSP</th>");
		for (let date = new Date(startDate); date.getTime() <= endDate.getTime(); date.setDate(date.getDate() + 1)) {
			document.writeln(`<th>${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}</th>`);
		}
		document.writeln("</tr>");
		document.writeln("</thead>");
	}

	#printBody(startDate, endDate, projects) {
		document.writeln("<tbody>");
		for (const [id, project] of Object.entries(projects)) {
			this.#printProject(startDate, endDate, project);
		}
		document.writeln("</tbody>");
	}

	#printProject(startDate, endDate, project) {
		document.writeln("<tr>");
		document.writeln(`<td>${project.getName()}</td>`);
		document.writeln(`<td></td>`);
		for (let date = new Date(startDate); date.getTime() <= endDate.getTime(); date.setDate(date.getDate() + 1)) {
			document.writeln(`<td></td>`);
		}
		document.writeln("</tr>");
		for (const [id, task] of Object.entries(project.getTasks())) {
			this.#printTask(startDate, endDate, task);
		}
	}

	#printTask(startDate, endDate, task) {
		document.writeln("<tr>");
		document.writeln(`<td>${task.getName()}</td>`);
		document.writeln(`<td>${task.getPSP()}</td>`);
		for (let date = new Date(startDate); date.getTime() <= endDate.getTime(); date.setDate(date.getDate() + 1)) {
			document.writeln(`<td></td>`);
		}
		document.writeln("</tr>");
		for (const [id, subTask] of Object.entries(task.getSubTasks())) {
			this.#printTask(startDate, endDate, subTask);
		}
	}

}
