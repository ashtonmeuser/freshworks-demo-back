const db = require('../common/database');

const tableName = 'freshworks-demo-feeding-table';
const dayLetter = () => 'UMTWRFS'.split('')[new Date().getDay()]; // Single-letter weekday form
const overwriteItem = (item) => ({ // Overwrite item schedule property
  ...item,
  schedule: undefined,
});

module.exports.handler = async () => {
  const yesterday = db.timestamp() - 24 * 60 * 60; // 24 hours ago

  // Query for items scheduled for current weekday, skipping those created today
  const results = await db.scan(
    tableName,
    'contains(schedule, :schedule) and createdAt < :yesterday',
    { ':schedule': dayLetter(), ':yesterday': yesterday },
  );
  const items = results.map(overwriteItem);
  await db.put(tableName, items);
};
