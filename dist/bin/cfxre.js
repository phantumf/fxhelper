#! /usr/bin/env node

if (Number(process.version.slice(1).split(".")[0]) < 16) throw new Error("Node 16.x or higher is required. Update Node on your system.");

import inquirer from "inquirer";
import { Command } from "commander";
const program = new Command();
import os from "node:os";
import fs from "node:fs/promises";
import colors from "colors";


const init = async (options) => {

    const path = options.__path ? `./${options.__path}/` : './';

    const defaults = {
        userName: os.userInfo().username || 'aleks'
    }
    //prompt
    const ans = await inquirer.prompt([
        {
            name: 'fx_version',
            message: 'select fx version',
            type: 'list',
            choices: [
                // only fx v2 are supported
                'cerulean',
                'bodacious',
                'adamant'
            ]
        },
        {
            name: 'games',
            message: 'select games',
            type: 'checkbox',
            choices: [
                'gta5',
                'rdr3',
            ],
            validate: (arr) => {
                if (!arr.length) return 'Please select one or more options';
                return true;
            }
        },
        {
            name: 'version',
            message: 'enter script version (ex. 0.0.1)',
            type: 'input',
            default: '0.0.1',
            validate: (t) => {
                if (!/^\d{1,2}\.\d{1,2}\.\d{1,2}$/.test(t)) return 'Please enter the version in correct format (ex. 0.0.1)';
                return true;
            }
        },
        {
            name: 'lua54',
            message: 'enable lua5.4?',
            type: 'confirm',
            default: true,
        },
        {
            name: 'description',
            message: 'enter script description',
            type: 'input',
            default: 'Awesome script!',
        },
        {
            name: 'author',
            message: 'enter script author (ex. your name)',
            type: 'input',
            default: defaults.userName
        },
    ]);


    let manifest = '--[[\nManifest file\nplease don\'t edit if you don\'t know what you are doing\n]]\n';
    manifest += '\n\n--fx data\n';
    if (ans.fx_version) manifest += ('fx_version \'$1\'\n'.replace('$1', ans.fx_version));
    if (ans.games) manifest += ('games { $1 }\n'.replace('$1', ans.games.map(x => `'${x}'`).join(', ')));
    if (ans.lua54) manifest += 'lua54 \'yes\'\n';
    manifest += '\n\n--script data\n';
    if (ans.author) manifest += ('author \'$1\'\n'.replace('$1', ans.author));
    if (ans.description) manifest += ('description \'$1\'\n'.replace('$1', ans.description));
    if (ans.version) manifest += ('version \'$1\'\n'.replace('$1', ans.version));
    if (!options.nofolders) {
        manifest += '\n\n--files data\n';
        manifest +=
            `client_scripts {
'client/**/*.lua',
}
server_scripts {
'server/**/*.lua',
}
shared_scripts {
'shared/**/*.lua',
}`;

        fs.mkdir(path + 'client').then(() => console.log(`${colors.white('[')}${colors.bgGreen('SUCC')}${colors.white(']')} ${colors.blue('>')} ${colors.green('Created \'client\' folder')}`)).catch(() => console.log(`${colors.white('[')}${colors.bgRed('ERR')}${colors.white(']')} ${colors.blue('>')} ${colors.red('Cannot create \'client\' folder')}`));
        fs.mkdir(path + 'server').then(() => console.log(`${colors.white('[')}${colors.bgGreen('SUCC')}${colors.white(']')} ${colors.blue('>')} ${colors.green('Created \'server\' folder')}`)).catch(() => console.log(`${colors.white('[')}${colors.bgRed('ERR')}${colors.white(']')} ${colors.blue('>')} ${colors.red('Cannot create \'server\' folder')}`));
        fs.mkdir(path + 'shared').then(() => console.log(`${colors.white('[')}${colors.bgGreen('SUCC')}${colors.white(']')} ${colors.blue('>')} ${colors.green('Created \'shared\' folder')}`)).catch(() => console.log(`${colors.white('[')}${colors.bgRed('ERR')}${colors.white(']')} ${colors.blue('>')} ${colors.red('Cannot create \'shared\' folder')}`));
    };




    fs.writeFile(path + 'fxmanifest.lua', manifest, { encoding: 'utf-8' }).then(() => console.log(`${colors.white('[')}${colors.bgGreen('SUCC')}${colors.white(']')} ${colors.blue('>')} ${colors.green('Created \'fxmanifest.lua\'')}`)).catch(() => console.log(`${colors.white('[')}${colors.bgRed('ERR')}${colors.white(']')} ${colors.blue('>')} ${colors.red('Cannot create \'fxmanifest.lua\'')}`));


    console.log(`${colors.white('[')}${colors.bgGreen('SUCC')}${colors.white(']')} ${colors.blue('>')} ${colors.green('Environment creation completed!')}`);
    if (options.__path) console.log(`${colors.white('[')}${colors.bgGreen('SUCC')}${colors.white(']')} ${colors.blue('>')} ${colors.green('Use \'cd ' + options.__path + '\' to go to the project directory')}`);

    process.exit(0);

};

const create = async () => {
    const ans = await inquirer.prompt([
        {
            name: 'project_name',
            message: 'enter project name',
            type: 'input',
            validate: async (name) => {
                if ((await (fs.stat('./' + name).catch(() => null)))) return 'A directory named ' + name + ' already exists';
                return true;
            }
        },
    ]);


    fs.mkdir('./' + ans.project_name).catch(() => console.log(`${colors.white('[')}${colors.bgRed('ERR')}${colors.white(']')} ${colors.blue('>')} ${colors.red('Cannot create \'' + ans.project_name + '\' folder')}`));

    await init({ Nf: false, __path: ans.project_name });
}

program.command('init')
    .option('-nf, --nofolders', 'Do not create script folders', false)
    .action(init)



program.command('create')
    .action(create)



program.parse();