var ImagesCollector = {
	show : function() {
		var doc = window.getBrowser().selectedBrowser.contentDocument;
		var imageNodes = doc.getElementsByTagName("img");
		var params = {
			"imageNodes" : imageNodes
		};
		this.openWindow("ImagesCollector.mainWindow", "chrome://imagescollector/content/collector.xul", "chrome=yes,centerscreen", params);
	},
	openWindow : function(windowName, url, flags, params) {
		var windowsMediator = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator);
		var aWindow = windowsMediator.getMostRecentWindow(windowName);
		if (aWindow)
			aWindow.focus();
		else
			aWindow = window.openDialog(url, windowName, flags, params);
		return aWindow;
	},
};