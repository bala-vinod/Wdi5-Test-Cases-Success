// Summarise wdio junit reports: one line per test with status.
const fs = require("fs"), path = require("path")
const dir = "reports/junit/wdi5"
const out = []
let pass = 0, fail = 0, skip = 0
for (const f of fs.existsSync(dir) ? fs.readdirSync(dir) : []) {
    const xml = fs.readFileSync(path.join(dir, f), "utf8")
    const re = /<testcase\b([^>]*?)(\/>|>([\s\S]*?)<\/testcase>)/g
    let m
    while ((m = re.exec(xml))) {
        const attr = (n) => ((m[1].match(new RegExp(n + '="([^"]*)"')) || [])[1] || "")
        const body = m[3] || ""
        const st = /<(failure|error)\b/.test(body) ? "FAIL" : /<skipped\b/.test(body) ? "SKIP" : "PASS"
        st === "FAIL" ? fail++ : st === "SKIP" ? skip++ : pass++
        out.push(`${st} | ${path.basename(attr("file"))} | ${attr("name")}`)
    }
}
const text = `TOTAL pass=${pass} fail=${fail} skip=${skip}\n` + out.sort().join("\n")
console.log(text)
if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, "```\n" + text + "\n```\n")
