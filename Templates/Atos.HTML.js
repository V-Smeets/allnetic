function Report() {
	this.projects = new Array();
	this.projectsSorted = false;
}

Report.prototype.findProject = function(id) {
	for (var i = 0; i < this.projects.length; i++) {
		var project = this.projects[i];
		if (project.id == id) {
			return project;
		}
	}
	return null;
};

Report.prototype.findTask = function(id) {
	for (var i = 0; i < this.projects.length; i++) {
		var project = this.projects[i];
		var task = project.findTask(id);
		if (task != null) {
			return task;
		}
	}
	return null;
};

Report.prototype.findPeriod = function(id) {
	for (var i = 0; i < this.projects.length; i++) {
		var project = this.projects[i];
		var period = project.findPeriod(id);
		if (period != null) {
			return period;
		}
	}
	return null;
};

Report.prototype.addProject = function(id, name) {
	var project = this.findProject(id);
	if (project != null) {
		alert("The project with the id " + id + " already exists!");
	}
	this.projects.push(new Project(id, name));
	this.projectsSorted = false;
};

Report.prototype.addTask = function(id, parentId, name, psp) {
	var task = this.findTask(id);
	if (task != null) {
		alert("The task with the id " + id + " already exists!");
	}
	var parent = this.findProject(parentId);
	parent = parent != null ? parent : this.findTask(parentId);
	if (parent == null) {
		alert("The parent with the id " + parentId + " doesn't exists!");
	}
	var nameParts = name.split(Task.nameSeparator);
	var partIndex = nameParts.length - 1;
	task = new Task(parent, id, nameParts[partIndex], psp);
	parent.addTask(task);
};

Report.prototype.addPeriod = function(id, parentId, startTime, duration) {
	var period = this.findPeriod(id);
	if (period != null) {
		alert("The period with the id " + id + " already exists!");
	}
	var parent = this.findTask(parentId);
	if (parent == null) {
		alert("The parent with the id " + parentId + " doesn't exists!");
	}
	period = new Period(parent, id, startTime, duration);
	parent.addPeriod(period);
};

Report.prototype.print = function(startDate, endDate) {
	if (!this.projectsSorted) {
		this.projects.sort(Project.sortFunction);
		this.projectsSorted = true;
	}
	for (var date = startDate; date.getTime() <= endDate.getTime(); date
			.setTime(date.getTime() + (24 * 60 * 60 * 1000))) {
		var day = new Day();
		for (var i = 0; i < this.projects.length; i++) {
			var project = this.projects[i];
			project.addPeriodsToDay(date, day);
		}
		document.writeln("<TABLE>");
		document.writeln("<CAPTION>" + date.toDateString() + "</CAPTION>");

		document.writeln("<THEAD>");
		document.writeln("<TR><TH colspan=\"2\">Name</TH><TH>Time</TH></TR>");
		document.writeln("</THEAD>");
		document.writeln("<TBODY>");
		document.writeln("<TR><TD colspan=\"2\">1. Start</TD><TD>"
				+ day.getFirstStartTime() + "</TD></TR>");
		document.writeln("<TR><TD colspan=\"2\">1. End</TD><TD>"
				+ day.getFirstEndTime() + "</TD></TR>");
		document.writeln("<TR><TD colspan=\"2\">2. Start</TD><TD>"
				+ day.getLastStartTime() + "</TD></TR>");
		document.writeln("<TR><TD colspan=\"2\">2. End</TD><TD>"
				+ day.getLastEndTime() + "</TD></TR>");
		document.writeln("</TBODY>");

		document.writeln("<THEAD>");
		document.writeln("<TR><TH>PSP</TH><TH>Name</TH><TH>Time</TH></TR>");
		document.writeln("</THEAD>");
		document.writeln("<TBODY>");
		for (var i = 0; i < this.projects.length; i++) {
			var project = this.projects[i];
			project.print(date);
		}
		document.writeln("</TBODY>");
		document.writeln("</TABLE>");
	}
};

function Project(id, name) {
	this.id = id;
	this.named = name;
	this.tasks = new Array();
	this.tasksSorted = false;
}

Project.sortFunction = function(a, b) {
	if (a == null && b == null) {
		return 0;
	} else if (a == null) {
		return -1;
	} else if (b == null) {
		return 1;
	} else if (a.name < b.name) {
		return -1;
	} else if (a.name > b.name) {
		return 1;
	} else {
		return 0;
	}
};

Project.prototype.findTask = function(id) {
	for (var i = 0; i < this.tasks.length; i++) {
		var task = this.tasks[i];
		if (task.id == id) {
			return task;
		}
		var subTask = task.findSubTask(id);
		if (subTask != null) {
			return subTask;
		}
	}
	return null;
};

Project.prototype.findPeriod = function(id) {
	for (var i = 0; i < this.tasks.length; i++) {
		var task = this.tasks[i];
		var period = task.findPeriod(id);
		if (period != null) {
			return period;
		}
	}
	return null;
};

Project.prototype.addTask = function(task) {
	this.tasks.push(task);
	this.tasksSorted = false;
};

Project.prototype.addPeriodsToDay = function(date, day) {
	for (var i = 0; i < this.tasks.length; i++) {
		var task = this.tasks[i];
		task.addPeriodsToDay(date, day);
	}
};

Project.prototype.print = function(date) {
	if (!this.tasksSorted) {
		this.tasks.sort(Task.sortFunction);
		this.tasksSorted = true;
	}
	for (var i = 0; i < this.tasks.length; i++) {
		var task = this.tasks[i];
		task.print(date);
	}
};

function Task(parent, id, name, psp) {
	this.parent = parent;
	this.id = id;
	this.name = name;
	this.psp = psp;
	this.subTasks = new Array();
	this.subTasksSorted = false;
	this.periods = new Array();
	this.periodsSorted = false;
}

Task.nameSeparator = "/";

Task.sortFunction = function(a, b) {
	if (a == null && b == null) {
		return 0;
	} else if (a == null) {
		return -1;
	} else if (b == null) {
		return 1;
	} else if (a.psp != null && b.psp != null) {
		if (a.psp < b.psp) {
			return -1;
		} else if (a.psp > b.psp) {
			return 1;
		} else {
			return 0;
		}
	} else if (a.name < b.name) {
		return -1;
	} else if (a.name > b.name) {
		return 1;
	} else {
		return 0;
	}
};

Task.prototype.findSubTask = function(id) {
	for (var i = 0; i < this.subTasks.length; i++) {
		var subTask = this.subTasks[i];
		if (subTask.id == id) {
			return subTask;
		}
		var subSubTask = subTask.findSubTask(id);
		if (subSubTask != null) {
			return subSubTask;
		}
	}
	return null;
};

Task.prototype.findPeriod = function(id) {
	for (var i = 0; i < this.periods.length; i++) {
		var period = this.periods[i];
		if (period.id == id) {
			return period;
		}
	}
	for (var i = 0; i < this.subTasks.length; i++) {
		var subTask = this.subTasks[i];
		var period = subTask.findPeriod(id);
		if (period != null) {
			return period;
		}
	}
	return null;
};

Task.prototype.addTask = function(task) {
	this.subTasks.push(task);
	this.subTasksSorted = false;
};

Task.prototype.addPeriod = function(period) {
	this.periods.push(period);
	this.periodsSorted = false;
};

Task.prototype.getDuration = function(date) {
	var duration = 0.0;
	for (var i = 0; i < this.periods.length; i++) {
		var period = this.periods[i];
		duration += period.getDuration(date);
	}
	for (var i = 0; i < this.subTasks.length; i++) {
		var subTask = this.subTasks[i];
		duration += subTask.getDuration(date);
	}
	return duration;
};

Task.prototype.addPeriodsToDay = function(date, day) {
	for (var i = 0; i < this.periods.length; i++) {
		var period = this.periods[i];
		var duration = period.getDuration(date);
		if (duration > 0) {
			day.addPeriod(period);
		}
	}
	for (var i = 0; i < this.subTasks.length; i++) {
		var subTask = this.subTasks[i];
		subTask.addPeriodsToDay(date, day);
	}
};

Task.prototype.print = function(date) {
	if (!this.subTasksSorted) {
		this.subTasks.sort(Task.sortFunction);
		this.subTasksSorted = true;
	}
	if (!this.periodsSorted) {
		this.periods.sort(Period.sortFunction);
		this.periodsSorted = true;
	}
	var duration = this.getDuration(date);
	var time = Period.toTime(duration);
	document.writeln("<TR>");
	document.writeln("<TD>" + this.psp + "</TD>");
	document.writeln("<TD>" + this.name + "</TD>");
	if (time > 0.0) {
		document.writeln("<TD>" + time.toFixed(2) + "</TD>");
	} else {
		document.writeln("<TD></TD>");
	}
	document.writeln("</TR>");
	if (this.psp != "") {
		for (var i = 0; i < this.subTasks.length; i++) {
			var subTask = this.subTasks[i];
			subTask.print(date);
		}
	}
};

function Period(parent, id, startTime, duration) {
	this.parent = parent;
	this.id = id;
	this.startTime = startTime;
	this.endTime = new Date(startTime.getTime() + duration * 1000);
}

Period.sortFunction = function(a, b) {
	if (a == null && b == null) {
		return 0;
	} else if (a == null) {
		return -1;
	} else if (b == null) {
		return 1;
	} else if (a.startTime < b.startTime) {
		return -1;
	} else if (a.startTime > b.startTime) {
		return 1;
	} else {
		return 0;
	}
};

Period.toTime = function(duration) {
	var hours = duration / 3600.0;
	var time = Math.round(hours * 4.0) / 4.0;
	return time;
};

Period.prototype.getDuration = function(date) {
	var nextDate = new Date(date.getTime() + (24 * 60 * 60 * 1000));
	if (this.startTime >= date && this.endTime <= nextDate) {
		return (this.endTime.getTime() - this.startTime.getTime()) / 1000;
	} else if (this.startTime >= date && this.startTime < nextDate) {
		return (nextDate.getTime() - this.startTime.getTime()) / 1000;
	} else if (this.endTime > date && this.endTime <= nextDate) {
		return (this.endTime.getTime() - date.getTime()) / 1000;
	} else if (this.startTime < date && this.endTime >= nextDate) {
		return (nextDate.getTime() - date.getTime()) / 1000;
	} else {
		return 0.0;
	}
};

function Day() {
	this.periods = new Array();
	this.periodsSorted = false;
	this.pauseDuration = 0;
	this.restartIndex = -1;
}

Day.minPauseDuration = 45 * 60;

Day.prototype.addPeriod = function(period) {
	this.periods.push(period);
	this.periodsSorted = false;
};

Day.prototype._calculatePause = function() {
	if (this.periodsSorted) {
		return;
	}
	this.periods.sort(Period.sortFunction);
	this.periodsSorted = true;
	for (var i = 1; i < this.periods.length; i++) {
		var previousPeriod = this.periods[i - 1];
		var period = this.periods[i];
		var duration = (period.startTime.getTime() - previousPeriod.endTime
				.getTime()) / 1000;
		if (duration > this.pauseDuration) {
			this.pauseDuration = duration;
			this.restartIndex = i;
		}
	}
};

Day.timeToString = function(time) {
	if (time == null) {
		return "";
	}
	var minutes = time.getHours() * 60 + time.getMinutes();
	minutes = Math.round(minutes / 15) * 15;
	var hours = Math.floor(minutes / 60);
	minutes = Math.floor(minutes - hours * 60);
	var hourString = ("00" + hours).slice(-2);
	var minuteString = ("00" + minutes).slice(-2);
	return hourString + ":" + minuteString;
};

Day.prototype.getFirstStartTime = function() {
	this._calculatePause();
	if (this.periods.length == 0) {
		return Day.timeToString(null);
	} else {
		return Day.timeToString(this.periods[0].startTime);
	}
};

Day.prototype.getFirstEndTime = function() {
	this._calculatePause();
	if (this.periods.length == 0) {
		return Day.timeToString(null);
	} else if (this.pauseDuration < Day.minPauseDuration) {
		return Day.timeToString(this.periods[this.periods.length - 1].endTime);
	} else {
		return Day.timeToString(this.periods[this.restartIndex - 1].endTime);
	}
};

Day.prototype.getLastStartTime = function() {
	this._calculatePause();
	if (this.periods.length == 0) {
		return Day.timeToString(null);
	} else if (this.pauseDuration < Day.minPauseDuration) {
		return Day.timeToString(null);
	} else {
		return Day.timeToString(this.periods[this.restartIndex].startTime);
	}
};

Day.prototype.getLastEndTime = function() {
	this._calculatePause();
	if (this.periods.length == 0) {
		return Day.timeToString(null);
	} else if (this.pauseDuration < Day.minPauseDuration) {
		return Day.timeToString(null);
	} else {
		return Day.timeToString(this.periods[this.periods.length - 1].endTime);
	}
};
