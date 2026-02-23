import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dir = path.join(__dirname, 'src/pages/landing');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));

for (const file of files) {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    // Replace occurrences of `Mail, ` or `, Mail` or ` Mail`
    content = content.replace(/Mail,\s*/g, '');
    content = content.replace(/,\s*Mail\b/g, '');
    content = content.replace(/\{ Mail \}/g, '{}');

    fs.writeFileSync(filePath, content, 'utf8');
}
console.log('Fixed imports');
