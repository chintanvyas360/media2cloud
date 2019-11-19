/**
 * Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: LicenseRef-.amazon.com.-AmznSL-1.0
 * Licensed under the Amazon Software License  http://aws.amazon.com/asl/
 */

/**
 * @author MediaEnt Solutions
 */

/* eslint-disable no-console */
/* eslint-disable global-require */
/* eslint-disable no-unused-vars */
/* eslint-disable arrow-body-style */
const AWS = require('aws-sdk');
const CRYPTO = require('crypto');

const {
  mxBaseResponse,
} = require('../shared/mxBaseResponse');

/**
 * @function StringManipulation
 * @param {object} event
 * @param {object} context
 */
exports.StringManipulation = async (event, context) => {
  try {
    const {
      ResourceProperties = {},
    } = event || {};

    class X0 extends mxBaseResponse(class {}) {}
    const x0 = new X0(event, context);

    if (x0.isRequestType('Delete')) {
      x0.storeResponseData('Status', 'SKIPPED');
      return x0.responseData;
    }

    /* if is 'Update', find the previous OutputString we generated */
    if (x0.isRequestType('Update') && ResourceProperties.OutputReference) {
      const result = await (new AWS.CloudFormation({
        apiVersion: '2010-05-15',
      })).describeStacks({
        StackName: event.StackId.split('/')[1],
      }).promise().catch(e => undefined);

      if (result && result.Stacks.length) {
        const out = result.Stacks.shift().Outputs.find(x =>
          x.OutputKey === ResourceProperties.OutputReference);
        if ((out || {}).OutputValue) {
          x0.storeResponseData('OutputString', out.OutputValue);
          x0.storeResponseData('Status', 'SUCCESS');
          return x0.responseData;
        }
      }
    }

    /* Support 'InputString' and 'Operations' parameters only */
    /* where Operations is specified as a string, comma separator */
    /* lower, upper, maxlen=20, minlen=3, random, underscore, dash, alphanumeric */
    const {
      InputString,
      Operations = '',
    } = ResourceProperties || {};

    /* extract operation(s) */
    const operations = Operations.split(',').map(x => x.toLowerCase().trim()).filter(x => x).reduce((acc, cur) => {
      const [
        key,
        val,
      ] = cur.split('=').map(x => x.trim());

      const tmp = {};

      tmp[key] = val || true;

      return Object.assign(acc, tmp);
    }, {});

    console.log(JSON.stringify(operations, null, 2));

    /* process the operations */
    let fragment = InputString || '';

    if (operations.alphanumeric) {
      fragment = fragment.replace(/[^a-zA-Z0-9]+/g, '');
    }

    if (operations.random) {
      let random = Number.parseInt(operations.random || 8, 10);
      /* operations.random must be at least 4 */
      random = Math.floor(((random < 4) ? 4 : random) / 2);
      fragment = `${fragment}-${CRYPTO.randomBytes(random).toString('hex')}`;
    }

    if (operations.upper) {
      fragment = fragment.toUpperCase();
    }

    if (operations.lower) {
      fragment = fragment.toLowerCase();
    }

    if (operations.underscore) {
      // '__abc 123 ,.<>/!@$#-_ def___'
      //  .replace(/[^a-zA-Z0-9_-]+/g, '_')
      //  .replace(/_+/g, '_')
      //  .replace(/_*$/, '')
      //  .replace(/^_*/, '')
      fragment = fragment.replace(/[\s-]/g, '_');
    }

    if (operations.dash) {
      fragment = fragment.replace(/[\s_]/g, '-');
    }

    if (operations.minlen) {
      const padding = Number.parseInt(operations.minlen, 10) - fragment.length;

      for (let i = 0; i < padding; i += 1) {
        fragment += '0';
      }
    }

    if (operations.maxlen) {
      const max = Number.parseInt(operations.maxlen, 10);

      fragment = fragment.substr(0, max);
    }

    x0.storeResponseData('OutputString', fragment);
    x0.storeResponseData('Status', 'SUCCESS');

    return x0.responseData;
  } catch (e) {
    e.message = `StringManipulation: ${e.message}`;
    throw e;
  }
};
