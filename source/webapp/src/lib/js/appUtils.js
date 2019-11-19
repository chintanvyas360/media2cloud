/**
 * Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: LicenseRef-.amazon.com.-AmznSL-1.0
 * Licensed under the Amazon Software License  http://aws.amazon.com/asl/
 */

/**
 * @author MediaEnt Solutions
 */

/* eslint-disable no-console */
/* eslint-disable no-unused-vars */
/* eslint-disable max-classes-per-file */
/**
 * @class AppUtils
 * @description common utility class for static functions
 */
class AppUtils extends mxReadable(mxZero(class {})) {
  /**
   * @function signRequest
   * @description sign V4 request
   * @param {string} method
   * @param {string} endpoint
   * @param {string} path
   * @param {object} query
   * @param {string|object} body
   */
  static signRequest(method, endpoint, path, query, body) {
    const signer = new SigV4Client({
      accessKey: AWS.config.credentials.accessKeyId,
      secretKey: AWS.config.credentials.secretAccessKey,
      sessionToken: AWS.config.credentials.sessionToken,
      region: AWS.config.region,
      serviceName: 'execute-api',
      endpoint,
    });

    const response = signer.signRequest({
      method,
      path,
      headers: {
        'Content-Type': 'application/json',
      },
      queryParams: query,
      body: (typeof body === 'string') ? body : JSON.stringify(body),
    });

    return response;
  }

  /**
   * @function authHttpRequest
   * @description http request with signed payload/headers
   * @param {string} method
   * @param {string} endpoint
   * @param {string} path
   * @param {object} query
   * @param {string|object} body
   */
  static async authHttpRequest(method, endpoint, query = {}, body = '') {
    return new Promise((resolve, reject) => {
      const request = new XMLHttpRequest();

      const {
        url, headers,
      } = AppUtils.signRequest(method, endpoint, '', query, body);

      request.open(method, url, true);

      Object.keys(headers).forEach((x) => {
        request.setRequestHeader(x, headers[x]);
      });

      request.withCredentials = false;

      request.onerror = e => reject(e);

      request.onabort = e => reject(e);

      request.onreadystatechange = () => {
        if (request.readyState === XMLHttpRequest.DONE) {
          if (request.status === 200) {
            resolve(JSON.parse(request.responseText));
          } else if (request.status >= 400) {
            reject(new Error(`${request.status} - ${request.responseURL}`));
          }
        }
      };

      request.send((typeof body === 'string')
        ? body
        : JSON.stringify(body));
    });
  }

  /**
   * @function sanitize
   * @description prevent xss ingestion
   * @param {string} str
   */
  static sanitize(str) {
    return str.toString().replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  /**
   * @static
   * @function pause - sleep for specified duration
   * @param {number} duration - in milliseconds
   */
  static async pause(duration = 0) {
    return new Promise(resolve => setTimeout(() => resolve(), duration));
  }

  /**
   * @function loading
   * @description show spinning icon
   * @param {string} id - dom id of the loading icon
   * @param {boolean} [show] - show or hide
   */
  static loading(id = 'spinning-icon', show = true) {
    if (show) {
      $(`#${id}`).removeClass('collapse');
    } else {
      $(`#${id}`).addClass('collapse');
    }
  }

  /**
   * @function uuid4
   * @description check or generate uuid
   * @param {string} [str] - check string if it is uuid
   */
  static uuid4(str) {
    const s0 = (str || CryptoJS.lib.WordArray.random(16)).toString();
    const matched = s0.match(/([0-9a-fA-F]{8})([0-9a-fA-F]{4})([0-9a-fA-F]{4})([0-9a-fA-F]{4})([0-9a-fA-F]{12})/);
    if (!matched) {
      throw new Error(`failed to generate uuid from '${s0}'`);
    }
    matched.shift();
    return matched.join('-').toLowerCase();
  }

  /**
   * @function toMD5String
   * @description convert MD5 string from/to hex/base64
   * @param {string} md5 - md5 string
   * @param {string} [format] - output format
   */
  static toMD5String(md5, format = 'hex') {
    if (!md5) {
      return undefined;
    }

    const encoded = md5.match(/^[0-9a-fA-F]{32}$/) ? 'hex' : 'base64';
    if (encoded === format) {
      return md5;
    }

    const words = (encoded === 'hex')
      ? CryptoJS.enc.Hex.parse(md5)
      : CryptoJS.enc.Base64.parse(md5);

    return (format === 'hex')
      ? CryptoJS.enc.Hex.stringify(words)
      : CryptoJS.enc.Base64.stringify(words);
  }
}
