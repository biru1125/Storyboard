// app/src/src.html 에 viz.css / viz.js 를 끼워 넣어 app/index.html 을 만든다
const fs = require("fs"), path = require("path");
const d = path.join(__dirname, "..", "app");
const r = f => fs.readFileSync(path.join(d, "src", f), "utf8");
// 앱은 app:// 로 파일을 그대로 띄우므로 문서 머리(doctype·charset)를 직접 붙인다
const head = '<!doctype html>\n<html lang="ko"><meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n';
const out = head + r("src.html").replace("/*VIZCSS*/", () => r("viz.css")).replace("//VIZJS", () => r("viz.js"));
fs.writeFileSync(path.join(d, "index.html"), out);
console.log("app/index.html", out.length);
