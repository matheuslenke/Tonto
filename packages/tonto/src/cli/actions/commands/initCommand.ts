import { input } from '@inquirer/prompts';
import chalk from 'chalk';
import { Command } from 'commander';
import * as fs from 'fs';
import * as path from 'path';

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

    const answers = { name, version, description, author };

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

    const cursorDirPath = path.join(projectPath, '.cursor');
    const rulesDirPath = path.join(cursorDirPath, 'rules');
    if (fs.existsSync(rulesDirPath)) {
        console.log(chalk.yellow('.cursor/rules directory already exists. Skipping creation.'));
    } else {
        fs.mkdirSync(rulesDirPath, { recursive: true });
        
        createRuleFile('tonto-guidance.md', rulesDirPath, 'tonto-guidance.mdc');
        createRuleFile('llm-guidance.md', rulesDirPath, 'tonto_llm_guidance.mdc');
        createRuleFile('tonto-llm-create-new-elements.md', rulesDirPath, 'tonto-llm-create-new-elements.mdc');
        createRuleFile('tonto-llm-terminology-analysis-guide.md', rulesDirPath, 'tonto_llm_terminology_analysis_guide.mdc');
        createRuleFile('tonto-llm-understanding.md', rulesDirPath, 'tonto_llm_understanding_and_summarization_guide.mdc');
        createRuleFile('tonto-llm-documentation-guide.md', rulesDirPath, 'tonto_llm_documentation_guide.mdc');
        
        console.log(chalk.green('.cursor/rules directory and guidance files created successfully.'));
    }

    const srcPath = path.join(projectPath, 'src');
    if (fs.existsSync(srcPath)) {
        console.log(chalk.yellow('src directory already exists. Skipping creation.'));
    } else {
        fs.mkdirSync(srcPath, { recursive: true });
        if (options.catDogExample) {
            copyTemplate('main.tonto', srcPath, 'main.tonto');
            copyTemplate('Cats.tonto', srcPath, 'Cats.tonto');
            copyTemplate('Dogs.tonto', srcPath, 'Dogs.tonto');
            copyTemplate('Datatypes.tonto', srcPath, 'Datatypes.tonto');
        } else {
            copyTemplate('main.blank.tonto', srcPath, 'main.tonto');
        }
        console.log(chalk.green('src directory and example files created successfully.'));
    }

    const readmePath = path.join(projectPath, 'README.md');
    if (fs.existsSync(readmePath)) {
        console.log(chalk.yellow('README.md already exists. Skipping creation.'));
    } else {
        const readmeContent = fs.readFileSync(path.join(__dirname, '..', '..', '..', '..', 'src', 'cli', 'templates', 'readme.md'), 'utf-8');
        fs.writeFileSync(readmePath, readmeContent.replace('{{projectName}}', answers.name));
        console.log(chalk.green('README.md created successfully.'));
    }
}

function copyTemplate(templateName: string, destinationDir: string, destinationName: string) {
    const templatesPath = path.join(__dirname, '..', '..', '..', '..', 'src', 'cli', 'templates');
    fs.copyFileSync(path.join(templatesPath, templateName), path.join(destinationDir, destinationName));
}

function createRuleFile(templateName: string, destinationDir: string, destinationName: string) {
    const templatesPath = path.join(__dirname, '..', '..', '..', '..', 'src', 'cli', 'templates');
    const templateContent = fs.readFileSync(path.join(templatesPath, templateName), 'utf-8');

    fs.writeFileSync(path.join(destinationDir, destinationName), templateContent);
}

export function initCommand(): Command {
    const init = new Command('init');
    init.description('Init a new Tonto project')
        .option('--cat-dog-example', 'Initialize a project with a Cat and Dog example.')
        .action(initAction);
    return init;
}
