//      Common (global) variables
var EXPORTED_SYMBOLS = [ "ImageCollector" ];

const Cc = Components.classes;
const Ci = Components.interfaces;

/**
 * ImageCollector namespace.
 */
if ("undefined" == typeof (ImageCollector)) {
    ImageCollector = {};
};

/**
 * Provides the log utilities used by the ImageCollector
 *
 * @class ImageCollector.Logger
 */
ImageCollector.Logger = {
    
    enabledLog : false,
    consoleService : Cc["@mozilla.org/consoleservice;1"].getService(Ci.nsIConsoleService),
    log : function(msg) {
        if(this.enabledLog){
            this.consoleService.logStringMessage("ImageCollector: " + msg);
        }
    }
};

/**
 * Provides the utilities used by the ImageCollector
 *
 * @class ImageCollector.Utils
 */
ImageCollector.Utils = {

	//TODO

};