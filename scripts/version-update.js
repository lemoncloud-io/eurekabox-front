#!/usr/bin/env node
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const CONFIG = {
    changelogPath: 'CHANGELOG.md',
    targetBranch: 'develop',
    rootPackagePath: 'package.json', // 루트 package.json 경로
    projectPaths: {
        web: 'apps/web/package.json',
    },
    scopeMap: {
        web: 'web',
    },
};

// 버전 변경 타입의 우선순위를 정의
const VERSION_PRIORITY = {
    major: 3,
    minor: 2,
    patch: 1,
    none: 0,
};

function parseSquashMergeCommit(commitMessage) {
    const commits = [];
    const lines = commitMessage.trim().split('\n');

    // PR 제목 처리
    const firstLine = lines[0].replace(/\s*\(#\d+\)$/, '').trim();
    const titleMatch = firstLine.match(/^([a-z]+)(?:\(([^\)]+)\))?:\s*(.+)/i);

    if (titleMatch) {
        commits.push({
            type: titleMatch[1].toLowerCase(),
            scope: titleMatch[2]?.toLowerCase() || '',
            message: titleMatch[3].trim(),
        });
    }

    // 세부 커밋 처리
    lines.forEach(line => {
        line = line.trim();
        if (!line || !line.startsWith('*')) return;

        line = line.substring(1).trim();
        const match = line.match(/^([a-z]+)(?:\(([^\)]+)\))?:\s*(.+)/);
        if (match) {
            commits.push({
                type: match[1],
                scope: match[2]?.toLowerCase() || '',
                message: match[3].trim(),
            });
        }
    });

    // Feature/ 형식 처리 - 다른 커밋이 없을 때만 처리
    if (commits.length === 0 && firstLine.toLowerCase().startsWith('feature/')) {
        commits.push({
            type: 'feat',
            scope: '',
            message: firstLine.substring(8).trim(),
        });
    }

    // 디버깅용 로그
    console.log('Parsed commits:', JSON.stringify(commits, null, 2));

    return commits;
}

function shouldUpdateProject(projectName, commits) {
    // 프로젝트의 scope를 가진 커밋이 있는 경우만 업데이트
    // return commits.some(
    //     commit => commit.scope === CONFIG.scopeMap[projectName]
    // );

    // scope가 없는 커밋이 하나라도 있으면 모든 프로젝트 업데이트
    const hasGlobalCommit = commits.some(commit => !commit.scope);

    // 프로젝트에 관련된 scope를 가진 커밋이 있으면 업데이트
    const hasProjectScopedCommit = commits.some(commit => commit.scope === CONFIG.scopeMap[projectName]);

    return hasGlobalCommit || hasProjectScopedCommit;
}

function determineReleaseType(commits, projectName) {
    // scope가 없거나 해당 프로젝트의 scope를 가진 커밋 모두 포함
    const relevantCommits = commits.filter(commit => !commit.scope || commit.scope === CONFIG.scopeMap[projectName]);

    let releaseType = 'patch';

    for (const commit of relevantCommits) {
        if (commit.type.endsWith('!') || commit.message.includes('BREAKING CHANGE')) {
            return 'major';
        }

        if (commit.type === 'feat') {
            releaseType = 'minor';
        }
    }

    return releaseType;
}

function categorizeCommits(commits) {
    const categories = {
        'Breaking Changes': [],
        Features: [],
        'Bug Fixes': [],
        Documentation: [],
        Refactor: [],
        Chores: [],
        Other: [],
    };

    // scope 필터링 없이 모든 커밋 처리
    commits.forEach(commit => {
        const { type, scope, message } = commit;
        const scopePrefix = scope ? `(${scope}) ` : '';

        switch (type) {
            case 'feat':
                if (message.includes('BREAKING CHANGE') || type.endsWith('!')) {
                    categories['Breaking Changes'].push(`${scopePrefix}${message}`);
                } else {
                    categories['Features'].push(`${scopePrefix}${message}`);
                }
                break;
            case 'fix':
                categories['Bug Fixes'].push(`${scopePrefix}${message}`);
                break;
            case 'docs':
                categories['Documentation'].push(`${scopePrefix}${message}`);
                break;
            case 'refactor':
                categories['Refactor'].push(`${scopePrefix}${message}`);
                break;
            case 'chore':
                categories['Chores'].push(`${scopePrefix}${message}`);
                break;
            default:
                categories['Other'].push(`${type}: ${scopePrefix}${message}`);
        }
    });

    // 빈 카테고리 제거
    Object.keys(categories).forEach(key => {
        if (categories[key].length === 0) {
            delete categories[key];
        }
    });

    return categories;
}

function generateChangelog(versionInfo, categories) {
    const date = new Date().toISOString().split('T')[0];
    let changelog = '';

    // 버전 정보와 날짜를 포함한 헤더
    changelog += `## [${date}] - ${versionInfo}\n\n`;

    Object.entries(categories).forEach(([category, messages]) => {
        if (messages.length > 0) {
            changelog += `### ${category}\n\n`;
            messages.forEach(msg => {
                changelog += `- ${msg}\n`;
            });
            changelog += '\n';
        }
    });

    return changelog;
}

function updateChangelog(newContent) {
    const changelogPath = path.resolve(process.cwd(), CONFIG.changelogPath);
    let existingContent = '';

    try {
        existingContent = fs.readFileSync(changelogPath, 'utf8');
    } catch (error) {
        existingContent = '# Changelog\n\nAll notable changes to this project will be documented in this file.\n\n';
    }

    const [header, ...rest] = existingContent.split('\n\n');
    const updatedContent = `${header}\n\n${newContent}${rest.join('\n\n')}`;

    fs.writeFileSync(changelogPath, updatedContent);
}

function updatePackageVersion(projectPath, newVersion) {
    const packagePath = path.resolve(process.cwd(), projectPath);
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    const oldVersion = packageJson.version;
    packageJson.version = newVersion;
    fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2) + '\n');
    return {
        name: packageJson.name,
        oldVersion,
        newVersion,
    };
}

function getSquashMergeCommitMessage() {
    const result = spawnSync('git', ['log', '-1', '--pretty=%B']);
    return result.stdout.toString().trim();
}

function incrementVersion(version, type) {
    const [major, minor, patch] = version.split('.').map(Number);

    switch (type) {
        case 'major':
            return `${major + 1}.0.0`;
        case 'minor':
            return `${major}.${minor + 1}.0`;
        case 'patch':
            return `${major}.${minor}.${patch + 1}`;
        default:
            throw new Error(`Invalid release type: ${type}`);
    }
}

function main() {
    try {
        const currentBranch = spawnSync('git', ['rev-parse', '--abbrev-ref', 'HEAD']).stdout.toString().trim();

        if (currentBranch !== CONFIG.targetBranch) {
            console.log(`Skipping version update: Not on ${CONFIG.targetBranch} branch`);
            return;
        }

        const commitMessage = getSquashMergeCommitMessage();
        const commits = parseSquashMergeCommit(commitMessage);

        if (commits.length === 0) {
            console.log('No conventional commits found in the squash merge message');
            return;
        }

        let updatedAnyProject = false;
        let updatedVersions = [];
        let highestReleaseType = 'none';

        // 1. 각 프로젝트의 버전 업데이트 처리
        Object.entries(CONFIG.projectPaths).forEach(([projectName, projectPath]) => {
            const packageJson = JSON.parse(fs.readFileSync(projectPath, 'utf8'));

            if (shouldUpdateProject(projectName, commits)) {
                updatedAnyProject = true;
                const releaseType = determineReleaseType(commits, projectName);

                // 가장 높은 버전 변경 타입 추적
                if (VERSION_PRIORITY[releaseType] > VERSION_PRIORITY[highestReleaseType]) {
                    highestReleaseType = releaseType;
                }

                const newVersion = incrementVersion(packageJson.version, releaseType);
                const { name, oldVersion } = updatePackageVersion(projectPath, newVersion);
                updatedVersions.push({ name, version: newVersion });

                console.log(`Updated ${name} from ${oldVersion} to ${newVersion}`);
                console.log(`::set-output name=${projectName.toUpperCase()}_VERSION::${newVersion}`);
            } else {
                console.log(`Skipping version update for ${projectName}: No relevant changes`);
            }
        });

        // 2. 루트 package.json 업데이트
        if (highestReleaseType !== 'none') {
            const rootPackage = JSON.parse(fs.readFileSync(CONFIG.rootPackagePath, 'utf8'));
            const newRootVersion = incrementVersion(rootPackage.version, highestReleaseType);
            const { name, oldVersion } = updatePackageVersion(CONFIG.rootPackagePath, newRootVersion);
            updatedVersions.unshift({ name: 'root', version: newRootVersion });

            console.log(`Updated root package from ${oldVersion} to ${newRootVersion}`);
        }

        // 3. CHANGELOG 생성
        if (commits.length > 0) {
            const categories = categorizeCommits(commits);

            let versionInfo = '';
            if (updatedVersions.length > 0) {
                versionInfo = updatedVersions.map(({ name, version }) => `${name}@${version}`).join(', ');
            } else {
                versionInfo = 'No version updates';
            }

            const changelogContent = generateChangelog(versionInfo, categories);
            updateChangelog(changelogContent);
            console.log('Successfully updated CHANGELOG');
        }

        if (!updatedAnyProject) {
            console.log('No projects were updated as no commits had matching scopes');
        }
    } catch (error) {
        console.error('Error occurred:', error);
        process.exit(1);
    }
}

main();
