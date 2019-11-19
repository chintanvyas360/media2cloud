/**
 * Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: LicenseRef-.amazon.com.-AmznSL-1.0
 * Licensed under the Amazon Software License  http://aws.amazon.com/asl/
 */

/**
 * @author MediaEnt Solutions
 */

/* eslint-disable import/no-unresolved */
/* eslint-disable import/no-extraneous-dependencies */
const {
  ChecksumError,
  CommonUtils,
} = require('m2c-core-lib');

const {
  Spark,
} = require('fixity-lib');

const {
  BaseLib,
} = require('./base');

/**
 * @class MD5Lib
 * @description MD5 checksum implementation
 */
class MD5Lib extends BaseLib {
  constructor(stateData) {
    super('MD5Lib', stateData);
    this.algorithm = 'md5';
  }

  /**
   * @override BaseLib compute()
   */
  async compute() {
    /* shouldn't be here */
    if (this.computed) {
      throw new ChecksumError();
    }

    const src = this.stateData.input.src || {};
    if (!src.bucket || !src.key) {
      throw new ChecksumError('missing src.bucket and key');
    }

    if (!this.fileSize) {
      const response = await CommonUtils.headObject(src.bucket, src.key);
      this.fileSize = Number.parseInt(response.ContentLength, 10);
    }

    this.bytesRead = 0;

    const responseData = await new Promise((resolve, reject) => {
      const spark = new Spark.ArrayBuffer();
      if (this.intermediateHash) {
        spark.setState(this.intermediateHash);
      }

      const [
        start,
        end,
      ] = this.calculateByteRange();

      const stream = CommonUtils.createReadStream(src.bucket, src.key, {
        Range: `bytes=${start}-${end}`,
      });

      stream.on('error', e =>
        reject(e));

      stream.on('data', async (data) => {
        this.bytesRead += data.length;
        spark.append(data);
      });

      stream.on('end', async () => {
        if ((this.byteStart + this.bytesRead) >= this.fileSize) {
          this.computed = spark.end();
          this.setChecksumCompleted();
        } else {
          this.intermediateHash = spark.getState();
          this.setChecksumInProgress();
        }
        resolve(this.stateData.toJSON());
      });
    });

    return responseData;
  }
}

module.exports = {
  MD5Lib,
};
