/**
 * Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: LicenseRef-.amazon.com.-AmznSL-1.0
 * Licensed under the Amazon Software License  http://aws.amazon.com/asl/
 */

/**
 * @author MediaEnt Solutions
 */

/* eslint-disable no-console */
/* eslint-disable import/no-unresolved */
/* eslint-disable prefer-destructuring */
/* eslint-disable class-methods-use-this */

/**
 * @class WebVttCue
 * @description simple wrapper class to handle input/ouput data with this state machine
 */
class WebVttCue {
  constructor(begin, end, text, position, factor = 1) {
    this.$begin = begin;
    this.$end = end;
    this.$position = (position) ? ` ${position}` : '';
    this.$text = text;
    this.$factor = factor;
  }

  get [Symbol.toStringTag]() {
    return 'WebVttCue';
  }

  get begin() {
    return this.$begin;
  }

  get end() {
    return this.$end;
  }

  get position() {
    return this.$position;
  }

  set position(val = '') {
    this.$position = (val[0] === ' ')
      ? val
      : ` ${val}`;
  }

  get text() {
    return this.$text;
  }

  set text(val) {
    this.$text = val;
  }

  get factor() {
    return this.$factor;
  }

  toTimeString(offset) {
    const offsetMillis = offset * this.factor;
    const HH = Math.floor(offsetMillis / 3600000);
    const MM = Math.floor((offsetMillis % 3600000) / 60000);
    const SS = Math.floor((offsetMillis % 60000) / 1000);
    const mmm = Math.ceil(offsetMillis % 1000);

    return `${HH.toString().padStart(2, '0')}:${MM.toString().padStart(2, '0')}:${SS.toString().padStart(2, '0')}.${mmm.toString().padStart(3, '0')}`;
  }

  toString() {
    return `${this.toTimeString(this.begin)} --> ${this.toTimeString(this.end)}${this.position}\n${this.text}`;
  }
}

module.exports = {
  WebVttCue,
};
