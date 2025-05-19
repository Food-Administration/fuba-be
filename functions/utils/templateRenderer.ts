// src/utils/templateRenderer.ts
import fs from 'fs';
import path from 'path';
import handlebars from 'handlebars';

class TemplateRenderer {
    private templateDir: string;

    constructor() {
        this.templateDir = path.join(__dirname, '../emailTemplates');
    }

    renderTemplate(templateName: string, data: any): string {
        const templatePath = path.join(this.templateDir, templateName);
        const templateSource = fs.readFileSync(templatePath, 'utf8');
        const template = handlebars.compile(templateSource);
        return template(data);
    }
}

export default new TemplateRenderer();