const github = require("./github.js");
const utils = require("./utils.js");

async function getCurrentIssue() {
	return await github.getIssue(await github.getCurrentIssueNumber());
}

async function update(pr) {
	const blockingIssueNumbers = utils.getBlockingIssues(pr.body);
	if (blockingIssueNumbers.length == 0) return;
	var openIssues = [];
	for (issueNumber of blockingIssueNumbers) {
		const issue = await github.getIssue(issueNumber);
		if (issue.state !== "open") continue;
		openIssues.push(issueNumber);
	}
	const commentText = utils.getCommentText(blockingIssueNumbers, openIssues);
	await github.writeComment(commentText);
	if (openIssues.length == 0) await github.removeLabel(pr.number, "blocked");
	else await github.applyLabel(pr.number, "blocked");
}

module.exports = {
	getCurrentIssue,
	update,
}
