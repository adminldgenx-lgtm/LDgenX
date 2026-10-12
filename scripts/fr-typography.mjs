// Adds French no-break spaces inside string literals and JSX text only:
// narrow (U+202F) before ? ! ; and regular (U+00A0) before : and inside « ».
// Usage: node scripts/fr-typography.mjs [--check]
import { readFile, writeFile } from 'node:fs/promises';
import { globSync } from 'node:fs';
import ts from 'typescript';

const check = process.argv.includes('--check');
const fix = (text) =>
  text
    .replace(/(\S) ([?!;])/g, '$1 $2')
    .replace(/(\S) :(?=\s|$)/g, '$1 :')
    .replace(/« /g, '« ')
    .replace(/ »/g, ' »');

const kinds = new Set([
  ts.SyntaxKind.StringLiteral,
  ts.SyntaxKind.NoSubstitutionTemplateLiteral,
  ts.SyntaxKind.TemplateHead,
  ts.SyntaxKind.TemplateMiddle,
  ts.SyntaxKind.TemplateTail,
  ts.SyntaxKind.JsxText,
]);
let changed = 0;
for (const file of globSync('src/**/*.{ts,tsx}')) {
  const source = await readFile(file, 'utf8');
  const tree = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const edits = [];
  const visit = (node) => {
    if (kinds.has(node.kind) && !ts.isImportDeclaration(node.parent)) {
      const start = node.getStart(tree);
      const text = source.slice(start, node.getEnd());
      const next = fix(text);
      if (next !== text) edits.push([start, node.getEnd(), next]);
    }
    ts.forEachChild(node, visit);
  };
  visit(tree);
  if (!edits.length) continue;
  changed += edits.length;
  if (check) {
    for (const [start, , next] of edits) {
      const line = source.slice(0, start).split('\n').length;
      console.error(`${file}:${line} missing French no-break space: ${next.slice(0, 70)}`);
    }
    continue;
  }
  let output = source;
  for (const [start, end, next] of edits.sort((a, b) => b[0] - a[0]))
    output = output.slice(0, start) + next + output.slice(end);
  await writeFile(file, output);
}
if (check && changed) process.exit(1);
console.log(check ? 'French typography: OK' : `French typography: ${changed} strings updated`);
