import { ObjC } from "./libobjc.js";
import type { default as ObjCTypes } from "frida-objc-bridge";
import { NSUTF8StringEncoding } from "./constants.js";
import {
  NSBundle,
  NSDictionary,
  NSFileManager,
  NSString as NSStringType
} from "./types.js";

// Attempt to unarchive data. Returning a string of `` indicates that the
// unarchiving failed.
export const unArchiveDataAndGetString = (data: ObjCTypes.Object | any): string => {

  try {

    // tslint:disable-next-line:max-line-length
    // https://developer.apple.com/documentation/foundation/nskeyedunarchiver/1574811-unarchivetoplevelobjectwithdata
    // This one is marked as DEPRECATED, but seems to still be a thing in
    // iOS 12. Ok for now.
    const NSKeyedUnarchiver = ObjC.classes.NSKeyedUnarchiver;
    const unArchivedData: any = NSKeyedUnarchiver.unarchiveTopLevelObjectWithData_error_(data, NULL);

    // if we have a null value, this data is probably not archived
    if (unArchivedData === null) {
      return ``;
    }

    switch (unArchivedData.$className) {

      case "__NSDictionary":
      case "__NSDictionaryI":
        const dict: NSDictionary = new ObjC.Object(unArchivedData);
        const enumerator = dict.keyEnumerator();
        let key: string;
        const s: {[key: string]: any } = {};

        // tslint:disable-next-line:no-conditional-assignment
        while ((key = enumerator.nextObject()) !== null) {
          s[key] = `${dict.objectForKey_(key)}`;
        }

        return JSON.stringify(s);

      default:
        return ``;
    }

  } catch (e) {
    return data.toString();
  }
};

export const smartDataToString = (raw: any): string => {

  if (raw === null) { return ""; }

  try {

    const dataObject: ObjCTypes.Object | any = new ObjC.Object(raw);

    switch (dataObject.$className) {
      case "__NSCFData":

        try {
          const unarchivedData: string = unArchiveDataAndGetString(dataObject);
          if (unarchivedData.length > 0) {
            return unarchivedData;
          }
          // tslint:disable-next-line:no-empty
        } catch (e) { }

        try {
          const data: string = dataObject.readUtf8String(dataObject.length());
          if (data.length > 0) {
            return data;
          }
          // tslint:disable-next-line:no-empty
        } catch (e) { }

      case "__NSCFNumber":
        return dataObject.integerValue();
      case "NSTaggedPointerString":
      case "__NSDate":
      case "__NSCFString":
      case "__NSTaggedDate":
        return dataObject.toString();

      default:
        return `(could not get string for class: ${dataObject.$className})`;
    }

  } catch (e) {
    return "(failed to decode)";
  }
};

export const bytesToUTF8 = (data: any): string => {
  // Sample Objective-C
  //
  // char buf[] = "\x41\x42\x43\x44";
  // NSString *p = [[NSString alloc] initWithBytes:buf length:5 encoding:NSUTF8StringEncoding];

  if (data === null) {
    return "";
  }

  if (!data.hasOwnProperty("bytes")) {
    return data.toString();
  }

  const s: NSStringType = ObjC.classes.NSString.alloc().initWithBytes_length_encoding_(
    data.bytes(), data.length(), NSUTF8StringEncoding);

  if (s) {
    return s.UTF8String();
  }

  return "";
};

export const bytesToHexString = (data: any): string => {
  // https://stackoverflow.com/a/50767210
  if (data == null) {
    return "";
  }
  const buffer: ArrayBuffer = data.bytes().readByteArray(data.length());
  return Array.from(new Uint8Array(buffer)).map((b) => ("0" + b.toString(16)).substr(-2)).join("");
};

export const getNSFileManager = (): NSFileManager => {
  const NSFM = ObjC.classes.NSFileManager;
  return NSFM.defaultManager();
};

export const getNSMainBundle = (): NSBundle => {
  const bundle = ObjC.classes.NSBundle;
  return bundle.mainBundle();
};

export const arrayBufferToHex = (arrayBuffer: ArrayBuffer | null): string => {
  if (typeof arrayBuffer !== 'object' || arrayBuffer === null || typeof arrayBuffer.byteLength !== 'number') {
    throw new TypeError('Expected input to be an ArrayBuffer');
  }

  const buffer = new Uint8Array(arrayBuffer);
  let result = '';
  let value;

  for (const byte of buffer) {
    value = byte.toString(16);
    result += (value.length === 1 ? '0' + value : value);
  }

  return result;
};

export const hexToString = (hexx: string): string => {
  const hex = hexx.toString(); // force conversion
  let str = '';
  for (let i = 0; (i < hex.length && hex.substring(i, i+2) !== '00'); i += 2)
    str += String.fromCharCode(parseInt(hex.substring(i, i+2), 16));
  return str;
};