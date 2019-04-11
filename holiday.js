"use strict";

var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var xml2json = require('xml-js');
var json2yaml = require('json2yaml');
var fs = require('fs');

function httpGetAsync(theUrl, callback) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            callback(xmlHttp.responseText);
    }
    xmlHttp.open("GET", theUrl, true); // true for asynchronous 
    xmlHttp.send(null);
}

module.exports = (solYear, solMonth, savePath) => {
    var dateInfo = {};
    var jsonData, jsonDates;
    var i;
    var url;
    
    savePath = savePath !== undefined ? savePath : '';

    // check year, month
    if (solYear === undefined || solMonth === undefined) {
        return new Error('Input Error');
    }
    if (solMonth < 0 || solMonth > 12) {
        return new Error('Input Error');
    }
    if (solMonth < 10) {
        if ((solMonth + '').length === 1)
            solMonth = '0' + solMonth;
    }

    url = "http://apis.data.go.kr/B090041/openapi/service/SpcdeInfoService/getRestDeInfo?" +
            "ServiceKey=%2BjqX%2FEmCdEajxBYwIdpsifTy7ZLPX1HQh1m97fdWWJCN%2FirT%2FLEytfcZxFYG4bdH5PFWMLUGp9sQp7L0lSylHw%3D%3D&";
    url += "solYear=" + solYear + "&";
    url += "solMonth=" + solMonth;

    httpGetAsync(url, (res) => {
        jsonData = xml2json.xml2js(res);

        dateInfo['totalDate'] = +jsonData.elements[0].elements[1].elements[3].elements[0].text;
        if (+jsonData.elements[0].elements[1].elements[3].elements[0].text !== 0) {
            jsonDates = jsonData.elements[0].elements[1].elements[0].elements;
            dateInfo['dates'] = [];
            for (i = 0; i < jsonDates.length; i++) {
                dateInfo['dates'].push({
                    dateName: jsonDates[i].elements[1].elements[0].text,
                    date: jsonDates[i].elements[3].elements[0].text,
                });
            }
        }
    
        if (dateInfo.dates !== undefined)
            fs.writeFileSync(savePath + solYear + '-' + solMonth + '.yml'  , json2yaml.stringify(dateInfo), 'utf8');
    })
};
