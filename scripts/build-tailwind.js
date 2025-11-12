const fs = require('fs');
const path = require('path');
const postcss = require('postcss');
const tailwind = require('tailwindcss');
const input = path.resolve(__dirname, '../assets/css/tailwind-input.css');
const output = path.resolve(__dirname, '../assets/css/azuria-tailwind.css');

async function build(minify = false) {
  const css = fs.readFileSync(input, 'utf8');
  const plugins = [tailwind];
  const result = await postcss(plugins).process(css, { from: input, to: output });
  fs.writeFileSync(output, result.css, 'utf8');
  console.log(`Tailwind build: ${output}`);
}

if (require.main === module) {
  const args = process.argv.slice(2);
  const minify = args.includes('--minify');
  build(minify).catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
