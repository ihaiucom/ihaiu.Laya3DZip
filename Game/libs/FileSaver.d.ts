// Type definitions for FileSaver.js
// Project: [LIBRARY_URL_HERE] 
// Definitions by: [YOUR_NAME_HERE] <[YOUR_URL_HERE]> 
// Definitions: https://github.com/borisyankov/DefinitelyTyped
// bom.!0

/**
 * 
 */
declare interface node {
}
// bom.!1

/**
 * 
 */
declare interface opts {
		
	/**
	 * 
	 */
	autoBom : boolean;
}
// click.!0

/**
 * 
 */
declare interface download {
		
	/**
	 * 
	 */
	target : string;
}
// saveAs.!3

/**
 * Open a popup immediately do go around popup blocker
 * Mostly only available on user interaction and the fileReader is async so...
 */
declare interface Popup {
}

/**
 * 
 * @param blob 
 * @param opts 
 * @return  
 */
declare function bom(blob : any, opts : any): 0;

/**
 * 
 * @param url 
 * @param name 
 * @param opts 
 */
declare function download(url : any, name : string, opts : any): void;

/**
 * 
 * @param url 
 * @return  
 */
declare function corsEnabled(url : any): boolean;

/**
 * `a.click()` doesn't work for all browsers (#465)
 * @param node 
 */
declare function click(node : 0): void;

/**
 * 
 * @param blob 
 * @param name 
 * @param opts 
 * @param popup 
 */
declare function saveAs(blob : any, name : string, opts : any, popup : Popup): void;


declare function saveFile(name : string, content : string): void;