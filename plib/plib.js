import fs from 'fs';
import path from 'path';

const [,, command, target] = process.argv;

if (command === 'init' && target) {
    const root = path.resolve(target);
    if (fs.existsSync(root)) {
        console.error(`Error: Directory ${target} already exists.`);
        process.exit(1);
    }
    
    fs.mkdirSync(root, { recursive: true });
    fs.mkdirSync(path.join(root, 'src'));

    const metadata = {
        name: target,
        version: "1.0.0",
        entry: `src/main.perhaps`
    };
    
    fs.writeFileSync(path.join(root, 'plib.json'), JSON.stringify(metadata, null, 4));
    fs.writeFileSync(path.join(root, 'src/main.perhaps'), `// ${target} entry point\n\nvoid lib_init() {\n    print("${target} library loaded.");\n}\n`);
    
    console.log(`✅ Library "${target}" initialized.`);
} 

else if (command === 'build') {
    const configPath = path.join(process.cwd(), 'plib.json');
    if (!fs.existsSync(configPath)) {
        console.error("Error: No plib.json found. Run this command from your library root.");
        process.exit(1);
    }

    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    const distDir = path.join(process.cwd(), 'dist');
    if (!fs.existsSync(distDir)) fs.mkdirSync(distDir);

    const outFile = path.join(distDir, `${config.name}.bundle.perhaps`);
    const srcDir = path.join(process.cwd(), 'src');
    
    // Simple Bundler: Concatenate all source files
    let bundleContent = `// Generated Bundle: ${config.name} v${config.version}\n`;
    const files = fs.readdirSync(srcDir).filter(f => f.endsWith('.perhaps'));

    files.forEach(file => {
        const data = fs.readFileSync(path.join(srcDir, file), 'utf8');
        bundleContent += `\n// Source: ${file}\n${data}\n`;
    });

    fs.writeFileSync(outFile, bundleContent);
    console.log(`📦 Build successful! Bundle created at: ${outFile}`);
} 

else {
    console.log("Usage:\n  plib init <name>  - Create a new library\n  plib build       - Bundle src/*.perhaps into dist/");
}
