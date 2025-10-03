import { input, select } from '@inquirer/prompts';
import chalk from 'chalk';
import { Command } from 'commander';
import * as fs from 'fs';
import * as path from 'path';
import { createDefaultTontoManifest, manifestFileName, toJson } from '../../model/grammar/TontoManifest.js';
import { cursorHeader, vscodeHeader } from '../../templates/headers.js';
import { readmeTemplate } from '../../templates/readme.js';
import { llmGuidance } from '../../templates/rules/llm-guidance.js';
import { tontoGuidance } from '../../templates/rules/tonto-guidance.js';
import { tontoLLMCreateNewElements } from '../../templates/rules/tonto-llm-create-new-elements.js';
import { tontoLLMDocumentationGuide } from '../../templates/rules/tonto-llm-documentation-guide.js';
import { tontoLLMTerminologyAnalysisGuide } from '../../templates/rules/tonto-llm-terminology-analysis-guide.js';
import { tontoLLMUnderstanding } from '../../templates/rules/tonto-llm-understanding.js';
import { catsTontoFile } from '../../templates/tonto/cats.js';
import { datatypesTontoFile } from '../../templates/tonto/datatypes.js';
import { dogsTontoFile } from '../../templates/tonto/dogs.js';
import { mainTontoBlankFile } from '../../templates/tonto/main.blank.js';
import { mainTontoFile } from '../../templates/tonto/main.js';

interface InitOptions {
    catDogExample?: boolean;
    template?: string;
}

// Validation function for project name
function validateProjectName(inputValue: string): boolean | string {
    if (!/^[\w-]+$/.test(inputValue)) {
        return 'Project name can only contain letters, numbers, underscores, and hyphens.';
    }
    if (fs.existsSync(path.resolve(inputValue))) {
        return `A directory named '${inputValue}' already exists in the current directory.`;
    }
    return true;
}

async function initAction(options: InitOptions) {
    console.log(chalk.cyan('[Tonto: Init new project command]'));
    console.log(chalk.blue('initAction started'));
    console.log(chalk.blue(`options: ${JSON.stringify(options)}`));
    // Gather project information through individual prompts
    const name = await input({
        message: 'Project name:',
        default: 'tonto-project',
        validate: validateProjectName
    });

    const version = await input({
        message: 'Version:',
        default: '0.0.1'
    });

    const description = await input({
        message: 'Description:',
        default: 'A new Tonto project.'
    });

    const author = await input({
        message: 'Author:'
    });

    const editorTarget = await select({
        message: 'Which editor do you use?',
        choices: [
            { name: 'Cursor', value: 'cursor', description: 'Generate guidance under .cursor/rules with .mdc files' },
            { name: 'VS Code', value: 'vscode', description: 'Generate guidance under .github/instructions with .md files' },
            { name: 'Both', value: 'both', description: 'Generate for both editors' }
        ]
    });

    // Ask for template selection
    const template = await select({
        message: 'Choose a project template:',
        choices: [
            {
                name: 'Blank',
                value: 'blank',
                description: 'Start with an empty project'
            },
            {
                name: 'Cat and Dog example',
                value: 'cat-dog',
                description: 'Start with a Cat and Dog example project'
            }
        ]
    });

    const answers = { name, version, description, author, template };
    console.log(chalk.blue(`Collected answers: ${JSON.stringify(answers)}`));

    const projectPath = path.resolve(answers.name);
    console.log(chalk.blue(`Creating project directory at ${projectPath}`));
    try {
        fs.mkdirSync(projectPath, { recursive: true });
        console.log(chalk.blue(`Created project directory ${projectPath}`));
    } catch (err) {
        console.error(chalk.red(`Failed to create project directory ${projectPath}: ${String(err)}`));
        throw err;
    }

    const tontoJsonPath = path.join(projectPath, manifestFileName);
    console.log(chalk.blue(`Checking for tonto.json at ${tontoJsonPath}`));
    if (fs.existsSync(tontoJsonPath)) {
        console.log(chalk.yellow('tonto.json already exists. Skipping creation.'));
    } else {
        // Create manifest from canonical API and populate with collected answers
        const manifest = createDefaultTontoManifest();
        manifest.projectName = answers.name;
        manifest.displayName = answers.name;
        manifest.version = answers.version ?? manifest.version;
        // If author was provided as a simple string, map to authors array
        if (answers.author) {
            manifest.authors = [{ name: answers.author }];
        }
        console.log(chalk.blue('Writing tonto.json'));
        try {
            fs.writeFileSync(tontoJsonPath, toJson(manifest));
            console.log(chalk.green(`tonto.json created successfully at ${tontoJsonPath}`));
        } catch (err) {
            console.error(chalk.red(`Failed to write tonto.json at ${tontoJsonPath}: ${String(err)}`));
            throw err;
        }
    }

    const shouldCreateCursor = editorTarget === 'cursor' || editorTarget === 'both';
    const shouldCreateVscode = editorTarget === 'vscode' || editorTarget === 'both';

    if (shouldCreateCursor) {
        const cursorDirPath = path.join(projectPath, '.cursor');
        const rulesDirPath = path.join(cursorDirPath, 'rules');
        console.log(chalk.blue(`Preparing to create Cursor rules at ${rulesDirPath}`));
        if (fs.existsSync(rulesDirPath)) {
            console.log(chalk.yellow('.cursor/rules directory already exists. Skipping creation.'));
        } else {
            console.log(chalk.blue(`Creating directory ${rulesDirPath}`));
            try {
                fs.mkdirSync(rulesDirPath, { recursive: true });
                console.log(chalk.blue('Creating .cursor rule files...'));
            } catch (err) {
                console.error(chalk.red(`Failed to create directory ${rulesDirPath}: ${String(err)}`));
                throw err;
            }

            try {
                createRuleFileWithHeader(tontoGuidance, rulesDirPath, 'tonto-guidance.mdc', cursorHeader);
                console.log(chalk.green('Created tonto-guidance.mdc'));
            } catch (err) {
                console.error(chalk.red(`Failed to create tonto-guidance.mdc: ${String(err)}`));
                throw err;
            }
            try {
                createRuleFileWithHeader(llmGuidance, rulesDirPath, 'tonto_llm_guidance.mdc', cursorHeader);
                console.log(chalk.green('Created tonto_llm_guidance.mdc'));
            } catch (err) {
                console.error(chalk.red(`Failed to create tonto_llm_guidance.mdc: ${String(err)}`));
                throw err;
            }
            try {
                createRuleFileWithHeader(tontoLLMCreateNewElements, rulesDirPath, 'tonto-llm-create-new-elements.mdc', cursorHeader);
                console.log(chalk.green('Created tonto-llm-create-new-elements.mdc'));
            } catch (err) {
                console.error(chalk.red(`Failed to create tonto-llm-create-new-elements.mdc: ${String(err)}`));
                throw err;
            }
            try {
                createRuleFileWithHeader(tontoLLMTerminologyAnalysisGuide, rulesDirPath, 'tonto_llm_terminology_analysis_guide.mdc', cursorHeader);
                console.log(chalk.green('Created tonto_llm_terminology_analysis_guide.mdc'));
            } catch (err) {
                console.error(chalk.red(`Failed to create tonto_llm_terminology_analysis_guide.mdc: ${String(err)}`));
                throw err;
            }
            try {
                createRuleFileWithHeader(tontoLLMUnderstanding, rulesDirPath, 'tonto_llm_understanding_and_summarization_guide.mdc', cursorHeader);
                console.log(chalk.green('Created tonto_llm_understanding_and_summarization_guide.mdc'));
            } catch (err) {
                console.error(chalk.red(`Failed to create tonto_llm_understanding_and_summarization_guide.mdc: ${String(err)}`));
                throw err;
            }
            try {
                createRuleFileWithHeader(tontoLLMDocumentationGuide, rulesDirPath, 'tonto_llm_documentation_guide.mdc', cursorHeader);
                console.log(chalk.green('Created tonto_llm_documentation_guide.mdc'));
            } catch (err) {
                console.error(chalk.red(`Failed to create tonto_llm_documentation_guide.mdc: ${String(err)}`));
                throw err;
            }

            console.log(chalk.green('.cursor/rules directory and guidance files created successfully.'));
        }
    }

    if (shouldCreateVscode) {
        const githubInstructionsPath = path.join(projectPath, '.github', 'instructions');
        console.log(chalk.blue(`Preparing to create VSCode instructions at ${githubInstructionsPath}`));
        if (fs.existsSync(githubInstructionsPath)) {
            console.log(chalk.yellow('.github/instructions directory already exists. Skipping creation.'));
        } else {
            console.log(chalk.blue(`Creating directory ${githubInstructionsPath}`));
            try {
                fs.mkdirSync(githubInstructionsPath, { recursive: true });
                console.log(chalk.blue('Creating .github instruction files...'));
            } catch (err) {
                console.error(chalk.red(`Failed to create directory ${githubInstructionsPath}: ${String(err)}`));
                throw err;
            }

            try {
                createRuleFileWithHeader(tontoGuidance, githubInstructionsPath, 'tonto-guidance.md', vscodeHeader);
                console.log(chalk.green('Created tonto-guidance.md'));
            } catch (err) {
                console.error(chalk.red(`Failed to create tonto-guidance.md: ${String(err)}`));
                throw err;
            }
            try {
                createRuleFileWithHeader(llmGuidance, githubInstructionsPath, 'tonto_llm_guidance.md', vscodeHeader);
                console.log(chalk.green('Created tonto_llm_guidance.md'));
            } catch (err) {
                console.error(chalk.red(`Failed to create tonto_llm_guidance.md: ${String(err)}`));
                throw err;
            }
            try {
                createRuleFileWithHeader(tontoLLMCreateNewElements, githubInstructionsPath, 'tonto-llm-create-new-elements.md', vscodeHeader);
                console.log(chalk.green('Created tonto-llm-create-new-elements.md'));
            } catch (err) {
                console.error(chalk.red(`Failed to create tonto-llm-create-new-elements.md: ${String(err)}`));
                throw err;
            }
            try {
                createRuleFileWithHeader(tontoLLMTerminologyAnalysisGuide, githubInstructionsPath, 'tonto_llm_terminology_analysis_guide.md', vscodeHeader);
                console.log(chalk.green('Created tonto_llm_terminology_analysis_guide.md'));
            } catch (err) {
                console.error(chalk.red(`Failed to create tonto_llm_terminology_analysis_guide.md: ${String(err)}`));
                throw err;
            }
            try {
                createRuleFileWithHeader(tontoLLMUnderstanding, githubInstructionsPath, 'tonto_llm_understanding_and_summarization_guide.md', vscodeHeader);
                console.log(chalk.green('Created tonto_llm_understanding_and_summarization_guide.md'));
            } catch (err) {
                console.error(chalk.red(`Failed to create tonto_llm_understanding_and_summarization_guide.md: ${String(err)}`));
                throw err;
            }
            try {
                createRuleFileWithHeader(tontoLLMDocumentationGuide, githubInstructionsPath, 'tonto_llm_documentation_guide.md', vscodeHeader);
                console.log(chalk.green('Created tonto_llm_documentation_guide.md'));
            } catch (err) {
                console.error(chalk.red(`Failed to create tonto_llm_documentation_guide.md: ${String(err)}`));
                throw err;
            }

            console.log(chalk.green('.github/instructions directory and guidance files created successfully.'));
        }
    }

    const srcPath = path.join(projectPath, 'src');
    if (fs.existsSync(srcPath)) {
        console.log(chalk.yellow('src directory already exists. Skipping creation.'));
    } else {
        fs.mkdirSync(srcPath, { recursive: true });
        
        // Use template selection or fallback to command line option
        const selectedTemplate = answers.template || (options.catDogExample ? 'cat-dog' : 'blank');
        
        if (selectedTemplate === 'cat-dog') {
            copyTemplate(mainTontoFile, srcPath, 'main.tonto');
            copyTemplate(catsTontoFile, srcPath, 'Cats.tonto');
            copyTemplate(dogsTontoFile, srcPath, 'Dogs.tonto');
            copyTemplate(datatypesTontoFile, srcPath, 'Datatypes.tonto');
            console.log(chalk.green('Cat and Dog example files created successfully.'));
        } else {
            copyTemplate(mainTontoBlankFile, srcPath, 'main.tonto');
            console.log(chalk.green('Blank template created successfully.'));
        }
        console.log(chalk.green('src directory created successfully.'));
    }

    const readmePath = path.join(projectPath, 'README.md');
    if (fs.existsSync(readmePath)) {
        console.log(chalk.yellow('README.md already exists. Skipping creation.'));
    } else {
        copyTemplate(readmeTemplate, projectPath, 'README.md');
        console.log(chalk.green('README.md created successfully.'));
    }

    // Create ignore files
    const cursorIgnorePath = path.join(projectPath, '.cursorignore');
    if (fs.existsSync(cursorIgnorePath)) {
        console.log(chalk.yellow('.cursorignore already exists. Skipping creation.'));
    } else {
        fs.writeFileSync(cursorIgnorePath, '.github\n.tonto_modules\n', 'utf-8');
        console.log(chalk.green('.cursorignore created successfully.'));
    }

    const gitIgnorePath = path.join(projectPath, '.gitignore');
    if (fs.existsSync(gitIgnorePath)) {
        console.log(chalk.yellow('.gitignore already exists. Skipping creation.'));
    } else {
        fs.writeFileSync(gitIgnorePath, 'tonto_modules\n', 'utf-8');
        console.log(chalk.green('.gitignore created successfully.'));
    }

    const vscodeIgnorePath = path.join(projectPath, '.vscodeignore');
    if (fs.existsSync(vscodeIgnorePath)) {
        console.log(chalk.yellow('.vscodeignore already exists. Skipping creation.'));
    } else {
        fs.writeFileSync(vscodeIgnorePath, '.cursor\n', 'utf-8');
        console.log(chalk.green('.vscodeignore created successfully.'));
    }
}

function copyTemplate(templateContent: string, destinationDir: string, destinationName: string) {
    fs.writeFileSync(path.join(destinationDir, destinationName), templateContent, 'utf-8');
}

function createRuleFileWithHeader(content: string, destinationDir: string, destinationName: string, header: string) {
    const fullContent = `${header}${content}`;
    fs.writeFileSync(path.join(destinationDir, destinationName), fullContent);
}

export function initCommand(): Command {
    const init = new Command('init');
    init.description('Init a new Tonto project with interactive template selection')
        .option('--cat-dog-example', 'Initialize a project with a Cat and Dog example (legacy option).')
        .action(initAction);
    return init;
}

export type InitProjectFile = { type: 'file' | 'dir'; relativePath: string; content?: string };

// Build list of files and directories to create for an init project without performing IO
export function buildInitProjectFiles(projectName: string, options: InitOptions): InitProjectFile[] {
    const files: InitProjectFile[] = [];

    // project dir
    files.push({ type: 'dir', relativePath: projectName });

    // tonto.json - use canonical manifest
    const manifest = createDefaultTontoManifest();
    manifest.projectName = projectName;
    manifest.displayName = projectName;
    files.push({ type: 'file', relativePath: path.join(projectName, manifestFileName), content: toJson(manifest) });

    // src
    files.push({ type: 'dir', relativePath: path.join(projectName, 'src') });
    const selectedTemplate = options?.template || (options?.catDogExample ? 'cat-dog' : 'blank');
    if (selectedTemplate === 'cat-dog') {
        files.push({ type: 'file', relativePath: path.join(projectName, 'src', 'main.tonto'), content: mainTontoFile });
        files.push({ type: 'file', relativePath: path.join(projectName, 'src', 'Cats.tonto'), content: catsTontoFile });
        files.push({ type: 'file', relativePath: path.join(projectName, 'src', 'Dogs.tonto'), content: dogsTontoFile });
        files.push({ type: 'file', relativePath: path.join(projectName, 'src', 'Datatypes.tonto'), content: datatypesTontoFile });
    } else {
        files.push({ type: 'file', relativePath: path.join(projectName, 'src', 'main.tonto'), content: mainTontoBlankFile });
    }

    // README
    files.push({ type: 'file', relativePath: path.join(projectName, 'README.md'), content: readmeTemplate });

    // .cursor/rules
    const cursorRulesDir = path.join(projectName, '.cursor', 'rules');
    files.push({ type: 'dir', relativePath: cursorRulesDir });
    files.push({ type: 'file', relativePath: path.join(cursorRulesDir, 'tonto-guidance.mdc'), content: `${cursorHeader}${tontoGuidance}` });
    files.push({ type: 'file', relativePath: path.join(cursorRulesDir, 'tonto_llm_guidance.mdc'), content: `${cursorHeader}${llmGuidance}` });
    files.push({ type: 'file', relativePath: path.join(cursorRulesDir, 'tonto-llm-create-new-elements.mdc'), content: `${cursorHeader}${tontoLLMCreateNewElements}` });
    files.push({ type: 'file', relativePath: path.join(cursorRulesDir, 'tonto_llm_terminology_analysis_guide.mdc'), content: `${cursorHeader}${tontoLLMTerminologyAnalysisGuide}` });
    files.push({ type: 'file', relativePath: path.join(cursorRulesDir, 'tonto_llm_understanding_and_summarization_guide.mdc'), content: `${cursorHeader}${tontoLLMUnderstanding}` });
    files.push({ type: 'file', relativePath: path.join(cursorRulesDir, 'tonto_llm_documentation_guide.mdc'), content: `${cursorHeader}${tontoLLMDocumentationGuide}` });

    // .github/instructions
    const githubDir = path.join(projectName, '.github', 'instructions');
    files.push({ type: 'dir', relativePath: githubDir });
    files.push({ type: 'file', relativePath: path.join(githubDir, 'tonto-guidance.md'), content: `${vscodeHeader}${tontoGuidance}` });
    files.push({ type: 'file', relativePath: path.join(githubDir, 'tonto_llm_guidance.md'), content: `${vscodeHeader}${llmGuidance}` });
    files.push({ type: 'file', relativePath: path.join(githubDir, 'tonto-llm-create-new-elements.md'), content: `${vscodeHeader}${tontoLLMCreateNewElements}` });
    files.push({ type: 'file', relativePath: path.join(githubDir, 'tonto_llm_terminology_analysis_guide.md'), content: `${vscodeHeader}${tontoLLMTerminologyAnalysisGuide}` });
    files.push({ type: 'file', relativePath: path.join(githubDir, 'tonto_llm_understanding_and_summarization_guide.md'), content: `${vscodeHeader}${tontoLLMUnderstanding}` });
    files.push({ type: 'file', relativePath: path.join(githubDir, 'tonto_llm_documentation_guide.md'), content: `${vscodeHeader}${tontoLLMDocumentationGuide}` });

    // ignore files
    files.push({ type: 'file', relativePath: path.join(projectName, '.cursorignore'), content: '.github\n.tonto_modules\n' });
    files.push({ type: 'file', relativePath: path.join(projectName, '.gitignore'), content: 'tonto_modules\n' });
    files.push({ type: 'file', relativePath: path.join(projectName, '.vscodeignore'), content: '.cursor\n' });

    return files;
}
