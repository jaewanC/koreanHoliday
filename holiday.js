var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var xml2json = require('xml-js');
var json2yaml = require('json2yaml');
var fs = require('fs');

var solYear, solMonth, savePath;

solYear = process.argv[2];
solMonth = process.argv[3];
savePath = process.argv[4] !== undefined ? process.argv[4] : '';

// check year, month
if (solYear === undefined || solMonth === undefined) {
    console.log("Input Error");
    process.exit(0);
}
if (solMonth < 0 || solMonth > 12) {
    console.log("Input Error");
    process.exit(0);
}
if (solMonth < 10) {
    if ((solMonth + '').length === 1)
        solMonth = '0' + solMonth;
}

var url = "http://apis.data.go.kr/B090041/openapi/service/SpcdeInfoService/getRestDeInfo?" +
            "ServiceKey=%2BjqX%2FEmCdEajxBYwIdpsifTy7ZLPX1HQh1m97fdWWJCN%2FirT%2FLEytfcZxFYG4bdH5PFWMLUGp9sQp7L0lSylHw%3D%3D&";
url += "solYear=" + solYear + "&";
url += "solMonth=" + solMonth;

function httpGetAsync(theUrl, callback) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            callback(xmlHttp.responseText);
    }
    xmlHttp.open("GET", theUrl, true); // true for asynchronous 
    xmlHttp.send(null);
}

httpGetAsync(url, function(res) {
    var dateInfo = {};
    var jsonData, jsonDates;
    var i;

    jsonData = JSON.parse(xml2json.xml2json(res));

    dateInfo['totalDate'] = +jsonData.elements[0].elements[1].elements[3].elements[0].text;

    if (+jsonData.elements[0].elements[1].elements[3].elements[0].text !== 0)
    {
        jsonDates = jsonData.elements[0].elements[1].elements[0].elements;
        dateInfo['dates'] = [];
        for (i = 0; i < jsonDates.length; i++)
        {
            dateInfo['dates'].push({
                dateName: jsonDates[i].elements[1].elements[0].text,
                date: jsonDates[i].elements[3].elements[0].text,
            });
        }
    }

    if (dateInfo.dates !== undefined)
        fs.writeFileSync(savePath + solYear + '-' + solMonth + '.yml'  , json2yaml.stringify(dateInfo), 'utf8');
})
