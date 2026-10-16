import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import ts from 'typescript';

// Compile the real TSX component for Node's dependency-free test runner.
const source = readFileSync(new URL('../components/Ponpon.tsx', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, {compilerOptions: {jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.CommonJS}});
const module = {exports: {} as {default?: React.ComponentType<any>}};
new Function('require', 'module', 'exports', compiled.outputText)(createRequire(import.meta.url), module, module.exports);
const Ponpon = module.exports.default!;
const render = (props: Record<string, unknown>) => renderToStaticMarkup(createElement(Ponpon, props));

test('Every Ponpon mood preserves the full-body rig and accessible description', () => {
  for (const mood of ['welcome', 'focused', 'thinking', 'celebrate', 'sleepy', 'concerned', 'curious']) {
    const markup = render({mood, animate: true});
    assert.match(markup, /role="img" aria-label="Ponpon/);
    assert.match(markup, /viewBox="0 0 400 400"/);
    for (const part of ['body', 'head', 'tail', 'torso', 'arm-left', 'arm-right', 'foot-left', 'foot-right']) {
      assert.ok(markup.includes(`ponpon-part ponpon-${part}`), `${mood}: ${part}`);
    }
    assert.equal((markup.match(/stroke="#DFAF21" stroke-width="2"/g) || []).length, 1);
    assert.ok(!markup.includes('<image'), 'The rig has no bitmap/video dependency');
  }
});

test('Static and decorative Ponpon instances remain noninteractive and unannounced', () => {
  const markup = render({mood: 'focused', decorative: true});
  assert.match(markup, /aria-hidden="true" focusable="false"/);
  assert.ok(!markup.includes('aria-label'));
  assert.ok(!markup.includes('ponpon-animated'));
  assert.ok(!markup.includes('tabindex'));
});

test('Motion is opt-in per instance, pausable globally, and disabled for reduced motion', () => {
  const css = readFileSync(new URL('../app/ponpon-motion.css', import.meta.url), 'utf8');
  assert.match(css, /prefers-reduced-motion: reduce/);
  assert.match(css, /animation: none !important/);
  assert.match(css, /:root:not\(\[data-ponpon-motion="on"\]\) \.ponpon-animated \.ponpon-part \{ animation-play-state: paused/);
  assert.match(css, /\.ponpon-animated\.mood-welcome \.ponpon-arm-left/);
  assert.match(css, /\.ponpon-animated\.mood-celebrate \.ponpon-body/);
});
