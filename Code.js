//import 'google-apps-script';

var prop_pre = 'ServerStatus_';

function onOpen() {
	SpreadsheetApp.getUi()
		.createMenu('Server Status')
		.addSubMenu(SpreadsheetApp.getUi().createMenu('Settings')
			.addItem('Set timeout', 'setTimeout')
			.addItem('Set password', 'setPassword')
			.addItem('Set active color', 'setActiveColor')
			.addItem('Set inactive color', 'setInactiveColor'))
		.addToUi();
}

function setTimeout() { setprop('timeout'); }
function setPassword() { setprop('password'); }
function setActiveColor() { setprop('activeColor'); }
function setInactiveColor() { setprop('inactiveColor'); }

function setprop(prop) {
	var ui = SpreadsheetApp.getUi();
	var old = PropertiesService.getDocumentProperties().getProperty(prop_pre + prop);
	var response = ui.prompt('New value', 'Old value: ' + old, ui.ButtonSet.OK_CANCEL);
	if (response.getSelectedButton() == ui.Button.OK) {
		PropertiesService.getDocumentProperties().setProperty(prop_pre + prop, response.getResponseText());
	}
}

function doGet(event) {
	try {
		var servername = event.parameter.get;
		servername = servername.replace(/-/g, "_");
		var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
		if (servername == 'all') {
			var namedranges = spreadsheet.getNamedRanges();
			var retval = {};
			for (namedrange of namedranges) {
				var cell = namedrange.getRange();
				var name = namedrange.getName();
				var color = cell.getBackground();
				retval[name] = color;
			}
			retval = JSON.stringify(retval);
			retval = retval.replace(/_/g, "-");
			return ContentService.createTextOutput(retval);
		}
		var cell = spreadsheet.getRangeByName(servername);
		var color = cell.getBackground();
		return ContentService.createTextOutput(color);
	} catch (error) {
		Logger.log(error);
	}
}

function doPost(event) {
	try {
		var pass = event.parameter.pass;
		var prop = PropertiesService.getDocumentProperties();
		password = prop.getProperty(prop_pre + 'password');
		if (pass == password) {
			var date = new Date();
			var servername = event.parameter.set;
			servername = servername.replace(/-/g, "_");
			var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
			var cell = spreadsheet.getRangeByName(servername);
			activeColor = prop.getProperty(prop_pre + 'activeColor');
			cell.setBackground(activeColor);
			cell.setNote(date);
		}
		else {
			Logger.log("wrong password");
		}
	} catch (error) {
		Logger.log(error);
	}
}

function timetTriggerTest() {
	var date = new Date();
	var test = {
		'year': date.getFullYear(),
		'month': date.getMonth() + 1,
		'day-of-month': date.getDate(),
		'hour': date.getHours(),
		'minute': date.getMinutes(),
		'second': date.getSeconds()
	};
	Logger.log(test);
	timeTrigger(test);
}

// TODO: modify trigger interval from UI https://developers.google.com/apps-script/reference/script/clock-trigger-builder

function timeTrigger(event) {
	try {
		var dateNow = new Date(
			event.year,
			event.month - 1,
			event['day-of-month'],
			event.hour + 1,
			event.minute,
			event.second
		);
		var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
		var prop = PropertiesService.getDocumentProperties();
		timeout = new Number(prop.getProperty(prop_pre + 'timeout'));
		activeColor = prop.getProperty(prop_pre + 'activeColor');
		inactiveColor = prop.getProperty(prop_pre + 'inactiveColor');
		var namedranges = spreadsheet.getNamedRanges();
		for (namedrange of namedranges) {
			var cell = namedrange.getRange();
			var color = cell.getBackground();
			if (color == activeColor) {
				var cellNote = cell.getNote();
				var endDate = new Date(cellNote);
				endDate.setSeconds(endDate.getSeconds() + timeout);
				if (dateNow > endDate) {
					cell.setBackground(inactiveColor);
				}
			}
		}
	} catch (error) {
		Logger.log(error);
	}
}