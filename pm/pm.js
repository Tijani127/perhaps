import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const [,, command, target] = process.argv;
const MODULES_DIR = path.join(process.cwd(), 'p_modules');

if (!fs.existsSync(MODULES_DIR)) fs.mkdirSync(MODULES_DIR);

if (command === 'install' && target) {
    const libName = path.basename(target).replace('.git', '');
    const dest = path.join(MODULES_DIR, libName);

    try {
        if (target.startsWith('http') || target.endsWith('.git')) {
            // Git Install
            console.log(`Cloning remote repository: ${target}...`);
            execSync(`git clone ${target} "${dest}"`, { stdio: 'pipe' }); 
        } else {
            // Local Path Install
            const srcPath = path.resolve(target);
            if (!fs.existsSync(srcPath)) {
                throw new Error(`The path "${target}" does not exist on your machine.`);
            }
            // Use junction for Windows compatibility if needed
            fs.symlinkSync(srcPath, dest, 'junction'); 
        }

        // DOUBLE CHECK: Did the folder actually get created?
        if (fs.existsSync(dest)) {
            console.log(`✅ Successfully installed ${libName} to p_modules/`);
        } else {
            throw new Error("Installation appeared to finish but directory is missing.");
        }

    } catch (err) {
        // Clearer error reporting
        console.error(`❌ Installation failed!`);
        console.error(`Reason: ${err.message}`);
        
        // Cleanup if a partial folder was made
        if (fs.existsSync(dest)) fs.rmSync(dest, { recursive: true, force: true });
    }
}
 

else if (command === 'list') {
    const libs = fs.readdirSync(MODULES_DIR);
    libs.forEach(lib => {
        const p = path.join(MODULES_DIR, lib, 'plib.json');
        const v = fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf8')).version : "0.0.0";
        console.log(` - ${lib} (@${v})`);
    });
}

// --- NEW UPDATE COMMAND ---
else if (command === 'update') {
    console.log("🔄 Updating all libraries in p_modules...");
    const libs = fs.readdirSync(MODULES_DIR);
    
    libs.forEach(lib => {
        const libPath = path.join(MODULES_DIR, lib);
        const gitPath = path.join(libPath, '.git');
        
        if (fs.existsSync(gitPath)) {
            console.log(` -> Updating ${lib}...`);
            try {
                // Pulls changes and merges them into the local branch
                execSync('git pull', { cwd: libPath, stdio: 'inherit' });
                console.log(` ✅ ${lib} is up to date.`);
            } catch (err) {
                console.error(` ❌ Error updating ${lib}: ${err.message}`);
            }
        } else {
            console.log(` ⏩ Skipping ${lib} (not a git repository).`);
        }
    });
}

else {
    console.log("pm Usage: install <url/path> | list | update");
}
