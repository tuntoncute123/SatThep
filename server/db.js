import 'server-only';
import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
function openDatabase() {
  const directory = resolve(/* turbopackIgnore: true */ process.env.DATA_DIR || 'data');
  mkdirSync(directory, {
    recursive: true,
  });
  const db = new DatabaseSync(resolve(directory, 'thepviet.sqlite'));
  db.exec(`PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON; PRAGMA busy_timeout=5000;
CREATE TABLE IF NOT EXISTS settings (id INTEGER PRIMARY KEY CHECK(id=1), data TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS sessions (token TEXT PRIMARY KEY, expires INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS rate_limits (key TEXT PRIMARY KEY, count INTEGER NOT NULL, expires INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS products (
 id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, sku TEXT UNIQUE NOT NULL,
 category TEXT NOT NULL, brand TEXT NOT NULL, price REAL NOT NULL CHECK(price>=0),
 stock REAL NOT NULL CHECK(stock>=0), unit TEXT NOT NULL, spec TEXT NOT NULL,
 description TEXT NOT NULL, active INTEGER NOT NULL DEFAULT 1
);
CREATE TABLE IF NOT EXISTS customers (
 id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, phone TEXT NOT NULL,
 email TEXT NOT NULL DEFAULT '', address TEXT NOT NULL DEFAULT '', company TEXT NOT NULL DEFAULT ''
);
CREATE TABLE IF NOT EXISTS orders (
 id INTEGER PRIMARY KEY AUTOINCREMENT, customerId INTEGER NOT NULL REFERENCES customers(id),
 items TEXT NOT NULL, total REAL NOT NULL, status TEXT NOT NULL,
 note TEXT NOT NULL DEFAULT '', createdAt TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS quotes (
 id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, phone TEXT NOT NULL,
 email TEXT NOT NULL DEFAULT '', company TEXT NOT NULL DEFAULT '', product TEXT NOT NULL DEFAULT '',
 quantity TEXT NOT NULL DEFAULT '', message TEXT NOT NULL DEFAULT '', status TEXT NOT NULL DEFAULT 'new', createdAt TEXT NOT NULL
);`);
  if (!db.prepare('SELECT id FROM settings WHERE id=1').get()) {
    db.prepare('INSERT INTO settings VALUES (1, ?)').run(
      JSON.stringify({
        name: 'Thép Việt',
        tagline: 'Vững nền móng, bền tương lai',
        phone: '0901 234 567',
        email: 'kinhdoanh@thepviet.vn',
        address: '128 Quốc lộ 1A, phường An Lạc, TP. Hồ Chí Minh',
        hours: 'Thứ 2 – Thứ 7: 7:30 – 17:30',
        intro:
          'Chúng tôi cung cấp giải pháp sắt thép toàn diện, đồng hành cùng nhà thầu và doanh nghiệp kiến tạo những công trình bền vững.',
        years: '15+',
        projects: '1.200+',
        partners: '500+',
        capacity: '50.000+',
      }),
    );
    const add = db.prepare(
      'INSERT INTO products (name,sku,category,brand,price,stock,unit,spec,description) VALUES (?,?,?,?,?,?,?,?,?)',
    );
    [
      [
        'Thép thanh vằn',
        'TV-CB400',
        'Thép xây dựng',
        'Hòa Phát',
        15800,
        125000,
        'kg',
        'D10 – D32 · CB400-V',
        'Thép thanh vằn có độ bám dính bê tông tốt, phù hợp kết cấu móng, cột và dầm. Có thể đặt theo quy cách và khối lượng công trình.',
      ],
      [
        'Thép hình H',
        'TV-H200',
        'Thép hình',
        'Posco',
        18200,
        45000,
        'kg',
        'H100 – H400 · SS400',
        'Thép hình H chịu lực cho kết cấu nhà xưởng, cầu đường và công trình công nghiệp. Tư vấn lựa chọn kích thước theo bản vẽ.',
      ],
      [
        'Thép hộp mạ kẽm',
        'TV-HMK',
        'Thép hộp & ống',
        'Hoa Sen',
        21500,
        62000,
        'kg',
        '20×20 – 100×100 mm',
        'Thép hộp mạ kẽm bền bỉ, bề mặt sáng đẹp, phù hợp gia công cơ khí, khung mái và các kết cấu ngoài trời.',
      ],
      [
        'Thép tấm cán nóng',
        'TV-TCN',
        'Thép tấm',
        'Hòa Phát',
        16700,
        80000,
        'kg',
        'Dày 3 – 50 mm · SS400',
        'Thép tấm cán nóng cho gia công cơ khí, chế tạo bồn bể và kết cấu công nghiệp. Hỗ trợ cắt theo kích thước yêu cầu.',
      ],
      [
        'Thép cuộn xây dựng',
        'TV-CB240',
        'Thép xây dựng',
        'Hòa Phát',
        15200,
        95000,
        'kg',
        'D6 – D8 · CB240-T',
        'Thép cuộn trơn có độ dẻo tốt, dễ uốn và gia công. Phù hợp đai thép, lưới thép và các hạng mục dân dụng.',
      ],
      [
        'Thép hình I',
        'TV-I200',
        'Thép hình',
        'Posco',
        17900,
        38000,
        'kg',
        'I100 – I300 · SS400',
        'Thép hình I được sử dụng trong kết cấu chịu tải, dầm sàn, khung nhà thép và nhiều công trình dân dụng.',
      ],
      [
        'Ống thép mạ kẽm',
        'TV-ONG',
        'Thép hộp & ống',
        'Hòa Phát',
        22800,
        24000,
        'kg',
        'Ø21 – Ø114 mm',
        'Ống thép tròn mạ kẽm cho khung giàn và cơ khí. Nhiều độ dày, hỗ trợ tư vấn quy cách trước khi đặt hàng.',
      ],
      [
        'Thép tấm mạ kẽm',
        'TV-TMK',
        'Thép tấm',
        'Hoa Sen',
        23500,
        18000,
        'kg',
        'Dày 0,5 – 3 mm',
        'Tấm thép mạ kẽm chống ăn mòn cho sản xuất thiết bị và gia công. Bề mặt đồng đều, dễ tạo hình.',
      ],
    ].forEach((p) => {
      return add.run(...p);
    });
    const customer = db.prepare(
      'INSERT INTO customers (name,phone,email,address,company) VALUES (?,?,?,?,?)',
    );
    [
      [
        'Nguyễn Minh Anh',
        '0903123456',
        'minhanh@example.com',
        'TP. Hồ Chí Minh',
        'Công ty Xây dựng An Phát',
      ],
      ['Trần Hoàng Nam', '0912345678', 'hoangnam@example.com', 'Đồng Nai', 'Cơ khí Hoàng Nam'],
      ['Lê Thu Hà', '0987654321', 'thuha@example.com', 'Bình Dương', 'Công ty Minh Long'],
      ['Phạm Đức Huy', '0934567890', 'duchuy@example.com', 'Long An', 'Xây dựng Đại Thành'],
    ].forEach((c) => {
      return customer.run(...c);
    });
    const now = new Date();
    const order = db.prepare(
      'INSERT INTO orders (customerId,items,total,status,note,createdAt) VALUES (?,?,?,?,?,?)',
    );
    for (let i = 0; i < 9; i++) {
      const p = db.prepare('SELECT * FROM products WHERE id=?').get((i % 4) + 1);
      const quantity = 1000 + i * 500;
      const date = new Date(now);
      date.setDate(now.getDate() - i * 12);
      order.run(
        (i % 4) + 1,
        JSON.stringify([
          {
            productId: p.id,
            name: p.name,
            unit: p.unit,
            price: p.price,
            quantity,
          },
        ]),
        p.price * quantity,
        [
          'new',
          'delivering',
          'confirmed',
          'completed',
          'completed',
          'completed',
          'completed',
          'completed',
          'cancelled',
        ][i],
        'Đơn hàng minh họa',
        date.toISOString(),
      );
    }
    db.prepare(
      'INSERT INTO quotes (name,phone,company,product,quantity,message,createdAt) VALUES (?,?,?,?,?,?,?)',
    ).run(
      'Võ Minh Khang',
      '0905550123',
      'Xây dựng Minh Khang',
      'Thép thanh vằn',
      '5 tấn',
      'Cần tư vấn quy cách D16 và D20 cho công trình nhà ở. Dữ liệu minh họa.',
      now.toISOString(),
    );
  }
  return db;
}
export function getDb() {
  const key = Symbol.for('thepviet.database');
  if (!globalThis[key]) {
    globalThis[key] = openDatabase();
  }
  return globalThis[key];
}
