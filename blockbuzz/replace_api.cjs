const fs = require('fs');
const path = require('path');

const DIRS = ['app', 'components', 'hooks', 'lib'];
const EXTENSIONS = ['.ts', '.tsx'];
const EXCLUDE_DIRS = ['app/api']; // Don't replace server routes

function processDirectory(dir) {
    const files = fs.readdirSync(dir);

    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            if (!EXCLUDE_DIRS.includes(fullPath.replace(/\\/g, '/'))) {
                processDirectory(fullPath);
            }
        } else if (EXTENSIONS.includes(path.extname(fullPath))) {
            let content = fs.readFileSync(fullPath, 'utf-8');
            let originalContent = content;

            // `"\/api\/` -> `process.env.NEXT_PUBLIC_API_BASE + "/api/` actually since NEXT_PUBLIC is "https://.../"
            // if we replace `"/api/` with `process.env.NEXT_PUBLIC_API_BASE + "api/`
            // Wait, we can replace  "/api/  with  `${process.env.NEXT_PUBLIC_API_BASE}api/` everywhere.

            // `"/api/..."` -> `` `${process.env.NEXT_PUBLIC_API_BASE}api/...` ``
            content = content.replace(/"\/api\/(.*?)"/g, '`${process.env.NEXT_PUBLIC_API_BASE}api/$1`');

            // `'/api/...'` -> `` `${process.env.NEXT_PUBLIC_API_BASE}api/...` ``
            content = content.replace(/'\/api\/(.*?)'/g, '`${process.env.NEXT_PUBLIC_API_BASE}api/$1`');

            // `` `/api/...` `` -> `` `${process.env.NEXT_PUBLIC_API_BASE}api/...` ``
            // For templates, we only need to replace `/api/` inside the template string at the start with `${process.env.NEXT_PUBLIC_API_BASE}api/`
            // so we match `/api/` preceded by ` (backtick)
            content = content.replace(/`\/api\//g, '`${process.env.NEXT_PUBLIC_API_BASE}api/');

            if (content !== originalContent) {
                fs.writeFileSync(fullPath, content, 'utf-8');
                console.log('Updated:', fullPath);
            }
        }
    }
}

for (const dir of DIRS) {
    if (fs.existsSync(dir)) {
        processDirectory(dir);
    }
}
