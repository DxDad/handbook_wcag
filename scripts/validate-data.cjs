const fs = require('node:fs');
const path = require('node:path');
const Ajv = require('ajv');

const root = path.resolve(__dirname, '..');
const schemaPath = path.join(root, 'src', 'data', 'schema.json');
const dataPath = path.join(root, 'src', 'data', 'data.json');

function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    console.error(`Não foi possível ler ${path.relative(root, filePath)}: ${error.message}`);
    process.exit(1);
  }
}

const schema = readJson(schemaPath);
const data = readJson(dataPath);

if (!Array.isArray(data)) {
  console.error('src/data/data.json deve conter uma lista de itens do handbook.');
  process.exit(1);
}

const validate = new Ajv({allErrors: true, strict: true}).compile(schema);
const errors = [];

data.forEach((item, index) => {
  if (!validate(item)) {
    for (const error of validate.errors) {
      const location = error.instancePath || '/';
      errors.push(`Item ${index + 1} (${item.id || 'sem id'}) em ${location}: ${error.message}`);
    }
  }
});

const ids = new Map();
data.forEach((item, index) => {
  if (!item.id) return;
  const firstIndex = ids.get(item.id);
  if (firstIndex !== undefined) {
    errors.push(`ID duplicado "${item.id}" nos itens ${firstIndex + 1} e ${index + 1}.`);
    return;
  }
  ids.set(item.id, index);
});

if (errors.length > 0) {
  console.error('Validação de src/data/data.json falhou:');
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log(`Dados válidos: ${data.length} itens e ${ids.size} IDs únicos.`);
