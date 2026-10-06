import fs from 'node:fs';
import path from 'node:path';

export const marker = '<!-- Built by the CV toolkit. Edit the structured source, then rebuild. -->';
const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const text = (value, label) => {
  if (typeof value !== 'string' || !value.trim()) throw new Error(`${label}: expected non-empty text`);
  return escape(value);
};
const array = (value, label) => {
  if (!Array.isArray(value)) throw new Error(`${label}: expected an array`);
  return value;
};
function local(root, filename) {
  const resolved = fs.realpathSync(path.resolve(root, filename));
  const relative = path.relative(fs.realpathSync(root), resolved);
  if (relative.startsWith('..') || path.isAbsolute(relative)) throw new Error(`File escapes project: ${filename}`);
  if (!fs.statSync(resolved).isFile()) throw new Error(`Not a file: ${filename}`);
  if (fs.statSync(resolved).size > 4 * 1024 * 1024) throw new Error(`File exceeds 4 MiB: ${filename}`);
  return resolved;
}
const read = (root, file) => fs.readFileSync(local(root, file), 'utf8').replace(/^\uFEFF/, '');
const json = (root, file) => {
  try { return JSON.parse(read(root, file)); }
  catch (error) { throw new Error(`${file}: ${error.message}`); }
};
const slug = (value, label) => {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)) throw new Error(`Invalid ${label}: ${value}`);
  return value;
};
function link(href) {
  if (typeof href !== 'string' || /[\x00-\x20]/.test(href)) throw new Error('Invalid contact link');
  const parsed = new URL(href);
  if (!['https:', 'mailto:', 'tel:'].includes(parsed.protocol)) throw new Error(`Unsupported contact link: ${href}`);
  return escape(href);
}
function section(title, inner) {
  return `<section class="section"><h2>${text(title, 'section title')}</h2>${inner}</section>`;
}
function role(root, selection, profile) {
  const item = json(root, `content/experience/${slug(selection.file, 'experience filename')}.json`);
  const part = item.parts[selection.part];
  const indices = item.variants[profile]?.[selection.part];
  if (!part || !indices) throw new Error(`Missing ${profile}/${selection.part} in ${selection.file}`);
  if (new Set(indices).size !== indices.length) throw new Error(`Duplicate paragraph in ${selection.file}`);
  return `<div class="role" data-experience="${escape(selection.file)}">
    <div class="role-header"><div class="company">${text(item.company, 'company')}</div>
    <div class="period">${text(item.period, 'period')}</div></div>
    ${part.meta ? `<div class="meta">${text(part.meta, 'meta')}</div>` : ''}
    ${part.position ? `<div class="position">${text(part.position, 'position')}</div>` : ''}
    ${array(indices, 'paragraph order').map(i => {
      if (!Number.isInteger(i) || i < 0 || i >= item.paragraphs.length) throw new Error(`Invalid paragraph index in ${selection.file}`);
      return `<p class="p">${text(item.paragraphs[i], 'experience paragraph')}</p>`;
    }).join('\n')}</div>`;
}
function sidebar(root, selections, profile, person) {
  return selections.map(key => {
    if (key === 'contacts') return section(person.contactHeading, `<div class="contact">${array(person.contacts, 'contacts').map(c =>
      `<div>${text(c.label, 'contact label')}: ${c.href ? `<a href="${link(c.href)}">${text(c.value, 'contact value')}</a>` : `<strong>${text(c.value, 'contact value')}</strong>`}</div>`
    ).join('\n')}<div class="small">${text(person.workFormat, 'work format')}</div></div>`);
    if (key === 'education') {
      const data = json(root, 'content/education.json');
      return section(data.heading, data.items.map(i => `<p class="p"><strong>${text(i.institution, 'institution')}</strong><br>${text(i.details, 'education details')}</p>`).join('\n'));
    }
    if (key === 'languages') {
      const data = json(root, 'content/languages.json');
      return section(data.heading, `<div class="chips">${data.items.map(i => `<span class="chip">${text(i, 'language')}</span>`).join('\n')}</div>`);
    }
    const data = profile.sections[key];
    if (!data || !['chips', 'text'].includes(data.type)) throw new Error(`Unknown sidebar section: ${key}`);
    const tag = data.type === 'chips' ? 'span' : 'p';
    const className = data.type === 'chips' ? 'chip' : 'competentions';
    return section(data.heading, `<div class="chips">${array(data.items, key).map(i => `<${tag} class="${className}">${text(i, key)}</${tag}>`).join('\n')}</div>`);
  }).join('\n');
}
function stylesheet(root, filename) {
  let css = read(root, filename);
  if (/@import\b|<\/style/i.test(css)) throw new Error('Styles must be local CSS without @import or closing style tags');
  const licenses = new Set();
  let embeddedBytes = Buffer.byteLength(css);
  css = css.replace(/url\(\s*(['"]?)(.*?)\1\s*\)/gi, (_, quote, url) => {
    if (/^(?:[a-z]+:|\/\/|#)/i.test(url)) throw new Error(`External or pre-embedded CSS asset is not allowed: ${url.slice(0, 80)}`);
    const relative = path.join(path.dirname(filename), url);
    const filenameOnDisk = local(root, relative);
    const mime = {'.ttf':'font/ttf', '.otf':'font/otf', '.woff':'font/woff', '.woff2':'font/woff2'}[path.extname(filenameOnDisk).toLowerCase()];
    if (!mime) throw new Error(`Only font assets are supported in CSS: ${url}`);
    embeddedBytes += Math.ceil(fs.statSync(filenameOnDisk).size / 3) * 4;
    if (embeddedBytes > 6 * 1024 * 1024) throw new Error('Embedded fonts exceed the 6 MiB stylesheet budget');
    const licensePath = path.join(path.dirname(relative), 'OFL.txt');
    const license = read(root, licensePath);
    if (license.includes('*/')) throw new Error('Unsupported font license comment');
    licenses.add(license);
    return `url("data:${mime};base64,${fs.readFileSync(filenameOnDisk).toString('base64')}")`;
  });
  return [...licenses].map(l => `/* Bundled font license:\n${l}\n*/\n`).join('') + css;
}
function headlineFromSource(source) {
  const matches = [...source.matchAll(/<h1\s+data-cv-headline\s*>([\s\S]*?)<\/h1>/g)];
  if (matches.length !== 1 || /[<>]/.test(matches[0][1])) throw new Error('Use exactly one plain-text <h1 data-cv-headline> in the source HTML');
  return matches[0][1].trim().replace(/&(amp|lt|gt|quot|#39);/g, (_, key) => ({amp:'&',lt:'<',gt:'>',quot:'"','#39':"'"}[key]));
}
export function render({ source, profile = 'mba', theme = 'classic', headline }) {
  const root = path.dirname(fs.realpathSync(source));
  const shell = read(root, path.basename(source));
  slug(profile, 'profile'); slug(theme, 'theme');
  const data = json(root, `content/profiles/${profile}.json`);
  if (!Array.isArray(data.pages) || data.pages.length !== 2) throw new Error('The supplied renderer requires exactly two pages');
  const person = json(root, 'content/person.json');
  const heading = headline ?? headlineFromSource(shell);
  text(heading, 'headline');
  const slots = {
    name: text(person.name, 'name'), headline: text(heading, 'headline'),
    subtitle: text(data.subtitle, 'subtitle'), note: text(data.note, 'note'),
    summary: array(data.summary, 'summary').map(p => `<p class="p">${text(p, 'summary paragraph')}</p>`).join('\n'),
  };
  for (let i = 0; i < 2; i++) {
    const page = data.pages[i];
    if (!page) throw new Error('The supplied layout requires exactly two pages');
    slots[`experience${i+1}`] = section(page.heading, array(page.experience, 'experience').map(s => role(root, s, profile)).join('\n'));
    slots[`sidebar${i+1}`] = sidebar(root, page.sidebar, data, person);
  }
  let layout = read(root, 'layout/two-pages.html');
  layout = layout.replace(/\{\{([a-zA-Z0-9]+)\}\}/g, (_, key) => {
    if (!(key in slots)) throw new Error(`Unknown layout slot: ${key}`);
    return slots[key];
  });
  if (/\{\{.*?\}\}/.test(layout)) throw new Error('Unresolved layout slot');
  const css = stylesheet(root, 'styles/base.css') + '\n' + stylesheet(root, `styles/${theme}.css`);
  for (const token of ['<!-- CV:STYLES -->', '<!-- CV:TITLE -->', '<!-- CV:CONTENT:START -->', '<!-- CV:CONTENT:END -->']) {
    if (shell.split(token).length !== 2) throw new Error(`Expected exactly one ${token}`);
  }
  const output = shell.replace('<!-- CV:TITLE -->', `${text(person.name, 'name')} — ${text(heading, 'headline')}`)
    .replace('<!-- CV:STYLES -->', `<style>\n${css}\n</style>`)
    .replace(/<!-- CV:CONTENT:START -->[\s\S]*?<!-- CV:CONTENT:END -->/, layout)
    .replace('<!DOCTYPE html>', `<!DOCTYPE html>\n${marker}`);
  if (/<script\b|<link\b|<iframe\b|<img\b|\bon[a-z]+\s*=/i.test(output)) throw new Error('Export must contain no scripts, external styles, frames, images, or event handlers');
  if (Buffer.byteLength(output) > 8 * 1024 * 1024) throw new Error('Export exceeds 8 MiB');
  return output;
}

export function writeExport(options, token) {
  const output = path.resolve(options.out);
  const source = fs.realpathSync(options.source);
  if (path.extname(output).toLowerCase() !== '.html') throw new Error('Output must end in .html');
  if (output.toLowerCase() === source.toLowerCase()) throw new Error('Refusing to overwrite source HTML');
  if (fs.existsSync(output) && !fs.readFileSync(output, 'utf8').startsWith(`<!DOCTYPE html>\n${marker}`)) throw new Error(`Refusing to overwrite a non-generated file: ${output}`);
  const result = render(options);
  fs.mkdirSync(path.dirname(output), { recursive: true });
  const temporary = `${output}.cv-${token}.tmp`;
  try {
    fs.writeFileSync(temporary, result, { flag: 'wx' });
    fs.renameSync(temporary, output);
  } finally {
    if (fs.existsSync(temporary)) fs.unlinkSync(temporary);
  }
  return { output, bytes: Buffer.byteLength(result) };
}
