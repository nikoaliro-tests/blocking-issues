const github = require("./github.js");
const utils = require("./utils.js");

async function getCurrentIssue() {
	return await github.getIssue(await github.getCurrentIssueNumber());
}

async function initLabels() {
	const labels = await github.getLabels();
	var hasBlockedLabel = false;
	for (label of labels) {
		if (label.name === utils.blockedLabel.name) hasBlockedLabel = true;
	}
	if (!hasBlockedLabel) {
		console.log("Creating label");
		await github.createLabel(utils.blockedLabel);
	}
}

async function update(pr) {
	const blockingIssueNumbers = utils.getBlockingIssues(pr.body);
	if (blockingIssueNumbers.length == 0) return;

	console.log(`PR is blocked by ${blockingIssueNumbers}`);
	var openIssues = [];
	for (issueNumber of blockingIssueNumbers) {
		const issue = await github.getIssue(issueNumber);
		if (issue.state !== "open") continue;
		openIssues.push(issueNumber);
	}
	console.log(`PR needs these issues to be closed: ${openIssues}`);

	console.log("Writing comment");
	const commentText = utils.getCommentText(blockingIssueNumbers, openIssues);
	await github.writeComment(pr.number, commentText);
	console.log("Comment written");

	console.log(`Applying label: ${openIssues.length == 0}`);
	if (openIssues.length == 0) await github.removeLabel(pr.number, "blocked");
	else await github.applyLabel(pr.number, "blocked");

	return openIssues.length == 0;
}

module.exports = {
	initLabels,
	getCurrentIssue,
	update,
}
