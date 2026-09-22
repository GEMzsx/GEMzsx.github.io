/**
 * 语言配色
 * ------------------------------------------------------------------
 * 常见语言沿用 GitHub Linguist 官方色值，保证与 GitHub 观感一致；
 * 未收录的语言用名称哈希生成稳定的 HSL 颜色，避免出现「灰色一片」。
 */
const KNOWN = {
  JavaScript: '#f1e05a',
  TypeScript: '#3178c6',
  Vue: '#41b883',
  HTML: '#e34c26',
  CSS: '#563d7c',
  SCSS: '#c6538c',
  Less: '#1d365d',
  Python: '#3572A5',
  Java: '#b07219',
  'C++': '#f34b7d',
  C: '#555555',
  'C#': '#178600',
  Go: '#00ADD8',
  Rust: '#dea584',
  PHP: '#4F5D95',
  Ruby: '#701516',
  Swift: '#F05138',
  Kotlin: '#A97BFF',
  Dart: '#00B4AB',
  Shell: '#89e051',
  PowerShell: '#012456',
  Lua: '#000080',
  Perl: '#0298c3',
  R: '#198CE7',
  MATLAB: '#e16737',
  Scala: '#c22d40',
  Haskell: '#5e5086',
  Elixir: '#6e4a7e',
  Clojure: '#db5855',
  Objective_C: '#438eff',
  Assembly: '#6E4C13',
  'Jupyter Notebook': '#DA5B0B',
  Markdown: '#083fa1',
  Dockerfile: '#384d54',
  Makefile: '#427819',
  Nix: '#7e7eff',
  Zig: '#ec915c',
  Svelte: '#ff3e00',
  Astro: '#ff5a03',
  MDX: '#fcb32c',
  Solidity: '#AA6746',
  Vim_Script: '#199f4b',
  Batchfile: '#C1F12E',
  Other: '#8b949e',
}

/** 名称 → 稳定色相，保证同一语言每次刷新颜色一致 */
function hashHue(name) {
  let hash = 0
  for (let i = 0; i < name.length; i += 1) {
    hash = (hash * 31 + name.charCodeAt(i)) % 360
  }
  return hash
}

export function languageColor(name) {
  if (!name) return KNOWN.Other
  return KNOWN[name] || `hsl(${hashHue(name)} 62% 58%)`
}
