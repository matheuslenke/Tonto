import { input, select } from '@inquirer/prompts';
import chalk from 'chalk';
import { Command } from 'commander';
import * as fs from 'fs';
import * as path from 'path';
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


const TontoConfig = {
    name: "tonto-project",
    version: "0.0.1",
    description: "A new Tonto project.",
    author: "",
    license: "ISC",
    files: [
        "src"
    ]
};

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

    const projectPath = path.resolve(answers.name);
    fs.mkdirSync(projectPath, { recursive: true });

    const tontoJsonPath = path.join(projectPath, 'tonto.json');
    if (fs.existsSync(tontoJsonPath)) {
        console.log(chalk.yellow('tonto.json already exists. Skipping creation.'));
    } else {
        const tontoConfig = { ...TontoConfig, ...answers };
        fs.writeFileSync(tontoJsonPath, JSON.stringify(tontoConfig, null, 2));
        console.log(chalk.green('tonto.json created successfully.'));
    }

    const shouldCreateCursor = editorTarget === 'cursor' || editorTarget === 'both';
    const shouldCreateVscode = editorTarget === 'vscode' || editorTarget === 'both';

    if (shouldCreateCursor) {
        const cursorDirPath = path.join(projectPath, '.cursor');
        const rulesDirPath = path.join(cursorDirPath, 'rules');
        if (fs.existsSync(rulesDirPath)) {
            console.log(chalk.yellow('.cursor/rules directory already exists. Skipping creation.'));
        } else {
            fs.mkdirSync(rulesDirPath, { recursive: true });

            createRuleFileWithHeader(tontoGuidance, rulesDirPath, 'tonto-guidance.mdc', cursorHeader);
            createRuleFileWithHeader(llmGuidance, rulesDirPath, 'tonto_llm_guidance.mdc', cursorHeader);
            createRuleFileWithHeader(tontoLLMCreateNewElements, rulesDirPath, 'tonto-llm-create-new-elements.mdc', cursorHeader);
            createRuleFileWithHeader(tontoLLMTerminologyAnalysisGuide, rulesDirPath, 'tonto_llm_terminology_analysis_guide.mdc', cursorHeader);
            createRuleFileWithHeader(tontoLLMUnderstanding, rulesDirPath, 'tonto_llm_understanding_and_summarization_guide.mdc', cursorHeader);
            createRuleFileWithHeader(tontoLLMDocumentationGuide, rulesDirPath, 'tonto_llm_documentation_guide.mdc', cursorHeader);

            console.log(chalk.green('.cursor/rules directory and guidance files created successfully.'));
        }
    }

    if (shouldCreateVscode) {
        const githubInstructionsPath = path.join(projectPath, '.github', 'instructions');
        if (fs.existsSync(githubInstructionsPath)) {
            console.log(chalk.yellow('.github/instructions directory already exists. Skipping creation.'));
        } else {
            fs.mkdirSync(githubInstructionsPath, { recursive: true });

            createRuleFileWithHeader(tontoGuidance, githubInstructionsPath, 'tonto-guidance.md', vscodeHeader);
            createRuleFileWithHeader(llmGuidance, githubInstructionsPath, 'tonto_llm_guidance.md', vscodeHeader);
            createRuleFileWithHeader(tontoLLMCreateNewElements, githubInstructionsPath, 'tonto-llm-create-new-elements.md', vscodeHeader);
            createRuleFileWithHeader(tontoLLMTerminologyAnalysisGuide, githubInstructionsPath, 'tonto_llm_terminology_analysis_guide.md', vscodeHeader);
            createRuleFileWithHeader(tontoLLMUnderstanding, githubInstructionsPath, 'tonto_llm_understanding_and_summarization_guide.md', vscodeHeader);
            createRuleFileWithHeader(tontoLLMDocumentationGuide, githubInstructionsPath, 'tonto_llm_documentation_guide.md', vscodeHeader);

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
