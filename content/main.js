/****************** Core Code *********************/

Components.utils.import("resource://imagescollector/common.js");

const XUL_NS = "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul";
const COLUMNS_PER_ROW = 3;
var subFolderName = "images_" + Math.random();
var saveDirectory = getDefaultSaveDirectory();

/**
 * onload function
 */
function mainWindowOnLoad() {
	var params = window.arguments[0];
	var imageNodes = params.imageNodes;
	displayImages(imageNodes);
	byId("mainWindow-save-path").value = saveDirectory.path;
}

/**
 * get string from the properties file
 */
function getFormattedString(key, parameters) {
	// Get a reference to the strings bundle
	if (this.stringsBundle == null) {
		this.stringsBundle = document.getElementById("ip-string-bundle");
	}
	return this.stringsBundle.getFormattedString(key, parameters);
}

/**
 * show the image items
 */
function displayImages(imageNodes) {
	imageNodes = imageNodes || [];
	var cols = COLUMNS_PER_ROW, row, image, hbox, checkbox;
	var rows = document.getElementById("imagesContainer");

	document.getElementById("filterStat").label = this.getFormattedString("statusBarText", [ imageNodes.length ]);

	for ( var i = 0, n = imageNodes.length; i < n; i++) {
		var imageNode = imageNodes[i];
		var imageSrc = imageNode.getAttribute("src");
		if (imageSrc == "") {
			continue;
		}
		var row;
		if (cols >= COLUMNS_PER_ROW) {
			row = document.createElementNS(XUL_NS, "row");
			row.setAttribute("align", "center");
			rows.appendChild(row);
			cols = 0;
		} else {
			var hbox = document.createElementNS(XUL_NS, "hbox");
			hbox.setAttribute("style", "margin:10px;padding:5px;");

			var div = document.createElementNS(XUL_NS, "div");
			div.setAttribute("style", "padding:5px;box-shadow: #333 1px 1px 2px;");

			var image = document.createElementNS(XUL_NS, "image");
			image.setAttribute("src", imageSrc);
			image.setAttribute("style", "width:150px;height:150px;");

			div.appendChild(image);

			checkbox = document.createElementNS(XUL_NS, "checkbox");
			checkbox.setAttribute("imageUrl", imageSrc);
			checkbox.setAttribute("class", "cb");
			hbox.appendChild(checkbox);
			hbox.appendChild(div);
			row.appendChild(hbox);
			cols++;
		}
	}
}

/**
 * select the saved folder
 */
function selectSaveDirectory() {
	const
	nsIFilePicker = Components.interfaces.nsIFilePicker;
	var fp = Components.classes["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
	fp.init(window, "", nsIFilePicker.modeGetFolder);
	var result = fp.show();
	if (result == nsIFilePicker.returnOK) {
		var file = fp.file;
		saveDirectory = file;
		byId("mainWindow-save-path").value = file.path;
	}
}

/**
 * get the default saved folder
 */
function getDefaultSaveDirectory() {
	// default saved in Desktop
	var file = Components.classes["@mozilla.org/file/directory_service;1"].getService(Components.interfaces.nsIProperties).get("Desk", Components.interfaces.nsIFile);
	return file;
}

/**
 * create the saved folder
 */
function createStoreFolder() {
	saveDirectory.append(subFolderName);
	if (!saveDirectory.exists() || !saveDirectory.isDirectory()) {
		// if it doesn't exist, create
		saveDirectory.create(Components.interfaces.nsIFile.DIRECTORY_TYPE, 0777);
	}
}

/**
 * the core code for downloading image
 */
function downloadSingleImage(uri, callback) {
	var ios = Components.classes["@mozilla.org/network/io-service;1"].getService(Components.interfaces.nsIIOService);
	var imageURI = ios.newURI(uri, null, null);
	var imageFileName = uri.substring(uri.lastIndexOf("/") + 1);
	var channel = ios.newChannelFromURI(imageURI);
	var observer = {
		onStreamComplete : function(loader, context, status, length, result) {
			var file = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
			file.initWithFile(saveDirectory);
			file.appendRelativePath(imageFileName);
			var stream = Components.classes["@mozilla.org/network/safe-file-output-stream;1"].createInstance(Components.interfaces.nsIFileOutputStream);
			stream.init(file, -1, -1, 0);
			var bstream = Components.classes["@mozilla.org/binaryoutputstream;1"].createInstance(Components.interfaces.nsIBinaryOutputStream);
			bstream.setOutputStream(stream);
			bstream.writeByteArray(result, length);
			if (stream instanceof Components.interfaces.nsISafeOutputStream) {
				stream.finish();
			} else {
				stream.close();
			}
			if (typeof callback == "function") {
				callback();
			}
		}
	};
	var streamLoader = Components.classes["@mozilla.org/network/stream-loader;1"].createInstance(Components.interfaces.nsIStreamLoader);
	var appInfo = Components.classes["@mozilla.org/xre/app-info;1"].getService(Components.interfaces.nsIXULAppInfo);
	var isOnBranch = appInfo.platformVersion.indexOf("1.8") == 0;
	if (isOnBranch) {
		streamLoader.init(channel, observer, null);
	} else {
		streamLoader.init(observer);
		channel.asyncOpen(streamLoader, channel);
	}
}

/**
 * download click solving
 */
function download() {
	var rows = document.getElementById("imagesContainer");
	var checkboxes = rows.getElementsByTagName("checkbox");
	var imageUrls = [];
	for ( var i = 0, n = checkboxes.length; i < n; i++) {
		if (checkboxes[i].checked) {
			imageUrls.push(checkboxes[i].getAttribute("imageUrl"));
		}
	}
	var total = imageUrls.length;
	if (total == 0)
		return;
	createStoreFolder();
	var progressmeter = byId("downloadProgress");
	progressmeter.style.visibility = "visible";

	var step = 100 / total;
	var current = 0;
	for ( var i = 0; i < total; i++) {
		try {
			downloadSingleImage(imageUrls[i], function() {
				var value = parseInt(progressmeter.value);
				progressmeter.value = value + step;
			});
		} catch (e) {
			continue;
		}
	}
	close();
}
function byId(id) {
	return document.getElementById(id);
}
function byClass(className) {
	return document.getElementsByClassName(className);
}

/**
 * select all the image item
 */
function selectAll() {
	var cbs = byClass("cb");
	for ( var i = 0; i < cbs.length; i++) {
		cbs[i].setAttribute("checked", true);
	}
}
/**
 * remove all the select status
 */
function unSelectAll() {
	var cbs = byClass("cb");
	for ( var i = 0; i < cbs.length; i++) {
		cbs[i].setAttribute("checked", false);
	}
}

/**
 * open the about dialog
 */
function openAboutDialog() {
	openDialog('chrome://imagescollector/content/about.xul', '', 'chrome,titlebar,resizable,centerscreen,modal=no,dialog=yes');
}

/**
 * the log function
 */
function log(msg) {
	var logger = Components.classes["@mozilla.org/consoleservice;1"].getService(Components.interfaces.nsIConsoleService);
	logger.logStringMessage(msg);
}

//ImageCollector.Logger.log("test");