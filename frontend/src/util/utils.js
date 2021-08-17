/*\
|*|
|*|  :: cookies.js ::
|*|
|*|  A complete cookies reader/writer framework with full unicode support.
|*|
|*|  https://developer.mozilla.org/en-US/docs/DOM/document.cookie
|*|
|*|  This framework is released under the GNU Public License, version 3 or later.
|*|  http://www.gnu.org/licenses/gpl-3.0-standalone.html
|*|
|*|  Syntaxes:
|*|
|*|  * docCookies.setItem(name, value[, end[, path[, domain[, secure]]]])
|*|  * docCookies.getItem(name)
|*|  * docCookies.removeItem(name[, path], domain)
|*|  * docCookies.hasItem(name)
|*|  * docCookies.keys()
|*|
\*/
export let docCookies = {
  getItem: function (sKey) {
    return (
      decodeURIComponent(
        document.cookie.replace(
          new RegExp(
            "(?:(?:^|.*;)\\s*" + encodeURIComponent(sKey).replace(/[-.+*]/g, "\\$&") + "\\s*\\=\\s*([^;]*).*$)|^.*$"
          ),
          "$1"
        )
      ) || null
    );
  },
  setItem: function (sKey, sValue, vEnd, sPath, sDomain, bSecure) {
    if (!sKey || /^(?:expires|max\-age|path|domain|secure)$/i.test(sKey)) {
      return false;
    }
    let sExpires = "";
    if (vEnd) {
      switch (vEnd.constructor) {
        case Number:
          sExpires = vEnd === Infinity ? "; expires=Fri, 31 Dec 9999 23:59:59 GMT" : "; max-age=" + vEnd;
          break;
        case String:
          sExpires = "; expires=" + vEnd;
          break;
        case Date:
          sExpires = "; expires=" + vEnd.toUTCString();
          break;
      }
    }
    document.cookie =
      encodeURIComponent(sKey) +
      "=" +
      encodeURIComponent(sValue) +
      sExpires +
      (sDomain ? "; domain=" + sDomain : "") +
      (sPath ? "; path=" + sPath : "") +
      (bSecure ? "; secure" : "");
    return true;
  },
  removeItem: function (sKey, sPath, sDomain) {
    if (!sKey || !this.hasItem(sKey)) {
      return false;
    }
    document.cookie =
      encodeURIComponent(sKey) +
      "=; expires=Thu, 01 Jan 1970 00:00:00 GMT" +
      (sDomain ? "; domain=" + sDomain : "") +
      (sPath ? "; path=" + sPath : "");
    return true;
  },
  hasItem: function (sKey) {
    return new RegExp("(?:^|;\\s*)" + encodeURIComponent(sKey).replace(/[-.+*]/g, "\\$&") + "\\s*\\=").test(
      document.cookie
    );
  },
  keys: /* optional method: you can safely remove it! */ function () {
    let aKeys = document.cookie
      .replace(/((?:^|\s*;)[^\=]+)(?=;|$)|^\s*|\s*(?:\=[^;]*)?(?:\1|$)/g, "")
      .split(/\s*(?:\=[^;]*)?;\s*/);
    for (let nIdx = 0; nIdx < aKeys.length; nIdx++) {
      aKeys[nIdx] = decodeURIComponent(aKeys[nIdx]);
    }
    return aKeys;
  },
};

/**
 * @description: 判断变量是否为空
 * @param {*} obj
 * @return {boolean} true/false
 */
export function isEmpty(obj) {
  return obj === null || obj === "null" || obj === undefined || obj === "undefined" || obj === "";
}

/**
 * @description: 判断数组是否为空
 * @param {*} arr
 * @return {boolean} true/false
 */
export function isArrEmpty(arr) {
  return !isEmpty(arr) && arr.length === 0;
}

/**
 * @description: 在对象中查找并设置
 * @param {object} obj
 * @param {string} key
 * @param {*} val
 * @return {undefined}
 */
export function findAndSet(obj, key, val) {
  if (obj instanceof Array) {
    obj = obj.map((o) => findAndSet(o, key, val));
  } else if (obj instanceof Object) {
    if (Object.prototype.hasOwnProperty.call(obj, key);) {
      obj[key] = val;
    } else {
      for (let k in obj) {
        findAndSet(obj[k], key, val);
      }
    }
  }
}

/**
 * @description: 返回字符串的BASE64编码
 * @param {string} str
 * @return {string}
 */
export function base64(str) {
  return Base64.encode(str);
}

/**
 * @description: 回字符串的安全BASE64编码
 * @param {string} str
 * @return {string}
 */
export function safeBase64(str) {
  return base64(str).replace(/\+/g, "-").replace(/=/g, "").replace(/\//g, "_");
}

/**
 * @description: 执行函数
 * @param {*} func
 * @param {array} args
 * @return {*}
 */
export function execute(func, ...args) {
  if (!isEmpty(func) && typeof func === "function") {
    func(...args);
  }
}

/**
 * @description: 拷贝数组
 * @param {*} dest
 * @param {*} src
 * @return {*}
 */
export function copyArr(dest, src) {
  dest.splice(0);
  for (const item of src) {
    dest.push(item);
  }
}

/**
 * @description: 对象浅拷贝
 * @param {*} obj
 * @return {*}
 */
export function clone(obj) {
  let newObj;
  if (obj instanceof Array) {
    newObj = [];
    copyArr(newObj, obj);
  } else if (obj instanceof Object) {
    newObj = {};
    for (const key of Object.keys(obj)) {
      newObj[key] = obj[key];
    }
  } else {
    newObj = obj;
  }
  return newObj;
}

/**
 * @description: 对象深拷贝
 * @param {*} obj
 * @return {*}
 */
export function deepClone(obj) {
  let newObj;
  if (obj instanceof Array) {
    newObj = [];
    for (const item of obj) {
      newObj.push(deepClone(item));
    }
  } else if (obj instanceof Object) {
    newObj = {};
    for (const key of Object.keys(obj)) {
      newObj[key] = deepClone(obj[key]);
    }
  } else {
    newObj = obj;
  }
  return newObj;
}

/**
 * @description: 对象深度搜索
 * @param {*} obj
 * @param {*} val
 * @return {*}
 */
export function deepSearch(obj, val) {
  if (obj instanceof Array) {
    for (let i = 0; i < obj.length; ++i) {
      if (deepSearch(obj[i], val)) {
        return true;
      }
    }
  } else if (obj instanceof Object) {
    for (let key in obj) {
      if (deepSearch(obj[key], val)) {
        return true;
      }
    }
  } else {
    return obj.toString().indexOf(val) >= 0;
  }
  return false;
}

/**
 * @description: 字节大小格式化
 * @param {*} size
 * @return {*}
 */
export function sizeFormat(size) {
  const ONE_KB = 1024;
  const ONE_MB = ONE_KB * 1024;
  const ONE_GB = ONE_MB * 1024;
  const ONE_TB = ONE_GB * 1024;
  const ONE_PB = ONE_TB * 1024;

  if (size < ONE_KB) {
    return size.toFixed(0) + " B";
  } else if (size < ONE_MB) {
    return (size / ONE_KB).toFixed(2) + " KB";
  } else if (size < ONE_GB) {
    return (size / ONE_MB).toFixed(2) + " MB";
  } else if (size < ONE_TB) {
    return (size / ONE_GB).toFixed(2) + " GB";
  } else if (size < ONE_PB) {
    return (size / ONE_TB).toFixed(2) + " TB";
  } else {
    return (size / ONE_PB).toFixed(2) + " PB";
  }
}

/**
 * @description: 生成范围内的随机整数
 * @param {*} min
 * @param {*} max
 * @return {*}
 */
export function randomIntRange(min, max) {
  return parseInt(Math.random() * (max - min) + min, 10);
}

/**
 * @description: 生成0到目标数字的随机整数
 * @param {*} n
 * @return {*}
 */
export function randomInt(n) {
  return randomIntRange(0, n);
}

/**
 * @description: 生成随机字符串（小写字母+大写字母+数字）
 * @param {*} count
 * @return {*}
 */
export function randomString(count) {
  const SEQ = "abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let str = "";
  for (let i = 0; i < count; ++i) {
    str += SEQ[randomInt(62)];
  }
  return str;
}

/**
 * @description: 生成随机字符串（小写字母+数字）
 * @param {*} count
 * @return {*}
 */
export function randomLowerAndNum(count) {
  const SEQ = "abcdefghijklmnopqrstuvwxyz0123456789";
  let str = "";
  for (let i = 0; i < count; ++i) {
    str += SEQ[randomInt(36)];
  }
  return str;
}

/**
 * @description: 生成随机UUID
 * @param {*}
 * @return {*}
 */
export function randomUUID() {
  let d = new Date().getTime();
  let uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    let r = (d + Math.random() * 16) % 16 | 0;
    d = Math.floor(d / 16);
    return (c === "x" ? r : (r & 0x7) | 0x8).toString(16);
  });
  return uuid;
}
