import nedb from "nedb-promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const database_names = ["company", "cart", "customers", "menu", "orders"];
const db = {};
database_names.forEach((name) => {
  const filename = `${__dirname}\\${name}.db`;
  db[name] = new nedb({
    filename: filename,
    autoload: true,
  });
});
export default db;