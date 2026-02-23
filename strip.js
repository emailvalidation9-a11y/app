import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dir = path.join(__dirname, 'src/pages/landing');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx') && f !== 'Landing.tsx' && f !== 'Pricing.tsx');

for (const file of files) {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    // Replace min-h-screen wrapper
    content = content.replace(
        /    <div className="min-h-screen">/,
        '    <div className="flex flex-col gap-0 animate-fade-in">'
    );

    // Remove nav
    content = content.replace(
        /      \{\/\* Navigation \*\/\}[\s\S]*?<\/nav>/,
        ''
    );

    // Remove footer
    content = content.replace(
        /      \{\/\* Footer \*\/\}[\s\S]*?<\/footer>/,
        ''
    );

    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Processed', file);
}
