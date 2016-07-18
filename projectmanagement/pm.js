/**
 * Created by FanTaSyLin on 2016/7/12.
 */

"use strict";

var path = require('path');
var http_port = process.env.HTTP_PORT || 4001;
var https_port = process.env.HTTPS_PORT || 4401;
var jwt = require("express-jwt");
