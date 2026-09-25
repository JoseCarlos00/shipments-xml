import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { XMLParser } from 'fast-xml-parser';

const parser = new XMLParser({
  ignoreAttributes: false,
  // CRÍTICO: sin esto "06060" se convierte en 6060 y pierdes el cero inicial
  parseTagValue: false,
});

const DIR = './samples';
const OUT = './src/data/customers.json';
const customers = [];
const warnings = [];

const files = readdirSync(DIR).filter((f) => f.endsWith('.shxmlP'))

for (const file of files) {
  const warn = (msg) => warnings.push(`${file}: ${msg}`);
  const s = parser.parse(readFileSync(`${DIR}/${file}`, 'utf8')).WMWROOT.WMWDATA.Shipments.Shipment;
  const c = s.Customer;
  const a = c.ShipToAddress;
  const cat = c.CustomerCategories;
  const storeNo = s.UserDef8;

  // Consistencias que asumimos al reducir varios campos a uno solo
  const m = /^R?(\d+)-T-111-(\d+)$/.exec(s.ShipmentId ?? '');
  if (!m || m[1] !== storeNo) warn(`UserDef8 (${storeNo}) no coincide con ShipmentId (${s.ShipmentId})`);
  if (s.ShipmentId !== s.ErpOrder) warn('ShipmentId != ErpOrder');
  if (c.Customer !== c.ShipTo || c.Customer !== c.CustomerAddress?.Name) warn('Customer / ShipTo / CustomerAddress.Name difieren');
  if (cat.Category1 !== s.OrderType) warn('Category1 != OrderType');

  // Código postal: siempre 5 dígitos (rellena con ceros a la izquierda)
  const postalCode = String(a.PostalCode ?? '').trim().padStart(5, '0');

  const required = { code: c.Customer, address1: a.Address1, city: a.City, state: a.State, category10: cat.Category10 };
  for (const [k, v] of Object.entries(required)) if (!v) warn(`falta ${k}`);
  if (!/^\d{5}$/.test(postalCode)) warn(`CP inválido: "${a.PostalCode}"`);
  if (!cat.Category2) warn('Category2 vacío (llénalo a mano)');

  customers.push({
    id: `store-${storeNo}`,
    storeNo,
    code: c.Customer,
    orderType: s.OrderType,
    category2: cat.Category2 ?? '',
    category10: cat.Category10,
    shipTo: {
      address1: a.Address1,
      address2: a.Address2 ?? '',
      address3: a.Address3 ?? '',
      city: a.City,
      state: a.State,
      postalCode,
    },
  });
}

const ids = customers.map((x) => x.id);
for (const id of new Set(ids.filter((id, i) => ids.indexOf(id) !== i))) warnings.push(`storeNo duplicado: ${id}`);

customers.sort((x, y) => x.code.localeCompare(y.code));
writeFileSync(OUT, JSON.stringify(customers, null, 2) + '\n');
console.log(`${customers.length} customers -> ${OUT}`);
console.log(warnings.length ? `\n${warnings.length} advertencias:\n` + warnings.join('\n') : 'Sin advertencias');
