-- Seed family members
INSERT INTO members (name, is_admin, display_order) VALUES
  ('אבא', FALSE, 1),
  ('אמא', TRUE, 2),
  ('שיראל ואלעד', FALSE, 3),
  ('רני ומרדכי', FALSE, 4),
  ('אריאל ואודליה', FALSE, 5),
  ('ישראל', TRUE, 6),
  ('נעמה ואלרואי', FALSE, 7),
  ('מוריה ושבי', FALSE, 8),
  ('אילה', FALSE, 9),
  ('צביקי', FALSE, 10),
  ('אורהלי', FALSE, 11);

-- Seed rooms in the parents' house
INSERT INTO rooms (name, description, display_order) VALUES
  ('סלון', NULL, 1),
  ('ממ"ד', NULL, 2),
  ('החדר של צביקי', NULL, 3),
  ('החדר של אורהלי', NULL, 4),
  ('החדר של אילה', NULL, 5),
  ('החדר של אריאל', NULL, 6),
  ('החדר של ישראל', NULL, 7),
  ('החדר של מוריה', NULL, 8);

-- Seed task templates: preparation (הכנות — Friday / erev chag)
INSERT INTO task_templates (name, category, icon, color, is_recurring, display_order) VALUES
  ('קניות סופר ופיצוחים', 'preparation', 'FaShoppingCart', 'bg-blue-100', TRUE, 1),
  ('סידור חצר, פינוי מיחזור כתום ובקבוקי פיקדון', 'preparation', 'FaRecycle', 'bg-green-100', TRUE, 2),
  ('סידור הבית + סידור ממ״ד', 'preparation', 'FaHome', 'bg-purple-100', TRUE, 3),
  ('ניקוי שולחן והרמת כיסאות', 'preparation', 'MdTableRestaurant', 'bg-amber-100', TRUE, 4),
  ('טיטוא הבית והמדרגות', 'preparation', 'FaBroom', 'bg-teal-100', TRUE, 5),
  ('שטיפת כיור בשרי (צהריים)', 'preparation', 'MdWaterDrop', 'bg-cyan-100', TRUE, 6),
  ('ריקון זבל, ריקון זבל, ריקון זבל', 'preparation', 'FaTrash', 'bg-red-100', TRUE, 7),
  ('ניקוי כיור נטילה ושירותים + שטיפה עם המטבח', 'preparation', 'FaSoap', 'bg-sky-100', TRUE, 8),
  ('שטיפת סלון', 'preparation', 'MdCleaningServices', 'bg-indigo-100', TRUE, 9),
  ('חיתוך/פיזור נייר טואלט והכנת נרות', 'preparation', 'FaFire', 'bg-orange-100', TRUE, 10),
  ('ממ״מ – מקרר, מזגן, מיחם', 'preparation', 'FaSnowflake', 'bg-blue-100', TRUE, 11),
  ('תמציות תה', 'preparation', 'FaMugHot', 'bg-yellow-100', TRUE, 12),
  ('פתיחת שולחן ועריכתו', 'preparation', 'MdDining', 'bg-violet-100', TRUE, 13),
  ('חלות', 'preparation', 'FaBreadSlice', 'bg-amber-100', TRUE, 14),
  ('עוגה', 'preparation', 'FaCakeCandles', 'bg-pink-100', TRUE, 15),
  ('תבשיל', 'preparation', 'FaBowlFood', 'bg-orange-100', TRUE, 16),
  ('סלטים', 'preparation', 'FaCarrot', 'bg-emerald-100', TRUE, 17),
  ('מוחמץ', 'preparation', 'FaKitchenSet', 'bg-rose-100', TRUE, 18);

-- Seed task templates: shabbat (שבת עצמה / החג)
INSERT INTO task_templates (name, category, icon, color, is_recurring, display_order) VALUES
  ('הגשת סלטים', 'shabbat', 'FaBowlRice', 'bg-emerald-100', TRUE, 1),
  ('שטיפת כלים – מנה א׳', 'shabbat', 'MdLocalLaundryService', 'bg-cyan-100', TRUE, 2),
  ('הגשה לפני ואחסון במקרר אחרי מנה ב׳', 'shabbat', 'FaBoxOpen', 'bg-sky-100', TRUE, 3),
  ('שטיפת כלים חלבי', 'shabbat', 'MdWaterDrop', 'bg-blue-100', TRUE, 4),
  ('כלים בוקר', 'shabbat', 'FaMugSaucer', 'bg-yellow-100', TRUE, 5),
  ('כלים בוקר חלבי', 'shabbat', 'FaCheese', 'bg-amber-100', TRUE, 6),
  ('עריכת והגשת סעודה שלישית', 'shabbat', 'MdDining', 'bg-orange-100', TRUE, 7),
  ('פינוי סעודה שלישית וסידור הבית', 'shabbat', 'FaHouse', 'bg-violet-100', TRUE, 8);

-- Seed task templates: motzash (מוצ"ש / מוצאי חג)
INSERT INTO task_templates (name, category, icon, color, is_recurring, display_order) VALUES
  ('טיטוא + שטיפה מוצ״ש', 'motzash', 'FaBroom', 'bg-slate-100', TRUE, 1),
  ('כלים מוצ״ש – מדיח + סידור השיש', 'motzash', 'MdCountertops', 'bg-gray-100', TRUE, 2),
  ('כלים חלבי מוצ״ש', 'motzash', 'MdWaterDrop', 'bg-zinc-100', TRUE, 3),
  ('קיפול מיטות ומצעים', 'motzash', 'FaBed', 'bg-stone-100', TRUE, 4);
