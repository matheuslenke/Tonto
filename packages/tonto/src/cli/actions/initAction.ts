import chalk from 'chalk';
import * as fs from 'fs';
import * as path from 'path';

type InitOptions = {
    catDogExample?: boolean
}

function copyDirectory(source: string, destination: string): void {
    if (!fs.existsSync(destination)) {
        fs.mkdirSync(destination, { recursive: true });
    }

    const entries = fs.readdirSync(source, { withFileTypes: true });

    for (const entry of entries) {
        const srcPath = path.join(source, entry.name);
        const destPath = path.join(destination, entry.name);

        if (entry.isDirectory()) {
            copyDirectory(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

export async function initAction(projectName: string, options: InitOptions): Promise<void> {
    const projectPath = path.join(process.cwd(), projectName);

    if (fs.existsSync(projectPath)) {
        console.error(chalk.red(`Error: Directory '${projectName}' already exists.`));
        return;
    }

    console.log(chalk.blue(`Initializing new Tonto project in '${projectPath}'...`));

    fs.mkdirSync(projectPath, { recursive: true });

    const tontoJsonContent = {
        name: projectName,
        version: "0.0.1",
        description: "",
        main: "src/main.tonto",
        outFolder: "out",
        dependencies: {}
    };

    fs.writeFileSync(
        path.join(projectPath, 'tonto.json'),
        JSON.stringify(tontoJsonContent, null, 2)
    );

    const srcPath = path.join(projectPath, 'src');
    fs.mkdirSync(srcPath);


    if (options.catDogExample) {
        const templateDir = path.resolve(__dirname, '../templates/cats-and-dogs');
        copyDirectory(templateDir, srcPath);
        console.log(chalk.green('Added Cat and Dog example files.'));

    } else {
        fs.writeFileSync(path.join(srcPath, 'main.tonto'), '');
    }

    console.log(chalk.green(`Project '${projectName}' initialized successfully.`));
    console.log(`\nTo get started, run:\n`);
    console.log(chalk.yellow(`  cd ${projectName}`));
}
