/**
 * Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: LicenseRef-.amazon.com.-AmznSL-1.0
 * Licensed under the Amazon Software License  http://aws.amazon.com/asl/
 */

/**
 * @author MediaEnt Solutions
 */

/* Definitions of store response data */

/**
  * @mixin mxBaseResponse
  * @description base class for custom resource
  *
  */
const mxBaseResponse = Base => class extends Base {
  constructor(event, context) {
    super(event, context);

    this.$event = event;
    this.$context = context;

    const {
      RequestType,
    } = this.$event || {};

    this.$requestType = RequestType || '';

    /* responseData */
    this.$responseData = {};
  }

  get event() {
    return this.$event;
  }

  get context() {
    return this.$context;
  }

  get responseData() {
    return this.$responseData;
  }

  get requestType() {
    return this.$requestType;
  }

  /**
    * @function isRequestType
    * @param {string} type
    */
  isRequestType(type) {
    return this.requestType.toLowerCase() === type.toLowerCase();
  }

  /**
    * @function storeResponseData
    * @param {string} key
    * @param {string|object} value. If is object, expects the object (hash) to have the same 'key'
    */
  storeResponseData(key, val) {
    if (val === undefined || val === null) {
      delete this.$responseData[key];
    } else if (typeof val !== 'object') {
      this.$responseData[key] = val;
    } else {
      this.$responseData[key] = val[key];
    }

    return this;
  }
};

module.exports.mxBaseResponse = mxBaseResponse;
