#!/usr/bin/env node
const { spawnSync } = require('child_process');

function getSquashMergeCommitMessage() {
    const result = spawnSync('git', ['log', '-1', '--pretty=%B']);
    return result.stdout.toString().trim();
}

function debugCommitMessage() {
    const commitMsg = getSquashMergeCommitMessage();
    console.log('=== Raw Commit Message ===');
    console.log(commitMsg);
    console.log('\n=== Message Parts ===');
    console.log('Split by newlines:');
    commitMsg.split('\n').forEach((line, i) => {
        console.log(`Line ${i + 1}: "${line}"`);
    });
}

debugCommitMessage();
